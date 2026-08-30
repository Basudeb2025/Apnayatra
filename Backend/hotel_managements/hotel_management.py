
from datetime import datetime, timezone
from fastapi import HTTPException


def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def safe_int(value, default=0):
    try:
        return int(value)
    except (TypeError, ValueError):
        return default


def envelope(success: bool, data=None, message: str = None, error: str = None):
    body = {"success": success}
    if message is not None:
        body["message"] = message
    if data is not None:
        body["data"] = data
    if error is not None:
        body["error"] = error
    return body


def api_error(message: str, status: int = 400):
    raise HTTPException(status_code=status, detail=message)

def manager_to_response(manager: dict) -> dict:
    return {
        "id": manager["phone_number"],
        "user_id": manager["phone_number"],
        "hotel_name": manager.get("hotel_name"),
        "phone_number": manager["phone_number"],
        "created_at":  now_iso(),
        "token": f"token-{int(datetime.now().timestamp() * 1000)}",
    }

def hotel_to_response(hotel: dict) -> dict:
    return {
        "hotel_id": hotel["hotel_id"],
        "user_id": hotel.get("manager_phone"),
        "hotel_name": hotel.get("hotel_name"),
        "town": hotel.get("town"),
        "address": hotel.get("address"),
        "available_rooms": hotel.get("available_rooms"),
        "total_rooms": hotel.get("total_rooms"),
        "price": hotel.get("price"),
        "manager_phone": hotel.get("manager_phone"),
        "created_at":  now_iso(),
    }
        # "hotel_id": next_id,
        # "hotel_name": hotel_name,
        # "town": town,
        # "address": address,
        # "total_rooms": total_rooms,
        # "available_rooms": available_rooms,
        # "price": price

def room_to_response(hotel_id, room_number, room: dict) -> dict:
    return {
        "id": f"R{room_number}",
        "hotel_id": hotel_id,
        "room_number": str(room_number),
        "room_type": room.get("room_type"),
        "price": room.get("price"),
        "status": room.get("status"),
        "floor": room.get("floor"),
        "capacity": room.get("capacity", 2),
        "amenities": room.get("amenities", ["AC", "Free Wi-Fi", "TV"]),
    }


def reservation_to_response(res: dict) -> dict:
    return {
        "id": res.get("phone_number"),
        "booked_hotel_name": res.get("hotel_name"),
        "customer_name": res.get("customer_name"),
        "hotel_id": str(res.get("hotel_id")),
        "hotel_room_no": res.get("hotel_room_no"),
        "number_of_rooms": res.get("number_of_rooms"),
        "phone_number": res.get("phone_number"),
        "status": res.get("status"),
        "created_at": res.get("created_at") or now_iso(),
        "check_in": res.get("check_in_date"),
        "check_out": res.get("check_out_date"),
    }
