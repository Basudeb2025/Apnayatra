import firebase_admin
from firebase_admin import credentials, db
import os
from dotenv import load_dotenv
import datetime

load_dotenv()  # Load environment variables from .env file

# 1. Initialize the Admin SDK with your service account credentials

cred = credentials.Certificate("the_json_file.json")
url = os.getenv("databaseURL")
firebase_admin.initialize_app(cred, {
    'databaseURL': url
})

token_id = os.getenv("token_id")
# 2. Get a database reference (e.g., at the path "users")
__all__ = ["db"]

from hotel_managements.Connect_db import reversavtion_collection_save
from hotel_managements.Connect_db import cancel_reservations
from hotel_managements.Connect_db import get_manager_email


async def search_hotel_by_id(hotel_id):
    # Reference the specific hotel path (e.g., 'hotels/100')
    ref = db.reference(f'hotels/{hotel_id}')
    hotel_data = ref.get()
    
    if hotel_data:
        return hotel_data
    else:
        return {"error": f"Hotel with ID '{hotel_id}' not found."}

def normalize_text(text: str) -> str:
    # Remove spaces and convert to lowercase
    return text.replace(" ", "").lower()

async def list_hotels_in_city(user_town_query):
    """
    Traverses the database to find hotels matching a specific town name,
    returning matching hotel IDs and names.
    """
    # 1. Fetch the entire database node (Note: Inefficient for large datasets)
    ref = db.reference('hotels')
    all_hotels = ref.get()
    
    if not all_hotels:
        print("No hotels found in the database.")
        return []
        
    # 2. Convert the user's town query to lowercase with no spaces
    clean_query = normalize_text(user_town_query)
    matching_hotel_names = []
    
    # Handle database formats (dict or list)
    hotels_iterator = all_hotels.values() if isinstance(all_hotels, dict) else all_hotels
    
    # 3. Traverse through each hotel in Python
    for hotel in hotels_iterator:
        # FIX: Changed 'tool' to 'town' and added validation for 'hotel_id'
        if hotel and 'town' in hotel and 'hotel_name' in hotel and 'hotel_id' in hotel:
            # Normalize this hotel's town name
            clean_db_town = normalize_text(hotel['town'])
            
            # 4. If the town matches, extract ID and name
            if clean_query == clean_db_town:
                hotel_details = f"Hotel ID: {hotel['hotel_id']}, Hotel Name: {hotel['hotel_name']}"
                matching_hotel_names.append(hotel_details)
                
    return matching_hotel_names


#user data schema in firebase realtime database

async def save_user_by_uid(customer_name, user_id, phone_number, booked_hotel_name,
                           hotel_id, hotel_room_no, no_of_rooms, no_of_days, manager_phone) -> str:
    phone_key = str(user_id)
    date = str(datetime.date.today())

    bookings_ref = db.reference(f'users/{phone_key}/{hotel_id}/bookings')
    existing_bookings = bookings_ref.get() or {}

    prefix = f"AY{hotel_id}"
    existing_nums = [
        int(bid[len(prefix):])
        for bid in existing_bookings.keys()
        if bid.startswith(prefix) and bid[len(prefix):].isdigit()
    ]
    new_booking_num = max(existing_nums) + 1 if existing_nums else 1
    booking_id = f"{prefix}{new_booking_num}"

    user_data = {
        "customer_name": customer_name,
        "phone_number": phone_number,
        "booked_hotel_name": booked_hotel_name,
        "hotel_room_no": str(hotel_room_no),
        "no_of_rooms": int(no_of_rooms),
        "Date_of_booking": date,
        "No_of_days": int(no_of_days),
        "manager_phone": manager_phone
    }

    bookings_ref.child(booking_id).set(user_data)

    return f"User data saved successfully. Booking ID: {booking_id}"

            

