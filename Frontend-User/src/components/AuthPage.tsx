import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Sparkles,
  Phone,
  Lock,
  User,
  Mail,
  Eye,
  EyeOff,
  ShieldCheck,
  Loader2,
  Building2,
  ExternalLink,
} from 'lucide-react';
import { Session } from '../types';

const API_BASE = "https://apnayatra-backend.onrender.com";

function normalizePhoneClientSide(raw: string) {
  return raw.replace(/\D/g, '');
}

interface AuthPageProps {
  onConnected: (session: Session) => void;
}

export function AuthPage({ onConnected }: AuthPageProps) {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const errorTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Clear timeout on unmount
  useEffect(() => {
    return () => {
      if (errorTimeoutRef.current) {
        clearTimeout(errorTimeoutRef.current);
      }
    };
  }, []);

  // Set error and auto-clear after 4 seconds (4000ms)
  const showTimedError = useCallback((msg: string, durationMs: number = 4000) => {
    if (errorTimeoutRef.current) {
      clearTimeout(errorTimeoutRef.current);
    }
    setStatus('error');
    setErrorMsg(msg);

    errorTimeoutRef.current = setTimeout(() => {
      setStatus('idle');
      setErrorMsg('');
      errorTimeoutRef.current = null;
    }, durationMs);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPhone = normalizePhoneClientSide(phone);

    if (mode === 'signup') {
      if (!name.trim() || !email.trim() || cleanPhone.length !== 10 || !password.trim()) {
        showTimedError('Please provide all required details to create your account');
        return;
      }
      if (!name.trim()) {
        showTimedError('Please enter your name.');
        return;
      }
      if (!email.trim() || !/^\S+@\S+\.\S+$/.test(email.trim())) {
        showTimedError('Please enter a valid email address.');
        return;
      }
    }

    if (cleanPhone.length !== 10) {
      showTimedError("Please enter a valid phone number. It must contain exactly 10 digits");
      return;
    }

    if (!password.trim()) {
      showTimedError('Please enter a password.');
      return;
    }

    if (mode === 'signup' && password.length < 6) {
      showTimedError('Password should be at least 6 characters');
      return;
    }

    if (errorTimeoutRef.current) {
      clearTimeout(errorTimeoutRef.current);
      errorTimeoutRef.current = null;
    }
    setStatus('loading');
    setErrorMsg('');

    try {
      const endpoint =
        mode === 'login'
          ? `${API_BASE}/session/start`
          : `${API_BASE}/session/signup_start`;

      const body =
        mode === 'login'
          ? { phone_number: cleanPhone, password }
          : { name: name.trim(), email: email.trim(), phone_number: cleanPhone, password };

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => null);
        const message = errorData?.detail || `Server returned ${res.status}`;
        throw new Error(message);
      }

      const data = await res.json();
      if (mode === 'login') {
        onConnected({
          threadId: data.thread_id,
          phone: data.phone || cleanPhone,
          name: data.name,
        });
      } else {
        onConnected({
          threadId: data.thread_id,
          phone: data.phone_number || cleanPhone,
          name: data.name || name.trim(),
        });
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unexpected error occurred';
      if (msg.includes('Failed to fetch') || msg.includes('NetworkError') || msg.includes('Load failed')) {
        showTimedError('This issue is on our end, not yours. Please try again shortly');
      } else {
        showTimedError(msg);
      }
    }
  };

  const switchMode = (m: 'login' | 'signup') => {
    if (errorTimeoutRef.current) {
      clearTimeout(errorTimeoutRef.current);
      errorTimeoutRef.current = null;
    }
    setMode(m);
    setName('');
    setEmail('');
    setShowPassword(false);
    setPassword('');
    setPhone('');
    setStatus('idle');
    setErrorMsg('');
  };

  const openManagerPortal = () => {
    window.open('http://localhost:3000', '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="min-h-screen w-full bg-[#0A0A0C] text-[#E9E9EC] font-sans flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-gradient-to-tr from-violet-600/20 via-indigo-600/15 to-teal-500/10 blur-[120px] pointer-events-none rounded-full" />
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage:
            'radial-gradient(#8B5CF6 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      />

      {/* Main Authentication Card */}
      <div className="relative w-full max-w-md bg-[#121216]/90 border border-[#23232A] rounded-2xl shadow-2xl shadow-violet-950/20 backdrop-blur-xl overflow-hidden">
        {/* Top Header */}
        <div className="px-6 pt-6 pb-4 border-b border-[#1E1E24] text-center flex flex-col items-center">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-600 via-indigo-600 to-teal-500 flex items-center justify-center text-white shadow-lg shadow-violet-900/30 mb-3">
            <Sparkles size={22} />
          </div>
          <h1 className="text-xl font-semibold text-white tracking-tight">
            ApnaYatra
          </h1>
          <p className="text-xs text-[#8E8E93] mt-1">
            {mode === 'login'
              ? 'Enter your credentials'
              : 'Create your account to get started'}
          </p>

          {/* Segmented Tab Switcher */}
          <div className="w-full grid grid-cols-2 mt-5 p-1 bg-[#18181D] border border-[#27272A] rounded-xl text-xs">
            <button
              type="button"
              onClick={() => switchMode('login')}
              className={`py-2 rounded-lg font-medium transition-all cursor-pointer ${
                mode === 'login'
                  ? 'bg-violet-600 text-white shadow-sm'
                  : 'text-[#9A9AA2] hover:text-white'
              }`}
            >
              Log in
            </button>
            <button
              type="button"
              onClick={() => switchMode('signup')}
              className={`py-2 rounded-lg font-medium transition-all cursor-pointer ${
                mode === 'signup'
                  ? 'bg-violet-600 text-white shadow-sm'
                  : 'text-[#9A9AA2] hover:text-white'
              }`}
            >
              Sign up
            </button>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Name Field (Sign Up Only) */}
          {mode === 'signup' && (
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-[#A1A1AA] flex items-center gap-1.5">
                <User size={13} className="text-violet-400" />
                <span>Name</span>
              </label>
              <div className="relative flex items-center bg-[#18181D] border border-[#27272A] rounded-xl px-3 focus-within:border-violet-500 focus-within:ring-1 focus-within:ring-violet-500/30 transition-all">
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="How should we greet you?"
                  className="w-full bg-transparent py-2.5 text-xs text-[#E9E9EC] placeholder-[#52525B] focus:outline-none"
                />
              </div>
            </div>
          )}

          {/* Email Field (Sign Up Only) */}
          {mode === 'signup' && (
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-[#A1A1AA] flex items-center gap-1.5">
                <Mail size={13} className="text-violet-400" />
                <span>Email address</span>
              </label>
              <div className="relative flex items-center bg-[#18181D] border border-[#27272A] rounded-xl px-3 focus-within:border-violet-500 focus-within:ring-1 focus-within:ring-violet-500/30 transition-all">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full bg-transparent py-2.5 text-xs text-[#E9E9EC] placeholder-[#52525B] focus:outline-none"
                />
              </div>
            </div>
          )}

          {/* Phone Number Field */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-[#A1A1AA] flex items-center gap-1.5">
              <Phone size={13} className="text-violet-400" />
              <span>Phone number</span>
            </label>
            <div className="relative flex items-center bg-[#18181D] border border-[#27272A] rounded-xl px-3 focus-within:border-violet-500 focus-within:ring-1 focus-within:ring-violet-500/30 transition-all">
              <span className="text-xs font-mono text-teal-400/80 mr-2 select-none">+91</span>
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="9876543210"
                inputMode="tel"
                className="w-full bg-transparent py-2.5 text-xs text-[#E9E9EC] placeholder-[#52525B] focus:outline-none font-mono"
              />
            </div>
          </div>

          {/* Password Field */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-[#A1A1AA] flex items-center gap-1.5">
              <Lock size={13} className="text-violet-400" />
              <span>Password</span>
            </label>
            <div className="relative flex items-center bg-[#18181D] border border-[#27272A] rounded-xl px-3 focus-within:border-violet-500 focus-within:ring-1 focus-within:ring-violet-500/30 transition-all">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={
                  mode === 'login' ? 'Enter password' : 'Choose a password with at least 6 characters'
                }
                className="w-full bg-transparent py-2.5 text-xs text-[#E9E9EC] placeholder-[#52525B] focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="text-[#71717A] hover:text-[#E9E9EC] transition-colors ml-2 select-none shrink-0 p-1 cursor-pointer"
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </div>

          {/* Error Banner */}
          {status === 'error' && (
            <div className="text-xs text-red-300 border border-red-900/50 bg-red-950/30 rounded-xl px-3.5 py-2.5 leading-relaxed animate-fadeIn">
              {errorMsg}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={status === 'loading'}
            className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 disabled:opacity-50 text-white text-xs font-semibold rounded-xl py-3 transition-all cursor-pointer shadow-lg shadow-violet-950/40 flex items-center justify-center gap-2"
          >
            {status === 'loading' ? (
              <>
                <Loader2 size={15} className="animate-spin text-white" />
                <span>{mode === 'login' ? 'Connecting…' : 'Signing up…'}</span>
              </>
            ) : (
              <span>{mode === 'login' ? 'Connect' : 'Sign up'}</span>
            )}
          </button>

          {/* Security Note */}
          <div className="pt-2 flex items-start gap-2 text-[11px] text-[#71717A]">
            <ShieldCheck size={14} className="text-teal-400 shrink-0 mt-0.5" />
            <p className="leading-normal">
              Your phone number and password are used to authenticate your session
              and secure your account bookings.
            </p>
          </div>

          {/* Manager Portal Redirect Button */}
          <div className="pt-2 border-t border-[#1E1E24]">
            <button
              type="button"
              onClick={openManagerPortal}
              className="w-full group bg-slate-900/80 hover:bg-slate-900 border border-slate-800/90 hover:border-amber-500/40 rounded-xl p-3 flex items-center justify-between text-left transition-all cursor-pointer shadow-sm"
            >
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 group-hover:scale-105 transition-transform">
                  <Building2 size={16} />
                </div>
                <div>
                  <span className="text-xs font-semibold text-white block group-hover:text-amber-400 transition-colors">
                    ApnaYatra-Hotel_manager
                  </span>
                  <span className="text-[10px] text-[#71717A]">
                    Register & manage your hotel
                  </span>
                </div>
              </div>
              <ExternalLink size={14} className="text-[#71717A] group-hover:text-amber-400 transition-colors" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}