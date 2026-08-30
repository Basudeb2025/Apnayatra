import { ApiResponse, Hotel, Manager, Reservation, Room, ChatApiResponse,ChatApiError } from '../types';

const BASE = "https://apnayatra-backend.onrender.com";

function authHeaders(userId: string): Record<string, string> {
  return { 'Content-Type': 'application/json', 'X-User-Id': userId };
}

export async function loginManager(phone_number: string, password: string): Promise<ApiResponse<Manager>> {
  const res = await fetch(`${BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone_number, password }),
  });
  return res.json();
}

export async function signupManager(hotel_name: string, phone_number: string, password: string, email:string): Promise<ApiResponse<Manager>> {
  const res = await fetch(`${BASE}/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ hotel_name, phone_number, password,email }),
  });
  return res.json();
}

export async function registerHotel(userId: string, data: {
  hotel_name: string;
  email?: string; 
  town: string;
  address: string;
  available_rooms: number | string;
  price: number | string;
  description:string;
}): Promise<ApiResponse<Hotel>> {
  const res = await fetch(`${BASE}/hotel/register`, {
    method: 'POST',
    headers: authHeaders(userId),
    body: JSON.stringify(data),
  });
  return res.json();
}

// --- Everything below requires the logged-in manager's user_id, sent as
// X-User-Id, so the backend can scope results to THEIR hotel only. ---

export async function getHotelDetails(userId: string): Promise<ApiResponse<Hotel>> {
  const res = await fetch(`${BASE}/get/hotel/details`, {
    headers: authHeaders(userId),
  });
  return res.json();
}

export async function updateHotelDetails(userId: string, data: Partial<Hotel>): Promise<ApiResponse<Hotel>> {
  const res = await fetch(`${BASE}/update/hotel/details`, {
    method: 'PUT',
    headers: authHeaders(userId),
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function getRooms(userId: string): Promise<ApiResponse<Room[]>> {
  const res = await fetch(`${BASE}/get/rooms`, {
    headers: authHeaders(userId),
  });
  return res.json();
}

export async function updateRoomStatus(userId: string, roomId: string, status: Room['status'], price?: number): Promise<ApiResponse<Room>> {
  const res = await fetch(`${BASE}/update/rooms/${roomId}`, {
    method: 'PUT',
    headers: authHeaders(userId),
    body: JSON.stringify({ status, price }),
  });
  return res.json();
}

export async function addRoom(userId: string, roomData: Partial<Room>): Promise<ApiResponse<Room>> {
  const res = await fetch(`${BASE}/add/rooms`, {
    method: 'POST',
    headers: authHeaders(userId),
    body: JSON.stringify(roomData),
  });
  return res.json();
}

export async function getReservations(userId: string): Promise<ApiResponse<Reservation[]>> {
  const res = await fetch(`${BASE}/get/reservations`, {
    headers: authHeaders(userId),
  });
  return res.json();
}

export async function createReservation(userId: string, data: {
  hotel_id: number;
  user_id: string;
  numer_of_room: string;
  customer_name: string;
  phone_number: string;
  check_in?: string;
  check_out?: string;
}): Promise<ApiResponse<Reservation>> {
  const res = await fetch(`${BASE}/create/reservations`, {
    method: 'POST',
    headers: authHeaders(userId),
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function updateReservationStatus(userId: string, id: string, status: Reservation['status']): Promise<ApiResponse<Reservation>> {
  const res = await fetch(`${BASE}/update/reservations/${id}`, {
    method: 'PUT',
    headers: authHeaders(userId),
    body: JSON.stringify({ status }),
  });
  return res.json();
}

//
// Thin client around the Python backend's chat endpoints.
// Keep all fetch/URL/error-handling logic here so components
// stay free of networking details.


async function parseOrThrow(res: Response): Promise<ChatApiResponse> {
  if (!res.ok) {
    let detail = '';
    try {
      const body = await res.json();
      detail = body?.detail || body?.message || '';
    } catch {
      // response body wasn't JSON, ignore
    }
    throw new ChatApiError(
      detail || `Request failed with status ${res.status}`,
      res.status
    );
  }
  return res.json();
}

export async function sendChatMessage(
  unique_id: string,
  message: string
): Promise<ChatApiResponse> {
  const res = await fetch(`${BASE}/chatAssistant`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ unique_id: unique_id, message }),
  });
  return parseOrThrow(res);
}

export async function confirmChatAction(
  threadId: string,
  approved: boolean
): Promise<ChatApiResponse> {
  const res = await fetch(`${BASE}/chat/confirm`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ thread_id: threadId, approved }),
  });
  return parseOrThrow(res);
}

export function createThreadId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return `thread-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}