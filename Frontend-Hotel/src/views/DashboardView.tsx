import React from 'react';
import {
  Bed,
  CalendarCheck,
  Building2,
  Tag,
  MapPin,
  ArrowUpRight,
  Clock,
  Plus,
  UserCheck,
  Phone,
  Hash,
} from 'lucide-react';
import { Hotel, Manager, Reservation, Room } from '../types';

interface DashboardViewProps {
  hotel: Hotel | null;
  manager: Manager | null;
  rooms: Room[];
  reservations: Reservation[];
  setActiveTab: (tab: string) => void;
  onQuickCheckIn: (reservationId: string) => void;
  onOpenNewBookingModal: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  hotel,
  manager,
  rooms,
  reservations,
  setActiveTab,
  onQuickCheckIn,
  onOpenNewBookingModal,
}) => {
  const availableCount = rooms.filter((r) => r.status === 'Available').length;
  const occupiedCount = rooms.filter((r) => r.status === 'Occupied').length;
  const checkedInCount = reservations.filter((r) => r.status === 'Checked In').length;

  return (
    <div className="space-y-6">
      {/* Primary Hotel Details & User Context Card */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-full bg-gradient-to-l from-[#3555a6]/15 to-transparent pointer-events-none"></div>

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-[#3555a6]/15 text-[#688ce4] border border-[#3555a6]/30 flex items-center space-x-1">
                <Tag className="w-3.5 h-3.5" />
                <span>Hotel Id: {hotel?.hotel_id || 10842}</span>
              </span>
              <span className="px-2.5 py-1 rounded-full text-xs font-mono font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center space-x-1">
                <UserCheck className="w-3.5 h-3.5" />
                <span>User Id: {manager?.user_id || 'M-101'}</span>
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {manager?.hotel_name || 'Bibhash'} Hotel Admin Panel
            </h2>

            <p className="text-xs sm:text-sm text-slate-300 flex flex-wrap items-center gap-2">
              <span className="flex items-center space-x-1">
                <MapPin className="w-4 h-4 text-[#688ce4]" />
                <span>{hotel?.address || ''}</span>
              </span>
              <span className="text-slate-600">•</span>
              <span>Town: <strong className="text-white capitalize">{hotel?.town || ''}</strong></span>
              <span className="text-slate-600">•</span>
              <span className="flex items-center space-x-1 text-slate-300">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                <span>Phone: {manager?.phone_number || '9876543210'}</span>
              </span>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={onOpenNewBookingModal}
              className="px-4 py-2.5 bg-[#3555a6] hover:bg-[#2b468b] text-white font-bold text-xs rounded-xl shadow-lg shadow-[#3555a6]/25 flex items-center space-x-2 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add User Record</span>
            </button>
            <button
              onClick={() => setActiveTab('register')}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold rounded-xl flex items-center space-x-2 transition-all cursor-pointer"
            >
              <Building2 className="w-4 h-4 text-[#688ce4]" />
              <span>Register Hotel</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* 1. hotel_id & user_id summary */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-2">
          <div className="flex items-center justify-between text-xs font-medium text-slate-400">
            <span>System Identifiers</span>
            <Hash className="w-4 h-4 text-[#688ce4]" />
          </div>
          <div className="space-y-1 font-mono">
            <div className="text-xs text-slate-300 flex items-center justify-between">
              <span className="text-slate-400">Hotel Id:</span>
              <span className="text-[#688ce4] font-bold text-sm">{hotel?.hotel_id || 10842}</span>
            </div>
            <div className="text-xs text-slate-300 flex items-center justify-between">
              <span className="text-slate-400">Hotel Id:</span>
              <span className="text-emerald-400 font-bold text-sm">{manager?.user_id || 'M-101'}</span>
            </div>
          </div>
        </div>

        {/* 2. numer_of_room / Rooms Summary */}
        <div
          onClick={() => setActiveTab('rooms')}
          className="bg-slate-900/90 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 shadow-lg transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">numer_of_room (Total)</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Bed className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <div>
              <span className="text-2xl font-extrabold text-white font-mono">
                {rooms.length}
              </span>
              <span className="text-xs text-slate-400 ml-1.5">Rooms Configured</span>
            </div>
            <span className="text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
              {availableCount} Available
            </span>
          </div>
        </div>

        {/* 3. User Records & Customer Registrations */}
        <div
          onClick={() => setActiveTab('reservations')}
          className="bg-slate-900/90 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 shadow-lg transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Customer Records</span>
            <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <CalendarCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <div>
              <span className="text-2xl font-extrabold text-white font-mono">
                {reservations.length}
              </span>
              <span className="text-xs text-slate-400 ml-1.5">Customers</span>
            </div>
            <span className="text-xs font-semibold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-full">
              {checkedInCount} Checked In
            </span>
          </div>
        </div>
      </div>

      {/* Customer Data Table Section */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div>
            <h3 className="text-base font-bold text-white flex items-center space-x-2">
              <CalendarCheck className="w-5 h-5 text-[#688ce4]" />
              <span>Customer Data Records</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Stored Data Field<code className="text-[#688ce4] font-mono"></code>
            </p>
          </div>
          <button
            onClick={() => setActiveTab('reservations')}
            className="text-xs font-semibold text-[#688ce4] hover:text-[#3555a6] flex items-center space-x-1 cursor-pointer"
          >
            <span>View All ({reservations.length})</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 uppercase font-semibold text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="px-4 py-3 font-mono">hotel_id</th>
                <th className="px-4 py-3 font-mono">user_id</th>
                <th className="px-4 py-3 font-mono">numer_of_room</th>
                <th className="px-4 py-3 font-mono">customer_name</th>
                <th className="px-4 py-3 font-mono">phone_number</th>
                <th className="px-4 py-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {reservations.slice(0, 5).map((res) => (
                <tr key={res.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="px-4 py-3 font-mono text-[#688ce4] font-bold">
                    {res.hotel_id}
                  </td>
                  <td className="px-4 py-3 font-mono text-emerald-400">
                    {res.user_id}
                  </td>
                  <td className="px-4 py-3">
                    <span className="px-2.5 py-1 rounded-md text-xs font-mono font-bold bg-slate-800 text-slate-200 border border-slate-700">
                      Room {res.numer_of_room}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-bold text-white">
                    {res.customer_name}
                  </td>
                  <td className="px-4 py-3 font-mono text-slate-300">
                    {res.phone_number}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span
                      className={`px-2.5 py-1 rounded-full text-[11px] font-semibold ${
                        res.status === 'Checked In'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                          : res.status === 'Confirmed'
                          ? 'bg-blue-500/10 text-blue-400 border border-blue-500/30'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {res.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};