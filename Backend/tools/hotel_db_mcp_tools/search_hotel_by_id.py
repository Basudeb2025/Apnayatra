from mcp_client.db_client import search_hotel_by_id
from langchain_core.tools import tool
import inspect

#@tool(name="search_hotel_by_id", description="Search for a hotel details by its ID in the database.")
@tool
async def execute(hotel_id):
    """Search for a hotel's details by its ID in the database."""

    return await search_hotel_by_id(hotel_id)
  
    



