import { useState, useEffect } from 'react';
import { AuthPage } from './components/AuthPage';
import { Sidebar, ActiveTab } from './components/Sidebar';
import { ChatView } from './components/ChatView';
import { BookedHotelsView } from './components/BookedHotelsView';
import { AboutView } from './components/AboutView';
import { Session } from './types';
import { Compass, LayoutGrid, History, Sparkles } from 'lucide-react';

const API_BASE = 'https://apnayatra-backend.onrender.com/';

export default function App() {
  // 1. Read stored session from sessionStorage on load / refresh
  const [session, setSession] = useState<Session | null>(() => {
    const saved = sessionStorage.getItem('staybot_session');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return null;
      }
    }
    return null;
  });

  const [activeTab, setActiveTab] = useState<ActiveTab>('chat');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [chatInitialPrompt, setChatInitialPrompt] = useState<string | undefined>(undefined);
  const [bookingCount, setBookingCount] = useState<number>(0);

  // 2. Save session to sessionStorage on login
  const handleConnected = (newSession: Session) => {
    setSession(newSession);
    sessionStorage.setItem('staybot_session', JSON.stringify(newSession));
  };

  // 3. Clear session from sessionStorage on logout
  const handleLogout = () => {
    setSession(null);
    sessionStorage.removeItem('staybot_session');
    setActiveTab('chat');
  };

  useEffect(() => {
    if (!session) return;
    async function fetchInitialCount() {
      try {
        const res = await fetch(
          `${API_BASE}/bookings?thread_id=${encodeURIComponent(
            session!.threadId
          )}&phone=${encodeURIComponent(session!.phone)}`
        );
        if (res.ok) {
          const data = await res.json();
          const list = Array.isArray(data) ? data : data.bookings;
          if (Array.isArray(list)) {
            setBookingCount(list.length);
            return;
          }
        }
        setBookingCount(3);
      } catch {
        setBookingCount(3);
      }
    }
    fetchInitialCount();
  }, [session]);

  if (!session) {
    return <AuthPage onConnected={handleConnected} />;
  }

  const handleNavigateToChat = (prompt?: string) => {
    if (prompt) {
      setChatInitialPrompt(prompt);
    }
    setActiveTab('chat');
  };

  const handleClearInitialPrompt = () => {
    setChatInitialPrompt(undefined);
  };

  return (
    <div className="h-screen w-screen bg-[#020618] text-[#E9E9EC] font-sans flex overflow-hidden">
      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
      
      <Sidebar
        session={session}
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onLogout={handleLogout}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        bookingCount={bookingCount}
      />

      <main className="flex-1 min-w-0 h-full flex flex-col bg-[#020618]">
        {/* Chat View */}
        <div className={`flex-1 min-w-0 h-full ${activeTab === 'chat' ? 'flex flex-col' : 'hidden'}`}>
          <ChatView
            session={session}
            initialPrompt={chatInitialPrompt}
            onClearInitialPrompt={handleClearInitialPrompt}
            onClearInitialProcessed={handleClearInitialPrompt}
          />
        </div>

        {/* Booked Hotels View */}
        <div className={`flex-1 min-w-0 h-full ${activeTab === 'bookings' ? 'flex flex-col' : 'hidden'}`}>
          <BookedHotelsView
            session={session}
            onNavigateToChat={handleNavigateToChat}
            searchFilter={searchQuery}
            onBookingsCountChange={setBookingCount}
          />
        </div>

        {/* Explore View */}
        <div className={`flex-1 min-w-0 h-full ${activeTab === 'explore' ? 'flex flex-col items-center justify-center p-8 bg-[#020618] text-center' : 'hidden'}`}>
          <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mb-4">
            <Compass size={28} />
          </div>
          <h2 className="text-xl font-semibold text-[#E9E9EC] mb-2">Explore Popular Destinations</h2>
          <p className="text-xs text-[#71717A] max-w-md mb-6">
            Discover top-rated hotels, luxury resorts, and recommended travel routes tailored for your next trip.
          </p>
          <button
            onClick={() => handleNavigateToChat('Suggest 5 amazing travel destinations in Europe')}
            className="px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-medium cursor-pointer transition-colors flex items-center gap-2"
          >
            <Sparkles size={14} />
            <span>Ask AI for Recommendations</span>
          </button>
        </div>

        {/* Templates View */}
        <div className={`flex-1 min-w-0 h-full ${activeTab === 'templates' ? 'flex flex-col items-center justify-center p-8 bg-[#020618] text-center' : 'hidden'}`}>
          <div className="w-14 h-14 rounded-2xl bg-violet-500/10 border border-violet-500/20 text-violet-400 flex items-center justify-center mb-4">
            <LayoutGrid size={28} />
          </div>
          <h2 className="text-xl font-semibold text-[#E9E9EC] mb-2">Itinerary Templates</h2>
          <p className="text-xs text-[#71717A] max-w-md mb-6">
            Choose from pre-built travel plans, business trip packages, and weekend getaway guides.
          </p>
          <button
            onClick={() => handleNavigateToChat('Create a 3-day weekend itinerary template')}
            className="px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-medium cursor-pointer transition-colors flex items-center gap-2"
          >
            <Sparkles size={14} />
            <span>Generate Custom Itinerary</span>
          </button>
        </div>

        {/* Session History View */}
        <div className={`flex-1 min-w-0 h-full ${activeTab === 'history' ? 'flex flex-col items-center justify-center p-8 bg-[#020618] text-center' : 'hidden'}`}>
          <div className="w-14 h-14 rounded-2xl bg-teal-500/10 border border-teal-500/20 text-teal-400 flex items-center justify-center mb-4">
            <History size={28} />
          </div>
          <h2 className="text-xl font-semibold text-[#E9E9EC] mb-2">Session Logs & History</h2>
          <p className="text-xs text-[#71717A] max-w-md mb-6 font-mono">
            Thread ID: {session.threadId}
          </p>
          <button
            onClick={() => setActiveTab('chat')}
            className="px-4 py-2 rounded-xl bg-[#1E1E24] hover:bg-[#272730] border border-[#2A2A32] text-xs text-[#E9E9EC] font-medium cursor-pointer transition-colors"
          >
            Back to Active Chat
          </button>
        </div>

        {/* About View */}
        <div className={`flex-1 min-w-0 h-full ${activeTab === 'about' ? 'flex flex-col' : 'hidden'}`}>
          <AboutView />
        </div>
      </main>
    </div>
  );
}