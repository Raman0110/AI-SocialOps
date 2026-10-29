import json
from groq.types.chat import ChatCompletionToolParam
from app.tools.customer_tools import get_customer_context
from app.tools.conversation_tools import get_conversation_history
from app.tools.ticket_tools import propose_support_ticket

CUSTOMER_CONTEXT_TOOL: ChatCompletionToolParam = {
    "type": "function",
    "function": {
        "name": "get_customer_context",
        "description": (
            "Get trusted customer and social profile "
            "information for the current conversation. "
            "Use this when customer identity or account "
            "context would help answer the request."
        ),
        "parameters": {
            "type": "object",
            "properties": {
            },
            "required": [],
            "additionalProperties": False,
        },
    },
}

CONVERSATION_HISTORY_TOOL = {
    "type": "function",
    "function": {
        "name": "get_conversation_history",
        "description": (
            "Get recent messages from the current "
            "customer conversation. Use this when "
            "previous messages are needed to understand "
            "context, references, previous questions, "
            "or what support has already told the customer."
        ),
        "parameters": {
            "type": "object",
            "properties": {
                "limit": {
                    "type": "integer",
                    "minimum": 1,
                    "maximum": 50,
                    "description": (
                        "Maximum number of recent " "messages to retrieve."
                    ),
                },
            },
            "required": [],
            "additionalProperties": False,
        },
    },
}

SUPPORT_TICKET_TOOL = {
    "type": "function",
    "function": {
        "name": "propose_support_ticket",
        "description": (
            "Propose creating a support ticket when "
            "the customer's issue requires escalation "
            "or follow-up beyond the current conversation. "
            "This does not immediately create the ticket. "
            "The proposal requires human approval."
        ),
        "parameters": {
            "type": "object",
            "properties": {
                "title": {
                    "type": "string",
                },
                "description": {
                    "type": "string",
                },
                "priority": {
                    "type": "string",
                    "enum": [
                        "Low",
                        "Normal",
                        "High",
                        "Urgent",
                    ],
                },
            },
            "required": [
                "title",
                "description",
                "priority",
            ],
            "additionalProperties": False,
        },
    },
}


TOOLS = [CUSTOMER_CONTEXT_TOOL, CONVERSATION_HISTORY_TOOL, SUPPORT_TICKET_TOOL]


VALID_PRIORITIES = {"Low", "Normal", "High", "Urgent"}


async def execute_tool(tool_name: str, arguments: str, conversation_id: str):
    """Run a tool for the given conversation.

    The conversation id is supplied by the server, never by the model, so a
    prompt-injected customer message cannot point the tools at another
    conversation.
    """
    parsed_arguments = json.loads(arguments or "{}")

    if not isinstance(parsed_arguments, dict):
        raise ValueError("Tool arguments must be a JSON object.")

    if tool_name == "get_customer_context":
        return await get_customer_context(conversation_id=conversation_id)

    if tool_name == "get_conversation_history":
        limit = parsed_arguments.get("limit", 20)

        if not isinstance(limit, int) or not 1 <= limit <= 50:
            limit = 20

        return await get_conversation_history(
            conversation_id=conversation_id,
            limit=limit,
        )

    if tool_name == "propose_support_ticket":
        priority = parsed_arguments.get("priority")

        if priority not in VALID_PRIORITIES:
            raise ValueError(f"priority must be one of {sorted(VALID_PRIORITIES)}.")

        return await propose_support_ticket(
            conversation_id=conversation_id,
            title=str(parsed_arguments["title"])[:200],
            description=str(parsed_arguments["description"])[:4000],
            priority=priority,
        )

    raise ValueError(f"Unknown tool: {tool_name}")
