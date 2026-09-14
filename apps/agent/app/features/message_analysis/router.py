from fastapi import APIRouter

from .models import AnalyzeMessageRequest, AnalyzeMessageResponse
from .service import analyze_message


router = APIRouter(prefix="/agent",tags=["Agent"])


@router.post("/analyze-message", response_model=AnalyzeMessageResponse)
async def analyze_message_endpoint(request: AnalyzeMessageRequest) -> AnalyzeMessageResponse:
    return analyze_message(request.message)
