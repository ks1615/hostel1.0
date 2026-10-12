import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import RoomGrid from './components/RoomGrid';
import RoomDetailModal from './components/RoomDetailModal';
import RoomFormModal from './components/RoomFormModal';
import ResidentModal from './components/ResidentModal';
import ResidentsList from './components/ResidentsList';
import PaymentsTracker from './components/PaymentsTracker';
import MaintenanceTracker from './components/MaintenanceTracker';
import NoticeBoard from './components/NoticeBoard';
import AnalyticsView from './components/AnalyticsView';
import DataStorageManager from './components/DataStorageManager';
import Toast from './components/Toast';
import LoginModal from './components/LoginModal';
import ResidentDashboard from './components/ResidentDashboard';

import { loadData, saveData, resetData, exportDataJSON } from './utils/storage';
import { fetchFullData, apiSyncData, apiResetData, getApiBaseUrl } from './utils/api';

export default function App() {
  const [data, setData] = useState(() => loadData());
  const [cloudStatus, setCloudStatus] = useState('connecting'); // 'connected' | 'connecting' | 'cached'
  const isInitialSyncRef = React.useRef(true);
  const [activeTab, setActiveTab] = useState('rooms');
  const [searchTerm, setSearchTerm] = useState('');
  const [theme, setTheme] = useState(() => localStorage.getItem('STARLIGHT_THEME') || 'dark');
  const [toast, setToast] = useState(null);

  // Authentication State: Null by default so shared links open in Public Read-Only Visitor mode
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('SAKHARE_CURRENT_USER');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [loginModalState, setLoginModalState] = useState({ isOpen: false, initialRole: 'owner' });

  const handleOpenLogin = (role = 'owner') => {
    setLoginModalState({ isOpen: true, initialRole: role });
  };

  // Modals state
  const [selectedRoomForView, setSelectedRoomForView] = useState(null);
  const [roomFormModalState, setRoomFormModalState] = useState({ isOpen: false, roomToEdit: null });
  const [residentModalState, setResidentModalState] = useState({ 
    isOpen: false, 
    preSelectedRoom: null, 
    preSelectedBed: null, 
    residentToEdit: null 
  });

  // Fetch live production dataset from cloud backend on mount
  useEffect(() => {
    let isMounted = true;
    const initCloudData = async () => {
      try {
        const liveData = await fetchFullData();
        if (liveData && liveData.rooms && isMounted) {
          setData(liveData);
          saveData(liveData);
          setCloudStatus('connected');
        } else if (isMounted) {
          setCloudStatus('cached');
        }
      } catch (err) {
        if (isMounted) setCloudStatus('cached');
      }
    };
    initCloudData();
    return () => { isMounted = false; };
  }, []);

  // Sync dataset changes to localStorage and push to live cloud backend
  useEffect(() => {
    saveData(data);
    if (isInitialSyncRef.current) {
      isInitialSyncRef.current = false;
      return;
    }
    apiSyncData(data).then(res => {
      if (res && res.success) {
        setCloudStatus('connected');
      }
    });
  }, [data]);

  // Sync authentication state to localStorage
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('SAKHARE_CURRENT_USER', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('SAKHARE_CURRENT_USER');
    }
  }, [currentUser]);

  // Apply Theme attribute
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('STARLIGHT_THEME', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const handleLogin = (userObj) => {
    setCurrentUser(userObj);
    setLoginModalState({ isOpen: false, initialRole: 'owner' });
    if (userObj.role === 'member') {
      setActiveTab('member_portal');
    } else {
      setActiveTab('rooms');
    }
    showToast(`Logged in successfully as ${userObj.name}!`);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setActiveTab('rooms');
    showToast('Logged out. Switched to Public Read-Only Visitor mode.');
  };

  // Hidden File input trigger for header
  const fileInputRef = React.useRef(null);

  const handleHeaderImportTrigger = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleHeaderFileImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target.result);
        if (parsed && (parsed.rooms || parsed.residents)) {
          handleRestoreData(parsed);
          showToast('Database imported successfully!', 'success');
        } else {
          alert('Invalid backup file structure.');
        }
      } catch (err) {
        alert('Failed to parse JSON backup.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // Data operations: Rooms (Owner only)
  const handleSaveRoom = (roomData) => {
    if (currentUser?.role !== 'owner') {
      alert('Only the owner can add or edit rooms.');
      return;
    }

    setData(prev => {
      const existsIndex = prev.rooms.findIndex(r => r.id === roomData.id);
      let updatedRooms = [...prev.rooms];

      if (existsIndex >= 0) {
        const existingBeds = prev.rooms[existsIndex].beds || [];
        const newBeds = Array.from({ length: roomData.capacity }, (_, i) => {
          const bedNo = i + 1;
          const match = existingBeds.find(b => b.bedNo === bedNo);
          return match || { bedNo, residentId: null };
        });

        updatedRooms[existsIndex] = { ...roomData, beds: newBeds };
      } else {
        const newBeds = Array.from({ length: roomData.capacity }, (_, i) => ({
          bedNo: i + 1,
          residentId: null
        }));
        updatedRooms.push({ ...roomData, beds: newBeds });
      }

      return { ...prev, rooms: updatedRooms };
    });

    setRoomFormModalState({ isOpen: false, roomToEdit: null });
    showToast(`Room ${roomData.number} saved successfully!`);
  };

  const handleDeleteRoom = (roomId) => {
    if (currentUser?.role !== 'owner') {
      alert('Only the owner can delete rooms.');
      return;
    }

    setData(prev => {
      const updatedRooms = prev.rooms.filter(r => r.id !== roomId);
      const updatedResidents = prev.residents.filter(r => r.roomId !== roomId);

      return {
        ...prev,
        rooms: updatedRooms,
        residents: updatedResidents
      };
    });

    if (selectedRoomForView && selectedRoomForView.id === roomId) {
      setSelectedRoomForView(null);
    }

    showToast(`Room deleted successfully.`);
  };

  // Residents (Owner only)
  const handleSaveResident = (residentData) => {
    if (currentUser?.role !== 'owner') {
      alert('Only the owner can register or edit residents.');
      return;
    }

    setData(prev => {
      let updatedResidents = [...prev.residents];
      const resIndex = updatedResidents.findIndex(r => r.id === residentData.id);

      if (resIndex >= 0) {
        updatedResidents[resIndex] = residentData;
      } else {
        updatedResidents.push(residentData);
      }

      const updatedRooms = prev.rooms.map(room => {
        if (room.id === residentData.roomId) {
          const updatedBeds = room.beds.map(bed => {
            if (bed.bedNo === residentData.bedNo) {
              return { ...bed, residentId: residentData.id };
            }
            return bed;
          });
          const occCount = updatedBeds.filter(b => b.residentId).length;
          const status = occCount >= room.capacity ? 'Full' : room.status === 'Maintenance' ? 'Maintenance' : 'Occupied';
          return { ...room, beds: updatedBeds, status };
        }
        return room;
      });

      return {
        ...prev,
        rooms: updatedRooms,
        residents: updatedResidents
      };
    });

    setResidentModalState({ isOpen: false, preSelectedRoom: null, preSelectedBed: null, residentToEdit: null });
    showToast(`Resident ${residentData.name} checked in!`);
  };

  const handleVacateBed = (roomId, bedNo, residentId) => {
    if (currentUser?.role !== 'owner') {
      alert('Only the owner can vacate resident beds.');
      return;
    }

    setData(prev => {
      const updatedRooms = prev.rooms.map(room => {
        if (room.id === roomId) {
          const updatedBeds = room.beds.map(bed => {
            if (bed.bedNo === bedNo) {
              return { ...bed, residentId: null };
            }
            return bed;
          });
          const occCount = updatedBeds.filter(b => b.residentId).length;
          const status = occCount === 0 ? 'Available' : 'Occupied';
          return { ...room, beds: updatedBeds, status };
        }
        return room;
      });

      const updatedResidents = prev.residents.filter(r => r.id !== residentId);

      return {
        ...prev,
        rooms: updatedRooms,
        residents: updatedResidents
      };
    });

    if (selectedRoomForView && selectedRoomForView.id === roomId) {
      setSelectedRoomForView(prev => ({
        ...prev,
        beds: prev.beds.map(b => b.bedNo === bedNo ? { ...b, residentId: null } : b)
      }));
    }

    showToast('Resident check-out completed. Bed is now vacant.');
  };

  // Payments
  const handleSavePayment = (paymentData) => {
    setData(prev => {
      const updatedPayments = [paymentData, ...prev.payments];
      const updatedResidents = prev.residents.map(r => {
        if (r.id === paymentData.residentId) {
          return { ...r, rentStatus: 'Paid' };
        }
        return r;
      });

      return {
        ...prev,
        payments: updatedPayments,
        residents: updatedResidents
      };
    });

    showToast(`Payment of ₹${paymentData.amount.toLocaleString()} recorded!`);
  };

  // Maintenance
  const handleSaveTicket = (ticketData) => {
    setData(prev => ({
      ...prev,
      maintenance: [ticketData, ...prev.maintenance]
    }));
    showToast('Maintenance request ticket created!');
  };

  const handleUpdateTicketStatus = (ticketId, newStatus) => {
    if (currentUser?.role !== 'owner') {
      alert('Only the owner can update maintenance ticket statuses.');
      return;
    }

    setData(prev => ({
      ...prev,
      maintenance: prev.maintenance.map(m => m.id === ticketId ? { ...m, status: newStatus } : m)
    }));
    showToast(`Ticket status updated to ${newStatus}`);
  };

  // Notices
  const handleSaveNotice = (noticeData) => {
    if (currentUser?.role !== 'owner') {
      alert('Only the owner can publish notices.');
      return;
    }

    setData(prev => {
      const idx = (prev.notices || []).findIndex(n => n.id === noticeData.id);
      let updatedNotices = [...(prev.notices || [])];
      if (idx >= 0) {
        updatedNotices[idx] = noticeData;
      } else {
        updatedNotices.unshift(noticeData);
      }
      return { ...prev, notices: updatedNotices };
    });
    showToast('Hostel announcement published!');
  };

  const handleDeleteNotice = (noticeId) => {
    if (currentUser?.role !== 'owner') {
      alert('Only the owner can delete notices.');
      return;
    }

    setData(prev => ({
      ...prev,
      notices: (prev.notices || []).filter(n => n.id !== noticeId)
    }));
    showToast('Notice deleted.');
  };

  const handleTogglePinNotice = (noticeId) => {
    if (currentUser?.role !== 'owner') return;

    setData(prev => ({
      ...prev,
      notices: (prev.notices || []).map(n => n.id === noticeId ? { ...n, isPinned: !n.isPinned } : n)
    }));
  };

  // Storage
  const handleRestoreData = async (newData) => {
    const fullState = {
      rooms: newData.rooms || data.rooms,
      residents: newData.residents || [],
      payments: newData.payments || [],
      maintenance: newData.maintenance || [],
      notices: newData.notices || [],
      upiConfig: newData.upiConfig || data.upiConfig,
      lastUpdated: new Date().toISOString()
    };
    setData(fullState);
    await apiSyncData(fullState);
    showToast('Database restored and synced to live cloud!');
  };

  const handleResetData = async () => {
    const res = resetData();
    if (res) {
      setData(res);
      await apiResetData();
      showToast('Database reset to clean production state.');
    }
  };

  // Computations for badge counts
  const pendingPaymentsCount = data.residents.filter(r => r.rentStatus !== 'Paid').length;
  const openMaintenanceCount = data.maintenance.filter(m => m.status !== 'Resolved').length;
  const noticeCount = (data.notices || []).length;

  const isOwner = currentUser?.role === 'owner';
  const isMember = currentUser?.role === 'member';

  return (
    <div className="app-container">
      <input 
        type="file" 
        accept=".json" 
        ref={fileInputRef} 
        style={{ display: 'none' }}
        onChange={handleHeaderFileImport}
      />

      <Sidebar 
        currentUser={currentUser}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        roomCount={data.rooms.length}
        residentCount={data.residents.length}
        pendingPaymentsCount={pendingPaymentsCount}
        openMaintenanceCount={openMaintenanceCount}
        noticeCount={noticeCount}
        onOpenLogin={handleOpenLogin}
      />

      <main className="main-content">
        <Header 
          currentUser={currentUser}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          theme={theme}
          toggleTheme={toggleTheme}
          onExport={() => {
            exportDataJSON(data);
            showToast('JSON Backup downloaded!');
          }}
          onImportTrigger={handleHeaderImportTrigger}
          onOpenAddRoom={() => setRoomFormModalState({ isOpen: true, roomToEdit: null })}
          onOpenLogin={handleOpenLogin}
          onLogout={handleLogout}
          onNavigateToPublic={() => setActiveTab('rooms')}
        />

        <div className="page-wrapper">
          {/* 3-Page System Portal Experience Selector (Dedicated Position) */}
          <div className="portal-switcher-banner">
            <div className="portal-switcher-top">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
                <span style={{ 
                  background: 'var(--color-black)', 
                  color: 'var(--accent-gold)', 
                  padding: '0.2rem 0.55rem', 
                  borderRadius: 'var(--radius-sm)', 
                  fontSize: '0.72rem', 
                  fontWeight: 800,
                  letterSpacing: '0.06em'
                }}>
                  SYSTEM PORTALS
                </span>
                <span style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                  Select which view you want to access:
                </span>
                <span style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  background: cloudStatus === 'connected' ? 'rgba(16, 126, 89, 0.12)' : 'rgba(197, 160, 89, 0.15)',
                  color: cloudStatus === 'connected' ? '#107e59' : '#8c6b2d',
                  padding: '0.15rem 0.55rem',
                  borderRadius: '12px',
                  fontSize: '0.72rem',
                  fontWeight: 700
                }} title={`Backend API: ${getApiBaseUrl()}`}>
                  <span style={{
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    background: cloudStatus === 'connected' ? '#107e59' : '#8c6b2d',
                    display: 'inline-block'
                  }}></span>
                  {cloudStatus === 'connected' ? '🟢 Live Cloud DB' : '⚡ Cloud Syncing...'}
                </span>
              </div>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Active Mode: <strong style={{ color: 'var(--color-black)' }}>{isOwner ? '👑 Page 1: Owner Admin' : isMember ? '🎓 Page 2: Resident Member' : '🌐 Page 3: Public Shared Link'}</strong>
              </span>
            </div>

            <div className="portal-cards-grid">
              {/* Page 1: Owner Admin */}
              <button 
                type="button"
                className={`portal-card-btn ${isOwner ? 'active' : ''}`}
                onClick={() => handleOpenLogin('owner')}
                title="Page 1: Full owner admin control to add, edit and delete rooms and residents"
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{ 
                    width: '38px', 
                    height: '38px', 
                    borderRadius: '10px', 
                    background: isOwner ? 'var(--accent-gold)' : 'rgba(20, 18, 16, 0.08)', 
                    color: isOwner ? '#141210' : '#141210', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    fontSize: '1.2rem',
                    flexShrink: 0
                  }}>
                    👑
                  </div>
                  <div>
                    <div className="portal-card-title">1. Owner Admin</div>
                    <div className="portal-card-desc">Full edit & delete permissions</div>
                  </div>
                </div>
                {isOwner ? (
                  <span className="portal-active-pill">ACTIVE</span>
                ) : (
                  <span className="portal-switch-pill">Login</span>
                )}
              </button>

              {/* Page 2: Member Portal */}
              <button 
                type="button"
                className={`portal-card-btn ${isMember ? 'active' : ''}`}
                onClick={() => handleOpenLogin('member')}
                title="Page 2: Resident member login to check room, roommates, dues & pay via UPI"
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{ 
                    width: '38px', 
                    height: '38px', 
                    borderRadius: '10px', 
                    background: isMember ? 'var(--accent-gold)' : 'rgba(20, 18, 16, 0.08)', 
                    color: isMember ? '#141210' : '#141210', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    fontSize: '1.2rem',
                    flexShrink: 0
                  }}>
                    🎓
                  </div>
                  <div>
                    <div className="portal-card-title">2. Member Login</div>
                    <div className="portal-card-desc">Student room, dues & UPI payment</div>
                  </div>
                </div>
                {isMember ? (
                  <span className="portal-active-pill">ACTIVE</span>
                ) : (
                  <span className="portal-switch-pill">Login</span>
                )}
              </button>

              {/* Page 3: Public Shared Link */}
              <button 
                type="button"
                className={`portal-card-btn ${!currentUser ? 'active' : ''}`}
                onClick={() => {
                  if (currentUser) handleLogout();
                  setActiveTab('rooms');
                }}
                title="Page 3: Live hostel directory showing room occupants & Paid/Unpaid rent"
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{ 
                    width: '38px', 
                    height: '38px', 
                    borderRadius: '10px', 
                    background: !currentUser ? 'var(--accent-gold)' : 'rgba(20, 18, 16, 0.08)', 
                    color: !currentUser ? '#141210' : '#141210', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    fontSize: '1.2rem',
                    flexShrink: 0
                  }}>
                    🌐
                  </div>
                  <div>
                    <div className="portal-card-title">3. Public View (Paid/Unpaid)</div>
                    <div className="portal-card-desc">Live room occupants & rent status</div>
                  </div>
                </div>
                {!currentUser ? (
                  <span className="portal-active-pill">ACTIVE</span>
                ) : (
                  <span className="portal-switch-pill">View Link</span>
                )}
              </button>
            </div>
          </div>

          {/* Hostel Member Resident Dashboard */}
          {isMember && activeTab === 'member_portal' && (
            <ResidentDashboard 
              currentUser={currentUser}
              rooms={data.rooms}
              residents={data.residents}
              payments={data.payments}
              maintenance={data.maintenance}
              notices={data.notices}
              upiConfig={data.upiConfig}
              onSavePayment={handleSavePayment}
              onSaveTicket={handleSaveTicket}
              showToast={showToast}
            />
          )}

          {/* Rooms View (Visible to Everyone: Owner, Member, Public Visitor) */}
          {activeTab === 'rooms' && (
            <RoomGrid 
              rooms={data.rooms}
              residents={data.residents}
              searchTerm={searchTerm}
              onViewRoom={(room) => setSelectedRoomForView(room)}
              onCheckInResident={(room, bedNo) => {
                setResidentModalState({
                  isOpen: true,
                  preSelectedRoom: room,
                  preSelectedBed: bedNo || null,
                  residentToEdit: null
                });
              }}
              onEditRoom={(room) => setRoomFormModalState({ isOpen: true, roomToEdit: room })}
              onDeleteRoom={handleDeleteRoom}
              isOwner={isOwner}
            />
          )}

          {/* Notices View (Visible to Everyone, but only Owner can add/edit/delete) */}
          {activeTab === 'notices' && (
            <NoticeBoard 
              notices={data.notices || []}
              onSaveNotice={handleSaveNotice}
              onDeleteNotice={handleDeleteNotice}
              onTogglePinNotice={handleTogglePinNotice}
              isOwner={isOwner}
            />
          )}

          {/* Payments & UPI Scanner View */}
          {activeTab === 'payments' && (
            <PaymentsTracker 
              payments={data.payments}
              residents={data.residents}
              upiConfig={data.upiConfig}
              onSavePayment={handleSavePayment}
              showToast={showToast}
              isOwner={isOwner}
            />
          )}

          {/* Residents Directory (Visible to everyone, edits owner-only) */}
          {activeTab === 'residents' && (
            <ResidentsList 
              residents={data.residents}
              rooms={data.rooms}
              searchTerm={searchTerm}
              onOpenCheckIn={() => setResidentModalState({ isOpen: true, preSelectedRoom: null, preSelectedBed: null, residentToEdit: null })}
              onEditResident={(res) => setResidentModalState({ isOpen: true, preSelectedRoom: null, preSelectedBed: null, residentToEdit: res })}
              onVacateResident={handleVacateBed}
              onRecordPayment={(res) => {
                setActiveTab('payments');
              }}
              isOwner={isOwner}
            />
          )}

          {/* Maintenance & Complaints (Visible to everyone, edits owner-only) */}
          {activeTab === 'maintenance' && (
            <MaintenanceTracker 
              maintenance={data.maintenance}
              rooms={data.rooms}
              onSaveTicket={handleSaveTicket}
              onUpdateTicketStatus={handleUpdateTicketStatus}
              isOwner={isOwner}
            />
          )}

          {/* Occupancy Analytics (Visible to everyone) */}
          {activeTab === 'analytics' && (
            <AnalyticsView 
              rooms={data.rooms}
              residents={data.residents}
              payments={data.payments}
            />
          )}

          {/* Data Storage & Backup (Owner Only) */}
          {isOwner && activeTab === 'storage' && (
            <DataStorageManager 
              appData={data}
              onRestoreData={handleRestoreData}
              onResetData={handleResetData}
              showToast={showToast}
            />
          )}
        </div>
      </main>

      {/* Login Modal */}
      {loginModalState.isOpen && (
        <LoginModal 
          residents={data.residents}
          onLogin={handleLogin}
          onClose={() => setLoginModalState({ isOpen: false, initialRole: 'owner' })}
          initialRole={loginModalState.initialRole}
        />
      )}

      {/* Room Detail Modal (Read-only for visitors, full actions for owner) */}
      {selectedRoomForView && (
        <RoomDetailModal 
          room={selectedRoomForView}
          residents={data.residents}
          onClose={() => setSelectedRoomForView(null)}
          onVacateBed={handleVacateBed}
          onCheckInResident={(room, bedNo) => {
            setResidentModalState({
              isOpen: true,
              preSelectedRoom: room,
              preSelectedBed: bedNo,
              residentToEdit: null
            });
          }}
          onOpenMaintenance={(room) => {
            setActiveTab('maintenance');
          }}
          onEditRoom={(room) => setRoomFormModalState({ isOpen: true, roomToEdit: room })}
          onDeleteRoom={handleDeleteRoom}
          isOwner={isOwner}
        />
      )}

      {/* Owner-Only Modals */}
      {isOwner && roomFormModalState.isOpen && (
        <RoomFormModal 
          roomToEdit={roomFormModalState.roomToEdit}
          onClose={() => setRoomFormModalState({ isOpen: false, roomToEdit: null })}
          onSave={handleSaveRoom}
          onDelete={handleDeleteRoom}
        />
      )}

      {isOwner && residentModalState.isOpen && (
        <ResidentModal 
          rooms={data.rooms}
          preSelectedRoom={residentModalState.preSelectedRoom}
          preSelectedBed={residentModalState.preSelectedBed}
          residentToEdit={residentModalState.residentToEdit}
          onClose={() => setResidentModalState({ isOpen: false, preSelectedRoom: null, preSelectedBed: null, residentToEdit: null })}
          onSave={handleSaveResident}
        />
      )}

      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}
