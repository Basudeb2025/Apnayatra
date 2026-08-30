from mcp_client.db_client import list_hotels_in_city
from langchain_core.tools import tool
import inspect

#@tool(name="search_hotel_names_by_location", description="Search for hotel names by town name in the database.")
@tool

async def execute(user_town_query):
    """Search for hotel names by town name in the database."""
    return await list_hotels_in_city(user_town_query)

  