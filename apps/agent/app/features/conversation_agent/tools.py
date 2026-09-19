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
                "conversation_id": {
                    "type": "string",
                    "description": ("The current conversation identifier."),
                },
                "limit": {
                    "type": "integer",
                    "minimum": 1,
                    "maximum": 50,
                    "description": (
                        "Maximum number of recent " "messages to retrieve."
                    ),
                },
            },
            "required": [
                "conversation_id",
            ],
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
                "conversation_id": {
                    "type": "string",
                },
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
                "conversation_id",
                "title",
                "description",
                "priority",
            ],
            "additionalProperties": False,
        },
    },
}


TOOLS = [CUSTOMER_CONTEXT_TOOL, CONVERSATION_HISTORY_TOOL, SUPPORT_TICKET_TOOL]


async def execute_tool(tool_name: str, arguments: str):
    parsed_arguments = json.loads(arguments)

    if tool_name == "get_customer_context":
        return await get_customer_context(
            conversation_id=parsed_arguments["conversation_id"]
        )

    if tool_name == "get_conversation_history":
        return await get_conversation_history(
            conversation_id=parsed_arguments["conversation_id"],
            limit=parsed_arguments.get("limit", 20),
        )

    if tool_name == "propose_support_ticket":
        return await propose_support_ticket(
            conversation_id=parsed_arguments["conversation_id"],
            title=parsed_arguments["title"],
            description=parsed_arguments["description"],
            priority=parsed_arguments["priority"],
        )

    raise ValueError(f"Unknown tool: {tool_name}")
