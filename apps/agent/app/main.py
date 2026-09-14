from fastapi import FastAPI

from app.features.message_analysis.router import (router as message_analysis_router)
from app.features.suggested_reply.router import (router as suggested_reply_router)


app = FastAPI(
    title="SocialOps AI Agent",
    version="0.1.0",
)


@app.get("/health")
async def health():
    return {
        "service": "socialops-agent",
        "status": "healthy",
    }


app.include_router(message_analysis_router)
app.include_router(suggested_reply_router)
