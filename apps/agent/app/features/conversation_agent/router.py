from fastapi import APIRouter, HTTPException

from app.features.conversation_agent.models import (RunConversationAgentRequest, RunConversationAgentResponse)
from app.features.conversation_agent.service import (AgentRunError, run_conversation_agent)


router = APIRouter(
    prefix="/agent",
    tags=["Agent"],
)


@router.post("/run", response_model= RunConversationAgentResponse)
async def run_agent_endpoint(request: RunConversationAgentRequest) -> RunConversationAgentResponse:

    try:
        return await run_conversation_agent(request)
    except AgentRunError as exc:
        raise HTTPException(status_code=502, detail=str(exc)) from exc
