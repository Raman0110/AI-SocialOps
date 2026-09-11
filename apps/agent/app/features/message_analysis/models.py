from enum import Enum

from pydantic import BaseModel, Field


class Sentiment(str, Enum):
    positive = "positive"
    neutral = "neutral"
    negative = "negative"


class Priority(str, Enum):
    low = "low"
    normal = "normal"
    high = "high"
    urgent = "urgent"


class Risk(str, Enum):
    low = "low"
    medium = "medium"
    high = "high"


class AnalyzeMessageRequest(BaseModel):
    message: str = Field(
        min_length=1,
        max_length=10_000,
    )


class AnalyzeMessageResponse(BaseModel):
    intent: str
    sentiment: Sentiment
    priority: Priority
    risk: Risk
    confidence: float = Field(
        ge=0.0,
        le=1.0,
    )