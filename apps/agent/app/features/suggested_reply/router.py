from fastapi import APIRouter
from app.features.suggested_reply.models import (GenerateReplyRequest, GenerateReplyResponse)
from app.features.suggested_reply.service import (generate_reply)


router = APIRouter(
    prefix="/agent",
    tags=["Agent"],
)

@router.post("/generate-reply", response_model=GenerateReplyResponse)
async def generate_reply_endpoint(request: GenerateReplyRequest) -> GenerateReplyResponse:
    return generate_reply(request)