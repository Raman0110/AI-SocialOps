from pydantic import BaseModel, Field


class RunConversationAgentRequest(BaseModel):
    conversation_id: str
    message: str


class RunConversationAgentResponse(BaseModel):
    reply: str

    tools_used: list[str] = Field(
        default_factory=list,
        serialization_alias="toolsUsed",
    )

    pending_action_ids: list[str] = Field(
        default_factory=list,
        serialization_alias="pendingActionIds",
    )

    model_config = {"populate_by_name": True}
