from mcp_client.db_client import cancel_booking_by_user
from langchain_core.tools import tool
import inspect

@tool
async def execute(hotel_id, user_id,booking_id):
    """Cancel a hotel booking for a user."""
    return await cancel_booking_by_user(hotel_id, user_id,booking_id)
    