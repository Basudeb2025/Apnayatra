from mcp_client.db_client import get_weather_by_city
from langchain_core.tools import tool
import inspect
#@tools(name="get_weather_by_city", description="Get weather information for a specific city.")

@tool
async def execute(city_name):
    """Get weather information for a specific city."""

    return await get_weather_by_city(city_name)


