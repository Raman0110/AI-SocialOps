from pydantic import BaseModel


class RunConversationAgentRequest(BaseModel):
    conversation_id: str
    message: str


class RunConversationAgentResponse(BaseModel):
    reply: str  