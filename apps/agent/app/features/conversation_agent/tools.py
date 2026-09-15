import json

from groq.types.chat import ChatCompletionToolParam

from app.tools.customer_tools import (get_customer_context)


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
                "conversation_id": {
                    "type": "string",
                    "description": ("The conversation identifier."),
                }
            },
            "required": ["conversation_id"],
            "additionalProperties": False,
        },
    },
}


TOOLS: list[ChatCompletionToolParam] = [CUSTOMER_CONTEXT_TOOL]


async def execute_tool(tool_name: str, arguments: str):
    parsed_arguments = json.loads(arguments)

    if tool_name == "get_customer_context":
        return await get_customer_context(conversation_id = parsed_arguments["conversation_id"])

    raise ValueError(f"Unknown tool: {tool_name}")
