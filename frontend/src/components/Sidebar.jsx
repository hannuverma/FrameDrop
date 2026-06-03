import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import useAuthStore from '../store/useAuthStore';
import { Home, Hash } from 'lucide-react';

export default function Sidebar() {
  const [rooms, setRooms] = useState([]);
  const user = useAuthStore(state => state.user);
  const navigate = useNavigate();
  const location = useLocation();

  const fetchRooms = async () => {
    try {
      const res = await axios.get('/room/get-users-rooms');
      setRooms(res.data.rooms || []);
    } catch (error) {
      console.error('Error fetching rooms for sidebar:', error);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, [location.pathname]); // Re-fetch when route changes in case we joined/created a room

  const getDesignation = (room) => {
    if (!user) return 'Member';
    if (room.owner === user.id) return 'Owner';
    if (room.admins?.includes(user.id)) return 'Admin';
    return 'Member';
  };

  return (
    <div className="glass-panel" style={{ width: '250px', height: 'calc(100vh - 80px)', position: 'sticky', top: '80px', overflowY: 'auto', borderRadius: '0', borderLeft: 'none', borderTop: 'none', borderBottom: 'none' }}>
      <div className="d-flex flex-col gap-2">
        <button 
          onClick={() => navigate('/')} 
          style={{ background: location.pathname === '/' ? 'rgba(59, 130, 246, 0.2)' : 'transparent', color: location.pathname === '/' ? 'var(--primary)' : 'var(--text-color)', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
        >
          <Home size={18} /> Dashboard
        </button>
        
        <div style={{ marginTop: '1rem', marginBottom: '0.5rem', fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.05em', paddingLeft: '1rem' }}>
          Your Rooms
        </div>

        {rooms.map(room => {
          const designation = getDesignation(room);
          const isActive = location.pathname === `/room/${room._id}`;
          
          return (
            <div 
              key={room._id} 
              onClick={() => navigate(`/room/${room._id}`)}
              style={{ 
                padding: '0.75rem 1rem', 
                cursor: 'pointer', 
                borderRadius: '0.5rem',
                background: isActive ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
                borderLeft: isActive ? '3px solid var(--primary)' : '3px solid transparent',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.25rem',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.background = 'rgba(255,255,255,0.05)' }}
              onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.background = 'transparent' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: isActive ? '600' : '400', color: isActive ? 'var(--primary)' : 'var(--text-color)' }}>
                <Hash size={14} /> {room.name}
              </div>
              <span style={{ fontSize: '0.65rem', padding: '0.1rem 0.4rem', background: designation === 'Owner' ? 'rgba(239, 68, 68, 0.2)' : designation === 'Admin' ? 'rgba(245, 158, 11, 0.2)' : 'rgba(148, 163, 184, 0.2)', color: designation === 'Owner' ? '#fca5a5' : designation === 'Admin' ? '#fcd34d' : '#cbd5e1', borderRadius: '1rem', width: 'fit-content', marginLeft: '1.2rem' }}>
                {designation}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
