import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';

const app = express();
const PORT = 3000;

app.use(express.json());

// In-Memory Database State
let managerSequence = 101;
let hotelIdSequence = 10842; // Backend calculated integer hotel_id

interface ManagerRecord {
  id: string; // user_id
  user_id: string;
  hotel_name: string;
  phone_number: string;
  password: string;
  created_at: string;
}

interface HotelRecord {
  hotel_id: number;
  user_id: string;
  hotel_name: string;
  town: string;
  address: string;
  available_rooms: number;
  total_rooms: number;
  price: number;
  manager_phone: string;
  created_at: string;
}

interface RoomRecord {
  id: string;
  hotel_id: number;
  room_number: string;
  room_type: string;
  price: number;
  status: 'Available' | 'Occupied' | 'Maintenance' | 'Reserved';
  floor: number;
  capacity: number;
  amenities: string[];
}

interface ReservationRecord {
  id: string;
  hotel_id: number;
  user_id: string;
  numer_of_room: string;
  customer_name: string;
  phone_number: string;
  status: 'Confirmed' | 'Checked In' | 'Checked Out' | 'Canceled';
  created_at: string;
  check_in?: string;
  check_out?: string;
}

const managers: ManagerRecord[] = [
  {
    id: 'M-101',
    user_id: 'M-101',
    hotel_name: 'Bibhash',
    phone_number: '9876543210',
    password: 'password123',
    created_at: '2026-08-01T10:00:00Z',
  },
];

const hotels: HotelRecord[] = [
  {
    hotel_id: 10842, // integer calculated by backend
    user_id: 'M-101',
    hotel_name: 'Bibhash',
    town: 'coochbehar',
    address: 'Office Para, Cooch Behar, West Bengal, India',
    available_rooms: 3,
    total_rooms: 3,
    price: 1200,
    manager_phone: '9876543210',
    created_at: '2026-08-01T10:00:00Z',
  },
];

// Helper to generate rooms based on count decided by backend (e.g. 3 -> room numbers 3, 2, 1)
function generateRoomsForCount(hotelId: number, count: number, price: number): RoomRecord[] {
  const generatedRooms: RoomRecord[] = [];
  for (let i = count; i >= 1; i--) {
    generatedRooms.push({
      id: `R${i}`,
      hotel_id: hotelId,
      room_number: `${i}`, // Decided by backend: 3, 2, 1
      room_type: i % 2 === 0 ? 'Deluxe Room' : 'Standard Room',
      price: price || 1200,
      status: i === 2 && count >= 3 ? 'Occupied' : 'Available',
      floor: 1,
      capacity: 2,
      amenities: ['AC', 'Free Wi-Fi', 'TV'],
    });
  }
  return generatedRooms;
}

let rooms: RoomRecord[] = generateRoomsForCount(10842, 3, 1200);

let reservations: ReservationRecord[] = [
  {
    id: 'RES-801',
    hotel_id: 10842,
    user_id: 'M-101',
    numer_of_room: '2',
    customer_name: 'Basudeb Roy',
    phone_number: '+91 98321 45678',
    status: 'Checked In',
    created_at: '2026-08-08T14:30:00Z',
    check_in: '2026-08-10',
    check_out: '2026-08-14',
  },
  {
    id: 'RES-802',
    hotel_id: 10842,
    user_id: 'M-101',
    numer_of_room: '1',
    customer_name: 'Ananya Sharma',
    phone_number: '+91 91234 56789',
    status: 'Confirmed',
    created_at: '2026-08-09T09:15:00Z',
    check_in: '2026-08-11',
    check_out: '2026-08-13',
  },
];

// Recalculate hotel available rooms
function syncAvailableRooms() {
  const currentHotel = hotels[0];
  if (currentHotel) {
    const availCount = rooms.filter((r) => r.status === 'Available').length;
    currentHotel.available_rooms = availCount;
    currentHotel.total_rooms = rooms.length;
  }
}

// REST API ENDPOINTS

