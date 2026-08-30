import React, { useState, useEffect } from 'react';
import {
  getHotelDetails,
  getRooms,
  getReservations,
  updateReservationStatus,
} from './services/api';
import { Hotel, Manager, Reservation, Room } from './types';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { LoginView } from './views/LoginView';
import { DashboardView } from './views/DashboardView';
import { HotelRegisterView } from './views/HotelRegisterView';
import { ReservationsView } from './views/ReservationsView';
import { RoomsView } from './views/RoomsView';

const STORAGE_KEY = 'hotel_admin_manager';

export default function App() {
  // Auth State - reads from sessionStorage so session clears when tab closes
  const [manager, setManager] = useState<Manager | null>(() => {
    const saved = sessionStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return null;
      }
    }
    return null;
  });

  // App Data State
  const [hotel, setHotel] = useState<Hotel | null>(null);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);

  // UI Navigation State
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [loadingData, setLoadingData] = useState<boolean>(true);
  const [openNewBookingModal, setOpenNewBookingModal] = useState<boolean>(false);

  // Load all backend data
  const refreshAllData = async () => {
    if (!manager) return;
    setLoadingData(true);
    try {
      const [hotelRes, roomsRes, resRes] = await Promise.all([
        getHotelDetails(manager.user_id),
        getRooms(manager.user_id),
        getReservations(manager.user_id),
      ]);

      if (hotelRes.data) setHotel(hotelRes.data);
      if (roomsRes.data) setRooms(roomsRes.data);
      if (resRes.data) setReservations(resRes.data);
    } catch (err) {
      console.error('Error fetching admin data:', err);
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    if (manager) {
      refreshAllData();
    }
  }, [manager]);

  const handleLoginSuccess = (newManager: Manager) => {
    setManager(newManager);
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(newManager));
  };

  const handleLogout = () => {
    setManager(null);
    sessionStorage.removeItem(STORAGE_KEY);
  };

  const handleQuickCheckIn = async (reservationId: string) => {
    if (!manager) return;
    await updateReservationStatus(manager.user_id, reservationId, 'Checked In');
    refreshAllData();
  };

  // 1. FIRST SCREEN: Login Page
  if (!manager) {
    return <LoginView onLoginSuccess={handleLoginSuccess} />;
  }

  const availableRoomsCount = rooms.filter((r) => r.status === 'Available').length;

  // 2. MAIN PAGE AFTER LOGIN
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans antialiased">
      {/* Top Header */}
      <Header
        hotel={hotel}
        manager={manager}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onLogout={handleLogout}
      />

      <div className="flex-1 flex flex-col lg:flex-row">
        {/* Sidebar */}
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          availableRoomsCount={availableRoomsCount}
          reservationsCount={reservations.length}
        />

        {/* Main Content Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full overflow-y-auto">
          {loadingData ? (
            <div className="flex flex-col items-center justify-center min-h-[400px] space-y-3">
              <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-xs text-slate-400 font-medium">Syncing Data Records...</p>
            </div>
          ) : (
            <>
              {activeTab === 'overview' && (
                <DashboardView
                  hotel={hotel}
                  manager={manager}
                  rooms={rooms}
                  reservations={reservations}
                  setActiveTab={setActiveTab}
                  onQuickCheckIn={handleQuickCheckIn}
                  onOpenNewBookingModal={() => {
                    setActiveTab('reservations');
                    setOpenNewBookingModal(true);
                  }}
                />
              )}

              {activeTab === 'register' && (
                <HotelRegisterView
                  currentHotel={hotel}
                  manager={manager}
                  onHotelRegistered={(newHotel) => {
                    setHotel(newHotel);
                    refreshAllData();
                  }}
                  onCancel={() => setActiveTab('overview')}
                />
              )}

              {activeTab === 'reservations' && (
                <ReservationsView
                  hotel={hotel}
                  manager={manager}
                  reservations={reservations}
                  rooms={rooms}
                  onRefresh={refreshAllData}
                  showNewModalOpen={openNewBookingModal}
                  onCloseNewModal={() => setOpenNewBookingModal(false)}
                />
              )}

              {activeTab === 'rooms' && (
                <RoomsView rooms={rooms} manager={manager} onRefresh={refreshAllData} />
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}