import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import useAuthStore from '../store/useAuthStore';
import {
  Upload, Image as ImageIcon, Trash2, Copy, ShieldAlert,
  UserMinus, ShieldPlus, Users, ShieldMinus, CloudUpload
} from 'lucide-react';

export default function Room() {
  const { id } = useParams();
  const [roomDetails, setRoomDetails] = useState(null);
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [deletingRoom, setDeletingRoom] = useState(false);
  const [toast, setToast] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef(null);
  const user = useAuthStore(state => state.user);
  const navigate = useNavigate();

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2000);
  };

  const fetchImages = useCallback(async () => {
    try {
      const res = await axios.get(`/image/${id}`);
      setImages(res.data.images || []);
    } catch (error) {
      console.error(error);
    }
  }, [id]);

  const fetchRoomData = useCallback(async () => {
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
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchRoomData();
    const interval = setInterval(fetchImages, 10000);
    return () => clearInterval(interval);
  }, [id, fetchRoomData, fetchImages]);

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
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) uploadFile(file);
  };

  const handleDelete = async (imageId) => {
    if (!window.confirm('Delete this image?')) return;
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
    if (!window.confirm('Are you ABSOLUTELY sure you want to delete this room? This cannot be undone.')) return;
    setDeletingRoom(true);
    try {
      await axios.post('/room/delete-room', { roomId: id });
      navigate('/');
    } catch (error) {
      alert(error.response?.data?.message || 'Error deleting room');
      setDeletingRoom(false);
    }
  };

  const getDesignation = () => {
    if (!user || !roomDetails) return 'Member';
    if (roomDetails.owner === user.id) return 'Owner';
    if (roomDetails.admins?.includes(user.id)) return 'Admin';
    return 'Member';
  };

  const handleMakeAdmin = async (userId) => {
    if (!window.confirm('Promote this member to admin?')) return;
    try {
      await axios.post('/room/make-admin', { roomId: id, userId });
      showToast('Member promoted to admin');
      fetchRoomData();
    } catch (error) {
      alert(error.response?.data?.message || 'Error');
    }
  };

  const handleMakeMember = async (userId) => {
    if (!window.confirm('Demote this admin to member?')) return;
    try {
      await axios.post('/room/make-member', { roomId: id, userId });
      showToast('Admin demoted to member');
      fetchRoomData();
    } catch (error) {
      alert(error.response?.data?.message || 'Error');
    }
  };

  const handleRemoveMember = async (userId) => {
    if (!window.confirm('Remove this member from the room?')) return;
    try {
      await axios.post('/room/remove-member', { roomId: id, userId });
      showToast('Member removed');
      fetchRoomData();
    } catch (error) {
      alert(error.response?.data?.message || 'Error');
    }
  };

  const designation = getDesignation();
  const getBadgeClass = (d) =>
    d === 'Owner' ? 'badge-owner' : d === 'Admin' ? 'badge-admin' : 'badge-member';

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '50vh', gap: '0.75rem' }}>
        <div className="spinner" />
        <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Loading room…</span>
      </div>
    );
  }

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
      onDragLeave={() => setDragOver(false)}
      onDrop={handleDrop}
      style={{ position: 'relative' }}
    >
      {/* Drag overlay */}
      {dragOver && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 50,
          background: 'rgba(99, 102, 241, 0.1)',
          backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          border: '3px dashed var(--accent-primary)',
          borderRadius: 'var(--radius-xl)'
        }}>
          <div style={{ textAlign: 'center', color: 'var(--accent-primary-hover)' }}>
            <CloudUpload size={48} style={{ marginBottom: '0.5rem' }} />
            <p style={{ fontSize: '1.125rem', fontWeight: 600 }}>Drop image to upload</p>
          </div>
        </div>
      )}

      {/* Room Header */}
      <div className="glass room-header animate-fade-in-up">
        <div className="room-header-info">
          <h2>
            {roomDetails?.name || 'Room'}
            <span className={`badge ${getBadgeClass(designation)}`} style={{ marginLeft: '0.5rem', verticalAlign: 'middle' }}>
              {designation}
            </span>
          </h2>
          <div className="room-header-meta">
            {roomDetails?.description && <span>{roomDetails.description} •</span>}
            <span style={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>{id.slice(0, 12)}…</span>
            <button className="btn-icon" onClick={copyRoomId} title="Copy Room ID" style={{ padding: '0.2rem' }}>
              <Copy size={12} />
            </button>
          </div>
        </div>
        <div className="room-header-actions">
          {designation === 'Owner' && (
            <button className="btn btn-danger" onClick={handleDeleteRoom} disabled={deletingRoom}>
              <ShieldAlert size={15} /> {deletingRoom ? 'Deleting…' : 'Delete Room'}
            </button>
          )}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            style={{ display: 'none' }}
            accept="image/*"
          />
          <button className="btn btn-primary" onClick={handleUploadClick} disabled={uploading}>
            <Upload size={15} /> {uploading ? 'Uploading…' : 'Upload'}
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="room-body">
        {/* Gallery */}
        <div className="gallery-area">
          {images.length === 0 ? (
            <div className="glass empty-state animate-fade-in-up" onClick={handleUploadClick} style={{ cursor: 'pointer' }}>
              <div className="empty-state-icon">
                <ImageIcon size={32} color="var(--text-tertiary)" />
              </div>
              <h3>No images yet</h3>
              <p>Click here or drag & drop to upload the first image!</p>
            </div>
          ) : (
            <div className="image-grid stagger">
              {images.map(image => (
                <div key={image._id} className="image-card">
                  <img src={image.url} alt="Shared" loading="lazy" />
                  <div className="image-card-footer">
                    <span className="image-card-user">
                      {image.uploadedBy?.username || 'Unknown'}
                    </span>
                    {(user?.id === image.uploadedBy?._id || user?.id === image.uploadedBy) && (
                      <button className="btn-icon remove" onClick={() => handleDelete(image._id)} title="Delete">
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Members Panel */}
        <div className="glass members-panel animate-fade-in-up" style={{ animationDelay: '150ms' }}>
          <div className="members-title">
            <Users size={18} color="var(--accent-primary-hover)" />
            Members ({roomDetails?.members?.length || 0})
          </div>
          <div>
            {roomDetails?.members?.map(member => {
              let memberDesig = 'Member';
              if (roomDetails.owner === member._id) memberDesig = 'Owner';
              else if (roomDetails.admins?.includes(member._id)) memberDesig = 'Admin';

              const canModify = (designation === 'Owner' || designation === 'Admin')
                && memberDesig !== 'Owner'
                && member._id !== user.id;

              return (
                <div key={member._id} className="member-item">
                  <div className="member-info">
                    <span className="member-name">{member.username}</span>
                    <span className={`badge ${getBadgeClass(memberDesig)}`}>{memberDesig}</span>
                  </div>
                  {canModify && (
                    <div className="member-actions">
                      {memberDesig !== 'Admin' && (
                        <button className="btn-icon promote" onClick={() => handleMakeAdmin(member._id)} title="Promote to Admin">
                          <ShieldPlus size={13} />
                        </button>
                      )}
                      {memberDesig === 'Admin' && (
                        <button className="btn-icon demote" onClick={() => handleMakeMember(member._id)} title="Demote to Member">
                          <ShieldMinus size={13} />
                        </button>
                      )}
                      <button className="btn-icon remove" onClick={() => handleRemoveMember(member._id)} title="Remove">
                        <UserMinus size={13} />
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Toast */}
      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}