async def fetch_user_by_id(user_id):
    """
    Fetches the user details using their user_id.
    Returns a readable string including booking IDs.
    """
    phone_key = str(user_id)
    ref = db.reference(f'users/{phone_key}/')
    user_data = ref.get()
    if user_data:
        lines = []
        for hotel_id, hotel_data in user_data.items():
            bookings = hotel_data.get("bookings", {})
            for booking_id, details in bookings.items():
                lines.append(
                    f"Booking Id: {booking_id}, Hotel ID: {hotel_id}, "
                    f"Hotel Name: {details.get('booked_hotel_name')}, "
                    f"Rooms Booked: {details.get('no_of_rooms')}, "
                    f"Customer Name: {details.get('customer_name')}, "
                    f"Phone Number: {str(details.get('phone_number'))}, "
                    f"Date Of Booking: {details.get('Date_of_booking')}"
                    
                )
        
        if lines:
            return "\n".join(lines)
        return f"User '{phone_key}' exists, but has no bookings."

    return f"No user found with phone number '{phone_key}'."


async def delete_user_by_id(user_id):
    """
    Deletes the user's record from the database.
    """
    phone_key = str(user_id)
    ref = db.reference(f'users/{phone_key}')
    
    # Check if the user exists before attempting to delete
    if ref.get():
        ref.delete()
        return f"User with phone number '{phone_key}' successfully deleted."
    else:
        return f"No user found with phone number '{phone_key}' to delete."



#Weather data From OpenWeatherMap API
import requests # replace with your actual key
  # replace with your actual key
API_KEY = os.getenv("API_KEY")  # Fetch the API key from environment variables
BASE_URL = os.getenv("BASE_URL")  # Fetch the base URL from environment variables



async def get_weather_by_city(city_name: str):
    # Step 1: Get coordinates from Geocoding API
    geo_url = f"http://api.openweathermap.org/geo/1.0/direct?q={city_name},IN&limit=1&appid={API_KEY}"
    geo_data = requests.get(geo_url).json()
    if not geo_data:
        return {"error": f"City '{city_name}' not found"}

    lat, lon = geo_data[0]["lat"], geo_data[0]["lon"]

    # Step 2: Get weather using coordinates
    weather_url = f"http://api.openweathermap.org/data/2.5/weather?lat={lat}&lon={lon}&appid={API_KEY}&units=metric"
    weather_data =  requests.get(weather_url).json()

    return {
        "city": city_name,
        "temperature": weather_data["main"]["temp"],
        "weather": weather_data["weather"][0]["description"]
    }



async def modify_hotel_data(hotel_id, new_data):
    """
    Modifies the hotel data for a given hotel ID in Firebase Realtime Database.
    """
    # Create a reference directly to the nested 'available_rooms' path
    rooms_ref = db.reference(f'hotels/{hotel_id}')
    new_data = {"available_rooms": new_data}
    # Check if the node contains data
    snapshot = rooms_ref.get()
    if snapshot:
        # Update the reference itself to write changes back to Firebase
        rooms_ref.update(new_data)
        return f"Hotel data for ID '{hotel_id}' updated successfully."
    else:
        return f"Hotel data for ID '{hotel_id}' or 'available_rooms' does not exist."


def get_user_email(phone_number):
    ref = db.reference(f'User_data/{phone_number}/email').get()
    return ref

from hotel_managements.Connect_db import find_available_room_number,update_room,count_availble_room, get_last_booking
from Email_services.Reservation_mail_to_manager import send_reservation_email_to_manager
from Email_services.Booking_confirmation_email import send_booking_email_to_user


