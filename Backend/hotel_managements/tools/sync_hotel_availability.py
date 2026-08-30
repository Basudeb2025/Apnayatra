from hotel_managements.Connect_db import get_rooms_for_hotel
from hotel_managements.Connect_db import update_hotel_fields


def sync_hotel_availability(hotel_id):
    rooms = get_rooms_for_hotel(hotel_id)
    available = sum(1 for r in rooms.values() if r.get("status") == "Available")
    return update_hotel_fields(hotel_id, {"available_rooms": available, "total_rooms": len(rooms)})

