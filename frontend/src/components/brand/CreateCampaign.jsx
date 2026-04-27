import React, { useState, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Image, Video, Music, Smile, X, Send, Film, Check } from 'lucide-react';
import { resolveAssetUrl } from '../../utils/helpers';
import LiquidButton from '../common/LiquidButton/LiquidButton';
import CustomToast from '../common/CustomToast/CustomToast';
import api from '../../services/api';
import EmojiPicker from 'emoji-picker-react';
import { serializeCampaignPayload } from '../../features/brand/campaignSerializer';
import '../common/CreatePost/CreatePost.css';

const MAX_VIDEO_SIZE_BYTES = 25 * 1024 * 1024;
const MAX_VIDEO_SIZE_MESSAGE = 'Maximum video size allowed is 25 MB';

export default function CreateCampaign({ onCampaignCreated, editData, onCancelEdit }) {
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [mediaFiles, setMediaFiles] = useState([]);
  const [tags, setTags] = useState('');
  const [loading, setLoading] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [budget, setBudget] = useState('');
  const [category, setCategory] = useState('Other');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [compensation, setCompensation] = useState('paid');
  const [requirements, setRequirements] = useState('');
  const [deliverables, setDeliverables] = useState('');
  const [showCampaignFields, setShowCampaignFields] = useState(false);
  const [toast, setToast] = useState(null);

  const imageRef = useRef(null);
  const videoRef = useRef(null);
  const audioRef = useRef(null);
  const gifRef = useRef(null);
  const emojiPickerRef = useRef(null);

  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target) && !event.target.closest('.action-btn')) {
        setShowEmojiPicker(false);
      }
    };
    if (showEmojiPicker) {
      window.addEventListener('click', handleClickOutside, true);
      window.addEventListener('touchstart', handleClickOutside, true);
    }
    return () => {
      window.removeEventListener('click', handleClickOutside, true);
      window.removeEventListener('touchstart', handleClickOutside, true);
    };
  }, [showEmojiPicker]);

  React.useEffect(() => {
    if (editData) {
      setTitle(editData.title || '');
      setContent(editData.content || '');
      setTags(editData.tags ? editData.tags.join(', ') : '');
      if (editData.media) {
        const existingMedia = editData.media.map(m => ({
          isExisting: true,
          preview: resolveAssetUrl(m.url),
          url: m.url,
          type: m.type
        }));
        setMediaFiles(existingMedia);
      }
      setBudget(editData.budget || '');
      setCategory(editData.category || 'Other');
      setStartDate(editData.startDate ? new Date(editData.startDate).toISOString().split('T')[0] : '');
      setEndDate(editData.endDate ? new Date(editData.endDate).toISOString().split('T')[0] : '');
      setCompensation(editData.compensation || 'paid');
      setRequirements(editData.requirements || '');
      setDeliverables(editData.deliverables ? editData.deliverables.join(', ') : '');
      if (editData.budget || editData.startDate || editData.endDate) {
        setShowCampaignFields(true);
      }
    }
  }, [editData]);

  const handleMediaSelect = (e, ref) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      if (filesArray.length + mediaFiles.length > 4) {
        setToast({ message: 'You can only upload up to 4 media files at once.', type: 'warning' });
        if (ref.current) ref.current.value = '';
        return;
      }
      const oversizedVideo = filesArray.find(file => file.type.startsWith('video/') && file.size > MAX_VIDEO_SIZE_BYTES);
      if (oversizedVideo) {
        setToast({ message: MAX_VIDEO_SIZE_MESSAGE, type: 'danger' });
        if (ref.current) ref.current.value = '';
        return;
      }
      const newMediaFiles = filesArray.map(file => ({
        file,
        preview: URL.createObjectURL(file),
        type: file.type.split('/')[0]
      }));
      setMediaFiles(prev => [...prev, ...newMediaFiles]);
    }
    if (ref.current) ref.current.value = '';
  };

  const removeMedia = (index) => {
    setMediaFiles(prev => prev.filter((_, i) => i !== index));
  };

  const onEmojiClick = (emojiObject) => {
    setContent(prev => prev + emojiObject.emoji);
    setShowEmojiPicker(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim() && mediaFiles.length === 0) return;

    setLoading(true);
    try {
      const payload = {
        title, content, tags, mediaFiles, budget, category, 
        startDate, endDate, compensation, requirements, deliverables
      };
      const formData = serializeCampaignPayload(payload);

      if (editData) {
        const updated = await api.updateCampaign(editData._id, formData);
        if (onCampaignCreated) onCampaignCreated(updated);
      } else {
        const created = await api.createCampaign(formData);
        setTitle(''); setContent(''); setMediaFiles([]); setTags('');
        setBudget(''); setCategory('Other'); setStartDate(''); setEndDate('');
        setCompensation('paid'); setRequirements(''); setDeliverables('');
        if (onCampaignCreated) onCampaignCreated(created);
      }
    } catch (err) {
      console.error(err);
      setToast({ message: err.response?.data?.error || err.message || 'Failed to save campaign', type: 'danger' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-post-container glass-panel">
      {toast && (
        <CustomToast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
      <div className="create-post-header" style={{ position: 'relative' }}>
        <div className="create-post-avatar">
          {user?.avatar ? <img src={user.avatar} alt="Avatar" /> : user?.name?.[0] || 'B'}
        </div>
        <div style={{ flex: 1, width: '100%' }}>
          <input
            type="text"
            placeholder="Campaign Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="create-post-title"
            style={{ marginBottom: '0.75rem', display: 'block', padding: '0.75rem 1rem', borderRadius: '12px', border: '1px solid var(--border)', background: 'var(--surface-alt)', color: 'var(--text-primary)', outline: 'none', fontWeight: 700, fontSize: '1.25rem' }}
          />
          <textarea
            placeholder="Describe your campaign or share a brand update..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="create-post-input"
            rows={4}
            style={{ width: '100%', padding: '1rem', borderRadius: '16px', border: '1px solid var(--border)', background: 'var(--surface-alt)', color: 'var(--text-primary)', outline: 'none', resize: 'none', fontSize: '1rem' }}
          />
        </div>
        {showEmojiPicker && (
          <div className="emoji-picker-container">
            <EmojiPicker onEmojiClick={onEmojiClick} theme="auto" />
          </div>
        )}
      </div>

      {mediaFiles.length > 0 && (
        <div className="create-post-media-preview">
          {mediaFiles.map((media, idx) => (
            <div key={idx} className="preview-item">
              <button type="button" className="remove-btn" onClick={() => removeMedia(idx)}><X size={14}/></button>
              {media.type === 'video' ? (
                <video src={media.preview} controls />
              ) : media.type === 'audio' ? (
                <audio src={media.preview} controls />
              ) : (
                <img src={media.preview} alt="preview" />
              )}
            </div>
          ))}
        </div>
      )}

      <div className="create-post-campaign-toggle" style={{ margin: '0.5rem 0' }}>
        <button
          type="button"
          className={`btn-toggle ${showCampaignFields ? 'active' : ''}`}
          onClick={() => setShowCampaignFields(!showCampaignFields)}
          style={{
            fontSize: '0.85rem',
            background: 'var(--surface-light)',
            border: '1px solid var(--border)',
            padding: '0.4rem 0.8rem',
            borderRadius: '20px',
            color: 'var(--text)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          {showCampaignFields ? '− Remove Campaign Details' : '+ Add Campaign Details (Budget, Dates, etc.)'}
        </button>
      </div>

      {showCampaignFields && (
        <div className="campaign-fields-grid" style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '1rem',
          padding: '1.25rem',
          borderRadius: '24px',
          background: 'var(--surface-alt)',
          border: '1.5px solid var(--border)'
        }}>
          <div className="input-group">
            <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem', display: 'block' }}>Budget (₹)</label>
            <input type="number" className="input sm" placeholder="e.g. 5000" value={budget} onChange={e => setBudget(e.target.value)}
              style={{ width: '100%', padding: '0.6rem 1rem', borderRadius: '20px', border: '1px solid var(--border)', background: 'var(--surface-alt)', color: 'var(--text-primary)' }} />
          </div>
          <div className="input-group">
            <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem', display: 'block' }}>Category</label>
            <select className="input sm glass-indicator" value={category} onChange={e => setCategory(e.target.value)}
              style={{ width: '100%', padding: '0.6rem 1rem', borderRadius: '20px', border: '1px solid var(--border)', background: 'var(--surface-alt)', color: 'var(--text-primary)' }}>
              {['Fashion', 'Tech', 'Fitness', 'Beauty', 'Food', 'Travel', 'Other'].map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
          <div className="input-group">
            <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem', display: 'block' }}>Start Date</label>
            <input type="date" className="input sm glass-indicator" value={startDate} onChange={e => setStartDate(e.target.value)}
              style={{ width: '100%', padding: '0.6rem 1rem', borderRadius: '20px', border: '1px solid var(--border)', background: 'var(--surface-alt)', color: 'var(--text-primary)' }} />
          </div>
          <div className="input-group">
            <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem', display: 'block' }}>End Date</label>
            <input type="date" className="input sm glass-indicator" value={endDate} onChange={e => setEndDate(e.target.value)}
              style={{ width: '100%', padding: '0.6rem 1rem', borderRadius: '20px', border: '1px solid var(--border)', background: 'var(--surface-alt)', color: 'var(--text-primary)' }} />
          </div>
          <div className="input-group">
            <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem', display: 'block' }}>Compensation</label>
            <select className="input sm glass-indicator" value={compensation} onChange={e => setCompensation(e.target.value)}
              style={{ width: '100%', padding: '0.6rem 1rem', borderRadius: '20px', border: '1px solid var(--border)', background: 'var(--surface-alt)', color: 'var(--text-primary)' }}>
              <option value="paid">Paid</option>
              <option value="product">Product Only</option>
              <option value="both">Both</option>
            </select>
          </div>
          <div className="input-group">
            <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem', display: 'block' }}>Deliverables (comma separated)</label>
            <input type="text" className="input sm glass-indicator" placeholder="e.g. 1 Post, 2 Stories" value={deliverables} onChange={e => setDeliverables(e.target.value)}
              style={{ width: '100%', padding: '0.6rem 1rem', borderRadius: '20px', border: '1px solid var(--border)', background: 'var(--surface-alt)', color: 'var(--text-primary)' }} />
          </div>
          <div className="input-group" style={{ gridColumn: 'span 2' }}>
            <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem', display: 'block' }}>Requirements</label>
            <textarea className="input sm glass-indicator" placeholder="Min 5k followers, Tech niche preferred..." value={requirements} onChange={e => setRequirements(e.target.value)}
              rows={3} style={{ width: '100%', padding: '1rem', background: 'var(--surface-alt)', border: '1px solid var(--border)', borderRadius: '16px', color: 'var(--text-primary)', resize: 'none', outline: 'none' }} />
          </div>
        </div>
      )}

      {tags && (
        <div className="create-post-tags">
          {tags.split(',').map((t, i) => t.trim() && <span key={i} className="badge badge-accent">#{t.trim()}</span>)}
        </div>
      )}

      <div className="create-post-footer">
        <div className="create-post-actions">
          <input type="file" ref={imageRef} style={{ display: 'none' }} multiple accept="image/jpeg,image/png,image/webp" onChange={(e) => handleMediaSelect(e, imageRef)} />
          <input type="file" ref={videoRef} style={{ display: 'none' }} multiple accept="video/*" onChange={(e) => handleMediaSelect(e, videoRef)} />
          <input type="file" ref={audioRef} style={{ display: 'none' }} multiple accept="audio/*" onChange={(e) => handleMediaSelect(e, audioRef)} />
          <input type="file" ref={gifRef} style={{ display: 'none' }} multiple accept="image/gif" onChange={(e) => handleMediaSelect(e, gifRef)} />
          <button type="button" className="action-btn" title="Add Image" onClick={() => imageRef.current?.click()}><Image size={24} /></button>
          <button type="button" className="action-btn" title="Add Video" onClick={() => videoRef.current?.click()}><Video size={24} /></button>
          <button type="button" className="action-btn" title="Add Audio" onClick={() => audioRef.current?.click()}><Music size={24} /></button>
          <button type="button" className="action-btn" title="Add GIF" onClick={() => gifRef.current?.click()}><Film size={24} /></button>
          <button type="button" className="action-btn" title="Add Emoji" onClick={() => setShowEmojiPicker(!showEmojiPicker)}><Smile size={24} /></button>

          {showEmojiPicker && (
            <div className="emoji-picker-container" ref={emojiPickerRef}>
              <div className="emoji-picker-header">
                <span>Select Emoji</span>
                <button onClick={() => setShowEmojiPicker(false)} className="close-picker"><X size={18}/></button>
              </div>
              <EmojiPicker onEmojiClick={onEmojiClick} theme="auto" width="100%" height={350} />
            </div>
          )}
          <input type="text" placeholder="Tags (comma separated)" value={tags} onChange={(e) => setTags(e.target.value)} className="tags-input glass-indicator" style={{ padding: '0.5rem 1rem', background: 'var(--surface-alt)', border: '1px solid var(--border)', color: 'var(--text-primary)', fontSize: '0.8125rem' }} />
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', width: '100%' }}>
          {editData && (
            <LiquidButton variant="secondary" onClick={onCancelEdit} disabled={loading}
              style={{ padding: '0.5rem 1.5rem', display: 'flex', justifyContent: 'center' }}>
              Cancel
            </LiquidButton>
          )}
          <LiquidButton variant="primary" onClick={handleSubmit}
            disabled={loading || (!content.trim() && mediaFiles.length === 0)}
            style={{ padding: '0.5rem 1.5rem', display: 'flex', justifyContent: 'center', flex: 1, width: '100%' }}>
            {loading ? (editData ? 'Saving...' : 'Publishing...') : (
              editData ? <><Check size={16} style={{marginRight:'0.5rem'}}/> Save</> : <><Send size={16} style={{marginRight:'0.5rem'}}/> Publish</>
            )}
          </LiquidButton>
        </div>
      </div>
    </div>
  );
}
