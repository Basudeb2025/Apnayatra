import React from 'react';
import {
  LayoutDashboard,
  CalendarCheck,
  BedDouble,
  PlusCircle,
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  availableRoomsCount: number;
  reservationsCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  availableRoomsCount,
  reservationsCount,
}) => {
  const navItems = [
    {
      id: 'overview',
      label: 'Dashboard',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      id: 'reservations',
      label: 'Reservations',
      icon: CalendarCheck,
      badge: reservationsCount,
    },
    {
      id: 'rooms',
      label: 'Rooms Matrix',
      icon: BedDouble,
      badge: availableRoomsCount > 0 ? `${availableRoomsCount} Free` : 'Full',
      badgeColor: availableRoomsCount > 0 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400',
    },
    {
      id: 'register',
      label: 'Register Hotel',
      icon: PlusCircle,
      badge: undefined,
      badgeColor: 'bg-[#6c35a6]/20 text-[#a874e0]',
    },
  ];

  return (
    <aside className="w-full lg:w-64 bg-slate-900/80 border-r border-slate-800 p-4 flex flex-col space-y-6">
      <div className="space-y-1">
        <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
          Management Console
        </p>
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#6c35a6] text-white font-semibold shadow-md shadow-[#6c35a6]/20'
                    : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge !== null && (
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : item.badgeColor || 'bg-slate-800 text-slate-400 border border-slate-700'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      <div className="pt-4 border-t border-slate-800 mt-auto">
        <div className="bg-slate-950/60 rounded-xl p-3 border border-slate-800/80 text-xs space-y-1.5">
          <div className="flex items-center justify-between text-slate-400">
            <span className="font-bold text-white text-xl">ApnaYatra</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          </div>
          <p className="text-[11px] text-slate-400">
            Session is Running
          </p>
        </div>
      </div>
    </aside>
  );
};