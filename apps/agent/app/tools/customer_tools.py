from app.clients.socialops_api import SocialOpsApiClient


api_client = SocialOpsApiClient()


async def get_customer_context(conversation_id: str) -> dict:
    """
    Get customer and social profile information
    for a conversation.
    """

    return await api_client.get_customer_context(conversation_id)