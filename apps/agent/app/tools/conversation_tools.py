from app.clients import socialops_api


async def get_conversation_history(conversation_id: str, limit: int = 20) -> dict:
    """
    Get recent conversation messages
    for the specified conversation.
    """

    return await socialops_api.get_conversation_history(conversation_id, limit)