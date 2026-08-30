from Hotel_information_DB.RAG import retrieve
from langchain_core.tools import tool
import inspect

@tool
async def execute(query):
    """Retrieve hotel details via RAG lookup for a name/location query."""
    return await retrieve(query)
    



