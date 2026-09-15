import httpx

from app.config.settings import settings


class SocialOpsApiClient:

    def __init__(self):
        self.base_url = settings.socialops_api_url

    async def get_customer_context(self, conversation_id: str) -> dict:

        url = f"{self.base_url}/internal/agent-tools/conversations/{conversation_id}/customer-context"

        async with httpx.AsyncClient() as client:
            response = await client.get(url)

            response.raise_for_status()

            return response.json()