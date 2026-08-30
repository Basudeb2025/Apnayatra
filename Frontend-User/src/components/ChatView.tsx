import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ArrowUp, Sparkles, Building2, MapPin, Compass } from 'lucide-react';
import { ChatMessage, PendingConfirmation, Session, ToolCall } from '../types';

const API_BASE = 'https://apnayatra-backend.onrender.com';

// Extend ChatMessage locally with a timestamp so we don't have to touch ../types
type TimedChatMessage = ChatMessage & { timestamp: string };

function formatTime(date: Date = new Date()) {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function useAutoScroll(dep: number) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (ref.current) {
      ref.current.scrollTop = ref.current.scrollHeight;
    }
  }, [dep]);
  return ref;
}

function ConnectionDot({ ok }: { ok: boolean }) {
  return (
    <span className="relative flex h-2.5 w-2.5">
      <span
        className={`absolute inline-flex h-full w-full rounded-full opacity-60 ${
          ok ? 'bg-teal-400 animate-ping' : 'bg-red-500'
        }`}
      />
      <span
        className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
          ok ? 'bg-teal-400' : 'bg-red-500'
        }`}
      />
    </span>
  );
}

function ToolCallLine({ tc }: { tc: ToolCall; key?: React.Key }) {
  const argsStr = Object.entries(tc.args || {})
    .map(([k, v]) => `${k}=${JSON.stringify(v)}`)
    .join(', ');
  return (
    <div className="font-mono text-xs text-[#B9AEFF] bg-[#020618] border border-violet-900/40 rounded-lg px-3 py-2">
      {tc.name}({argsStr})
    </div>
  );
}

function ConfirmationCard({
  message,
  toolCalls,
  onDecide,
  deciding,
}: {
  message: string;
  toolCalls: ToolCall[];
  onDecide: (approved: boolean) => void;
  deciding: boolean;
}) {
  return (
    <div className="border border-violet-500/30 bg-violet-500/[0.05] rounded-xl p-4 max-w-[85%] space-y-3">
      <div className="text-[10px] uppercase tracking-wider text-violet-300/80 font-mono">
        Confirmation needed
      </div>
      <p className="text-sm text-[#E9E9EC]">{message}</p>
      <div className="space-y-1.5">
        {toolCalls.map((tc, i) => (
          <ToolCallLine key={i} tc={tc} />
        ))}
      </div>
      <div className="flex gap-2 pt-1">
        <button
          disabled={deciding}
          onClick={() => onDecide(true)}
          className="text-xs px-3.5 py-1.5 rounded-lg border border-violet-400/50 text-violet-300 bg-violet-400/10 hover:bg-violet-400/20 disabled:opacity-50 cursor-pointer font-medium"
        >
          Approve
        </button>
        <button
          disabled={deciding}
          onClick={() => onDecide(false)}
          className="text-xs px-3.5 py-1.5 rounded-lg border border-[#2A2A2E] text-[#9A9AA2] hover:text-[#E9E9EC] disabled:opacity-50 cursor-pointer"
        >
          Reject
        </button>
      </div>
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="flex items-center gap-1.5 px-1 py-0.5">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="w-1.5 h-1.5 rounded-full bg-violet-400/70 animate-bounce"
          style={{ animationDelay: `${i * 0.12}s` }}
        />
      ))}
    </div>
  );
}

function renderInlineFormatting(text: string) {
  if (!text) return '';
  const cleanLine = text.replace(/\*\*\*(.*?)\*\*\*/g, '**$1**');
  const parts = cleanLine.split(/(\*\*.*?\*\*)/g);

  return parts.map((part, partIdx) => {
    if (part.startsWith('**') && part.endsWith('**') && part.length >= 4) {
      const content = part.slice(2, -2);
      return (
        <strong key={partIdx} className="font-semibold text-violet-200">
          {content}
        </strong>
      );
    }
    return part;
  });
}

function renderFormattedMessage(text: string) {
  if (typeof text !== 'string' || !text || !text.trim()) return null;

  const lines = text.split('\n');
  return lines.map((line, lineIdx) => {
    const safeLine = line ?? '';
    const trimmed = safeLine.trim();
    if (!trimmed) {
      return <div key={lineIdx} className="h-2" />;
    }

    const headingMatch = trimmed.match(/^(#{1,6})\s+(.*)$/);
    if (headingMatch) {
      return (
        <div key={lineIdx} className="font-bold text-violet-200 text-sm sm:text-base mt-2 mb-1 border-b border-[#232328] pb-1">
          {renderInlineFormatting(headingMatch[2])}
        </div>
      );
    }

    const bulletMatch = trimmed.match(/^[\*\-]\s+(.*)$/);
    if (bulletMatch) {
      return (
        <div key={lineIdx} className="flex items-start gap-2 my-0.5 pl-2">
          <span className="text-violet-400 font-bold select-none">•</span>
          <span className="flex-1">{renderInlineFormatting(bulletMatch[1])}</span>
        </div>
      );
    }

    return (
      <div key={lineIdx} className="my-0.5">
        {renderInlineFormatting(trimmed)}
      </div>
    );
  });
}

function Bubble({
  role,
  time,
  children,
}: {
  role: 'user' | 'assistant';
  time?: string;
  children: React.ReactNode;
  key?: React.Key;
}) {
  const isUser = role === 'user';
  let content: React.ReactNode = children;

  if (typeof children === 'string' || typeof children === 'number') {
    const textStr = String(children);
    const formatted = renderFormattedMessage(textStr);
    content = formatted !== null ? formatted : textStr;
  }

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`flex flex-col max-w-[80%] ${isUser ? 'items-end' : 'items-start'}`}>
        <div
          className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${
            isUser
              ? 'bg-gradient-to-r from-violet-600/30 to-indigo-600/30 border border-violet-400/30 text-[#EDEAFF] shadow-sm'
              : 'bg-[#1E293B] border border-[#1E1E22] text-[#E9E9EC]'
          }`}
        >
          {content}
        </div>
        {time && (
          <span className="text-[10px] text-[#5A5A63] mt-1 px-1 select-none">
            {time}
          </span>
        )}
      </div>
    </div>
  );
}

