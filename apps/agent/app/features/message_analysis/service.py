import json

from groq import Groq

from app.config.settings import settings

from .models import AnalyzeMessageResponse


client = Groq(api_key=settings.groq_api_key)


def analyze_message(message: str) -> AnalyzeMessageResponse:
    response = client.chat.completions.create(
        model=settings.groq_model,
        temperature=0,
        messages=[
            {
                "role": "system",
                "content": (
                    "You analyze incoming customer messages "
                    "for a social customer operations platform. "
                    "Return only the requested structured data. "
                    "Intent should be a concise snake_case label "
                    "such as delivery_issue, refund_request, "
                    "product_question, complaint, greeting, "
                    "pricing_question, or unknown."
                ),
            },
            {
                "role": "user",
                "content": message,
            },
        ],
        response_format={
            "type": "json_schema",
            "json_schema": {
                "name": "message_analysis",
                "strict": True,
                "schema": {
                    "type": "object",
                    "properties": {
                        "intent": {
                            "type": "string",
                        },
                        "sentiment": {
                            "type": "string",
                            "enum": [
                                "positive",
                                "neutral",
                                "negative",
                            ],
                        },
                        "priority": {
                            "type": "string",
                            "enum": [
                                "low",
                                "normal",
                                "high",
                                "urgent",
                            ],
                        },
                        "risk": {
                            "type": "string",
                            "enum": [
                                "low",
                                "medium",
                                "high",
                            ],
                        },
                        "confidence": {
                            "type": "number",
                            "minimum": 0,
                            "maximum": 1,
                        },
                    },
                    "required": [
                        "intent",
                        "sentiment",
                        "priority",
                        "risk",
                        "confidence",
                    ],
                    "additionalProperties": False,
                },
            },
        },
    )

    content = response.choices[0].message.content

    if not content:
        raise RuntimeError("LLM returned an empty response.")

    data = json.loads(content)

    return AnalyzeMessageResponse.model_validate(data)
