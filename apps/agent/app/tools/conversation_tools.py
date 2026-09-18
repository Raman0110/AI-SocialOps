from app.clients.socialops_api import SocialOpsApiClient


api_client = SocialOpsApiClient()


async def get_conversation_history(conversation_id: str, limit: int = 20) -> dict:
    """
    Get recent conversation messages
    for the specified conversation.
    """

    return await api_client.get_conversation_history(conversation_id, limit)