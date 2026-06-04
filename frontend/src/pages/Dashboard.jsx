import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import useAuthStore from '../store/useAuthStore';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';

const MagneticButton = ({ children, onClick }) => {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  
  const springX = useSpring(x, { stiffness: 150, damping: 15, mass: 0.1 });
  const springY = useSpring(y, { stiffness: 150, damping: 15, mass: 0.1 });

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    x.set((e.clientX - centerX) * 0.15);
    y.set((e.clientY - centerY) * 0.15);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.button
      className="magnetic-action"
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ x: springX, y: springY }}
      whileTap={{ scale: 0.98 }}
    >
      {children}
    </motion.button>
  );
};

const RoomCard = ({ room, index, designation, onClick }) => {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 300, damping: 30 });
  const springY = useSpring(y, { stiffness: 300, damping: 30 });
  
  const rotateX = useTransform(springY, [-0.5, 0.5], ["7deg", "-7deg"]);
  const rotateY = useTransform(springX, [-0.5, 0.5], ["-7deg", "7deg"]);

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;
    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  const roleClass = designation === 'Owner' ? 'role-owner' : designation === 'Admin' ? 'role-admin' : '';
  // Random placeholder image if none exists
  const bgImage = `https://images.unsplash.com/photo-${1514525253161 + index}?auto=format&fit=crop&q=80&w=800`;

  return (
    <motion.a 
      onClick={onClick}
      className="room-card"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.5, type: 'spring' }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ rotateX, rotateY, cursor: 'pointer' }}
      whileHover={{ zIndex: 10, boxShadow: "0 24px 48px rgba(0,0,0,0.5)" }}
    >
      <img src={bgImage} alt={room.name} className="room-cover" />
      <div className="room-overlay">
        <span className={`role-badge ${roleClass}`}>{designation}</span>
        <h3 className="room-name">{room.name}</h3>
      </div>
    </motion.a>
  );
};

export default function Dashboard() {
  const [myRooms, setMyRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const navigate = useNavigate();

  const [createName, setCreateName] = useState('');
  const [createDesc, setCreateDesc] = useState('');
  const [createPassword, setCreatePassword] = useState('');
  const [createLoading, setCreateLoading] = useState(false);

  const [joinId, setJoinId] = useState('');
  const [joinPassword, setJoinPassword] = useState('');
  const [joinLoading, setJoinLoading] = useState(false);

  const { user, logout } = useAuthStore();

  const fetchRooms = async () => {
    try {
      const res = await axios.get('/room/get-users-rooms');
      setMyRooms(res.data.rooms || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const getDesignation = (room) => {
    if (!user) return 'Member';
    if (room.owner === user.id) return 'Owner';
    if (room.admins?.includes(user.id)) return 'Admin';
    return 'Member';
  };

  useEffect(() => { fetchRooms(); }, []);

  const handleCreateRoom = async (e) => {
    e.preventDefault();
    setCreateLoading(true);
    try {
      const res = await axios.post('/room/create', {
        name: createName,
        description: createDesc,
        password: createPassword
      });
      setShowCreateModal(false);
      setCreateName(''); setCreateDesc(''); setCreatePassword('');
      navigate(`/room/${res.data.room._id}`);
    } catch (error) {
      alert(error.response?.data?.message || 'Error creating room');
    } finally {
      setCreateLoading(false);
    }
  };

  const handleJoinRoom = async (e) => {
    e.preventDefault();
    setJoinLoading(true);
    try {
      const res = await axios.post('/room/join', {
        id: joinId,
        password: joinPassword
      });
      setShowJoinModal(false);
      setJoinId(''); setJoinPassword('');
      navigate(`/room/${res.data.room._id}`);
    } catch (error) {
      alert(error.response?.data?.message || 'Error joining room');
    } finally {
      setJoinLoading(false);
    }
  };

  return (
    <div>
      <header className="top-nav">
        <div className="container">
          <div className="user-profile">
            <div className="avatar">{user?.username?.[0]?.toUpperCase() || 'U'}</div>
            <span className="welcome-text">Hey, {user?.username}</span>
          </div>
          <button className="btn-logout" onClick={logout}>Log Out</button>
        </div>
      </header>

      <main className="container dashboard-content">
        <div className="action-cards">
          <MagneticButton onClick={() => setShowCreateModal(true)}>
            <div className="action-icon">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4"></path></svg>
            </div>
            <div className="action-text">
              <h3>Create a New Room</h3>
              <p>Start a new private photo dump</p>
            </div>
          </MagneticButton>

          <MagneticButton onClick={() => setShowJoinModal(true)}>
            <div className="action-icon">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"></path></svg>
            </div>
            <div className="action-text">
              <h3>Join a Room</h3>
              <p>Enter with a room ID and password</p>
            </div>
          </MagneticButton>
        </div>

        <h2 className="section-title">Your Rooms</h2>
        
        {loading ? (
          <div className="room-grid">
            <div className="skeleton" style={{ height: 200 }}></div>
            <div className="skeleton" style={{ height: 200 }}></div>
          </div>
        ) : myRooms.length === 0 ? (
          <div className="empty-state">
            <h3>No rooms yet</h3>
            <p>Create a room or join one to get started.</p>
          </div>
        ) : (
          <div className="room-grid">
            {myRooms.map((room, i) => (
              <RoomCard 
                key={room._id} 
                room={room} 
                index={i} 
                designation={getDesignation(room)}
                onClick={() => navigate(`/room/${room._id}`)} 
              />
            ))}
          </div>
        )}
      </main>

      {/* Create Room Modal */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <motion.div 
            className="modal-card" 
            onClick={e => e.stopPropagation()}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
          >
            <h2 className="modal-title">Create Room</h2>
            <form onSubmit={handleCreateRoom}>
              <div className="field-group">
                <input className="input-field" required value={createName} onChange={e => setCreateName(e.target.value)} placeholder="Room Name" />
                <input className="input-field" value={createDesc} onChange={e => setCreateDesc(e.target.value)} placeholder="Description (optional)" />
                <input className="input-field" required type="password" value={createPassword} onChange={e => setCreatePassword(e.target.value)} placeholder="Password" />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowCreateModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary" disabled={createLoading} style={{ width: 'auto' }}>
                  {createLoading ? 'Creating...' : 'Create Room'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Join Room Modal */}
      {showJoinModal && (
        <div className="modal-overlay" onClick={() => setShowJoinModal(false)}>
          <motion.div 
            className="modal-card" 
            onClick={e => e.stopPropagation()}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
          >
            <h2 className="modal-title">Join Room</h2>
            <form onSubmit={handleJoinRoom}>
              <div className="field-group">
                <input className="input-field" required value={joinId} onChange={e => setJoinId(e.target.value)} placeholder="Room ID" />
                <input className="input-field" required type="password" value={joinPassword} onChange={e => setJoinPassword(e.target.value)} placeholder="Password" />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowJoinModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary" disabled={joinLoading} style={{ width: 'auto' }}>
                  {joinLoading ? 'Joining...' : 'Join Room'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
