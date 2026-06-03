import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import useAuthStore from '../store/useAuthStore';
import { Upload, Image as ImageIcon, Trash2, Copy, Settings, ShieldAlert, UserMinus, ShieldPlus, Users, ShieldMinus } from 'lucide-react';

export default function Room() {
  const { id } = useParams();
  const [roomDetails, setRoomDetails] = useState(null);
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [deletingRoom, setDeletingRoom] = useState(false);
  const fileInputRef = useRef(null);
  const user = useAuthStore(state => state.user);
  const navigate = useNavigate();

  const fetchImages = async () => {
    try {
      const res = await axios.get(`/image/${id}`);
      setImages(res.data.images || []);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchRoomData = async () => {
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
  };

  useEffect(() => {
    fetchRoomData();
    // In a real app we'd setup a socket or polling here, but polling for simplicity
    const interval = setInterval(fetchImages, 10000);
    return () => clearInterval(interval);
  }, [id]);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);
    formData.append('roomId', id);

    setUploading(true);
    try {
      await axios.post('/image/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      fetchImages();
    } catch (error) {
      alert(error.response?.data?.message || 'Error uploading image');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (imageId) => {
    if (!window.confirm('Are you sure you want to delete this image?')) return;
    try {
      await axios.delete(`/image/${imageId}`);
      fetchImages();
    } catch (error) {
      alert(error.response?.data?.message || 'Error deleting image');
    }
  };

  const copyRoomId = () => {
    navigator.clipboard.writeText(id);
    alert('Room ID copied to clipboard!');
  };

  const handleDeleteRoom = async () => {
    if (!window.confirm('Are you ABSOLUTELY sure you want to delete this room? This action cannot be undone.')) return;
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
    if (!window.confirm('Are you sure you want to make this member an admin?')) return;
    try {
      await axios.post('/room/make-admin', { roomId: id, userId });
      fetchRoomData();
    } catch (error) {
      alert(error.response?.data?.message || 'Error making admin');
    }
  };

  const handleMakeMember = async (userId) => {
    if (!window.confirm('Are you sure you want to demote this admin to a regular member?')) return;
    try {
      await axios.post('/room/make-member', { roomId: id, userId });
      fetchRoomData();
    } catch (error) {
      alert(error.response?.data?.message || 'Error demoting admin');
    }
  };

  const handleRemoveMember = async (userId) => {
    if (!window.confirm('Are you sure you want to remove this member from the room?')) return;
    try {
      await axios.post('/room/remove-member', { roomId: id, userId });
      fetchRoomData();
    } catch (error) {
      alert(error.response?.data?.message || 'Error removing member');
    }
  };

  const designation = getDesignation();

  return (
    <div className="container">
      <div className="d-flex justify-between items-center mb-6 glass-panel" style={{ padding: '1rem 2rem' }}>
        <div>
          <h2 className="d-flex items-center gap-2">
            <ImageIcon size={24} color="var(--primary)" /> {roomDetails ? roomDetails.name : 'Room Dashboard'}
            {designation !== 'Member' && (
              <span style={{ fontSize: '0.65rem', padding: '0.2rem 0.5rem', background: designation === 'Owner' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(245, 158, 11, 0.2)', color: designation === 'Owner' ? '#fca5a5' : '#fcd34d', borderRadius: '1rem', fontWeight: 'bold', verticalAlign: 'middle' }}>
                {designation}
              </span>
            )}
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }} className="d-flex items-center gap-2 mt-1">
            {roomDetails?.description ? `${roomDetails.description} • ` : ''}ID: {id} 
            <button onClick={copyRoomId} style={{ padding: '0.2rem 0.5rem', background: 'transparent', color: 'var(--primary)', border: '1px solid var(--primary)', marginLeft: '0.5rem' }}><Copy size={12} /></button>
          </p>
        </div>
        <div className="d-flex gap-4">
          {designation === 'Owner' && (
            <button 
              onClick={handleDeleteRoom} 
              disabled={deletingRoom} 
              className="danger d-flex items-center gap-2"
              style={{ background: 'transparent', border: '1px solid var(--danger)', color: 'var(--danger)' }}
            >
              <ShieldAlert size={18} /> {deletingRoom ? 'Deleting...' : 'Delete Room'}
            </button>
          )}
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            style={{ display: 'none' }} 
            accept="image/*"
          />
          <button onClick={handleUploadClick} disabled={uploading} className="d-flex items-center gap-2">
            <Upload size={18} /> {uploading ? 'Uploading...' : 'Upload Image'}
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '2rem', alignItems: 'flex-start' }}>
        <div style={{ flex: 1 }}>
          {loading ? (
            <div className="text-center mt-10">Loading images...</div>
          ) : images.length === 0 ? (
            <div className="glass-panel text-center py-10">
              <ImageIcon size={48} color="var(--text-muted)" style={{ margin: '0 auto', marginBottom: '1rem' }} />
              <h3>No images yet</h3>
              <p style={{ color: 'var(--text-muted)' }}>Be the first to upload an image to this room!</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1.5rem' }}>
              {images.map(image => (
                <div key={image._id} className="glass-panel animate-fade-in" style={{ padding: '1rem', position: 'relative', overflow: 'hidden' }}>
                  <img 
                    src={image.url} 
                    alt="Shared" 
                    style={{ width: '100%', height: '200px', objectFit: 'cover', borderRadius: '0.5rem', background: 'var(--bg-color)' }} 
                  />
                  <div className="d-flex justify-between items-center mt-4">
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      By {image.uploadedBy?.username || 'Unknown'}
                    </span>
                    
                    {(user?.id === image.uploadedBy?._id || user?.id === image.uploadedBy) && (
                      <button 
                        onClick={() => handleDelete(image._id)} 
                        className="danger"
                        style={{ padding: '0.3rem 0.5rem', fontSize: '0.75rem' }}
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Sidebar for members */}
        <div className="glass-panel" style={{ width: '300px', padding: '1.5rem', position: 'sticky', top: '100px' }}>
          <h3 className="d-flex items-center gap-2 mb-4" style={{ fontSize: '1.25rem' }}>
            <Users size={20} color="var(--primary)" /> Members ({roomDetails?.members?.length || 0})
          </h3>
          <div className="d-flex flex-col gap-3">
            {roomDetails?.members?.map(member => {
              let memberDesig = 'Member';
              if (roomDetails.owner === member._id) memberDesig = 'Owner';
              else if (roomDetails.admins?.includes(member._id)) memberDesig = 'Admin';
              
              const canModify = (designation === 'Owner' || designation === 'Admin') && memberDesig !== 'Owner' && member._id !== user.id;

              return (
                <div key={member._id} className="d-flex justify-between items-center" style={{ padding: '0.75rem', background: 'var(--bg-color-light)', borderRadius: '0.5rem', border: '1px solid var(--glass-border)' }}>
                  <div>
                    <div style={{ fontWeight: '600', fontSize: '0.875rem' }}>{member.username}</div>
                    <div style={{ fontSize: '0.65rem', padding: '0.1rem 0.4rem', background: memberDesig === 'Owner' ? 'rgba(239, 68, 68, 0.2)' : memberDesig === 'Admin' ? 'rgba(245, 158, 11, 0.2)' : 'rgba(148, 163, 184, 0.2)', color: memberDesig === 'Owner' ? '#fca5a5' : memberDesig === 'Admin' ? '#fcd34d' : '#cbd5e1', borderRadius: '1rem', display: 'inline-block', marginTop: '0.2rem' }}>
                      {memberDesig}
                    </div>
                  </div>
                  
                  {canModify && (
                    <div className="d-flex gap-2">
                      {memberDesig !== 'Admin' && (
                        <button onClick={() => handleMakeAdmin(member._id)} style={{ padding: '0.3rem', background: 'transparent', color: 'var(--primary)', border: '1px solid var(--primary)' }} title="Make Admin">
                          <ShieldPlus size={14} />
                        </button>
                      )}
                      {memberDesig === 'Admin' && (
                        <button onClick={() => handleMakeMember(member._id)} style={{ padding: '0.3rem', background: 'transparent', color: 'var(--danger)', border: '1px solid var(--danger)' }} title="Demote to Member">
                          <ShieldMinus size={14} />
                        </button>
                      )}
                      <button onClick={() => handleRemoveMember(member._id)} className="danger" style={{ padding: '0.3rem' }} title="Remove Member">
                        <UserMinus size={14} />
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
