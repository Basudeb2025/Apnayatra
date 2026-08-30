import React, { useState, useEffect, useCallback } from 'react';
import {
  Building2,
  Calendar,
  Phone,
  User,
  RefreshCw,
  Search,
  Tag,
  BedDouble,
  Plus,
  AlertCircle,
  LayoutGrid,
  List,
  Sparkles,
} from 'lucide-react';
import { BookedHotel, Session } from '../types';

const API_BASE = 'https://apnayatra-backend.onrender.com';

interface BookedHotelsViewProps {
  session: Session;
  onNavigateToChat: (initialPrompt?: string) => void;
  searchFilter?: string;
  onBookingsCountChange?: (count: number) => void;
}

function normalizeBooking(raw: Record<string, any>, defaultName: string, defaultPhone: string): BookedHotel {
  return {
    hotelName: raw.hotel_name || raw.hotelName || 'Taj Hotel',
    customerName: raw.customer_name || raw.customerName || defaultName,
    hotelId: raw.hotel_id || raw.hotelId || 'HTL-101',
    phoneNumber: raw.phone_number || raw.phoneNumber || defaultPhone,
    roomNumber: String(raw.room_number || raw.roomNumber || '101'),
    dateOfBooking: raw.date_of_booking || raw.dateOfBooking || '12 Aug 2026',
    numberOfRooms: raw.number_of_rooms ?? raw.numberOfRooms ?? 1,
    ManagerPhnumber: raw.ManagerPhnumber || raw.manager_ph_number || 'N/A',
  };
}