interface ComposerProps {
  value: string;
  onChange: (v: string) => void;
  onSubmit: () => void;
  disabled: boolean;
  autoFocus?: boolean;
}

function Composer({ value, onChange, onSubmit, disabled, autoFocus }: ComposerProps) {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSubmit();
    }
  };

  return (
    <div className="border border-[#1E1E22] bg-[#2b365c] focus-within:border-violet-500/50 rounded-2xl px-5 py-3.5 flex items-end gap-3 transition-colors shadow-lg">
      <textarea
        autoFocus={autoFocus}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        rows={1}
        placeholder="Ask me about your favorite place or book a hotel…"
        className="flex-1 resize-none bg-transparent text-sm text-[#FFFFFF] placeholder-[#d3d5de] focus:outline-none disabled:opacity-50 py-1"
      />
      <button
        onClick={onSubmit}
        disabled={disabled || !value.trim()}
        className="shrink-0 w-9 h-9 rounded-full bg-violet-500 hover:bg-violet-400 disabled:opacity-30 disabled:hover:bg-violet-500 flex items-center justify-center transition-all cursor-pointer shadow-md"
      >
        <ArrowUp size={16} className="text-[#020618]" strokeWidth={2.5} />
      </button>
    </div>
  );
}

interface ChatViewProps {
  session: Session;
  initialPrompt?: string;
  onClearInitialPrompt?: () => void;
}

