import React, { useState } from 'react';
import {
  MessageSquare,
  Building2,
  Compass,
  LayoutGrid,
  History,
  Info,
  Search,
  LogOut,
  Sparkles,
} from 'lucide-react';
import { Session, NavTab } from '../types';
export type ActiveTab = NavTab;

interface SidebarProps {
  session: Session;
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  onLogout: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  bookingCount?: number;
}

export function Sidebar({
  session,
  activeTab,
  onSelectTab,
  onLogout,
  searchQuery,
  onSearchChange,
  bookingCount = 0,
}: SidebarProps) {
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const shortSessionId = session.threadId ? session.threadId.split('-')[0] : 'session';

  const navItems = [
    {
      id: 'chat' as ActiveTab,
      label: 'AI Chat',
      icon: MessageSquare,
      badge: 'Live',
      badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    },
    {
      id: 'bookings' as ActiveTab,
      label: 'Booked Hotels',
      icon: Building2,
      badge: bookingCount > 0 ? `${bookingCount}` : undefined,
      badgeColor: 'bg-violet-500/20 text-violet-300 border-violet-500/30',
    },
    {
      id: 'explore' as ActiveTab,
      label: 'Explore Destinations',
      icon: Compass,
    },
    {
      id: 'templates' as ActiveTab,
      label: 'Itinerary Templates',
      icon: LayoutGrid,
    },
    {
      id: 'history' as ActiveTab,
      label: 'Session History',
      icon: History,
    },
    {
      id: 'about' as ActiveTab,
      label: 'About',
      icon: Info,
    },
  ];

  return (
    <>
      <aside className="w-[280px] shrink-0 border-r border-white/10 bg-[#020618] flex flex-col h-full select-none z-20">
        {/* Brand Header */}
        <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 via-indigo-600 to-teal-500 flex items-center justify-center text-white text-xs font-bold shadow-md shadow-violet-900/20">
              <Sparkles size={16} />
            </div>
            <div>
              <div className="text-sm font-semibold tracking-wide text-[#E9E9EC] flex items-center gap-1.5">
                ApnaYatra
              </div>
              <div className="text-[10px] font-mono text-[#D8B4E2]/70">version 1.0</div>
            </div>
          </div>
          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-teal-400/10 text-teal-300 border border-teal-400/20">
            PRO
          </span>
        </div>

        {/* Search Bar */}
        <div className="px-4 pt-4 pb-2">
          <div className="relative flex items-center bg-black/20 border border-white/10 rounded-xl px-3 py-2 text-[#8E8E93] focus-within:border-violet-400/60 focus-within:text-[#E9E9EC] transition-all">
            <Search size={15} className="shrink-0 mr-2 text-white/50" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search chats, hotels..."
              className="w-full bg-transparent text-xs text-[#E9E9EC] placeholder-white/40 focus:outline-none"
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                className="text-[10px] text-white/60 hover:text-white ml-1"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Main Navigation */}
        <div className="px-3 py-2 text-[10px] uppercase font-mono tracking-wider text-white/50 font-semibold">
          Navigation
        </div>
        <nav className="px-3 space-y-1 flex-1 overflow-y-auto no-scrollbar">
          {navItems.map(({ id, label, icon: Icon, badge, badgeColor }) => {
            const isActive = activeTab === id;
            return (
              <button
                key={id}
                onClick={() => onSelectTab(id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs transition-all cursor-pointer ${
                  isActive
                    ? 'bg-white/15 text-white border border-white/20 font-medium shadow-sm'
                    : 'text-white/70 hover:bg-white/10 hover:text-white border border-transparent'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    size={17}
                    className={isActive ? 'text-white' : 'text-white/60'}
                  />
                  <span>{label}</span>
                </div>
                {badge && (
                  <span
                    className={`px-1.5 py-0.5 rounded-md text-[10px] font-mono font-semibold border ${
                      badgeColor || 'bg-black/30 text-white/80 border-white/10'
                    }`}
                  >
                    {badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Profile Section */}
        <div className="border-t border-white/10 bg-black/20 px-4 py-3.5 flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-violet-600 to-indigo-500 flex items-center justify-center text-xs font-bold text-white shadow-inner shrink-0 border border-violet-400/30">
            {session.name ? session.name[0].toUpperCase() : 'U'}
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-xs font-medium text-[#E9E9EC] truncate">
              {session.name || `+${session.phone}`}
            </div>
            <div className="text-[10px] font-mono text-white/60 truncate flex items-center gap-1">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400" />
              Session: {shortSessionId}
            </div>
          </div>
          <button
            onClick={() => setShowLogoutModal(true)}
            title="Log out"
            className="p-1.5 rounded-lg text-white/60 hover:text-red-300 hover:bg-red-500/20 transition-colors shrink-0 cursor-pointer"
          >
            <LogOut size={16} />
          </button>
        </div>
      </aside>

      {/* Confirmation Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="w-full max-w-sm rounded-2xl border border-white/15 bg-[#020618] p-5 shadow-2xl">
            <h3 className="text-sm font-semibold text-[#E9E9EC]">Logout</h3>
            <p className="mt-2 text-xs text-white/70">
              Are you sure do you want to log out ?
            </p>
            <div className="mt-5 flex justify-end gap-2.5">
              <button
                onClick={() => setShowLogoutModal(false)}
                className="px-3.5 py-1.5 rounded-lg text-xs font-medium text-white/70 hover:bg-white/10 hover:text-white transition-colors"
              >
                No, Stay
              </button>
              <button
                onClick={() => {
                  setShowLogoutModal(false);
                  onLogout();
                }}
                className="px-3.5 py-1.5 rounded-lg text-xs font-medium bg-red-500/20 text-red-300 border border-red-500/30 hover:bg-red-500/30 transition-colors"
              >
                Yes, Log out
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}