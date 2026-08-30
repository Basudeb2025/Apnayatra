import firebase_admin
from firebase_admin import credentials,db



def find_available_room_number(hotel_id):
    rooms = get_rooms_for_hotel(hotel_id)
    for room_number, room in rooms.items():
        if room.get("status") == "Available":
            return room_number
    return None

def count_availble_room(hotel_id):
    rooms = get_rooms_for_hotel(hotel_id)
    c = 0
    for room_number, room in rooms.items():
            if room.get("status") == "Available":
                c+=1
    return c


def get_all_hotels():
    return db.reference("hotels").get() or {}

 

def get_hotel(hotel_id):
    return db.reference(f"hotels/{hotel_id}").get()

 

def get_hotel_id_of_user(user_id):
    user_id = str(user_id)
    ref = db.reference(f'hotel_management/manager_data/{user_id}').get()
    if ref is None:
        return "None"
    return ref["hotel_id"]

 
def get_manager(phone_number):
    return db.reference(f"hotel_management/manager_data/{phone_number}").get()

def get_manager_email(phone_number):
    return db.reference(f"hotel_management/manager_data/{phone_number}/email").get()

 

def get_reservations_for_hotel(hotel_id):
    reservations = {}
    reservations_ref = db.reference(f"hotel_management/reservations/{hotel_id}").get() or {}
    
    # Iterate through phone numbers and their bookings
    for phone_number, phone_data in reservations_ref.items():
        if isinstance(phone_data, dict) and "booking" in phone_data:
            bookings = phone_data["booking"]
            if isinstance(bookings, dict):
                for booking_id, booking_data in bookings.items():
                    # Use booking_id as key for the flattened structure
                    reservations[booking_id] = booking_data
    
    return reservations


def get_room(hotel_id, room_number):
    return db.reference(f"hotel_management/room_details/{hotel_id}/{room_number}").get()

 
def get_rooms_for_hotel(hotel_id):
    return db.reference(f"hotel_management/room_details/{hotel_id}").get() or {}

from Email_services.Manager_registration_email import send_signup_email_to_manager
def managers_data(phone_number, hotel_name, password,email):
    ref1 = db.reference("hotels")
    all_hotels = ref1.get() or {}
    next_id = 100
    if isinstance(all_hotels, dict) and all_hotels:
        next_id = max(
            int(hotel.get("hotel_id", 0)) for hotel in all_hotels.values()
        ) + 1
    else:
        next_id = 100
    ref = db.reference(f'hotel_management/manager_data/{phone_number}')
    data_schema = {
        "phone_number": phone_number,
        "hotel_name": hotel_name,
        "password": password,
        "hotel_id":next_id,
        "email": email   
    }
    ref.set(data_schema)
    send_signup_email_to_manager(hotel_name,next_id,email,phone_number)
    return data_schema

def reversavtion_collection_save(hotel_name, customer_name, hotel_id, hotel_room_no,number_of_rooms, phone_number, status, check_in, check_out):
    """
    Saves reservation data with sequential booking IDs.
    Booking ID format = hotelid + booking_number (string concat).
    Example: hotel_id=134, booking_number=1 → "1341"
    """
    room_ref = db.reference(f'hotel_management/room_details/{hotel_id}/{hotel_room_no}')
    room_data = room_ref.get()

    if not room_data:
        return {"message": f"Room {hotel_room_no} not found in hotel {hotel_id}."}

    if room_data.get("status") != "Available":
        return {"message": f"Room {hotel_room_no} is not available for booking."}
    
    bookings_ref = db.reference(f'hotel_management/reservations/{hotel_id}/{phone_number}/booking')
    existing_bookings = bookings_ref.get() or {}

    # Find the last booking number
    prefix = f"AY{hotel_id}"
    if existing_bookings:
       last_booking_num = max(
        int(bid[len(prefix):]) for bid in existing_bookings.keys()
       )
       new_booking_num = last_booking_num + 1
    else:
       new_booking_num = 1

    booking_id = f"AY{hotel_id}{new_booking_num}"

    data_schema = {
        "hotel_name": hotel_name,
        "customer_name": customer_name,
        "hotel_id": hotel_id,
        "hotel_room_no": hotel_room_no,
        "number_of_rooms": number_of_rooms,
        "phone_number": phone_number,
        "status": status,
        "check_in_date": check_in,
        "check_out_date": check_out
    }

    # Save under sequential booking ID
    bookings_ref.child(booking_id).set(data_schema)

    return {
        "message": "Reservation saved successfully.",
        "booking_id": booking_id,
        "data": data_schema
    }



