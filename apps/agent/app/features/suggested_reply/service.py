from groq import Groq

from app.config.settings import settings
from app.features.suggested_reply.models import (GenerateReplyRequest, GenerateReplyResponse)


client = Groq(api_key=settings.groq_api_key,)


def generate_reply(request: GenerateReplyRequest) -> GenerateReplyResponse:

    history = "\n".join(
        f"{message.sender}: {message.content}"
        for message in request.messages
    )

    prompt = f"""
        Customer name: {request.customer_name or "Unknown"}
        Platform: {request.platform}

        Conversation:
        {history}

        Generate a concise customer-service reply.

        Requirements:
        - Be polite and natural.
        - Address the customer's latest request.
        - Do not invent facts.
        - Do not claim an action was completed unless the conversation confirms it.
        - If required information is missing, ask the customer for it.
        - Do not mention that you are an AI.
        - Return only the reply text.
        """.strip()

    response = client.chat.completions.create(
        model=settings.groq_model,
        temperature=0.3,
        messages=[
            {
                "role": "system",
                "content": (
                    "You are a customer support assistant "
                    "for a social media operations platform."
                ),
            },
            {
                "role": "user",
                "content": prompt,
            },
        ],
    )

    content = response.choices[0].message.content

    if not content:
        raise RuntimeError("LLM returned an empty reply.")

    return GenerateReplyResponse(reply=content.strip())