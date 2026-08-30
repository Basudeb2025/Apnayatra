import React, { useState, useRef, useEffect } from 'react';
import {
  Building2,
  MapPin,
  Bed,
  LogOut,
  User,
  PlusCircle,
  Tag,
  X,
  Send,
} from 'lucide-react';
import { Hotel, Manager } from '../types';
import chatbotLogo from '../../assets/chatbot.png';
import {
  sendChatMessage,
  createThreadId
} from '../services/api';

interface HeaderProps {
  hotel: Hotel | null;
  manager: Manager | null;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onLogout: () => void;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
}

function nowLabel() {
  return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

// Typewriter effect for assistant replies. Animates once, then stays static.
const AssistantMessage: React.FC<{
  text: string;
  animate: boolean;
  onDone: () => void;
}> = ({ text, animate, onDone }) => {
  const [displayedText, setDisplayedText] = useState(animate ? '' : text);

  useEffect(() => {
    if (!animate) {
      setDisplayedText(text);
      return;
    }

    let index = 0;
    const speed = 15; // ms per character — lower = faster typing

    const interval = setInterval(() => {
      index++;
      setDisplayedText(text.slice(0, index));
      if (index >= text.length) {
        clearInterval(interval);
        onDone();
      }
    }, speed);

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text, animate]);

  return <span className="whitespace-pre-line">{displayedText}</span>;
};

export const Header: React.FC<HeaderProps> = ({
  hotel,
  manager,
  activeTab,
  setActiveTab,
  onLogout,
}) => {
  const [isChatOpen, setIsChatOpen] = useState<boolean>(false);
  const [showLogoutModal, setShowLogoutModal] = useState<boolean>(false);
  const [inputMessage, setInputMessage] = useState<string>('');
  const [isSending, setIsSending] = useState<boolean>(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      sender: 'assistant',
      text: `Hello admin, I'm your Assistant. How can I help you manage bookings or hotel info today?`,
      timestamp: nowLabel(),
    },
  ]);

  // Tracks which assistant message IDs have already finished animating,
  // so old messages don't re-type themselves on every re-render.
  const [animatedIds, setAnimatedIds] = useState<Set<string>>(new Set(['1']));

  const markAnimated = (id: string) => {
    setAnimatedIds((prev) => new Set(prev).add(id));
  };

  // One thread id per mounted session. Swap createThreadId() for a
  // backend-issued id if your Python service allocates thread ids itself.
  const threadIdRef = useRef<string>(createThreadId());
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (isChatOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isChatOpen, isSending]);

  const appendMessage = (msg: ChatMessage) => {
    setMessages((prev) => [...prev, msg]);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = inputMessage.trim();
    if (!text || isSending) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text,
      timestamp: nowLabel(),
    };
    appendMessage(userMsg);
    setInputMessage('');
    setIsSending(true);

    try {
      const data = await sendChatMessage(threadIdRef.current, text);

      // The admin chatbox here doesn't render tool-call confirmations
      // (unlike the main ChatView), so surface a plain-text fallback
      // if the backend asks for one.
      const replyText = data.requires_confirmation
        ? data.confirmation_message || 'This action needs confirmation before I can proceed.'
        : data.reply || "I didn't get a response for that — could you rephrase?";

      appendMessage({
        id: `${Date.now()}-a`,
        sender: 'assistant',
        text: replyText,
        timestamp: nowLabel(),
      });
    } catch (err) {
      const message =
        err instanceof ChatApiError
          ? err.message
          : 'Service temporarily unavailable due to an issue on our end. Please try again shortly.';
      appendMessage({
        id: `${Date.now()}-e`,
        sender: 'assistant',
        text: message,
        timestamp: nowLabel(),
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <>
      <header className="bg-slate-900 border-b border-slate-800 text-slate-100 sticky top-0 z-30 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Hotel Information */}
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-600 flex items-center justify-center text-slate-950 font-bold shadow-lg shadow-amber-500/20">
                <Building2 className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h1 className="text-lg font-bold text-white tracking-tight">
                    {manager?.hotel_name || 'Bibhash'}
                  </h1>
                  {hotel?.hotel_id && (
                    <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-xs font-mono font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/30">
                      <Tag className="w-3 h-3 text-amber-400" />
                      <span>ID: {hotel.hotel_id}</span>
                    </span>
                  )}
                </div>
                <div className="flex items-center space-x-3 text-xs text-slate-400 mt-0.5">
                  <span className="flex items-center space-x-1">
                    <MapPin className="w-3 h-3 text-slate-400" />
                    <span className="capitalize">{hotel?.town || ''}</span>
                  </span>
                  <span className="text-slate-600">•</span>
                  <span className="flex items-center space-x-1">
                    <Bed className="w-3 h-3 text-emerald-400" />
                    <span>
                      <strong className="text-emerald-400 font-semibold">{hotel?.available_rooms ?? 3}</strong>{' '}
                      / {hotel?.total_rooms ?? 3} Rooms Free
                    </span>
                  </span>
                  <span className="text-slate-600">•</span>
                  <span className="font-semibold text-slate-300">
                    ₹{hotel?.price ?? 1200}/night
                  </span>
                </div>
              </div>
            </div>

            {/* Actions & Profile */}
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setActiveTab('register')}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === 'register'
                    ? 'bg-amber-500 text-slate-950 shadow-sm'
                    : 'bg-slate-800 text-slate-200 border border-slate-700 hover:bg-slate-700'
                }`}
              >
                <PlusCircle className="w-4 h-4" />
                <span className="hidden sm:inline">Register Hotel</span>
              </button>

              <div className="flex items-center space-x-2 border-l border-slate-800 pl-3">
                <div className="text-right hidden md:block">
                  <div className="text-xs font-medium text-slate-200 flex items-center justify-end space-x-1">
                    <User className="w-3 h-3 text-slate-400" />
                    <span>{manager?.phone_number || '9876543210'}</span>
                  </div>
                  <div className="text-[10px] text-amber-400 font-medium">Hotel Manager</div>
                </div>
                <button
                  onClick={() => setShowLogoutModal(true)}
                  title="Logout"
                  className="p-2 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Floating Animated Assistant Button (Logo outside the box with larger size) */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-center">
        <button
          onClick={() => setIsChatOpen((prev) => !prev)}
          className="relative group bg-transparent border-0 outline-none p-0 cursor-pointer transition-all duration-200 hover:scale-110 active:scale-95"
          title="Open Assistant"
        >
          {isChatOpen ? (
            <div className="w-16 h-16 rounded-full bg-slate-800/90 border border-slate-700 flex items-center justify-center shadow-2xl backdrop-blur-sm">
              <X className="w-8 h-8 text-slate-200" />
            </div>
          ) : (
            <div className="relative">
              {/* Subtle ambient backglow */}
              <div className="absolute inset-0 rounded-full bg-amber-400/20 blur-xl scale-125 animate-pulse" />
              <img
              src={chatbotLogo}
              alt="Assistant Logo"
              className="relative w-14 h-14 object-contain drop-shadow-[0_8px_16px_rgba(0,0,0,0.4)] animate-bounce"
            />
            </div>
          )}
        </button>
        <span className="mt-1 text-xs font-semibold text-slate-200 tracking-wide font-mono drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] bg-slate-900/80 px-2.5 py-0.5 rounded-full border border-slate-800/80">
          Assistant
        </span>
      </div>

      {/* Chatbox Modal */}
      {isChatOpen && (
        <div className="fixed bottom-32 right-6 z-50 w-[360px] sm:w-[400px] h-[520px] bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-200">
          <div className="px-4 py-3.5 bg-slate-800/80 border-b border-slate-700/60 flex items-center justify-between backdrop-blur-sm">
            <div className="flex items-center space-x-2.5">
              <img
                src={chatbotLogo}
                alt="Assistant Logo"
                className="w-8 h-8 object-contain drop-shadow"
              />
              <div>
                <div className="text-xs font-bold text-white flex items-center gap-1.5">
                 Admin assistant
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400" />
                </div>
                <div className="text-[10px] font-mono text-slate-400">ApnaYatra</div>
              </div>
            </div>
            <button
              onClick={() => setIsChatOpen(false)}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-700/50 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* "no-scrollbar" hides the visible scrollbar track while keeping scroll functional */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 no-scrollbar">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${
                  msg.sender === 'user' ? 'items-end' : 'items-start'
                }`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-3.5 py-2 text-xs leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-amber-500 text-slate-950 font-medium rounded-br-sm whitespace-pre-line'
                      : 'bg-slate-800 border border-slate-700/70 text-slate-200 rounded-bl-sm'
                  }`}
                >
                  {msg.sender === 'assistant' ? (
                    <AssistantMessage
                      text={msg.text}
                      animate={!animatedIds.has(msg.id)}
                      onDone={() => markAnimated(msg.id)}
                    />
                  ) : (
                    msg.text
                  )}
                </div>
                <span className="text-[9px] font-mono text-slate-500 mt-1 px-1">
                  {msg.timestamp}
                </span>
              </div>
            ))}

            {isSending && (
              <div className="flex flex-col items-start">
                <div className="max-w-[80%] rounded-2xl rounded-bl-sm px-3.5 py-2.5 bg-slate-800 border border-slate-700/70">
                  <div className="flex items-center gap-1">
                    {[0, 1, 2].map((i) => (
                      <span
                        key={i}
                        className="w-1.5 h-1.5 rounded-full bg-slate-400/70 animate-bounce"
                        style={{ animationDelay: `${i * 0.12}s` }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          <form
            onSubmit={handleSendMessage}
            className="p-3 bg-slate-950/40 border-t border-slate-800/80 flex items-center gap-2"
          >
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Ask anything about rooms, guests..."
              disabled={isSending}
              className="flex-1 bg-slate-800/60 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500/70 transition-all disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={!inputMessage.trim() || isSending}
              className="p-2 rounded-xl bg-amber-500 text-slate-950 hover:bg-amber-400 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-md shadow-amber-500/10 cursor-pointer"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm px-4">
          <div className="w-full max-w-sm rounded-2xl border border-slate-800 bg-slate-900 p-5 shadow-2xl">
            <h3 className="text-sm font-semibold text-slate-100">Logout</h3>
            <p className="mt-2 text-xs text-slate-400">
              Are you sure do you want to logout ?
            </p>
            <div className="mt-5 flex justify-end gap-2.5">
              <button
                onClick={() => setShowLogoutModal(false)}
                className="px-3.5 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:bg-slate-800 transition-colors cursor-pointer"
              >
                No, Stay
              </button>
              <button
                onClick={() => {
                  setShowLogoutModal(false);
                  onLogout();
                }}
                className="px-3.5 py-1.5 rounded-lg text-xs font-medium bg-rose-500/20 text-rose-300 border border-rose-500/30 hover:bg-rose-500/30 transition-colors cursor-pointer"
              >
                Yes, Log out
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};