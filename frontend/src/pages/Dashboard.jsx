import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import useAuthStore from '../store/useAuthStore';
import { Plus, Users, Search, ArrowRight, X } from 'lucide-react';

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

  const user = useAuthStore(state => state.user);

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

  const getBadgeClass = (d) =>
    d === 'Owner' ? 'badge-owner' : d === 'Admin' ? 'badge-admin' : 'badge-member';

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
    <>
      <div className="dashboard-header animate-fade-in-up">
        <h1 className="dashboard-title">Your Rooms</h1>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button className="btn btn-secondary" onClick={() => setShowJoinModal(true)}>
            <Search size={16} /> Join Room
          </button>
          <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}>
            <Plus size={16} /> Create Room
          </button>
        </div>
      </div>

      {loading ? (
        <div className="rooms-grid stagger">
          {[1, 2, 3].map(i => (
            <div key={i} className="skeleton" style={{ height: '160px' }} />
          ))}
        </div>
      ) : myRooms.length === 0 ? (
        <div className="glass empty-state animate-fade-in-up">
          <div className="empty-state-icon">
            <Users size={32} color="var(--text-tertiary)" />
          </div>
          <h3>No rooms yet</h3>
          <p>Create a room or join one using a Room ID and password.</p>
        </div>
      ) : (
        <div className="rooms-grid stagger">
          {myRooms.map(room => {
            const designation = getDesignation(room);
            return (
              <div
                key={room._id}
                className="glass room-card"
                onClick={() => navigate(`/room/${room._id}`)}
              >
                <div className="room-card-header">
                  <span className="room-card-name">{room.name}</span>
                  <span className={`badge ${getBadgeClass(designation)}`}>{designation}</span>
                </div>
                <p className="room-card-desc">{room.description || 'No description'}</p>
                <div className="room-card-footer">
                  <span className="room-card-meta">
                    <Users size={13} /> {room.members?.length || 1} member{(room.members?.length || 1) !== 1 ? 's' : ''}
                  </span>
                  <button className="btn btn-secondary" style={{ padding: '0.375rem 0.75rem', fontSize: '0.75rem' }}
                    onClick={(e) => { e.stopPropagation(); navigate(`/room/${room._id}`); }}>
                    Open <ArrowRight size={13} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Room Modal */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="glass modal-card" onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h2 className="modal-title" style={{ marginBottom: 0 }}>Create Room</h2>
              <button className="btn-ghost" onClick={() => setShowCreateModal(false)}><X size={18} /></button>
            </div>
            <form onSubmit={handleCreateRoom} className="modal-form" style={{ marginTop: '1rem' }}>
              <div>
                <label className="input-label">Room Name</label>
                <input className="input-field" required value={createName} onChange={e => setCreateName(e.target.value)} placeholder="My awesome room" />
              </div>
              <div>
                <label className="input-label">Description <span style={{ color: 'var(--text-tertiary)' }}>(optional)</span></label>
                <input className="input-field" value={createDesc} onChange={e => setCreateDesc(e.target.value)} placeholder="What's this room about?" />
              </div>
              <div>
                <label className="input-label">Password</label>
                <input className="input-field" required type="password" value={createPassword} onChange={e => setCreatePassword(e.target.value)} placeholder="Set a password for the room" />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowCreateModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={createLoading}>
                  {createLoading ? <><div className="spinner" style={{ width: 14, height: 14 }} /> Creating…</> : 'Create Room'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Join Room Modal */}
      {showJoinModal && (
        <div className="modal-overlay" onClick={() => setShowJoinModal(false)}>
          <div className="glass modal-card" onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h2 className="modal-title" style={{ marginBottom: 0 }}>Join Room</h2>
              <button className="btn-ghost" onClick={() => setShowJoinModal(false)}><X size={18} /></button>
            </div>
            <form onSubmit={handleJoinRoom} className="modal-form" style={{ marginTop: '1rem' }}>
              <div>
                <label className="input-label">Room ID</label>
                <input className="input-field" required value={joinId} onChange={e => setJoinId(e.target.value)} placeholder="Paste the room ID here" />
              </div>
              <div>
                <label className="input-label">Password</label>
                <input className="input-field" required type="password" value={joinPassword} onChange={e => setJoinPassword(e.target.value)} placeholder="Enter room password" />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowJoinModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={joinLoading}>
                  {joinLoading ? <><div className="spinner" style={{ width: 14, height: 14 }} /> Joining…</> : 'Join Room'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
