import React from 'react';
import {
  Info,
  Sparkles,
  Compass,
  Building2,
  FileText,
  CalendarCheck,
  CalendarX,
  UserCheck,
  CheckCircle2,
  Cpu,
  Hotel,
  Linkedin,
  ExternalLink,
} from 'lucide-react';

export function AboutView() {
  const capabilities = [
    {
      title: 'Explore Travel Destinations',
      desc: 'Discover places to visit, popular attractions, travel recommendations, and useful travel tips.',
      icon: Compass,
      color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
    },
    {
      title: 'Discover Hotels',
      desc: 'Find hotels based on location, preferences, and other requirements.',
      icon: Hotel,
      color: 'text-violet-400 bg-violet-500/10 border-violet-500/20',
    },
    {
      title: 'Get Hotel Information',
      desc: 'View important hotel details such as hotel name, hotel ID, location, available rooms, pricing, facilities, ratings, and contact information.',
      icon: FileText,
      color: 'text-teal-400 bg-teal-500/10 border-teal-500/20',
    },
    {
      title: 'Make Hotel Reservations',
      desc: 'Create hotel bookings by providing the required reservation details.',
      icon: CalendarCheck,
      color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    },
    {
      title: 'Manage Bookings',
      desc: 'View existing reservations, booking details, room information, and reservation dates.',
      icon: Building2,
      color: 'text-sky-400 bg-sky-500/10 border-sky-500/20',
    },
    {
      title: 'Cancel Reservations',
      desc: 'Cancel existing hotel bookings when required.',
      icon: CalendarX,
      color: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
    },
  ];

  return (
    <div className="flex-1 h-full flex flex-col bg-[#020618] text-[#E9E9EC] overflow-hidden">
      {/* Top Header Bar */}
      <div className="h-16 shrink-0 border-b border-[#1E1E22] px-6 flex items-center justify-between bg-[#0E0E11]/80 backdrop-blur-md">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-violet-900/30">
            <Info size={18} />
          </div>
          <div>
            <h1 className="text-base font-semibold text-[#E9E9EC]">About</h1>
            <p className="text-[11px] text-[#71717A]">
              ApnaYatra Overview & Developer Information
            </p>
          </div>
        </div>

        <span className="px-2.5 py-1 rounded-md text-[11px] font-mono font-medium bg-violet-500/10 text-violet-300 border border-violet-500/20">
          ApnaYatra
        </span>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar p-6 space-y-8 max-w-4xl w-full mx-auto">
        {/* Intro Hero Box */}
        <section className="bg-gradient-to-b from-[#14141A] to-[#101014] border border-[#22222A] rounded-2xl p-6 sm:p-8 space-y-4 shadow-xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-xs font-medium text-violet-300">
            <Sparkles size={14} />
            <span>AI-Powered Travel & Hotel Booking Assistant</span>
          </div>

          <h2 className="text-2xl font-bold text-white tracking-tight">
           About ApnaYatra
          </h2>

          <p className="text-sm text-[#B4B4BB] leading-relaxed">
            ApnaYatra is an AI-powered travel assistant designed to make travel planning, destination discovery, and hotel booking simple, convenient, and personalized.
          </p>

          <p className="text-sm text-[#9A9AA2] leading-relaxed">
            The application provides an intuitive conversational experience where users can interact with the AI using natural language instead of navigating through complicated menus. Whether a user wants to discover a destination, find a suitable hotel, or manage an existing reservation, the system is designed to provide relevant information and assist throughout the process.
          </p>
        </section>

        {/* What You Can Do */}
        <section className="space-y-4">
          <div className="border-b border-[#1E1E22] pb-3">
            <h2 className="text-lg font-semibold text-[#E9E9EC] flex items-center gap-2">
              <CheckCircle2 size={20} className="text-teal-400" />
              What You Can Do
            </h2>
            <p className="text-xs text-[#71717A] mt-0.5">
              Users can interact with the AI to perform a wide range of travel operations:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {capabilities.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div
                  key={idx}
                  className="bg-[#121216] border border-[#1E1E22] hover:border-violet-500/30 rounded-xl p-4 transition-all duration-200 flex items-start gap-3.5 group"
                >
                  <div
                    className={`p-2.5 rounded-xl border shrink-0 ${item.color}`}
                  >
                    <Icon size={18} />
                  </div>
                  <div>
                    <h3 className="text-xs font-semibold text-[#E9E9EC] group-hover:text-violet-300 transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-xs text-[#8E8E93] mt-1 leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* AI-Powered Experience */}
        <section className="bg-[#121216] border border-[#1E1E22] rounded-2xl p-6 space-y-3">
          <h2 className="text-base font-semibold text-[#E9E9EC] flex items-center gap-2">
            <Cpu size={18} className="text-violet-400" />
            AI-Powered Experience
          </h2>
          <p className="text-xs text-[#A1A1AA] leading-relaxed">
            The application combines artificial intelligence with a user-friendly interface to provide a smooth and interactive travel-booking experience. Users can communicate with the system naturally, while the application processes their requests and provides relevant travel and hotel information.
          </p>
        </section>

        {/* Developed By */}
        <section className="bg-gradient-to-r from-[#14141C] via-[#121218] to-[#10141A] border border-violet-500/20 rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="text-[10px] uppercase font-mono tracking-widest text-teal-400 font-semibold flex items-center gap-1.5">
              <UserCheck size={13} />
              <span>Developer Information</span>
            </div>
            <h2 className="text-lg font-bold text-white">Developed By Basudeb Roy</h2>
            <p className="text-xs text-[#9A9AA2] max-w-xl leading-relaxed">
              Developed and maintained by Basudeb Roy, with a focus on building AI-powered applications, intelligent backend systems, and practical, user-friendly software solutions.
            </p>
          </div>

          <a
            href="https://www.linkedin.com/in/basudeb-roy-a31651229"
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 px-4 py-2.5 rounded-xl bg-violet-600/10 hover:bg-violet-600/20 border border-violet-500/30 hover:border-violet-500/50 text-xs font-mono text-violet-300 hover:text-white transition-all flex items-center gap-2 group cursor-pointer shadow-sm"
            title="View Basudeb Roy's LinkedIn Profile"
          >
            <Linkedin size={15} className="text-violet-400 group-hover:text-violet-300" />
            <span>Basudeb Roy</span>
            <ExternalLink size={13} className="text-[#8E8E93] group-hover:text-white" />
          </a>
        </section>
      </div>
    </div>
  );
}
