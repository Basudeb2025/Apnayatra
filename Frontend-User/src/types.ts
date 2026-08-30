export interface Session {
  threadId: string;
  phone: string;
  name?: string;
}

export interface ToolCall {
  name: string;
  args?: Record<string, unknown>;
}

export interface PendingConfirmation {
  message: string;
  toolCalls: ToolCall[];
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  text: string;
}

export interface ChatResponse {
  reply?: string;
  requires_confirmation?: boolean;
  confirmation_message?: string;
  pending_tool_calls?: ToolCall[];
}

export interface BookedHotel {
  hotelName: string;
  customerName: string;
  hotelId: string;
  phoneNumber: string;
  roomNumber: string;
  dateOfBooking: string;
  numberOfRooms: number;
  ManagerPhnumber:number;
}

