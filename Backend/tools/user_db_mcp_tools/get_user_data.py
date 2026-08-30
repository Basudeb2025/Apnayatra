from mcp_client.db_client import fetch_user_by_id
from langchain_core.tools import tool


@tool
async def execute(sessionkey):
    """Fetch user details by phone number from the database."""
    return await fetch_user_by_id(sessionkey)

   