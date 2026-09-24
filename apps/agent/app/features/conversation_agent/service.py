import json
from typing import cast

from groq import AsyncGroq
from groq.resources.chat import AsyncChat
from groq.types.chat import (
    ChatCompletionAssistantMessageParam,
    ChatCompletionMessageParam,
    ChatCompletionMessageToolCallParam,
    ChatCompletionToolMessageParam,
)
from app.config.settings import settings
from app.features.conversation_agent.models import (
    RunConversationAgentRequest,
    RunConversationAgentResponse,
)
from app.features.conversation_agent.tools import TOOLS, execute_tool

client = AsyncGroq(api_key=settings.groq_api_key)


MAX_TOOL_ITERATIONS = 5


async def run_conversation_agent(
    request: RunConversationAgentRequest,
) -> RunConversationAgentResponse:
    messages: list[ChatCompletionMessageParam] = [
        {
            "role": "system",
            "content": (
                "You are a customer support AI assistant "
                "inside a social media operations platform. "
                "Use get_customer_context when customer identity "
                "or customer profile information is needed. "
                "Use get_conversation_history when previous "
                "messages are necessary to understand context "
                "or determine what has already been discussed. "
                "Use propose_support_ticket when an issue genuinely "
                "requires escalation, investigation, or follow-up that "
                "cannot be resolved directly in the conversation. "
                "The support-ticket tool only creates an approval request. "
                "Never tell the customer that a ticket has been created "
                "until a tool explicitly confirms that the real ticket "
                "was created. "
                "Use tools only when they are useful. "
                "Do not call tools unnecessarily. "
                "Never invent customer information or business facts. "
                "Do not claim an action was completed unless a tool "
                "confirms it. "
                "Your final response should be a concise and polite "
                "draft suitable for sending to the customer."
            ),
        },
        {
            "role": "user",
            "content": (
                f"Conversation ID: "
                f"{request.conversation_id}\n\n"
                f"Customer message:\n"
                f"{request.message}"
            ),
        },
    ]

    tools_used: list[str] = []
    pending_action_ids: list[str] = []

    for _ in range(MAX_TOOL_ITERATIONS):
        response = await cast(AsyncChat, client.chat).completions.create(
            model=settings.groq_model,
            messages=messages,
            tools=TOOLS,
            tool_choice="auto",
            temperature=0.2,
        )

        assistant_message = response.choices[0].message

        tool_calls = assistant_message.tool_calls

        if not tool_calls:
            content = assistant_message.content

            if not content:
                raise RuntimeError("Agent returned an empty response.")

            return RunConversationAgentResponse(
                reply=content.strip(),
                tools_used=tools_used,
                pending_action_ids=pending_action_ids,
            )

        assistant_tool_calls: list[ChatCompletionMessageToolCallParam] = [
            {
                "id": tool_call.id,
                "type": "function",
                "function": {
                    "name": tool_call.function.name,
                    "arguments": tool_call.function.arguments,
                },
            }
            for tool_call in tool_calls
        ]

        assistant_param: ChatCompletionAssistantMessageParam = {
            "role": "assistant",
            "content": assistant_message.content,
            "tool_calls": assistant_tool_calls,
        }

        messages.append(assistant_param)

        for tool_call in tool_calls:
            tool_name = tool_call.function.name

            if tool_name not in tools_used:
                tools_used.append(tool_name)

            result = await execute_tool(
                tool_call.function.name,
                tool_call.function.arguments,
            )

            if tool_name == "propose_support_ticket" and isinstance(result, dict):
                action_id = result.get("actionId")
                if action_id:
                    pending_action_ids.append(str(action_id))

            tool_message: ChatCompletionToolMessageParam = {
                "role": "tool",
                "tool_call_id": tool_call.id,
                "content": json.dumps(result),
            }

            messages.append(tool_message)

    raise RuntimeError("Agent exceeded maximum tool iterations.")