// 1. SIGNUP
app.post('/api/auth/signup', (req, res) => {
  const { hotel_name, phone_number, password } = req.body;

  if (!phone_number || !password) {
    return res.status(400).json({ success: false, error: 'Phone number and password are required.' });
  }

  const existing = managers.find((m) => m.phone_number === phone_number);
  if (existing) {
    return res.status(400).json({ success: false, error: 'Manager with this phone number is already registered.' });
  }

  managerSequence += 1;
  const newUserId = `M-${managerSequence}`;
  const newManager: ManagerRecord = {
    id: newUserId,
    user_id: newUserId,
    hotel_name: hotel_name || 'My Hotel',
    phone_number: String(phone_number),
    password: String(password),
    created_at: new Date().toISOString(),
  };

  managers.push(newManager);

  // Auto create initial hotel record if provided
  if (hotel_name) {
    hotelIdSequence += 1; // Backend calculates hotel_id as integer
    const newHotel: HotelRecord = {
      hotel_id: hotelIdSequence,
      user_id: newUserId,
      hotel_name: String(hotel_name),
      town: 'coochbehar',
      address: 'Office Para, Cooch Behar, West Bengal, India',
      available_rooms: 3,
      total_rooms: 3,
      price: 1200,
      manager_phone: String(phone_number),
      created_at: new Date().toISOString(),
    };
    hotels.unshift(newHotel);
    rooms = generateRoomsForCount(hotelIdSequence, 3, 1200);
  }

  return res.json({
    success: true,
    message: 'Signup successful!',
    data: {
      id: newManager.id,
      user_id: newManager.user_id,
      hotel_name: newManager.hotel_name,
      phone_number: newManager.phone_number,
      created_at: newManager.created_at,
      token: `token-${Date.now()}`,
    },
  });
});

// 2. LOGIN
app.post('/api/auth/login', (req, res) => {
  const { phone_number, password } = req.body;

  if (!phone_number || !password) {
    return res.status(400).json({ success: false, error: 'Phone number and password are required.' });
  }

  const manager = managers.find(
    (m) => String(m.phone_number) === String(phone_number) && String(m.password) === String(password)
  );

  if (!manager) {
    // If not found in memory, create quick session
    managerSequence += 1;
    const newUserId = `M-${managerSequence}`;
    const tempManager: ManagerRecord = {
      id: newUserId,
      user_id: newUserId,
      hotel_name: 'Bibhash',
      phone_number: String(phone_number),
      password: String(password),
      created_at: new Date().toISOString(),
    };
    managers.push(tempManager);

    return res.json({
      success: true,
      message: 'Logged in successfully.',
      data: {
        id: tempManager.id,
        user_id: tempManager.user_id,
        hotel_name: tempManager.hotel_name,
        phone_number: tempManager.phone_number,
        created_at: tempManager.created_at,
        token: `token-${Date.now()}`,
      },
    });
  }

  return res.json({
    success: true,
    message: 'Login successful.',
    data: {
      id: manager.id,
      user_id: manager.user_id,
      hotel_name: manager.hotel_name,
      phone_number: manager.phone_number,
      created_at: manager.created_at,
      token: `token-${Date.now()}`,
    },
  });
});

// 3. HOTEL REGISTRATION
app.post('/api/hotel/register', (req, res) => {
  const { hotel_name, town, address, available_rooms, price, manager_phone, user_id } = req.body;

  if (!hotel_name || !town || !address) {
    return res.status(400).json({ success: false, error: 'hotel_name, town, and address are required.' });
  }

  hotelIdSequence += 1;
  const calculatedHotelId = hotelIdSequence;
  const parsedAvailableRooms = parseInt(available_rooms, 10) || 3;
  const parsedPrice = parseInt(price, 10) || 1200;

  const newHotel: HotelRecord = {
    hotel_id: calculatedHotelId,
    user_id: user_id || 'M-101',
    hotel_name: String(hotel_name),
    town: String(town),
    address: String(address),
    available_rooms: parsedAvailableRooms,
    total_rooms: parsedAvailableRooms,
    price: parsedPrice,
    manager_phone: manager_phone ? String(manager_phone) : '9876543210',
    created_at: new Date().toISOString(),
  };

  hotels.unshift(newHotel);

  // Backend decides room numbers (e.g. 3 -> rooms 3, 2, 1)
  rooms = generateRoomsForCount(calculatedHotelId, parsedAvailableRooms, parsedPrice);

  return res.json({
    success: true,
    message: `Hotel registered! Hotel ID: #${calculatedHotelId}, Rooms: ${rooms.map(r => r.room_number).join(', ')}`,
    data: newHotel,
  });
});

// 4. GET HOTEL DETAILS
app.get('/api/hotel/details', (req, res) => {
  syncAvailableRooms();
  const currentHotel = hotels[0] || {
    hotel_id: 10842,
    user_id: 'M-101',
    hotel_name: 'Bibhash',
    town: 'coochbehar',
    address: 'Office Para, Cooch Behar, West Bengal, India',
    available_rooms: 3,
    total_rooms: 3,
    price: 1200,
    manager_phone: '9876543210',
    created_at: '2026-08-01T10:00:00Z',
  };
  return res.json({ success: true, data: currentHotel });
});

