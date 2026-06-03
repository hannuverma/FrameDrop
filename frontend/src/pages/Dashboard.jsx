import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import useAuthStore from '../store/useAuthStore';
import { Plus, Users, Search } from 'lucide-react';

export default function Dashboard() {
  const [myRooms, setMyRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const navigate = useNavigate();

  // Create Form State
  const [createName, setCreateName] = useState('');
  const [createDesc, setCreateDesc] = useState('');
  const [createPassword, setCreatePassword] = useState('');
  const [createLoading, setCreateLoading] = useState(false);

  // Join Form State
  const [joinId, setJoinId] = useState('');
  const [joinPassword, setJoinPassword] = useState('');
  const [joinLoading, setJoinLoading] = useState(false);

  const user = useAuthStore(state => state.user);

  const fetchRooms = async () => {
    try {
      const res = await axios.get('/room/get-users-rooms');
      setMyRooms(res.data.rooms || []);
      setLoading(false);
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  const getDesignation = (room) => {
    if (!user) return 'Member';
    if (room.owner === user.id) return 'Owner';
    if (room.admins?.includes(user.id)) return 'Admin';
    return 'Member';
  };

  useEffect(() => {
    fetchRooms();
  }, []);

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
      navigate(`/room/${res.data.room._id}`);
    } catch (error) {
      alert(error.response?.data?.message || 'Error joining room');
    } finally {
      setJoinLoading(false);
    }
  };

  return (
    <div className="container">
      <div className="d-flex justify-between items-center mb-6">
        <h2>Your Rooms</h2>
        <div className="d-flex gap-4">
          <button onClick={() => setShowJoinModal(true)} className="d-flex items-center gap-2" style={{ background: 'var(--bg-color-light)', border: '1px solid var(--glass-border)' }}>
            <Search size={18} /> Join Room
          </button>
          <button onClick={() => setShowCreateModal(true)} className="d-flex items-center gap-2">
            <Plus size={18} /> Create Room
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-10">Loading your rooms...</div>
      ) : myRooms.length === 0 ? (
        <div className="glass-panel text-center py-10" style={{ padding: '4rem 2rem' }}>
          <Users size={48} color="var(--text-muted)" style={{ margin: '0 auto', marginBottom: '1rem' }} />
          <h3>No rooms to display</h3>
          <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>Create or join a room to start sharing images.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
          {myRooms.map(room => {
            const designation = getDesignation(room);
            return (
              <div key={room._id} className="glass-panel animate-fade-in" style={{ padding: '1.5rem' }}>
                <div className="d-flex justify-between items-center mb-2">
                  <h3 style={{ margin: 0 }}>{room.name}</h3>
                  <span style={{ fontSize: '0.65rem', padding: '0.2rem 0.5rem', background: designation === 'Owner' ? 'rgba(239, 68, 68, 0.2)' : designation === 'Admin' ? 'rgba(245, 158, 11, 0.2)' : 'rgba(148, 163, 184, 0.2)', color: designation === 'Owner' ? '#fca5a5' : designation === 'Admin' ? '#fcd34d' : '#cbd5e1', borderRadius: '1rem', fontWeight: 'bold' }}>
                    {designation}
                  </span>
                </div>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '1rem' }}>
                  {room.description || 'No description provided'}
                </p>
                <div className="d-flex justify-between items-center mt-4">
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {room.members?.length || 1} Member(s)
                  </span>
                  <button 
                    onClick={() => navigate(`/room/${room._id}`)} 
                    style={{ padding: '0.4rem 0.8rem', fontSize: '0.875rem' }}
                  >
                    Enter Room
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Room Modal */}
      {showCreateModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="glass-panel animate-fade-in" style={{ width: '100%', maxWidth: '500px' }}>
            <h3 className="mb-4">Create New Room</h3>
            <form onSubmit={handleCreateRoom} className="d-flex flex-col gap-4">
              <div>
                <label className="mb-2" style={{ display: 'block' }}>Room Name</label>
                <input required value={createName} onChange={e => setCreateName(e.target.value)} />
              </div>
              <div>
                <label className="mb-2" style={{ display: 'block' }}>Description</label>
                <input value={createDesc} onChange={e => setCreateDesc(e.target.value)} />
              </div>
              <div>
                <label className="mb-2" style={{ display: 'block' }}>Room Password</label>
                <input required type="password" value={createPassword} onChange={e => setCreatePassword(e.target.value)} />
              </div>
              <div className="d-flex justify-between mt-4">
                <button type="button" className="danger" onClick={() => setShowCreateModal(false)}>Cancel</button>
                <button type="submit" disabled={createLoading}>{createLoading ? 'Creating...' : 'Create Room'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Join Room Modal */}
      {showJoinModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="glass-panel animate-fade-in" style={{ width: '100%', maxWidth: '500px' }}>
            <h3 className="mb-4">Join Room</h3>
            <form onSubmit={handleJoinRoom} className="d-flex flex-col gap-4">
              <div>
                <label className="mb-2" style={{ display: 'block' }}>Room ID</label>
                <input required value={joinId} onChange={e => setJoinId(e.target.value)} />
              </div>
              <div>
                <label className="mb-2" style={{ display: 'block' }}>Room Password</label>
                <input required type="password" value={joinPassword} onChange={e => setJoinPassword(e.target.value)} />
              </div>
              <div className="d-flex justify-between mt-4">
                <button type="button" className="danger" onClick={() => setShowJoinModal(false)}>Cancel</button>
                <button type="submit" disabled={joinLoading}>{joinLoading ? 'Joining...' : 'Join Room'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