import random
 
def room_details_store(hotel_id, room_number, room_type, price, status):
    # status, floor will be fixed
    floor = random.randint(1, 5)
    ref = db.reference(f'hotel_management/room_details/{hotel_id}/{room_number}')
    data_Schema = {
        "room_number": room_number,
        "room_type": room_type,
        "price": price,
        "floor": floor,
        "status": status
    }
    ref.set(data_Schema)

    return data_Schema 

from Hotel_information_DB.RAG import store_hotel
def save_hotels_data(user_id, hotel_name, town, address, available_rooms, total_rooms, price,description):
    
    next_id = get_hotel_id_of_user(user_id)
    print(f'This is the user_id from manager_data:{user_id}')
    ref = db.reference(f'hotels/{next_id}')
    hotels_data = {
        "hotel_id": next_id,
        "hotel_name": hotel_name,
        "town": town,
        "address": address,
        "total_rooms": total_rooms,
        "available_rooms": available_rooms,
        "price": price,
        "manager_phone":user_id
    }
    ref.set(hotels_data)
    store_hotel(hotel_name,town,description)
    return hotels_data

 
def update_hotel_fields(hotel_id, updates: dict):
    db.reference(f"hotels/{hotel_id}").update(updates)
    return db.reference(f"hotels/{hotel_id}").get()



def update_reservation(hotel_id, phone_number, updates: dict):
    # Get all bookings for this phone number
    bookings_ref = db.reference(f"hotel_management/reservations/{hotel_id}/{phone_number}/booking").get() or {}
    
    if not bookings_ref:
        return None
    
    # Update the latest booking (last one in the dictionary)
    booking_id = list(bookings_ref.keys())[-1] if bookings_ref else None
    if booking_id:
        db.reference(f"hotel_management/reservations/{hotel_id}/{phone_number}/booking/{booking_id}").update(updates)
        return db.reference(f"hotel_management/reservations/{hotel_id}/{phone_number}/booking/{booking_id}").get()
    
    return None
 

def update_room(hotel_id, room_number, updates: dict):
    db.reference(f"hotel_management/room_details/{hotel_id}/{room_number}").update(updates)
    return get_room(hotel_id, room_number)


def cancel_reservations(hotel_id, phone_number, booking_id):
    booking_ref = db.reference(
        f'hotel_management/reservations/{hotel_id}/{phone_number}/booking/{booking_id}'
    )

    if not booking_ref.get():
        return f"No booking found with ID '{booking_id}' for phone number '{phone_number}' at hotel ID '{hotel_id}'."

    booking_ref.delete()
    return f"Booking '{booking_id}' for hotel ID '{hotel_id}' and phone number '{phone_number}' canceled successfully."



def cancel_reservation_by_button(hotel_id, phone_number):
    """
    Returns a list of booking IDs for a given hotel and phone number
    where the status is 'Cancelled'.
    """
    bookings_ref = db.reference(f'hotel_management/reservations/{hotel_id}/{phone_number}/booking')
    bookings_data = bookings_ref.get() or {}

    
    for booking_id, details in bookings_data.items():
        if details.get("status") == "Canceled":
           print(cancel_reservations(hotel_id,phone_number,booking_id))


def get_last_booking(hotel_id, phone_number):
    """
    Fetch the most recent booking for a given hotel + phone number.

    Returns a tuple (booking_id, booking_data) if a booking exists,
    otherwise None.
    """
    bookings_ref = db.reference(f'hotel_management/reservations/{hotel_id}/{phone_number}/booking')
    existing_bookings = bookings_ref.get() or {}

    if not existing_bookings:
        return None

    prefix = f"AY{hotel_id}"
    valid_bookings = {
        bid: data for bid, data in existing_bookings.items()
        if bid.startswith(prefix) and bid[len(prefix):].isdigit()
    }

    if not valid_bookings:
        return None

    last_id, last_data = max(
        valid_bookings.items(),
        key=lambda item: item[1].get("Date_of_booking", "")
    )
    return last_id, last_data