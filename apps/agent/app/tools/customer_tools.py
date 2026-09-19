
from app.clients import socialops_api


async def get_customer_context(conversation_id: str) -> dict:
    """
    Get customer and social profile information
    for a conversation.
    """

    return await socialops_api.get_customer_context(conversation_id)