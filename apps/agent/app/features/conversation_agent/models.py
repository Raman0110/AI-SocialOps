from datetime import datetime

from pydantic import BaseModel, Field


class RunConversationAgentRequest(BaseModel):
    conversation_id: str
    message: str


class ToolExecutionResult(BaseModel):
    toolName: str
    argumentsJson: str
    resultJson: str | None = None
    success: bool
    error: str | None = None
    startedAt: datetime
    completedAt: datetime


class RunConversationAgentResponse(BaseModel):
    reply: str

    toolsUsed: list[str] = Field(default_factory=list)

    pendingActionIds: list[str] = Field(default_factory=list)

    toolExecutions: list[ToolExecutionResult] = Field(default_factory=list)

    model: str