// 5. UPDATE HOTEL DETAILS
app.put('/api/hotel/details', (req, res) => {
  const currentHotel = hotels[0];
  if (!currentHotel) {
    return res.status(404).json({ success: false, error: 'Hotel record not found' });
  }

  const { hotel_name, town, address, available_rooms, price } = req.body;
  if (hotel_name) currentHotel.hotel_name = String(hotel_name);
  if (town) currentHotel.town = String(town);
  if (address) currentHotel.address = String(address);
  if (available_rooms !== undefined) {
    const count = parseInt(available_rooms, 10);
    currentHotel.available_rooms = count;
    currentHotel.total_rooms = count;
    rooms = generateRoomsForCount(currentHotel.hotel_id, count, currentHotel.price);
  }
  if (price !== undefined) {
    currentHotel.price = parseInt(price, 10);
    rooms.forEach((r) => (r.price = currentHotel.price));
  }

  return res.json({ success: true, message: 'Hotel updated successfully', data: currentHotel });
});

// 6. ROOMS MANAGEMENT
app.get('/api/rooms', (req, res) => {
  syncAvailableRooms();
  return res.json({ success: true, data: rooms });
});

app.post('/api/rooms', (req, res) => {
  const { room_number, room_type, price, floor } = req.body;
  const newRoom: RoomRecord = {
    id: `R${Date.now()}`,
    hotel_id: hotels[0]?.hotel_id || 10842,
    room_number: room_number || `${rooms.length + 1}`,
    room_type: room_type || 'Standard Room',
    price: parseInt(price, 10) || 1200,
    status: 'Available',
    floor: parseInt(floor, 10) || 1,
    capacity: 2,
    amenities: ['AC', 'Free Wi-Fi', 'TV'],
  };

  rooms.push(newRoom);
  syncAvailableRooms();
  return res.json({ success: true, message: 'Room added', data: newRoom });
});

app.put('/api/rooms/:id', (req, res) => {
  const { id } = req.params;
  const { status, price } = req.body;

  const room = rooms.find((r) => r.id === id || r.room_number === id);
  if (!room) {
    return res.status(404).json({ success: false, error: 'Room not found' });
  }

  if (status) room.status = status;
  if (price) room.price = parseInt(price, 10);

  syncAvailableRooms();
  return res.json({ success: true, message: 'Room status updated', data: room });
});

// 7. TRACK RESERVATIONS / USER DATA
app.get('/api/reservations', (req, res) => {
  return res.json({ success: true, data: reservations });
});

app.post('/api/reservations', (req, res) => {
  const { hotel_id, user_id, numer_of_room, customer_name, phone_number, check_in, check_out } = req.body;

  if (!customer_name || !phone_number) {
    return res.status(400).json({ success: false, error: 'customer_name and phone_number are required.' });
  }

  const assignedRoomNumber = numer_of_room
    ? String(numer_of_room)
    : (rooms.find((r) => r.status === 'Available')?.room_number || '1');
  const resId = `RES-${Math.floor(800 + Math.random() * 200)}`;

  const newRes: ReservationRecord = {
    id: resId,
    hotel_id: Number(hotel_id) || hotels[0]?.hotel_id || 10842,
    user_id: String(user_id || 'M-101'),
    numer_of_room: assignedRoomNumber,
    customer_name: String(customer_name),
    phone_number: String(phone_number),
    status: 'Confirmed',
    created_at: new Date().toISOString(),
    check_in: check_in ? String(check_in) : '2026-08-11',
    check_out: check_out ? String(check_out) : '2026-08-14',
  };

  reservations.unshift(newRes);

  const matchedRoom = rooms.find((r) => r.room_number === assignedRoomNumber);
  if (matchedRoom) {
    matchedRoom.status = 'Reserved';
    syncAvailableRooms();
  }

  return res.json({ success: true, message: 'User record saved successfully', data: newRes });
});

app.put('/api/reservations/:id', (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const reservation = reservations.find((r) => r.id === id);
  if (!reservation) {
    return res.status(404).json({ success: false, error: 'Record not found' });
  }

  if (status) {
    reservation.status = status;
    const room = rooms.find((r) => r.room_number === reservation.numer_of_room);
    if (room) {
      if (status === 'Checked In') room.status = 'Occupied';
      if (status === 'Checked Out' || status === 'Canceled') room.status = 'Available';
      syncAvailableRooms();
    }
  }

  return res.json({ success: true, message: 'Record updated', data: reservation });
});

// VITE MIDDLEWARE SETUP
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Hotel Admin Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