export function BookedHotelsView({
  session,
  onNavigateToChat,
  searchFilter = '',
  onBookingsCountChange,
}: BookedHotelsViewProps) {
  const [hotels, setHotels] = useState<BookedHotel[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [localSearch, setLocalSearch] = useState<string>(searchFilter);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  useEffect(() => {
    onBookingsCountChange?.(hotels.length);
  }, [hotels, onBookingsCountChange]);

  useEffect(() => {
    if (searchFilter) {
      setLocalSearch(searchFilter);
    }
  }, [searchFilter]);

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    setError(null);
    setHotels([]);
    const defaultName = session.name || 'Traveler';
    const defaultPhone = session.phone || '9876543210';

    try {
      const res = await fetch(`${API_BASE}/bookings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ thread_id: session.threadId }),
      });

      const data = await res.json().catch(() => null);
      const list = Array.isArray(data) ? data : data?.bookings;
      if (res.ok && Array.isArray(list) && list.length > 0) {
        setHotels(list.map((item) => normalizeBooking(item, defaultName, defaultPhone)));
        setLoading(false);
        return;
      }

      if (res.ok) {
        setError('No hotel booked till now');
      } else {
        setError(`Failed to load bookings (${res.status}).`);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error occurred while fetching bookings.';
      setError(`Unable to fetch bookings: ${message}`);
    } finally {
      setLoading(false);
    }
  }, [session.name, session.phone, session.threadId]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const filteredHotels = hotels.filter((h) => {
    const query = localSearch.toLowerCase();
    return (
      h.hotelName.toLowerCase().includes(query) ||
      h.customerName.toLowerCase().includes(query) ||
      h.hotelId.toLowerCase().includes(query) ||
      h.phoneNumber.includes(query) ||
      h.roomNumber.toLowerCase().includes(query) ||
      (h.ManagerPhnumber && h.ManagerPhnumber.includes(query))
    );
  });

  return (
    <div className="flex-1 h-full flex flex-col bg-[#020618] text-[#F3E8FF] overflow-hidden">
      {/* Top Bar */}
      <div className="h-16 shrink-0 border-b border-purple-900/40 px-6 flex items-center justify-between bg-[#020618]/80 backdrop-blur-md">
        <div>
          <h1 className="text-lg font-semibold text-white flex items-center gap-2">
            <Building2 size={20} className="text-fuchsia-300" />
            Booked Hotels List
          </h1>
          <p className="text-xs text-purple-300/70">
            Customer hotel booking records
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchBookings}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-purple-800/50 bg-[#4A2463]/60 hover:bg-[#582B76] text-xs text-purple-100 transition-colors cursor-pointer disabled:opacity-50"
            title="Refresh bookings from API"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin text-fuchsia-300' : ''} />
            <span>Refresh</span>
          </button>

          <button
            onClick={() => onNavigateToChat('I want to book a hotel')}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-fuchsia-600 to-violet-600 hover:from-fuchsia-500 hover:to-violet-500 text-xs text-white font-medium shadow-md shadow-fuchsia-950/40 transition-all cursor-pointer"
          >
            <Plus size={15} />
            <span>Book New Hotel</span>
          </button>
        </div>
      </div>

      {/* Main Body */}
      <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar p-6 space-y-6 max-w-7xl w-full mx-auto">
        {/* Controls Header: Search & View Modes */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-[#020618] border border-purple-800/40 p-3.5 rounded-2xl shadow-lg shadow-purple-950/30">
          <div className="relative flex-1 max-w-md">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-purple-300/60" />
            <input
              type="text"
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              placeholder="Search by hotel name, customer, ID, phone, room..."
              className="w-full bg-[#2E163E] border border-purple-800/50 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-purple-300/40 focus:outline-none focus:border-fuchsia-400"
            />
          </div>

          <div className="flex items-center gap-1 bg-[#2E163E] border border-purple-800/50 p-1 rounded-xl text-xs shrink-0">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                viewMode === 'grid' ? 'bg-fuchsia-600 text-white shadow' : 'text-purple-300/60 hover:text-white'
              }`}
              title="Grid View"
            >
              <LayoutGrid size={15} />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                viewMode === 'table' ? 'bg-fuchsia-600 text-white shadow' : 'text-purple-300/60 hover:text-white'
              }`}
              title="Table View"
            >
              <List size={15} />
            </button>
          </div>
        </div>

        {/* Loading Indicator */}
        {loading && (
          <div className="py-12 flex flex-col items-center justify-center text-purple-300/70 space-y-3">
            <RefreshCw size={24} className="animate-spin text-fuchsia-300" />
            <span className="text-xs">Fetching bookings from API...</span>
          </div>
        )}

        {/* Error Notification */}
        {error && (
          <div className="bg-rose-950/40 border border-rose-800/60 rounded-xl p-4 flex items-center gap-3 text-rose-200 text-xs">
            <AlertCircle size={18} className="shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        {/* Bookings Count Header */}
        {!loading && !error && (
          <div className="flex items-center justify-between text-xs text-purple-300/70 px-1">
            <span>
              Showing <strong className="text-white">{filteredHotels.length}</strong> booked hotel
              {filteredHotels.length === 1 ? '' : 's'}
            </span>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && filteredHotels.length === 0 && (
          <div className="bg-[#3B1E4F] border border-purple-800/40 rounded-2xl p-12 text-center space-y-4 max-w-lg mx-auto shadow-xl">
            <div className="w-12 h-12 rounded-2xl bg-fuchsia-500/15 border border-fuchsia-500/30 text-fuchsia-300 flex items-center justify-center mx-auto">
              <Building2 size={24} />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white">No Bookings Found</h3>
              <p className="text-xs text-purple-300/70 mt-1">
                No customer reservations match your search.
              </p>
            </div>
            <button
              onClick={() => onNavigateToChat('Book a hotel room for me')}
              className="px-4 py-2 rounded-xl bg-fuchsia-600 hover:bg-fuchsia-500 text-white text-xs font-medium inline-flex items-center gap-2 cursor-pointer transition-colors shadow-md"
            >
              <Sparkles size={14} />
              <span>Ask AI to Book a Room</span>
            </button>
          </div>
        )}

        {/* Grid View */}
        {!loading && viewMode === 'grid' && filteredHotels.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredHotels.map((hotel, idx) => (
              <div
                key={`${hotel.hotelId}-${idx}`}
                className="bg-[#25376e] border border-purple-800/40 hover:border-fuchsia-400/50 rounded-2xl p-5 overflow-hidden transition-all duration-200 hover:shadow-xl hover:shadow-purple-950/40 flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <h3 className="text-base font-semibold text-white flex items-center gap-2">
                      <Building2 size={18} className="text-fuchsia-300 shrink-0" />
                      {hotel.hotelName}
                    </h3>
                  </div>

                  {/* Booking Fields */}
                  <div className="bg-[#2E163E]/80 border border-purple-900/50 rounded-xl p-4 space-y-3 text-xs font-sans">
                    {/* Hotel Name */}
                    <div className="flex items-center justify-between">
                      <span className="text-purple-300/70">Hotel Name:</span>
                      <span className="font-medium text-white">{hotel.hotelName}</span>
                    </div>

                    {/* Customer Name */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-purple-300/70">
                        <User size={13} className="text-teal-300" />
                        <span>Customer Name:</span>
                      </div>
                      <span className="font-medium text-white">{hotel.customerName}</span>
                    </div>

                    {/* Hotel ID */}
                    <div className="flex items-center justify-between border-t border-purple-900/60 pt-2">
                      <div className="flex items-center gap-1.5 text-purple-300/70">
                        <Tag size={13} className="text-fuchsia-300" />
                        <span>Hotel ID:</span>
                      </div>
                      <span className="font-mono text-xs text-fuchsia-200 font-semibold">{hotel.hotelId}</span>
                    </div>

                    {/* Phone Number */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-purple-300/70">
                        <Phone size={13} className="text-teal-300" />
                        <span>Customer Phone:</span>
                      </div>
                      <span className="font-mono text-xs text-purple-100">+91 {hotel.phoneNumber}</span>
                    </div>

                    {/* Manager Phone Number */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-purple-300/70">
                        <Phone size={13} className="text-teal-300" />
                        <span>Manager Phone:</span>
                      </div>
                      <span className="font-mono text-xs text-purple-100">+91 {hotel.ManagerPhnumber}</span>
                    </div>

                    {/* Room Number */}
                    <div className="flex items-center justify-between border-t border-purple-900/60 pt-2">
                      <div className="flex items-center gap-1.5 text-purple-300/70">
                        <BedDouble size={13} className="text-indigo-300" />
                        <span>Room Number:</span>
                      </div>
                      <span className="font-mono font-semibold text-emerald-300">
                        {hotel.roomNumber}
                      </span>
                    </div>

                    {/* Number of Rooms */}
                    <div className="flex items-center justify-between border-t border-purple-900/60 pt-2">
                      <div className="flex items-center gap-1.5 text-purple-300/70">
                        <BedDouble size={13} className="text-indigo-300" />
                        <span>No. of Rooms:</span>
                      </div>
                      <span className="font-mono font-semibold text-emerald-300">
                        {hotel.numberOfRooms}
                      </span>
                    </div>

                    {/* Date of Booking Section */}
                    <div className="flex items-center justify-between border-t border-purple-900/60 pt-2">
                      <div className="flex items-center gap-1.5 text-purple-300/70">
                        <Calendar size={13} className="text-teal-300" />
                        <span>Date of Booking:</span>
                      </div>
                      <span className="font-mono text-xs text-teal-300">
                        {hotel.dateOfBooking}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Table View */}
        {!loading && viewMode === 'table' && filteredHotels.length > 0 && (
          <div className="bg-[#3B1E4F] border border-purple-800/40 rounded-2xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-purple-800/50 bg-[#2E163E] text-purple-300/70 font-mono uppercase tracking-wider text-[10px]">
                    <th className="p-4">Hotel Name</th>
                    <th className="p-4">Customer Name</th>
                    <th className="p-4">Hotel ID</th>
                    <th className="p-4">Phone Number</th>
                    <th className="p-4">Room Number</th>
                    <th className="p-4">No. of Rooms</th>
                    <th className="p-4">Date of Booking</th>
                    <th className="p-4">Manager Phone</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-purple-800/30 text-purple-100">
                  {filteredHotels.map((hotel, idx) => (
                    <tr key={`${hotel.hotelId}-${idx}`} className="hover:bg-[#4A2463]/50 transition-colors">
                      <td className="p-4 font-semibold text-white">{hotel.hotelName}</td>
                      <td className="p-4 font-medium text-purple-100">{hotel.customerName}</td>
                      <td className="p-4 font-mono font-semibold text-fuchsia-200">{hotel.hotelId}</td>
                      <td className="p-4 font-mono text-purple-200">+91 {hotel.phoneNumber}</td>
                      <td className="p-4 font-mono font-bold text-emerald-300">{hotel.roomNumber}</td>
                      <td className="p-4 font-mono font-bold text-emerald-300">{hotel.numberOfRooms}</td>
                      <td className="p-4 font-mono text-teal-300">{hotel.dateOfBooking}</td>
                      <td className="p-4 font-mono text-purple-200">+91 {hotel.ManagerPhnumber}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}