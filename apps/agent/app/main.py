from fastapi import FastAPI

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