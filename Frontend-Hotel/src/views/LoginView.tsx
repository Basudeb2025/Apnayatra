import React, { useState } from 'react';
import { Building2, Phone, Lock, ArrowRight, ShieldCheck, Hotel as HotelIcon, CheckCircle2, Mail, Eye, EyeOff } from 'lucide-react';
import { loginManager, signupManager } from '../services/api';
import { Manager } from '../types';

interface LoginViewProps {
  onLoginSuccess: (manager: Manager) => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onLoginSuccess }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [hotelName, setHotelName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isSignUp) {
        if (!hotelName.trim() || !phone.trim() || !password.trim() || !email.trim()) {
          setError('Please fill in hotel name, email address, phone number, and password.');
          setLoading(false);
          return;
        }
        const res = await signupManager(hotelName, phone, password, email);
        if (res.success && res.data) {
          // Store manager data in sessionStorage
          sessionStorage.setItem('currentManager', JSON.stringify(res.data));
          onLoginSuccess(res.data);
        } else {
          setError(res.error || 'Signup failed. Please try again.');
        }
      } else {
        if (!phone.trim() || !password.trim()) {
          setError('Please provide both phone number and password.');
          setLoading(false);
          return;
        }
        const res = await loginManager(phone, password);
        if (res.success && res.data) {
          // Store manager data in sessionStorage
          sessionStorage.setItem('currentManager', JSON.stringify(res.data));
          onLoginSuccess(res.data);
        } else {
          setError(res.error || 'Invalid credentials.');
        }
      }
    } catch (err: any) {
      setError(err.message || 'Authentication error.');
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = () => {
    setHotelName('');
    setPhone('');
    setEmail('');
    setPassword('');
    setShowPassword(false);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black">
      <div className="w-full max-w-md space-y-6">
        {/* Header Branding */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#3555a6] text-white shadow-xl shadow-[#3555a6]/25 mb-2">
            <Building2 className="w-9 h-9" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            ApnaYatra Hotel Admin
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 max-w-xs mx-auto">
            Professional management platform for hotel owners
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="bg-slate-900/90 p-1 rounded-xl border border-slate-800 flex space-x-1">
          <button
            type="button"
            onClick={() => {
              setIsSignUp(false);
              setError(null);
            }}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              !isSignUp
                ? 'bg-[#3555a6] text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Login
          </button>
          <button
            type="button"
            onClick={() => {
              setIsSignUp(true);
              setError(null);
            }}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              isSignUp
                ? 'bg-[#3555a6] text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Sign Up
          </button>
        </div>

        {/* Auth Form Card */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-2xl backdrop-blur-sm space-y-5">
          <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-white">
                {isSignUp ? 'Manager Registration' : 'Manager Login'}
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                {isSignUp
                  ? 'Sign up with hotel name, email, phone & password'
                  : 'Enter your phone number & password'}
              </p>
            </div>
            <button
              type="button"
              onClick={fillDemo}
              className="px-2.5 py-1 text-[11px] font-semibold bg-[#3555a6]/15 text-[#688ce4] hover:bg-[#3555a6]/25 rounded-md border border-[#3555a6]/30 transition-colors cursor-pointer"
            >
              v 1.0
            </button>
          </div>

          {error && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs rounded-xl flex items-start space-x-2">
              <span className="font-bold">•</span>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Hotel Name (Signup only) */}
            {isSignUp && (
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Hotel Name
                </label>
                <div className="relative">
                  <HotelIcon className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={hotelName}
                    onChange={(e) => setHotelName(e.target.value)}
                    placeholder="e.g. Bibhash"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-[#3555a6] focus:ring-1 focus:ring-[#3555a6] transition-all"
                  />
                </div>
              </div>
            )}

            {/* Email Address (Signup only) */}
            {isSignUp && (
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="rparitosh@gmail.com"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-[#3555a6] focus:ring-1 focus:ring-[#3555a6] transition-all"
                  />
                </div>
              </div>
            )}

            {/* Phone Number */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Phone Number
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. 9876543210"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-[#3555a6] focus:ring-1 focus:ring-[#3555a6] transition-all"
                />
              </div>
            </div>

            {/* Password with Show/Hide Toggle */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-10 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-[#3555a6] focus:ring-1 focus:ring-[#3555a6] transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Main Submit (OK/Action) Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-[#3555a6] hover:bg-[#2b468b] text-white font-bold text-xs rounded-xl shadow-lg shadow-[#3555a6]/25 flex items-center justify-center space-x-2 transition-all cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <span>Processing...</span>
              ) : (
                <>
                  <span>{isSignUp ? 'Create Manager Account' : 'Access Admin Dashboard'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Feature Badges */}
          <div className="pt-2 border-t border-slate-800/80 grid grid-cols-2 gap-2 text-[11px] text-slate-400">
            <div className="flex items-center space-x-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>RegisterHotel</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>Room Availability</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>View Guest Data</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>Track Reservations</span>
            </div>
          </div>
        </div>

        {/* Footer Note */}
        <div className="text-center text-xs text-slate-500 flex items-center justify-center space-x-1">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          <span>Secure Admin Session</span>
        </div>
      </div>
    </div>
  );
};