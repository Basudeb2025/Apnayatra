"""
Minimal web layer for the hotel agent.

Flow, matching what you described:
  1. Website loads -> POST /session/start  {phone_number}
     -> we create a thread_id and remember phone_number for it.
  2. Every chat turn -> POST /chat  {thread_id, message}
     -> we look up the phone_number for that thread_id server-side
        and use it as mem0's user_id. The frontend never has to
        resend the phone number, and the LLM never has to "guess" it.
  3. If a booking/cancel needs confirmation -> POST /chat/confirm
     {thread_id, approved}

SESSION_STORE below is in-memory, same caveat as MemorySaver in
graph/builder.py: fine for local dev, swap for Redis/Postgres before
you actually deploy this (multiple workers won't share this dict).

Run with:  uvicorn api:app --reload
"""

import re
import uuid
from typing import Dict, Optional, List
import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from langchain_core.messages import HumanMessage
from langgraph.types import Command
from pydantic import BaseModel
from mcp_client.db_client import user_exist, signUp_user,Booked_hotel_details
from graph.builder import build_graph
from langsmith import Client
from dotenv import load_dotenv



load_dotenv()
app_graph = build_graph()
app = FastAPI(title="Hotel Agent API")
client = Client()
os.environ["LANGSMITH_TRACING"] = "true"
# Dev-only: lets the frontend (served from a different port/origin while
# you're building it) call this API directly. Lock this down to your real
# frontend origin before deploying.
origins = [
    "https://apnayatra-frontend-user.vercel.app",
     "https://apnayatra-frontend-hotel-manager-gs.vercel.app"
]
app.add_middleware(
    CORSMiddleware,
    allow_origins= origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# thread_id -> user_id (normalized phone number)
SESSION_STORE: Dict[str, str] = {}


def normalize_phone_number(raw: str) -> str:
    """
    mem0 keys memories by the exact user_id string, so the SAME user
    must always produce the SAME user_id across sessions. Do NOT skip
    this - "+91 98765 43210", "9876543210" and "09876543210" being
    treated as three different users silently breaks memory recall.
    Adjust this to your actual expected phone format / country rules.
    """
    digits = re.sub(r"\D", "", raw)
    return digits

#This is for user frontend
class StartSessionRequest(BaseModel):
    phone_number: str
    password:str


class StartSessionResponse(BaseModel):
    thread_id: str
    name: str


class ChatRequest(BaseModel):
    thread_id: str
    message: str

class SignUP(BaseModel):
    name:str
    email:str
    phone_number:str
    password:str

class SignupResponse(BaseModel):
    thread_id: str
    phone_number:str
    name:str

class ConfirmRequest(BaseModel):
    thread_id: str
    approved: bool


class ChatResponse(BaseModel):
    reply: Optional[str] = None
    requires_confirmation: bool = False
    pending_tool_calls: Optional[list] = None
    confirmation_message: Optional[str] = None


class GetResponseBooking(BaseModel):
    thread_id: str

class BookingResponse(BaseModel):
    hotel_name:str
    customer_name:str
    hotel_id:str
    phone_number:str
    room_number:str
    date_of_booking:str
    number_of_rooms: str
    ManagerPhnumber:str



def _extract_text(content) -> str:
    """
    Normalize an AIMessage.content into a plain string.

    Groq/OpenAI-style models return .content as a plain string. Gemini
    (langchain_google_genai) returns it as a list of content blocks
    instead - e.g. [{"type": "text", "text": "..."}, {"type": "thought_signature", ...}]
    - even for an ordinary text reply. Passing that list straight into
    ChatResponse(reply=...) fails pydantic validation since `reply` is
    typed as a plain string. This pulls out and joins only the actual
    text parts, regardless of which shape the model returned.
    """
    if isinstance(content, str):
        return content

    if isinstance(content, list):
        parts = []
        for block in content:
            if isinstance(block, str):
                parts.append(block)
            elif isinstance(block, dict) and block.get("type") == "text":
                parts.append(block.get("text", ""))
        return "".join(parts)

    return str(content) if content is not None else ""


def _build_config(thread_id: str) -> dict:
    user_id = SESSION_STORE.get(thread_id)
    if user_id is None:
        raise HTTPException(status_code=404, detail="Unknown thread_id. Call /session/start first.")
    return {"configurable": {"thread_id": thread_id, "user_id": user_id}}

def _format_result(result: dict) -> ChatResponse:
    if "__interrupt__" in result:
        payload = result["__interrupt__"][0].value
        return ChatResponse(
            requires_confirmation=True,
            confirmation_message=payload.get("message", ""),
            pending_tool_calls=payload.get("tool_calls", []),
        )
    last = result["messages"][-1]
    return ChatResponse(reply=_extract_text(last.content))


@app.post("/session/start", response_model=StartSessionResponse)
def start_session(req: StartSessionRequest):
    user_id = normalize_phone_number(req.phone_number)
    password = req.password
    User_exist = user_exist(user_id,password)
    if not user_id:
        raise HTTPException(status_code=400, detail="Invalid phone number.")
    if User_exist.get("status") == "none":
        raise HTTPException(status_code=400,detail= "No account was found with these credentials. Please sign up first to create an account.")
    if User_exist.get("status") == "invalid_p":
        raise HTTPException(status_code=401,detail= "Incorrect password. Please check your password and try again")
    thread_id = str(uuid.uuid4())
    SESSION_STORE[thread_id] = user_id
    return StartSessionResponse(thread_id=thread_id, name = User_exist['name'])

@app.post("/session/signup_start",response_model=SignupResponse)
async def signUP_user(req:SignUP):
    user_id = normalize_phone_number(req.phone_number)
    password = req.password
    if len(user_id) < 1: 
        raise HTTPException(status_code=400,detail="Please enter a valid phone number")
    email = req.email
    thread_id = str(uuid.uuid4())
    SESSION_STORE[thread_id] = user_id
    created_user = signUp_user(user_id,req.name,password,email)
    if created_user['status'] == "already_exists":
        raise HTTPException(status_code=409,detail= "user exist please sign in by this phone number")
    return SignupResponse(thread_id = thread_id,phone_number=user_id,name=req.name)
  

@app.post("/chat", response_model=ChatResponse)
async def chat(req: ChatRequest):
    config = _build_config(req.thread_id)
    user_id = SESSION_STORE.get(req.thread_id)
    result = await app_graph.ainvoke({"messages": [HumanMessage(content=req.message)]}, config=config)
    #LangSmith
    client.create_run(
        project_name="ApnaYatra",
        name="chat_answer",
        run_type="chain",  
        inputs={"question" : result},
        outputs={"answer": req.message},
        metadata={"user_id": user_id, "route": "chat"}
    )
    return _format_result(result)


@app.post("/chat/confirm", response_model=ChatResponse)
async def confirm(req: ConfirmRequest):
    config = _build_config(req.thread_id)
    result = await app_graph.ainvoke(Command(resume={"approved": req.approved}), config=config)
    return _format_result(result)

@app.post("/bookings", response_model=List[BookingResponse])
async def get_bookings(req:GetResponseBooking):
    """
    API endpoint that returns bookings for the authenticated session.
    The frontend must pass the thread_id returned by /session/start or /session/signup_start.
    """
    user_id = SESSION_STORE.get(req.thread_id)
    if user_id is None:
        raise HTTPException(status_code=404, detail="Unknown thread_id. Call /session/start first.")

    result = await Booked_hotel_details(user_id)
    if result == "none":
        return []
    all_booking = []
    if isinstance(result, list):
        for item in result:
            all_booking.append(item)
        return all_booking

    raise HTTPException(status_code=500, detail="Unexpected booking data format.")




#Hotel management api. 
from hotel_managements.Connect_db import get_manager
from hotel_managements.Connect_db import find_available_room_number
from hotel_managements.Connect_db import get_all_hotels
from hotel_managements.Connect_db import get_hotel
from hotel_managements.Connect_db import get_reservations_for_hotel
from hotel_managements.Connect_db import get_room
from hotel_managements.Connect_db import get_rooms_for_hotel
from hotel_managements.Connect_db import managers_data
from hotel_managements.Connect_db import reversavtion_collection_save
from hotel_managements.Connect_db import room_details_store
from hotel_managements.Connect_db import save_hotels_data
from hotel_managements.tools.sync_hotel_availability import sync_hotel_availability
from hotel_managements.Connect_db import update_hotel_fields
from hotel_managements.Connect_db import update_reservation
from hotel_managements.Connect_db import update_room
from hotel_managements.Connect_db import get_hotel_id_of_user

from hotel_managements.hotel_management import(
  manager_to_response,
  api_error,
  now_iso,
  envelope,
  safe_int,
  hotel_to_response,
  room_to_response,
  reservation_to_response
)
from typing import Union
from firebase_admin import db
from fastapi import Request

class LoginRequest(BaseModel):
    phone_number: str
    password: str


class SignupRequest(BaseModel):
    hotel_name: str
    phone_number: str
    password: str
    email:str


class HotelRegisterRequest(BaseModel):
    hotel_name: str
    town: str
    address: str
    available_rooms: Union[int, str] = 3
    price: Union[int, str] = 1200
    description:str
    

class HotelRegisterResponse(BaseModel):
    hotel_id: int
    user_id: str
    hotel_name: str
    town: str
    address: str
    available_rooms: int
    total_rooms: int
    price: int
    manager_phone: int
    created_at: int

class HotelUpdateRequest(BaseModel):
    hotel_name: Optional[str] = None
    town: Optional[str] = None
    address: Optional[str] = None
    available_rooms: Optional[Union[int, str]] = None
    price: Optional[Union[int, str]] = None


class RoomCreateRequest(BaseModel):
    room_number: Optional[str] = None
    room_type: Optional[str] = None
    price: Optional[Union[int, str]] = None
    floor: Optional[Union[int, str]] = None


class RoomUpdateRequest(BaseModel):
    status: Optional[str] = None
    price: Optional[Union[int, str]] = None


class ReservationCreateRequest(BaseModel):
    hotel_id: Optional[Union[int, str]] = None
    user_id: Optional[str] = None
    numer_of_room: Optional[str] = None  # matches the frontend's field name (typo preserved)
    customer_name: str
    phone_number: str
    check_in: Optional[str] = None
    check_out: Optional[str] = None


class ReservationUpdateRequest(BaseModel):
    status: str

# Dev convenience — tighten allow_origins for production.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------------------------------------------------------
# 2. LOGIN — POST /api/auth/login
# ---------------------------------------------------------------------------

@app.post("/auth/login")
async def login(request:Request, req: LoginRequest):
    phone_number = str(req.phone_number)
    if not phone_number or not req.password:
        api_error("Phone number and password are required.")

    manager = get_manager(phone_number)
    if not manager or str(manager.get("password")) != str(req.password):
        api_error("Invalid phone number or password.", 401)

    return envelope(True, data=manager_to_response(manager), message="Manager Login successfully")
    
@app.post("/auth/signup")
async def signup(request:Request,req: SignupRequest):
    phone_number = str(req.phone_number)
    phone_number = normalize_phone_number(phone_number)
    if not phone_number or not req.password:
        api_error("Phone number and password are required.")

    if get_manager(phone_number):
        api_error("Manager with this phone number is already registered.")
    
    manager = managers_data(phone_number, req.hotel_name, str(req.password),str(req.email))
    return envelope(True, data=manager_to_response(manager), message="Manager Signup successfully")

# ---------------------------------------------------------------------------
# 3. HOTEL REGISTRATION — POST /api/hotel/register
# ---------------------------------------------------------------------------

@app.post("/hotel/register")
async def register_hotel(request:Request, req: HotelRegisterRequest):
    if not req.hotel_name or not req.town or not req.address:
        api_error("hotel_name, town, and address are required.")
    
    available_rooms = 0  #safe_int(req.available_rooms, 3) or 3
    price = safe_int(req.price, 1200) or 1200
    user_id = request.headers.get("X-User-Id")
    description = req.description
    hotel_record = save_hotels_data(
        user_id = user_id,
        hotel_name=req.hotel_name,
        town=req.town,
        address=req.address,
        available_rooms=available_rooms,
        total_rooms=available_rooms,
        price=price,
        description = description
    )
    
    return envelope(True, data=hotel_to_response(hotel_record), message="Hotel Register successfully")

# ---------------------------------------------------------------------------
# 4 & 5. HOTEL DETAILS — GET/PUT /api/hotel/details
# ---------------------------------------------------------------------------

@app.get("/get/hotel/details")
async def get_hotel_details(request:Request):
    user_id = request.headers.get("X-User-Id")
    hotel_id = get_hotel_id_of_user(user_id)
    if hotel_id == "None":
        api_error("No hotels found.", 404)

    sync_hotel_availability(hotel_id)
    hotel_record = get_hotel(hotel_id)
    return envelope(True, data = hotel_record, message="Hotel Detailed fetched")

@app.put("/update/hotel/details")
async def update_hotel_details(request:Request, req: HotelUpdateRequest):
    user_id = request.headers.get("X-User-Id")
    hotel_id = get_hotel_id_of_user(user_id)
    if hotel_id is None:
        api_error("Hotel record not found", 404)

    existing = get_hotel(hotel_id)
    updates = {}

    if req.hotel_name:
        updates["hotel_name"] = req.hotel_name
    if req.town:
        updates["town"] = req.town
    if req.address:
        updates["address"] = req.address
    if req.price is not None:
        updates["price"] = safe_int(req.price, existing["price"])

    room_count_changed = req.available_rooms is not None
    if room_count_changed:
        count = safe_int(req.available_rooms, existing["available_rooms"])
        updates["available_rooms"] = count
        updates["total_rooms"] = count

    hotel = update_hotel_fields(hotel_id, updates) if updates else existing

    if room_count_changed:
        db.reference(f"hotel_management/room_details/{hotel_id}").delete()
        new_price = updates.get("price", hotel["price"])
        for room_number in range(1, updates["available_rooms"] + 1):
            room_details_store(hotel_id, room_number, "Delux", new_price, "Available")
    elif "price" in updates:
        for room_number in get_rooms_for_hotel(hotel_id):
            update_room(hotel_id, room_number, {"price": updates["price"]})

    return envelope(True, data=hotel_to_response(hotel), message="Hotel updated successfully")


# ---------------------------------------------------------------------------
# 6. ROOMS — GET/POST /api/rooms, PUT /api/rooms/{id}
# ---------------------------------------------------------------------------

@app.get("/get/rooms")
async def get_rooms(request:Request):
    user_id = request.headers.get("X-User-Id")
    hotel_id = get_hotel_id_of_user(user_id)
    if hotel_id is None:
        return envelope(True, data=[])

    sync_hotel_availability(hotel_id)
    rooms = get_rooms_for_hotel(hotel_id)
    return envelope(True, data=[room_to_response(hotel_id, n, r) for n, r in rooms.items()])


@app.post("/add/rooms")
async def add_room(request:Request, req: RoomCreateRequest):
    user_id = request.headers.get("X-User-Id")
    hotel_id = get_hotel_id_of_user(user_id)
    if hotel_id is None:
        api_error("No hotel to add a room to.", 404)

    existing_rooms = get_rooms_for_hotel(hotel_id)
    room_number = req.room_number or str(len(existing_rooms) + 1)
    room_type = req.room_type or "Delux"
    price = safe_int(req.price, 1200) or 1200

    room = room_details_store(hotel_id, room_number, room_type, price, "Available")
    sync_hotel_availability(hotel_id)

    return envelope(True, data=room_to_response(hotel_id, room_number, room), message="Room added")


@app.put("/update/rooms/{roomId}")
async def update_room_status(roomId: str, request:Request, req: RoomUpdateRequest):
    user_id = request.headers.get("X-User-Id")
    hotel_id = get_hotel_id_of_user(user_id)
    if hotel_id is None:
        api_error("Room not found", 404)

    # mirrors server.ts's `r.id === id || r.room_number === id` lookup:
    # accept either a bare room number ("3") or an "R3"-style id.
    room_number = roomId[1:] if roomId.startswith("R") and roomId[1:].isdigit() else roomId

    if not get_room(hotel_id, room_number):
        api_error("Room not found", 404)

    updates = {}
    if req.status:
        updates["status"] = req.status
    if req.price is not None:
        updates["price"] = safe_int(req.price)

    room = update_room(hotel_id, room_number, updates) if updates else get_room(hotel_id, room_number)
    sync_hotel_availability(hotel_id)

    return envelope(True, data=room_to_response(hotel_id, room_number, room), message="Room status updated")


# ---------------------------------------------------------------------------
# 7. RESERVATIONS — GET/POST /api/reservations, PUT /api/reservations/{id}
# ---------------------------------------------------------------------------
#################################################################################################################
#You have change here for the reservations system change.
@app.get("/get/reservations")
async def get_reservations(request:Request):
    user_id = request.headers.get("X-User-Id")
    hotel_id = get_hotel_id_of_user(user_id)
    if hotel_id is None:
        return envelope(True, data=[])
    
    reservations = get_reservations_for_hotel(hotel_id)
    return envelope(True, data=[reservation_to_response(r) for r in reservations.values()])

@app.post("/create/reservations")
async def create_reservation(request:Request, req: ReservationCreateRequest):
    if not req.customer_name or not req.phone_number:
        api_error("customer_name and phone_number are required.")
    user_id = request.headers.get("X-User-Id")
    hotel_id = safe_int(req.hotel_id, get_hotel_id_of_user(user_id))
    hotel = get_hotel(hotel_id)
    if not hotel:
        api_error("Hotel not found.", 404)
    hotel_room_no = req.numer_of_room or find_available_room_number(hotel_id)
    if hotel_room_no is None:
        api_error("No available rooms for this hotel.", 409)

    phone_number = str(req.phone_number)

    reservation = reversavtion_collection_save(
        hotel_name=hotel["hotel_name"],
        customer_name=str(req.customer_name),
        hotel_id=hotel_id,
        hotel_room_no=str(hotel_room_no),
        number_of_rooms="1",
        phone_number=phone_number,
        status="Confirmed",
        check_in=req.check_in or "2026-08-11",
        check_out=req.check_out or "2026-08-14",
    )
    if "data" not in reservation:
       return envelope(False, data=None, message=reservation["message"])
    created_at = now_iso()
    reservation = update_reservation(hotel_id, phone_number, {"created_at": created_at})

    update_room(hotel_id, str(hotel_room_no), {"status": "Reserved"})
    sync_hotel_availability(hotel_id)

    return envelope(True, data=reservation_to_response(reservation), message="User record saved successfully")

from hotel_managements.Connect_db import cancel_reservation_by_button

@app.put("/update/reservations/{id}")
async def update_reservation_status(request:Request,id: str, req: ReservationUpdateRequest):
    user_id = request.headers.get("X-User-Id")
    hotel_id = get_hotel_id_of_user(user_id)
    if hotel_id is None:
        api_error("Record not found", 404)

    # reservation_id == phone_number, per hotel_management/reservations/{hotel_id}/{phone_number}
    reservation = db.reference(f"hotel_management/reservations/{hotel_id}/{id}").get()
    if not reservation:
        api_error("Record not found", 404)

    reservation = update_reservation(hotel_id, id, {"status": req.status})

    room_number = reservation.get("hotel_room_no")
    new_room_status = None
    if req.status == "Checked In":
        new_room_status = "Occupied"
    elif req.status in ("Checked Out", "Canceled"):
        new_room_status = "Available"
        
    if room_number and new_room_status:
        update_room(hotel_id, room_number, {"status": new_room_status})
        sync_hotel_availability(hotel_id)

    if req.status == "Canceled":
        cancel_reservation_by_button(hotel_id,id)


    return envelope(True, data=reservation_to_response(reservation), message="Record updated")


# ---------------------------------------------------------------------------
# Health check
# ---------------------------------------------------------------------------

@app.get("/health")
async def health():
    return envelope(True, message="ok")


# Coding agent assistant code api

from Admin_assistant.agent import Admin_assistant_agent
sessions: dict[str, list[dict]] = {}
 
 
class ChatAssistantRequest(BaseModel):
    unique_id: str
    message: str
 
 
class ChatAssistantResponse(BaseModel):
    reply: str

@app.post("/chatAssistant", response_model=ChatAssistantResponse)
def chat(req: ChatAssistantRequest):
    th_id = req.unique_id
    message = req.message
    reply = Admin_assistant_agent(message,th_id)
    return ChatAssistantResponse(reply=reply)