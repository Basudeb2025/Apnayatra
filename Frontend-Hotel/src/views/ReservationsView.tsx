import React, { useState } from 'react';
import {
  CalendarCheck,
  Search,
  Plus,
  Filter,
  Phone,
  User,
  Bed,
  Hash,
  X,
  Tag,
} from 'lucide-react';
import { createReservation, updateReservationStatus } from '../services/api';
import { Hotel, Manager, Reservation, Room } from '../types';

interface ReservationsViewProps {
  hotel: Hotel | null;
  manager: Manager | null;
  reservations: Reservation[];
  rooms: Room[];
  onRefresh: () => void;
  showNewModalOpen?: boolean;
  onCloseNewModal?: () => void;
}

export const ReservationsView: React.FC<ReservationsViewProps> = ({
  hotel,
  manager,
  reservations = [],
  rooms = [],
  onRefresh,
  showNewModalOpen = false,
  onCloseNewModal,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('All');

  // New Reservation Modal state
  const [isModalOpen, setIsModalOpen] = useState(showNewModalOpen);
  const [customerName, setCustomerName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('+91 ');
  const [selectedRoom, setSelectedRoom] = useState(rooms?.[0]?.room_number || '3');
  const [checkIn, setCheckIn] = useState('2026-08-11');
  const [checkOut, setCheckOut] = useState('2026-08-14');
  const [loading, setLoading] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  // Sync external open request
  React.useEffect(() => {
    if (showNewModalOpen) setIsModalOpen(true);
  }, [showNewModalOpen]);

  const handleCreateReservation = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalError(null);
    setLoading(true);

    try {
      if (!customerName.trim() || !phoneNumber.trim()) {
        setModalError('Please enter customer_name and phone_number.');
        setLoading(false);
        return;
      }

      if (!manager) {
        setModalError('You must be logged in to create a reservation.');
        setLoading(false);
        return;
      }

      const res = await createReservation(manager.user_id, {
        hotel_id: hotel?.hotel_id || 10842,
        user_id: manager.user_id,
        numer_of_room: selectedRoom,
        customer_name: customerName.trim(),
        phone_number: phoneNumber.trim(),
        check_in: checkIn,
        check_out: checkOut,
      });

      if (res.success) {
        setIsModalOpen(false);
        if (onCloseNewModal) onCloseNewModal();
        onRefresh();
        // Reset modal form
        setCustomerName('');
        setPhoneNumber('+91 ');
      } else {
        setModalError(res.message || res.error || 'Fetching some error');
      }
    } catch (err: any) {
      setModalError(err.message || 'Failed to Register');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id: string, newStatus: Reservation['status']) => {
    if (!manager) return;
    await updateReservationStatus(manager.user_id, id, newStatus);
    onRefresh();
  };

  // Safe search and filtering
  const safeReservations = Array.isArray(reservations) ? reservations : [];
  const normalizedSearch = searchTerm.toLowerCase().trim();

  const filteredReservations = safeReservations.filter((r) => {
    if (!r) return false;

    const customerNameStr = String(r.customer_name || '').toLowerCase();
    const phoneStr = String(r.phone_number || '');
    const roomStr = String(r.numer_of_room || '');
    const hotelIdStr = String(r.hotel_id || '');
    const userIdStr = String(r.user_id || '').toLowerCase();

    const matchesSearch =
      customerNameStr.includes(normalizedSearch) ||
      phoneStr.includes(normalizedSearch) ||
      roomStr.includes(normalizedSearch) ||
      hotelIdStr.includes(normalizedSearch) ||
      userIdStr.includes(normalizedSearch);

    const matchesStatus =
      selectedStatusFilter === 'All' || r.status === selectedStatusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* View Title & Action Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-white flex items-center space-x-2">
            <CalendarCheck className="w-6 h-6 text-[#688ce4]" />
            <span>Customer Records</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            User Information Fields <code className="text-[#688ce4] font-mono"></code>
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2.5 bg-[#3555a6] hover:bg-[#2b468b] text-white font-bold text-xs rounded-xl shadow-lg shadow-[#3555a6]/25 flex items-center justify-center space-x-2 transition-all cursor-pointer self-start md:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Customer Record</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-lg flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search customer name, phone, room..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-[#3555a6]"
          />
        </div>

        <div className="flex items-center space-x-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          <Filter className="w-4 h-4 text-slate-400 shrink-0 mr-1" />
          {['All', 'Confirmed', 'Checked In', 'Checked Out', 'Canceled'].map((status) => (
            <button
              key={status}
              onClick={() => setSelectedStatusFilter(status)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                selectedStatusFilter === status
                  ? 'bg-[#3555a6] text-white shadow-sm'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* User Data Table */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 uppercase font-semibold text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="px-4 py-3 font-mono">hotel_id</th>
                <th className="px-4 py-3 font-mono">user_id</th>
                <th className="px-4 py-3 font-mono">numer_of_room</th>
                <th className="px-4 py-3 font-mono">customer_name</th>
                <th className="px-4 py-3 font-mono">phone_number</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filteredReservations.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-slate-500">
                    No matching customer records found.
                  </td>
                </tr>
              ) : (
                filteredReservations.map((res, index) => {
                  const itemKey = res.id || (res as any).reservation_id || (res as any)._id || index;
                  return (
                    <tr key={itemKey} className="hover:bg-slate-800/40 transition-colors">
                      <td className="px-4 py-3.5 font-mono font-bold text-[#688ce4]">
                        {res.hotel_id}
                      </td>

                      <td className="px-4 py-3.5 font-mono text-emerald-400 font-semibold">
                        {res.user_id}
                      </td>

                      <td className="px-4 py-3.5">
                        <span className="px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-slate-800 text-slate-200 border border-slate-700 inline-block">
                          Room {res.numer_of_room}
                        </span>
                      </td>

                      <td className="px-4 py-3.5 font-bold text-white text-sm">
                        {res.customer_name || '—'}
                      </td>

                      <td className="px-4 py-3.5 font-mono text-slate-200">
                        <span className="flex items-center space-x-1">
                          <Phone className="w-3 h-3 text-slate-500" />
                          <span>{res.phone_number || '—'}</span>
                        </span>
                      </td>

                      <td className="px-4 py-3.5">
                        <span
                          className={`px-2.5 py-1 rounded-full text-xs font-semibold inline-block ${
                            res.status === 'Checked In'
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                              : res.status === 'Confirmed'
                              ? 'bg-blue-500/10 text-blue-400 border border-blue-500/30'
                              : res.status === 'Checked Out'
                              ? 'bg-slate-800 text-slate-400'
                              : 'bg-rose-500/10 text-rose-400'
                          }`}
                        >
                          {res.status || 'Confirmed'}
                        </span>
                      </td>

                      <td className="px-4 py-3.5 text-right space-x-1.5">
                        {res.status === 'Confirmed' && (
                          <button
                            onClick={() => handleStatusChange(String(itemKey), 'Checked In')}
                            className="px-2.5 py-1 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 font-semibold rounded-lg text-[11px] border border-emerald-500/40 transition-colors cursor-pointer"
                          >
                            Check In
                          </button>
                        )}

                        {res.status === 'Checked In' && (
                          <button
                            onClick={() => handleStatusChange(String(itemKey), 'Checked Out')}
                            className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-lg text-[11px] border border-slate-700 transition-colors cursor-pointer"
                          >
                            Check Out
                          </button>
                        )}

                        {res.status !== 'Canceled' && res.status !== 'Checked Out' && (
                          <button
                            onClick={() => handleStatusChange(String(itemKey), 'Canceled')}
                            className="px-2.5 py-1 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 font-semibold rounded-lg text-[11px] border border-rose-500/30 transition-colors cursor-pointer"
                          >
                            Cancel
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Record Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center space-x-2">
                <Plus className="w-5 h-5 text-[#688ce4]" />
                <span>Add Customer Record</span>
              </h3>
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  if (onCloseNewModal) onCloseNewModal();
                }}
                className="text-slate-400 hover:text-white p-1 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {modalError && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs rounded-xl">
                {modalError}
              </div>
            )}

            <form onSubmit={handleCreateReservation} className="space-y-4">
              <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3 grid grid-cols-2 gap-3 text-xs font-mono">
                <div>
                  <span className="text-slate-400 block text-[10px]">Hotel Id:</span>
                  <span className="text-[#688ce4] font-bold">{hotel?.hotel_id || 10842}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">User Id:</span>
                  <span className="text-emerald-400 font-bold">{manager?.user_id || 'M-101'}</span>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Customer name
                  </label>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="e.g. Basudeb Roy"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-[#3555a6]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Phone number
                  </label>
                  <input
                    type="text"
                    required
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="+91 9876543210"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-[#3555a6]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                   Room number
                  </label>
                  <select
                    value={selectedRoom}
                    onChange={(e) => setSelectedRoom(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-[#3555a6]"
                  >
                    {rooms?.map((room) => (
                      <option key={room.id} value={room.room_number}>
                        Room {room.room_number} ({room.room_type}) [{room.status}]
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    if (onCloseNewModal) onCloseNewModal();
                  }}
                  className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 bg-[#3555a6] hover:bg-[#2b468b] text-white font-bold text-xs rounded-xl transition-all cursor-pointer disabled:opacity-50"
                >
                  {loading ? 'Saving...' : 'Save User Record'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};