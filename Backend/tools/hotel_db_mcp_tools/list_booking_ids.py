from langchain_core.tools import tool
from mcp_client.db_client import list_booking_ids

@tool
async def exectute(user_id , hotel_id):
    """ Returns the total number of bookings and a list of booking IDs"""
    return await list_booking_ids(user_id,hotel_id)