async def hotel_booking_by_user(hotel_id,user_id,numer_of_room,customer_name,phone_number,no_of_days):

    # Fetch current available rooms for the hotel
    ref = db.reference(f'hotels/{hotel_id}/available_rooms')
    current_available_rooms = ref.get()
    booked_hotel_name = db.reference(f'hotels/{hotel_id}/hotel_name').get()
    manager_phone = db.reference(f'hotels/{hotel_id}/manager_phone').get()
    if current_available_rooms is None:
        return f"Hotel with ID '{hotel_id}' not found."
    
    # Check if there are enough available rooms
    numer_of_room = int(numer_of_room)
    if current_available_rooms < numer_of_room:
        return f"Not enough available rooms. Current available: {current_available_rooms}."
    
    # Update the available rooms after booking
    hotel_room_no = find_available_room_number(hotel_id)
    print(hotel_room_no)
    if hotel_room_no == -1:
        return f"No availble rooms for Hotel Id: {hotel_id}"
    count_rooms = count_availble_room(hotel_id)
    if count_rooms < numer_of_room:
        return f"Not enough available rooms. Current available: {count_rooms}."

    current_available_rooms = current_available_rooms - int(numer_of_room)
    await modify_hotel_data(hotel_id, current_available_rooms)
    await save_user_by_uid(customer_name, user_id, phone_number, booked_hotel_name, hotel_id, hotel_room_no, numer_of_room, no_of_days,manager_phone)
    date = str(datetime.date.today())
    # user_key = str(user_id)
    # ref = db.reference(f'users/{user_key}/')
    # user_data = ref.get()
    # last_key = list(user_data.keys())[-1]
    # details = user_data[last_key]
    
    
    # Use No_of_days to calculate checkout
    check_in_date = datetime.datetime.strptime(date, "%Y-%m-%d")
    no_of_days = int(no_of_days)  # default to 1 if missing
    check_out_date = check_in_date + datetime.timedelta(days=no_of_days)

    # Format back to string for saving
    check_out_date_str = check_out_date.strftime("%Y-%m-%d")
    user = ""
    user += f"Hotel Name: , Rooms Booked: {numer_of_room}, Customer Name: {customer_name},No Of Days/night: {no_of_days}\n"
    saved = reversavtion_collection_save(booked_hotel_name,customer_name,hotel_id,hotel_room_no,numer_of_room,user_id,"Confirmed",date,check_out_date_str)
    print(saved)
    rooms = update_room(hotel_id, hotel_room_no, {"status": "Reserved"})
    print(rooms)
    # Hotel manager email
    result = get_last_booking(hotel_id=hotel_id, phone_number=user_id)
    booking_id = ""
    booking_data = None
    if result:
        booking_id, booking_data = result
        print(booking_id)          # e.g. "AY1313"
        print(booking_data)        # full dict: hotel_name, customer_name, etc.
    else:
        print("No bookings found for this hotel/phone number.")
        
    check_in_date = datetime.datetime.strptime(date, "%Y-%m-%d")
    manager_phone = db.reference(f'hotels/{hotel_id}/manager_phone').get()
    manager_email = get_manager_email(manager_phone)
    user_email = get_user_email(user_id)
    send_reservation_email_to_manager(str(manager_email), customer_name, booked_hotel_name, phone_number, check_in_date,numer_of_room)
    send_booking_email_to_user(user_email, customer_name,booked_hotel_name , booking_id, check_in_date, no_of_days)
    return f"Booking successful! for hotel ID: '{hotel_id}' and the booked room number is: {hotel_room_no} , for {user}"

async def update_room_status_for_delete_user(hotel_id, hotel_room_no, status="Available"):
    room_ref = db.reference(f'hotel_management/room_details/{hotel_id}/{hotel_room_no}')
    room_ref.update({"status": status})
    return room_ref.get()

