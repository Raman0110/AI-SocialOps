from fastapi import APIRouter

from app.features.conversation_agent.models import (RunConversationAgentRequest, RunConversationAgentResponse)
from app.features.conversation_agent.service import (run_conversation_agent)


router = APIRouter(
    prefix="/agent",
    tags=["Agent"],
)


@router.post("/run", response_model= RunConversationAgentResponse)
async def run_agent_endpoint(request: RunConversationAgentRequest) -> RunConversationAgentResponse:

    return await run_conversation_agent(request)