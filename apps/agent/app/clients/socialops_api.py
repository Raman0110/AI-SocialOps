import httpx

from app.config.settings import settings


class SocialOpsApiClient:

    def __init__(self):
        self.base_url = settings.socialops_api_url
        self._headers = {"X-Api-Key": settings.socialops_api_key}

    async def get_customer_context(self, conversation_id: str) -> dict:

        url = f"{self.base_url}/internal/agent-tools/conversations/{conversation_id}/customer-context"

        async with httpx.AsyncClient(headers=self._headers) as client:
            response = await client.get(url)

            response.raise_for_status()

            return response.json()

    async def get_conversation_history(
        self, conversation_id: str, limit: int = 20
    ) -> dict:

        url = f"{self.base_url}/internal/agent-tools/conversations/{conversation_id}/history"

        async with httpx.AsyncClient(headers=self._headers) as client:
            response = await client.get(
                url,
                params={
                    "limit": limit,
                },
            )

            response.raise_for_status()

            return response.json()

    async def propose_support_ticket(
        self, conversation_id: str, title: str, description: str, priority: str
    ) -> dict:

        url = (
            f"{self.base_url}"
            f"/internal/agent-tools/"
            f"conversations/{conversation_id}"
            f"/ticket-proposals"
        )

        async with httpx.AsyncClient(headers=self._headers) as client:
            response = await client.post(
                url,
                json={
                    "title": title,
                    "description": description,
                    "priority": priority,
                },
            )

            response.raise_for_status()

            return response.json()
