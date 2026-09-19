from app.clients import socialops_api


async def propose_support_ticket(conversation_id: str,title: str,description: str,priority: str) -> dict:
    return await socialops_api.propose_support_ticket(
        conversation_id=conversation_id,
        title=title,
        description=description,
        priority=priority,
    )