export function ChatView({ session, initialPrompt, onClearInitialPrompt }: ChatViewProps) {
  const [messages, setMessages] = useState<TimedChatMessage[]>([]);
  const [input, setInput] = useState<string>('');
  const [busy, setBusy] = useState<boolean>(false);
  const [pendingConfirmation, setPendingConfirmation] = useState<PendingConfirmation | null>(null);
  const [apiOk, setApiOk] = useState<boolean>(true);

  const scrollRef = useAutoScroll(
    messages.length > 0
      ? messages.length + messages[messages.length - 1].text.length + (pendingConfirmation ? 1 : 0)
      : (pendingConfirmation ? 1 : 0)
  );
  const hasStarted = messages.length > 0;
  const processedPromptRef = useRef<string | null>(null);
  const busyRef = useRef<boolean>(false);
  const streamTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (streamTimerRef.current) {
        clearInterval(streamTimerRef.current);
      }
    };
  }, []);

  const streamAssistantReply = useCallback((fullText: string) => {
    if (streamTimerRef.current) {
      clearInterval(streamTimerRef.current);
      streamTimerRef.current = null;
    }

    const timestamp = formatTime();
    setMessages((prev) => [...prev, { role: 'assistant', text: '', timestamp }]);

    let currentIndex = 0;
    const totalLength = fullText.length;
    const step = Math.max(1, Math.ceil(totalLength / 70));

    streamTimerRef.current = setInterval(() => {
      currentIndex += step;
      if (currentIndex >= totalLength) {
        setMessages((prev) => {
          if (prev.length === 0) return prev;
          const next = [...prev];
          next[next.length - 1] = { role: 'assistant', text: fullText, timestamp };
          return next;
        });
        if (streamTimerRef.current) {
          clearInterval(streamTimerRef.current);
          streamTimerRef.current = null;
        }
      } else {
        const partialText = fullText.slice(0, currentIndex);
        setMessages((prev) => {
          if (prev.length === 0) return prev;
          const next = [...prev];
          next[next.length - 1] = { role: 'assistant', text: partialText, timestamp };
          return next;
        });
      }
    }, 18);
  }, []);

  const applyResult = useCallback((data: {
    requires_confirmation?: boolean;
    confirmation_message?: string;
    pending_tool_calls?: ToolCall[];
    reply?: string;
  }) => {
    if (data.requires_confirmation) {
      setPendingConfirmation({
        message: data.confirmation_message || 'Confirmation required for action',
        toolCalls: data.pending_tool_calls || [],
      });
    } else {
      setPendingConfirmation(null);
      if (data.reply) {
        streamAssistantReply(data.reply);
      }
    }
  }, [streamAssistantReply]);

  const sendMessageWithText = useCallback(async (text: string) => {
    if (!text || busyRef.current) return;
    busyRef.current = true;
    setBusy(true);
    setMessages((m) => [...m, { role: 'user', text, timestamp: formatTime() }]);
    setInput('');

    try {
      const res = await fetch(`${API_BASE}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ thread_id: session.threadId, message: text }),
      });

      if (!res.ok) throw new Error(String(res.status));
      const data = await res.json();
      setApiOk(true);
      applyResult(data);
    } catch {
      setApiOk(false);
      streamAssistantReply('Service temporarily unavailable due to an issue on our end. Please try again shortly.');
    } finally {
      busyRef.current = false;
      setBusy(false);
    }
  }, [session.threadId, applyResult, streamAssistantReply]);

  useEffect(() => {
    if (
      initialPrompt &&
      initialPrompt.trim() &&
      processedPromptRef.current !== initialPrompt
    ) {
      processedPromptRef.current = initialPrompt;
      sendMessageWithText(initialPrompt);
      if (onClearInitialPrompt) {
        onClearInitialPrompt();
      }
    }
  }, [initialPrompt, sendMessageWithText, onClearInitialPrompt]);

  const sendMessage = () => {
    sendMessageWithText(input.trim());
  };

  const decide = async (approved: boolean) => {
    setBusy(true);
    try {
      const res = await fetch(`${API_BASE}/chat/confirm`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ thread_id: session.threadId, approved }),
      });
      if (!res.ok) throw new Error(String(res.status));
      const data = await res.json();
      setApiOk(true);
      applyResult(data);
    } catch {
      setApiOk(false);
      setPendingConfirmation(null);
      streamAssistantReply("Couldn't reach the API to confirm that action.");
    } finally {
      setBusy(false);
    }
  };

  const quickPrompts = [
    { label: 'Book Taj Palace Mumbai', icon: Building2 },
    { label: 'Top 5 hotels in Paris', icon: MapPin },
    { label: 'Find luxury resort with pool', icon: Compass },
  ];

  return (
    <div className="flex-1 h-full flex flex-col min-w-0 bg-[#020618] text-[#E9E9EC]">
      <div className="h-14 shrink-0 border-b border-[#1A1A1D] flex items-center justify-between px-6 bg-[#020618]">
        <div className="flex items-center gap-2.5 text-xs text-[#9A9AA2]">
          <ConnectionDot ok={apiOk} />
          <span className="font-medium">
            {apiOk ? 'ApnaYatra is Ready for You' : 'Service unavailable'}
          </span>
        </div>
        <div className="text-[11px] font-mono text-[#52525B]">
          Thread: {session.threadId.slice(0, 8)}...
        </div>
      </div>

      {!hasStarted ? (
        <div className="flex-1 flex flex-col items-center justify-center px-6 py-8">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-violet-600/20 to-teal-500/20 border border-violet-500/30 flex items-center justify-center text-violet-300 mb-6 shadow-lg">
            <Sparkles size={24} />
          </div>

          <h1 className="text-2xl sm:text-3xl font-medium text-center mb-3 text-white max-w-xl leading-tight">
            Hello, Traveler! Where would you like to go?
          </h1>
          <p className="text-xs text-[#71717A] text-center mb-8 max-w-md">
            Ask me to search hotels, reserve rooms, check availability, or tailor your perfect travel itinerary.
          </p>

          <div className="w-full max-w-2xl mb-6">
            <Composer
              value={input}
              onChange={setInput}
              onSubmit={sendMessage}
              disabled={busy}
              autoFocus
            />
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2 max-w-2xl">
            {quickPrompts.map(({ label, icon: Icon }) => (
              <button
                key={label}
                onClick={() => sendMessageWithText(label)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#131316] hover:bg-[#1C1C22] border border-[#232328] hover:border-violet-500/40 text-xs text-[#A1A1AA] hover:text-[#E9E9EC] transition-all cursor-pointer"
              >
                <Icon size={13} className="text-violet-400" />
                <span>{label}</span>
              </button>
            ))}
          </div>
        </div>
      ) : (
        <>
          <div
            ref={scrollRef}
            className="flex-1 min-h-0 overflow-y-auto no-scrollbar px-6 py-6 space-y-4 max-w-3xl w-full mx-auto"
          >
            {messages.map((m, i) => (
              <Bubble key={i} role={m.role} time={m.timestamp}>
                {m.text}
              </Bubble>
            ))}

            {pendingConfirmation && (
              <ConfirmationCard
                message={pendingConfirmation.message}
                toolCalls={pendingConfirmation.toolCalls}
                onDecide={decide}
                deciding={busy}
              />
            )}

            {busy && !pendingConfirmation && (
              <div className="flex justify-start">
                <div className="bg-[#1E293B] border border-[#1E1E22] rounded-xl px-4 py-3">
                  <TypingIndicator />
                </div>
              </div>
            )}
          </div>

          <div className="px-6 pb-6 pt-2 shrink-0 bg-[#020618]">
            <div className="max-w-3xl mx-auto">
              <Composer
                value={input}
                onChange={setInput}
                onSubmit={sendMessage}
                disabled={busy || !!pendingConfirmation}
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
}