import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import useAuthStore from '../store/useAuthStore';
import { Home, Hash, Plus } from 'lucide-react';

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
  }, [location.pathname]);

  const getDesignation = (room) => {
    if (!user) return 'Member';
    if (room.owner === user.id) return 'Owner';
    if (room.admins?.includes(user.id)) return 'Admin';
    return 'Member';
  };

  const getBadgeClass = (d) =>
    d === 'Owner' ? 'badge-owner' : d === 'Admin' ? 'badge-admin' : 'badge-member';

  return (
    <aside className="sidebar">
      <button
        className={`sidebar-btn ${location.pathname === '/' ? 'active' : ''}`}
        onClick={() => navigate('/')}
      >
        <Home size={16} /> Dashboard
      </button>

      <div className="sidebar-label">Your Rooms</div>

      {rooms.length === 0 && (
        <div style={{ padding: '0.5rem 0.75rem', fontSize: '0.8125rem', color: 'var(--text-tertiary)' }}>
          No rooms yet
        </div>
      )}

      {rooms.map(room => {
        const designation = getDesignation(room);
        const isActive = location.pathname === `/room/${room._id}`;

        return (
          <div
            key={room._id}
            className={`sidebar-item ${isActive ? 'active' : ''}`}
            onClick={() => navigate(`/room/${room._id}`)}
          >
            <div className="room-name">
              <Hash size={14} /> {room.name}
            </div>
            <span className={`badge ${getBadgeClass(designation)}`} style={{ marginLeft: '1.35rem' }}>
              {designation}
            </span>
          </div>
        );
      })}
    </aside>
  );
}