async def cancel_booking_by_user(hotel_id, user_id, booking_id):
    # Fetch current available rooms for the hotel
    ref = db.reference(f'hotels/{hotel_id}/available_rooms')
    current_available_rooms = ref.get()

    if current_available_rooms is None:
        return f"Hotel with ID '{hotel_id}' not found."
    
    user_key = str(user_id)
    bookings_ref = db.reference(f'users/{user_key}/{hotel_id}/bookings')
    bookings_data = bookings_ref.get()

    if not bookings_data:
        return f"No booking found for user '{user_key}' at hotel ID '{hotel_id}'."

    # Look up the specific booking by ID
    matched_details = bookings_data.get(booking_id)
    if not matched_details:
        return f"No booking found with ID '{booking_id}' for user '{user_key}' at hotel ID '{hotel_id}'."
    hotel_room_no = matched_details.get("hotel_room_no")
    if not hotel_room_no:
        return f"Booking '{booking_id}' found, but has no room number recorded."
    print(hotel_room_no) 
    # Get the number of rooms booked from the matched booking
    rooms_booked = int(matched_details.get('no_of_rooms', 0))
   
    # Update the available rooms after cancellation
    new_available_rooms = current_available_rooms + rooms_booked
    await modify_hotel_data(hotel_id, new_available_rooms)
    await update_room_status_for_delete_user(hotel_id,hotel_room_no)
    # Delete just that booking entry
    bookings_ref.child(booking_id).delete()
    ht_reserve = cancel_reservations(hotel_id, user_id, booking_id)
    print(ht_reserve)
    return f"Booking '{booking_id}' for hotel ID '{hotel_id}' canceled successfully."


from Email_services.User_registration_email import send_signup_email_to_user

def signUp_user(ph_number, name:str,password:str,email:str):
    phone_key = str(ph_number)
    ref = db.reference(f'User_data/{phone_key}')
    existing_data = ref.get()
    if existing_data is not None:
        # User already exists, return a status indicating this
        return {"status": "already_exists"}
    user_data = {
        "name":name,
         "password":password,
         "email":email
    }
    send_signup_email_to_user(email,ph_number,name)
    ref.set(user_data)
    return {"status": "yes"}



def user_exist(ph_number,password:str):
    phone_key = str(ph_number)
    ref = db.reference(f'User_data/{phone_key}').get()
    if ref is not None:
        pas = ref.get("password")
        if(pas == password):
           return {
            "name": ref.get("name"),
             "Phone_number": phone_key
          }
        else:
            return {"status":"invalid_p"}
    return {"status" : "none"}




#this is similar to the fetch_user_by_id 
async def Booked_hotel_details(user_id):
    """
    Fetches the user details using their phone number.
    Returns a list of dictionaries for the agent/tool layer.
    """
    phone_key = str(user_id)
    ref = db.reference(f'users/{phone_key}/')
    user_data = ref.get()
    manager_email = db.reference(f'')
    if user_data:
        lines = []
        # Loop through each hotel ID
        for hotel_id, hotel_data in user_data.items():
            # Safely get the nested bookings dictionary
            bookings = hotel_data.get("bookings", {})
            for booking_id, details in bookings.items():
                lines.append(
                    {
                        "hotel_name": details.get('booked_hotel_name'),
                        "customer_name": details.get('customer_name'),
                        "hotel_id": hotel_id,
                        "booking_id":booking_id,
                        "phone_number": str(details.get('phone_number')),
                        "room_number": str(details.get('hotel_room_no')),
                        "date_of_booking": details.get('Date_of_booking'),
                        "number_of_rooms": str(details.get('no_of_rooms')),
                        "ManagerPhnumber" : str(details.get('manager_phone'))
                
                    }
                )
        if lines:
            return lines

    return "none"

async def list_booking_ids(user_id: str, hotel_id: str):
    """
    Returns the total number of bookings and a list of booking IDs
    for a given user and hotel. If no bookings exist, returns a message.
    """
    bookings_ref = db.reference(f'users/{user_id}/{hotel_id}/bookings')
    existing_bookings = bookings_ref.get() or {}

    if not existing_bookings:
        return {
            "count": 0,
            "booking_ids": [],
            "message": "No booking exists for this user and hotel."
        }

    # Extract booking IDs (keys of the dictionary)
    booking_ids = list(existing_bookings.keys())
    count = len(booking_ids)

    return {
        "count": count,
        "booking_ids": booking_ids,
        "message": f"{count} booking(s) found."
    }
