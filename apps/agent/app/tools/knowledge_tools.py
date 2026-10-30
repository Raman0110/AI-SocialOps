from app.clients import socialops_api


async def search_knowledge(query: str) -> dict:
    """
    Search the organization's knowledge base (FAQs, policies)
    for entries relevant to the query.
    """

    return await socialops_api.search_knowledge(query)
