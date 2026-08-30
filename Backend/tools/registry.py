"""
Central registry for all LangChain tools used by the agent.

Every tool source file under tools/ exposes a function literally named
`execute` (decorated with @tool). That's fine for isolated use, but if we
bind all of them to the LLM as-is, the model sees N tools that are all
named "execute" and can't tell them apart.

This module imports each `execute` tool, renames it, gives it a proper
description, and exposes:
    ALL_TOOLS       -> list[BaseTool]                (bind this to the LLM)
    TOOLS_BY_NAME   -> dict[str, BaseTool]            (lookup at execution time)
    SENSITIVE_TOOLS -> set[str]                       (needs human approval)

If you add a new tool file, just import it below and add one line to
_TOOL_METADATA.
"""

from tools.user_db_mcp_tools.get_user_data import execute as _get_user_data
from tools.hotel_db_mcp_tools.cancel_booking import execute as _cancel_booking
from tools.hotel_db_mcp_tools.list_hotels_in_city import execute as _list_hotels_in_city
from tools.hotel_db_mcp_tools.get_hotel_details_by_name import execute as _get_hotel_details_by_name
from tools.hotel_db_mcp_tools.search_hotel_by_id import execute as _search_hotel_by_id
from tools.hotel_db_mcp_tools.hotel_booking import execute as _hotel_booking
from tools.get_weather_by_location import execute as _get_weather_by_location
from tools.hotel_db_mcp_tools.list_booking_ids import exectute as _list_booking_ids

# name -> (tool_object, description)
_TOOL_METADATA = {
    "get_user_data": (
        _get_user_data,
        "Fetch a user's details (hotel id, hotel name, number of rooms booked, "
        "customer name, Phone number,Date of booking) from the database using the current user id as the key. "
        "Input: sessionkey"
    ),
    "list_hotels_in_city": (
        _list_hotels_in_city,
        "STEP 1 for location searches. Use this whenever the user asks what "
        "hotels exist in a city/town in general (e.g. 'what hotels are in "
        "Siliguri', 'hotels near Mathabhanga', 'show me hotels in Coochbehar') "
        "extract the city name from the query and send it as the input"
        "and has NOT yet named one specific hotel. Returns a list of hotel "
        "NAMES only in that town - nothing else. Input: user_town_query "
        "(the town/city name). Do NOT use get_hotel_details_by_name for "
        "this kind of 'what hotels are in <city>' request"
        "Do not guess the answer"
    ),
    "get_hotel_details_by_name": (
        _get_hotel_details_by_name,
        "Retrieve hotel details via a RAG lookup, given a natural language, "
        "User can ask hotel details by city name or hotel name then use this"
        "query about a hotel's name and/or location. Input: query.",
    ),
    "search_hotel_by_id": (
        _search_hotel_by_id,
        "Look up complete details for a single hotel using its hotel_id. "
        "Input: hotel_id.",
    ),
    "hotel_booking": (
        _hotel_booking,
        "Book hotel room(s) for a user. This performs a real, state-changing "
        "booking and REQUIRES human confirmation before it is executed."
        "Input: hotel_id,user_id, number_of_rooms,  customer_name, phone_number,no_of_days ",
    ),
    "cancel_booking": (
        _cancel_booking,
        "Cancel an existing hotel booking for a user. This performs a real, "
        "state-changing cancellation and REQUIRES human confirmation before it. use the current user_id"
        "is executed. Input: hotel_id ,user_id, booking_id",
    ),
    "get_weather_by_location": (
        _get_weather_by_location,
        "Get current weather information for a given city name. Input: city_name.",
    ),
    "list_booking_ids":(
        _list_booking_ids,
        "This function will return the list of hotel id's booked by the user for a specific hotel"
        "Input: user_id, hotel_id",
    )
}

ALL_TOOLS = []
TOOLS_BY_NAME = {}

def _rename_tool(tool_obj, name: str, description: str):
    """
    Return a copy of tool_obj with name/description overridden.
 
    Some langchain_core/pydantic versions expose `.name` and `.description`
    on StructuredTool as read-only properties, so a plain assignment
    (`tool_obj.name = name`) raises instead of working. model_copy(update=...)
    is pydantic's supported way to get a modified copy regardless of that,
    with graceful fallbacks for older pydantic and plain mutability.
    """
    update = {"name": name, "description": description}
    if hasattr(tool_obj, "model_copy"):  # pydantic v2
        return tool_obj.model_copy(update=update)
    if hasattr(tool_obj, "copy"):  # pydantic v1
        return tool_obj.copy(update=update)
    tool_obj.name = name
    tool_obj.description = description
    return tool_obj
 
 
for _name, (_tool_obj, _description) in _TOOL_METADATA.items():
    _tool_obj = _rename_tool(_tool_obj, _name, _description)
    ALL_TOOLS.append(_tool_obj)
    TOOLS_BY_NAME[_name] = _tool_obj
 
# Tool names that must go through the human-in-the-loop review node
# (node2 in the plan: booking + cancellation).
SENSITIVE_TOOLS = {"hotel_booking", "cancel_booking"}