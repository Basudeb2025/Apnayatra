import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  MapPin, 
  Bed, 
  Tag, 
  ArrowRight, 
  AlertCircle, 
  Edit3, 
  Hotel as HotelIcon,
  Loader2,
  Lock,
  FileText
} from 'lucide-react';
import { registerHotel, getHotelDetails } from '../services/api';
import { Hotel, Manager } from '../types';

interface HotelRegisterViewProps {
  currentHotel: Hotel | null;
  manager: Manager | null;
  onHotelRegistered: (hotel: Hotel) => void;
  onCancel?: () => void;
}

export const HotelRegisterView: React.FC<HotelRegisterViewProps> = ({
  currentHotel,
  manager,
  onHotelRegistered,
  onCancel,
}) => {
  // Validate whether the hotel is registered
  const isHotelRegistered = Boolean(
    currentHotel && 
    currentHotel.hotel_id && 
    String(currentHotel.hotel_id).trim() !== '' &&
    currentHotel.town && 
    String(currentHotel.town).trim() !== ''
  );

  const [fetchingHotel, setFetchingHotel] = useState<boolean>(!isHotelRegistered && !manager?.user_id);
  const [isEditing, setIsEditing] = useState<boolean>(false);

  // Form states
  const hotelDisplayName = manager?.hotel_name || currentHotel?.hotel_name || 'Assigned Hotel';

  const [town, setTown] = useState('coochbehar');
  const [address, setAddress] = useState('Office Para, Cooch Behar, West Bengal, India');
  const [availableRooms, setAvailableRooms] = useState<number | string>(3);
  const [price, setPrice] = useState<number | string>(1200);
  const [description, setDescription] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch on mount if not already populated with valid data
  useEffect(() => {
    let isMounted = true;

    const checkHotelStatus = async () => {
      if (isHotelRegistered || !manager?.user_id) {
        setFetchingHotel(false);
        return;
      }

      try {
        setFetchingHotel(true);
        const res = await getHotelDetails(manager.user_id);
        
        if (isMounted) {
          if (res?.success && res?.data && res.data.hotel_id && res.data.town) {
            onHotelRegistered(res.data);
          }
        }
      } catch (err: any) {
        console.error('Error fetching hotel details:', err);
      } finally {
        if (isMounted) {
          setFetchingHotel(false);
        }
      }
    };

    checkHotelStatus();

    return () => {
      isMounted = false;
    };
  }, [manager?.user_id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const parsedRooms = typeof availableRooms === 'number' ? availableRooms : parseInt(availableRooms, 10);
      const parsedPrice = typeof price === 'number' ? price : parseInt(price, 10);

      if (isNaN(parsedRooms) || parsedRooms < 1) {
        setError('available_rooms must be an integer of at least 1.');
        setLoading(false);
        return;
      }

      if (isNaN(parsedPrice) || parsedPrice <= 0) {
        setError('price must be a valid positive integer.');
        setLoading(false);
        return;
      }

      if (!manager?.user_id) {
        setError('You must be logged in to register a hotel.');
        setLoading(false);
        return;
      }

      const resolvedHotelName = (manager.hotel_name || currentHotel?.hotel_name || '').trim();

      const res = await registerHotel(manager.user_id, {
        hotel_name: resolvedHotelName,
        town: town.trim(),
        address: address.trim(),
        available_rooms: parsedRooms,
        price: parsedPrice,
        // Retain existing description on edit, or use new input on registration
        description: isEditing ? (currentHotel?.description || '') : description.trim()
      });

      if (res.success && res.data) {
        onHotelRegistered(res.data);
        setIsEditing(false);
      } else {
        setError(res.error || 'Failed to register hotel.');
      }
    } catch (err: any) {
      setError(err.message || 'Error communicating with backend.');
    } finally {
      setLoading(false);
    }
  };

  // 1. Loading State
  if (fetchingHotel) {
    return (
      <div className="max-w-4xl mx-auto p-12 flex flex-col items-center justify-center space-y-3 bg-slate-900 border border-slate-800 rounded-2xl">
        <Loader2 className="w-8 h-8 text-[#688ce4] animate-spin" />
        <p className="text-xs text-slate-400">Checking hotel registration status...</p>
      </div>
    );
  }

  // 2. VIEW: Hotel is Registered
  if (isHotelRegistered && currentHotel && !isEditing) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
          <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
          <div className="flex items-center justify-between relative z-10">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-emerald-600 flex items-center justify-center text-slate-950 font-bold shadow-lg shadow-emerald-500/20">
                <HotelIcon className="w-7 h-7" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h2 className="text-xl font-extrabold text-white">{currentHotel.hotel_name || manager?.hotel_name}</h2>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    Active Hotel
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  Manager: <strong className="text-slate-300">{manager?.name || manager?.email || 'Authenticated'}</strong>
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                setTown(currentHotel.town || '');
                setAddress(currentHotel.address || '');
                setAvailableRooms(currentHotel.available_rooms ?? 3);
                setPrice(currentHotel.price ?? 1200);
                setIsEditing(true);
              }}
              className="flex items-center space-x-1.5 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-[#688ce4] hover:text-[#3555a6] rounded-xl text-xs font-semibold border border-slate-700 transition-all cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Update Details</span>
            </button>
          </div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl space-y-6">
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">
            Hotel Information
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono">
            <div className="bg-slate-950 border border-slate-800/80 rounded-xl p-4">
              <span className="text-[11px] text-slate-500 block">Hotel ID</span>
              <span className="text-xl font-black text-[#688ce4]">{currentHotel.hotel_id}</span>
            </div>

            <div className="bg-slate-950 border border-slate-800/80 rounded-xl p-4">
              <span className="text-[11px] text-slate-500 block">Hotel Name</span>
              <span className="text-base font-semibold text-slate-200">{currentHotel.hotel_name || manager?.hotel_name}</span>
            </div>

            <div className="bg-slate-950 border border-slate-800/80 rounded-xl p-4">
              <span className="text-[11px] text-slate-500 block">City / Town</span>
              <span className="text-base font-semibold text-slate-200">{currentHotel.town}</span>
            </div>

            <div className="bg-slate-950 border border-slate-800/80 rounded-xl p-4">
              <span className="text-[11px] text-slate-500 block">Total Available Rooms</span>
              <span className="text-base font-bold text-emerald-400">{currentHotel.available_rooms} Rooms</span>
            </div>

            <div className="md:col-span-2 bg-slate-950 border border-slate-800/80 rounded-xl p-4">
              <span className="text-[11px] text-slate-500 block">Full Address</span>
              <span className="text-xs text-slate-300">{currentHotel.address}</span>
            </div>

            <div className="md:col-span-2 bg-slate-950 border border-slate-800/80 rounded-xl p-4 flex items-center justify-between">
              <div>
                <span className="text-[11px] text-slate-500 block">Price Per Day / Night</span>
                <span className="text-base font-bold text-[#688ce4]">₹{currentHotel.price}</span>
              </div>
              <Tag className="w-6 h-6 text-slate-700" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 3. VIEW: Registration / Edit Form
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-[#3555a6]/15 rounded-full blur-2xl pointer-events-none" />
        <div className="flex items-start justify-between relative z-10">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-2xl bg-[#3555a6] flex items-center justify-center text-white font-bold shadow-lg shadow-[#3555a6]/25">
              <Building2 className="w-7 h-7" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-white">
                {isEditing ? 'Update Hotel Details' : 'Hotel Registration'}
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                {isEditing 
                  ? 'Update your hotel properties.' 
                  : 'Register your hotel details. Please enter everything carefully.'}
              </p>
            </div>
          </div>
          {isEditing && (
            <button
              onClick={() => setIsEditing(false)}
              className="text-xs text-slate-400 hover:text-white underline cursor-pointer"
            >
              Cancel Edit
            </button>
          )}
        </div>
      </div>

      {/* "No hotel registered" Banner */}
      {!isHotelRegistered && !isEditing && (
        <div className="bg-[#3555a6]/10 border border-[#3555a6]/30 rounded-xl p-4 flex items-center space-x-3 text-[#9ab4f5]">
          <AlertCircle className="w-5 h-5 text-[#688ce4] shrink-0" />
          <div className="text-xs">
            <span className="font-bold text-[#688ce4] block">No hotel registered</span>
            You haven't registered any hotel yet. Please fill out the form below to register your hotel.
          </div>
        </div>
      )}

      {/* Registration / Edit Form */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl space-y-6">
        {error && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs rounded-xl">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* 1. Read-only Display for Hotel Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center justify-between">
                <span>Hotel Name</span>
                <span className="text-[10px] text-slate-500 flex items-center gap-1">
                  <Lock className="w-3 h-3" /> Fixed
                </span>
              </label>
              <div className="relative">
                <Building2 className="w-4 h-4 text-[#688ce4] absolute left-3 top-3" />
                <div className="w-full bg-slate-950/70 border border-slate-800/80 rounded-xl pl-9 pr-3 py-2.5 text-xs text-[#688ce4] font-semibold cursor-not-allowed">
                  {hotelDisplayName}
                </div>
              </div>
            </div>

            {/* 2. City / Town */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">City / Town</label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  value={town}
                  onChange={(e) => setTown(e.target.value)}
                  placeholder="coochbehar"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-[#3555a6] focus:ring-1 focus:ring-[#3555a6]"
                />
              </div>
            </div>

            {/* 3. Full Address */}
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Full Address</label>
              <input
                type="text"
                required
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Office Para, Cooch Behar, West Bengal, India"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-[#3555a6] focus:ring-1 focus:ring-[#3555a6]"
              />
            </div>

            {/* 4. Total Rooms */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center space-x-1">
                <Bed className="w-3.5 h-3.5 text-emerald-400" />
                <span>Total Rooms</span>
              </label>
              <input
                type="number"
                required
                min="1"
                step="1"
                value={availableRooms}
                onChange={(e) => setAvailableRooms(e.target.value)}
                placeholder="3"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-[#3555a6] font-mono"
              />
            </div>

            {/* 5. Price */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center space-x-1">
                <Tag className="w-3.5 h-3.5 text-[#688ce4]" />
                <span>Price ₹ / Night</span>
              </label>
              <input
                type="number"
                required
                min="1"
                step="1"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="1200"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-[#3555a6] font-mono"
              />
            </div>

            {/* 6. Description - ONLY during First Registration */}
            {!isEditing && (
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center justify-between">
                  <span className="flex items-center space-x-1">
                    <FileText className="w-3.5 h-3.5 text-slate-400" />
                    <span>Mention something about your Hotel (Description)</span>
                  </span>
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe amenities, ambience, nearby landmarks, or staff services..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-[#3555a6] focus:ring-1 focus:ring-[#3555a6] resize-none transition-all leading-relaxed"
                />
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-slate-800 flex items-center justify-end space-x-3">
            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                Cancel
              </button>
            )}
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 bg-[#3555a6] hover:bg-[#2b468b] text-white font-bold text-xs rounded-xl shadow-lg shadow-[#3555a6]/25 flex items-center space-x-2 transition-all cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <span>{isEditing ? 'Updating Hotel...' : 'Registering Hotel...'}</span>
              ) : (
                <>
                  <span>{isEditing ? 'Update Hotel Details' : 'Register Hotel'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};