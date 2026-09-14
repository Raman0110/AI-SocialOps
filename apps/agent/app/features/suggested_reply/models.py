from pydantic import BaseModel, Field


class ConversationMessage(BaseModel):
    sender: str
    content: str


class GenerateReplyRequest(BaseModel):
    customer_name: str | None = None
    platform: str
    messages: list[ConversationMessage] = Field(
        min_length=1,
        max_length=50,
    )


class GenerateReplyResponse(BaseModel):
    reply: str