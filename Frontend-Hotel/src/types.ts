export interface Manager {
  id: string;
  user_id: string;
  hotel_name: string;
  phone_number: string;
  created_at: string;
  token?: string;
}

export interface Hotel {
  hotel_id: number | string; // Integer/string calculated by backend
  user_id?: string;
  hotel_name: string;
  email?: string; 
  town: string;
  address: string;
  available_rooms: number;
  total_rooms: number;
  price: number;
  manager_phone?: string;
  created_at: string;
}

export type RoomStatus = 'Available' | 'Occupied' | 'Maintenance' | 'Reserved';

export interface Room {
  id: string;
  hotel_id: string | number;
  room_number: string; // e.g. "1", "2", "3"
  room_type: string;
  price: number;
  status: RoomStatus;
  floor: number;
  capacity: number;
  amenities: string[];
}

export type ReservationStatus = 'Confirmed' | 'Checked In' | 'Checked Out' | 'Canceled';

export interface Reservation {
  id: string;
  booked_hotel_name: string; // e.g. "Silicon"
  customer_name: string; // e.g. "Basudeb"
  hotel_id: string; // e.g. "102"
  hotel_room_no: string; // e.g. "1,2"
  number_of_rooms: string; // e.g. "2"
  phone_number: number | string; // e.g. 74885454
  status: ReservationStatus;
  created_at: string;
  check_in?: string;
  check_out?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

export interface ToolCall {
  name: string;
  args: Record<string, unknown>;
}

export interface ChatApiResponse {
  requires_confirmation?: boolean;
  confirmation_message?: string;
  pending_tool_calls?: ToolCall[];
  reply?: string;
}

export class ChatApiError extends Error {
  status?: number;
  constructor(message: string, status?: number) {
    super(message);
    this.name = 'ChatApiError';
    this.status = status;
  }
}
