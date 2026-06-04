import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import useAuthStore from '../store/useAuthStore';
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from 'framer-motion';

// Icons
const LockIcon = ({ isUnlocked }) => (
  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
    <motion.path 
      d="M7 11V7a5 5 0 0 1 10 0v4" 
      animate={isUnlocked ? { d: "M7 11V7a5 5 0 0 1 9.5 -2.5" } : { d: "M7 11V7a5 5 0 0 1 10 0v4" }}
      transition={{ duration: 0.4, type: "spring" }}
    />
  </svg>
);

const PhotoCard = ({ photo, index, onDelete, canDelete }) => {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 400, damping: 30 });
  const springY = useSpring(y, { stiffness: 400, damping: 30 });
  const rotateX = useTransform(springY, [-0.5, 0.5], ["5deg", "-5deg"]);
  const rotateY = useTransform(springX, [-0.5, 0.5], ["-5deg", "5deg"]);

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    x.set((e.clientX - rect.left) / rect.width - 0.5);
    y.set((e.clientY - rect.top) / rect.height - 0.5);
  };
  const handleMouseLeave = () => { x.set(0); y.set(0); };

  return (
    <motion.div 
      layout
      initial={{ y: 50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ scale: 0, opacity: 0, rotate: 45, filter: "brightness(2) blur(10px)" }}
      transition={{ type: "spring", stiffness: 100, damping: 20, delay: index * 0.05 }}
      className="photo-card-wrapper"
    >
      <motion.div 
        className="photo-card"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{ rotateX, rotateY }}
        whileHover={{ zIndex: 10, scale: 1.02, boxShadow: "0 24px 48px rgba(0,0,0,0.5)" }}
      >
        <img src={photo.url} alt="Upload" className="photo-img" />
        <div className="photo-overlay">
          <div className="photo-meta">
            <div>
              <div className="photo-uploader">@{photo.uploadedBy?.username || 'Unknown'}</div>
              <div className="photo-date">{new Date(photo.createdAt).toLocaleDateString()}</div>
            </div>
            {canDelete && (
              <button className="btn-delete" onClick={() => onDelete(photo._id)} title="Delete">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default function Room() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const [roomDetails, setRoomDetails] = useState(null);
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Unlock Modal State
  const [isLocked, setIsLocked] = useState(true);
  const [isUnlocking, setIsUnlocking] = useState(false);
  const [password, setPassword] = useState('');
  const [unlockError, setUnlockError] = useState('');

  const [uploading, setUploading] = useState(false);
  const [deletingRoom, setDeletingRoom] = useState(false);
  const [toast, setToast] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef(null);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2000);
  };

  const fetchImages = useCallback(async () => {
    if (isLocked) return;
    try {
      const res = await axios.get(`/image/${id}`);
      setImages(res.data.images || []);
    } catch (error) {
      console.error(error);
    }
  }, [id, isLocked]);

  const fetchRoomData = useCallback(async () => {
    if (isLocked) return;
    setLoading(true);
    try {
      const [roomRes, imagesRes] = await Promise.all([
        axios.get(`/room/get-room-details/${id}`),
        axios.get(`/image/${id}`)
      ]);
      setRoomDetails(roomRes.data.room);
      setImages(imagesRes.data.images || []);
    } catch (error) {
      console.error(error);
      if (error.response?.status === 401 || error.response?.status === 403) {
        setIsLocked(true); // Should not happen if unlocked properly
      }
    } finally {
      setLoading(false);
    }
  }, [id, isLocked]);

  // Initial check: if user is not in room or needs password, we show lock
  // We'll try to fetch room details. If it succeeds, they are already authenticated for it.
  // Wait, backend might not return 401 if they haven't "joined" properly, 
  // actually the backend requires join to add them to members.
  // For simplicity, let's just assume we need to show the unlock modal 
  // only if fetching fails with 401/403, OR we just let them try to fetch first.
  
  useEffect(() => {
    const checkAccess = async () => {
      try {
        const res = await axios.get(`/room/get-room-details/${id}`);
        setRoomDetails(res.data.room);
        setIsLocked(false);
      } catch (err) {
        // Assume they need to unlock
        setIsLocked(true);
      }
    };
    checkAccess();
  }, [id]);

  useEffect(() => {
    if (!isLocked) {
      fetchRoomData();
      const interval = setInterval(fetchImages, 10000);
      return () => clearInterval(interval);
    }
  }, [id, isLocked, fetchRoomData, fetchImages]);

  const handleUnlock = async (e) => {
    e.preventDefault();
    setUnlockError('');
    try {
      await axios.post('/room/join', { id, password });
      setIsUnlocking(true);
      setTimeout(() => setIsLocked(false), 800);
    } catch (err) {
      setUnlockError(err.response?.data?.message || 'Invalid password');
    }
  };

  const uploadFile = async (file) => {
    if (!file) return;
    const formData = new FormData();
    formData.append('image', file);
    formData.append('roomId', id);

    setUploading(true);
    try {
      await axios.post('/image/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      showToast('Image uploaded!');
      fetchImages();
    } catch (error) {
      alert(error.response?.data?.message || 'Error uploading image');
    } finally {
      setUploading(false);
    }
  };

  const handleUploadClick = () => fileInputRef.current?.click();
  const handleFileChange = (e) => uploadFile(e.target.files?.[0]);

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    if (isLocked) return;
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) uploadFile(file);
  };

  const handleDelete = async (imageId) => {
    try {
      await axios.delete(`/image/${imageId}`);
      showToast('Image deleted');
      fetchImages();
    } catch (error) {
      alert(error.response?.data?.message || 'Error deleting image');
    }
  };

  const copyRoomId = () => {
    navigator.clipboard.writeText(id);
    showToast('Room ID copied!');
  };

  const handleDeleteRoom = async () => {
    if (!window.confirm('Delete this room forever?')) return;
    setDeletingRoom(true);
    try {
      await axios.post('/room/delete-room', { roomId: id });
      navigate('/');
    } catch (error) {
      alert(error.response?.data?.message || 'Error deleting room');
      setDeletingRoom(false);
    }
  };

  const handlePromote = async (userId, currentRole) => {
    try {
      if (currentRole === 'Member') {
        await axios.post('/room/make-admin', { roomId: id, userId });
      } else if (currentRole === 'Admin') {
        await axios.post('/room/make-member', { roomId: id, userId });
      }
      fetchRoomData();
    } catch (error) {
      alert(error.response?.data?.message || 'Error');
    }
  };

  const handleRemoveMember = async (userId) => {
    if (!window.confirm('Remove this member?')) return;
    try {
      await axios.post('/room/remove-member', { roomId: id, userId });
      fetchRoomData();
    } catch (error) {
      alert(error.response?.data?.message || 'Error');
    }
  };

  const getDesignation = (uId) => {
    if (!roomDetails) return 'Member';
    if (roomDetails.owner === uId) return 'Owner';
    if (roomDetails.admins?.includes(uId)) return 'Admin';
    return 'Member';
  };

  const myDesignation = user ? getDesignation(user.id) : 'Member';

  return (
    <div 
      className="app-container"
      onDragOver={(e) => { e.preventDefault(); if(!isLocked) setDragOver(true); }}
      onDragLeave={() => setDragOver(false)}
      onDrop={handleDrop}
    >
      {/* Secret Room Unlock Modal */}
      <AnimatePresence>
        {isLocked && (
          <motion.div 
            key="unlock-overlay"
            className="modal-overlay"
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, delay: 0.4 }}
          >
            <motion.div 
              className="modal-card center-text"
              animate={isUnlocking ? { scale: 1.2, opacity: 0 } : { scale: 1, opacity: 1 }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
            >
              <div className="lock-icon-container">
                <LockIcon isUnlocked={isUnlocking} />
              </div>
              <h2>Secret Room</h2>
              <p>Enter the password to join.</p>
              {unlockError && <p style={{color: 'var(--danger)', marginTop: -16}}>{unlockError}</p>}
              <form onSubmit={handleUnlock}>
                <input 
                  type="password" 
                  className="input-field password-input" 
                  placeholder="••••••••" 
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required 
                />
                <button type="submit" className="btn-primary" disabled={isUnlocking}>Unlock</button>
                <button type="button" className="btn-ghost" style={{marginTop: 12, width: '100%'}} onClick={() => navigate('/')}>Back to Dashboard</button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <motion.div 
        className="main-content"
        initial={{ scale: 0.9, filter: "blur(20px)" }}
        animate={isLocked ? { scale: 0.9, filter: "blur(20px)" } : { scale: 1, filter: "blur(0px)" }}
        transition={{ scale: { duration: 0.8, type: "spring", bounce: 0.3 }, filter: { duration: 0.8, ease: "easeInOut" } }}
      >
        <header className="room-header">
          <div style={{display: 'flex', alignItems: 'center', gap: 12}}>
             <button className="icon-btn" onClick={() => navigate('/')}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
             </button>
             <div>
                <h1 className="room-title">
                  {roomDetails?.name || 'Loading...'}
                  {!isLocked && <span className={`badge ${myDesignation === 'Owner' ? 'badge-owner' : myDesignation === 'Admin' ? 'badge-admin' : ''}`} style={{marginLeft: 8}}>{myDesignation}</span>}
                </h1>
                <div className="room-id" onClick={copyRoomId} title="Copy ID" style={{marginTop: 4, display: 'inline-flex'}}>
                  {id.slice(0, 12)}…
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                </div>
             </div>
          </div>
          <div className="nav-actions">
            {myDesignation === 'Owner' && (
              <button className="icon-btn" style={{color: 'var(--danger)'}} onClick={handleDeleteRoom} title="Delete Room">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
              </button>
            )}
          </div>
        </header>

        <div className="grid-scroll-area">
          {!isLocked && !loading && images.length === 0 && (
             <div className="empty-state" style={{cursor: 'pointer'}} onClick={handleUploadClick}>
               <h3>No images yet</h3>
               <p>Click here or use the + button to upload</p>
             </div>
          )}
          {!isLocked && (
            <div className="masonry-grid">
              <AnimatePresence mode="popLayout">
                {images.map((photo, i) => {
                  const canDelete = myDesignation === 'Owner' || myDesignation === 'Admin' || photo.uploadedBy?._id === user?.id || photo.uploadedBy === user?.id;
                  return <PhotoCard key={photo._id} photo={photo} index={i} onDelete={handleDelete} canDelete={canDelete} />;
                })}
              </AnimatePresence>
            </div>
          )}
        </div>

        {/* Magnetic FAB */}
        {!isLocked && (
          <motion.button 
            className="fab" 
            onClick={handleUploadClick}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            title="Upload Photo"
          >
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
          </motion.button>
        )}
        <input type="file" ref={fileInputRef} onChange={handleFileChange} style={{ display: 'none' }} accept="image/*" />
      </motion.div>

      {/* Right Sidebar */}
      {!isLocked && (
        <aside className="sidebar">
          <div className="sidebar-header">Members ({roomDetails?.members?.length || 0})</div>
          <div className="members-list">
            {roomDetails?.members?.map(member => {
              const role = getDesignation(member._id);
              const isMe = member._id === user?.id;
              const canModify = (myDesignation === 'Owner' || myDesignation === 'Admin') && role !== 'Owner' && !isMe;

              return (
                <div key={member._id} className="member-row">
                  <div className="member-info">
                    <div className="member-avatar">{member.username.charAt(0)}</div>
                    <div>
                      <div className="member-name">{member.username} {isMe && '(You)'}</div>
                      <div className={`badge ${role === 'Owner' ? 'badge-owner' : role === 'Admin' ? 'badge-admin' : ''}`}>
                        {role}
                      </div>
                    </div>
                  </div>
                  {canModify && (
                    <div className="member-menu-btn">
                      <button title="Toggle Admin" onClick={() => handlePromote(member._id, role)}>
                        {role === 'Admin' ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 20V10M18 20V4M6 20v-4" transform="rotate(180 12 12)"/></svg> : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 20V10M18 20V4M6 20v-4"/></svg>}
                      </button>
                      <button className="delete" title="Remove" onClick={() => handleRemoveMember(member._id)}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </aside>
      )}

      {/* Drag overlay */}
      {dragOver && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 1000,
          background: 'rgba(168, 85, 247, 0.1)',
          backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          border: '4px dashed var(--accent)',
          borderRadius: 'var(--radius-xl)'
        }}>
          <div style={{ textAlign: 'center', color: 'var(--accent)' }}>
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{marginBottom: 16}}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12"/></svg>
            <h2 style={{fontFamily: 'var(--font-display)'}}>Drop image to upload</h2>
          </div>
        </div>
      )}

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div 
            className="toast"
            initial={{ opacity: 0, y: 50, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: 50, x: '-50%' }}
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
