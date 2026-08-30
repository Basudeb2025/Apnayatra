import React, { useState } from 'react';
import {
  BedDouble,
  Plus,
  Edit2,
  Check,
  X,
  Sparkles,
  Wifi,
  Tv,
  Wind,
  ShieldAlert,
} from 'lucide-react';
import { addRoom, updateRoomStatus } from '../services/api';
import { Manager, Room, RoomStatus } from '../types';

interface RoomsViewProps {
  rooms: Room[];
  manager: Manager | null;
  onRefresh: () => void;
}

export const RoomsView: React.FC<RoomsViewProps> = ({ rooms, manager, onRefresh }) => {
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('All');
  const [editingRoomId, setEditingRoomId] = useState<string | null>(null);
  const [editingStatus, setEditingStatus] = useState<RoomStatus>('Available');
  const [editingPrice, setEditingPrice] = useState<number>(1200);

  // New Room Modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newRoomNumber, setNewRoomNumber] = useState('');
  const [newRoomType, setNewRoomType] = useState('Standard King');
  const [newRoomPrice, setNewRoomPrice] = useState(1200);
  const [newFloor, setNewFloor] = useState(1);
  const [loading, setLoading] = useState(false);

  const handleStartEdit = (room: Room) => {
    setEditingRoomId(room.id);
    setEditingStatus(room.status);
    setEditingPrice(room.price);
  };

  const handleSaveEdit = async (roomId: string) => {
    if (!manager) return;
    await updateRoomStatus(manager.user_id, roomId, editingStatus, editingPrice);
    setEditingRoomId(null);
    onRefresh();
  };

  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoomNumber || !manager) return;
    setLoading(true);

    await addRoom(manager.user_id, {
      room_number: newRoomNumber,
      room_type: newRoomType,
      price: Number(newRoomPrice) || 1200,
      status: 'Available',
      floor: Number(newFloor) || 1,
      capacity: 2,
      amenities: ['AC', 'Free Wi-Fi', 'TV', 'Geyser'],
    });

    setIsAddModalOpen(false);
    setNewRoomNumber('');
    setLoading(false);
    onRefresh();
  };

  const filteredRooms = rooms.filter((r) =>
    selectedStatusFilter === 'All' ? true : r.status === selectedStatusFilter
  );

  return (
    <div className="space-y-6">
      {/* View Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-white flex items-center space-x-2">
            <BedDouble className="w-6 h-6 text-emerald-400" />
            <span>Manage Room Availability</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Toggle live room statuses (Available, Occupied, Maintenance, Reserved) and update daily pricing.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-emerald-500/20 flex items-center justify-center space-x-2 transition-all cursor-pointer self-start md:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Room</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-1">
        {['All', 'Available', 'Occupied', 'Reserved', 'Maintenance'].map((status) => (
          <button
            key={status}
            onClick={() => setSelectedStatusFilter(status)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              selectedStatusFilter === status
                ? 'bg-emerald-500 text-slate-950 shadow-sm'
                : 'bg-slate-900 text-slate-300 border border-slate-800 hover:bg-slate-800'
            }`}
          >
            {status}
          </button>
        ))}
      </div>

      {/* Rooms Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredRooms.map((room) => {
          const isEditing = editingRoomId === room.id;

          return (
            <div
              key={room.id}
              className={`bg-slate-900/90 border rounded-2xl p-5 shadow-lg space-y-4 transition-all ${
                room.status === 'Available'
                  ? 'border-emerald-500/30 bg-emerald-950/10'
                  : room.status === 'Occupied'
                  ? 'border-amber-500/30 bg-amber-950/10'
                  : room.status === 'Reserved'
                  ? 'border-blue-500/30 bg-blue-950/10'
                  : 'border-slate-800 bg-slate-950/40'
              }`}
            >
              {/* Room Top Bar */}
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-400 font-mono">Floor {room.floor}</span>
                  <h3 className="text-lg font-black font-mono text-white">Room {room.room_number}</h3>
                </div>

                {!isEditing && (
                  <button
                    onClick={() => handleStartEdit(room)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-amber-400 hover:bg-slate-800 transition-colors cursor-pointer"
                    title="Edit Status or Price"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                )}
              </div>

              <div className="text-xs text-slate-300 font-semibold">{room.room_type}</div>

              {/* Editing Controls vs Normal Display */}
              {isEditing ? (
                <div className="bg-slate-950 border border-amber-500/40 rounded-xl p-3 space-y-3">
                  <div>
                    <label className="block text-[10px] text-slate-400 font-semibold mb-1">
                      Status
                    </label>
                    <select
                      value={editingStatus}
                      onChange={(e) => setEditingStatus(e.target.value as RoomStatus)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-slate-100"
                    >
                      <option value="Available">Available</option>
                      <option value="Occupied">Occupied</option>
                      <option value="Reserved">Reserved</option>
                      <option value="Maintenance">Maintenance</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] text-slate-400 font-semibold mb-1">
                      Price (₹/night)
                    </label>
                    <input
                      type="number"
                      value={editingPrice}
                      onChange={(e) => setEditingPrice(Number(e.target.value))}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-slate-100"
                    />
                  </div>

                  <div className="flex items-center justify-end space-x-2 pt-1">
                    <button
                      onClick={() => setEditingRoomId(null)}
                      className="p-1 text-slate-400 hover:text-white cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleSaveEdit(room.id)}
                      className="px-2.5 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-lg cursor-pointer"
                    >
                      Save
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                  <span
                    className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                      room.status === 'Available'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : room.status === 'Occupied'
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        : room.status === 'Reserved'
                        ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                        : 'bg-slate-800 text-slate-400 border border-slate-700'
                    }`}
                  >
                    {room.status}
                  </span>

                  <span className="text-sm font-bold font-mono text-amber-400">
                    ₹{room.price}/night
                  </span>
                </div>
              )}

              {/* Amenities */}
              <div className="flex items-center space-x-2 text-[10px] text-slate-400 pt-1">
                <span className="flex items-center space-x-1">
                  <Wind className="w-3 h-3 text-slate-500" />
                  <span>AC</span>
                </span>
                <span>•</span>
                <span className="flex items-center space-x-1">
                  <Wifi className="w-3 h-3 text-slate-500" />
                  <span>Wi-Fi</span>
                </span>
                <span>•</span>
                <span className="flex items-center space-x-1">
                  <Tv className="w-3 h-3 text-slate-500" />
                  <span>TV</span>
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add New Room Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center space-x-2">
                <Plus className="w-5 h-5 text-emerald-400" />
                <span>Add Room to Inventory</span>
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateRoom} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Room Number *
                </label>
                <input
                  type="text"
                  required
                  value={newRoomNumber}
                  onChange={(e) => setNewRoomNumber(e.target.value)}
                  placeholder="e.g. 106"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Room Category / Type
                </label>
                <select
                  value={newRoomType}
                  onChange={(e) => setNewRoomType(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100"
                >
                  <option value="Standard King">Standard King</option>
                  <option value="Deluxe Suite">Deluxe Suite</option>
                  <option value="Executive Room">Executive Room</option>
                  <option value="Super Deluxe">Super Deluxe</option>
                  <option value="Presidential Suite">Presidential Suite</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Price (₹/night)
                  </label>
                  <input
                    type="number"
                    value={newRoomPrice}
                    onChange={(e) => setNewRoomPrice(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Floor</label>
                  <input
                    type="number"
                    value={newFloor}
                    onChange={(e) => setNewFloor(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-xs text-slate-400 hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl cursor-pointer"
                >
                  Add Room
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};