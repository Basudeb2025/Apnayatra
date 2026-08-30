from mcp_client.db_client import hotel_booking_by_user
from langchain_core.tools import tool
import inspect


@tool
async def execute(hotel_id, user_id, number_of_rooms, customer_name, phone_number,no_of_days):
    """Book hotel room(s) for a user."""
    return await hotel_booking_by_user(hotel_id, user_id, number_of_rooms, customer_name, phone_number,no_of_days)
   