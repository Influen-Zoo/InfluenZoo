import React, { useState, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Image, Video, Music, Smile, X, Send, Film, Check } from 'lucide-react';
import { resolveAssetUrl } from '../../utils/helpers';
import LiquidButton from '../common/LiquidButton/LiquidButton';
import CustomToast from '../common/CustomToast/CustomToast';
import api from '../../services/api';
import EmojiPicker from 'emoji-picker-react';
import { serializeCampaignPayload } from '../../features/brand/campaignSerializer';
import useCategories from '../../hooks/useCategories';
import '../common/CreatePost/CreatePost.css';

const MAX_VIDEO_SIZE_BYTES = 25 * 1024 * 1024;
const MAX_VIDEO_SIZE_MESSAGE = 'Maximum video size allowed is 25 MB';
const PLATFORM_OPTIONS = [
  { name: 'YouTube' },
  { name: 'Instagram' },
  { name: 'Facebook' },
];
const PLATFORM_NAMES = PLATFORM_OPTIONS.map(({ name }) => name);

const normalizeStringList = (value) => {
  if (!value) return [];
  if (Array.isArray(value)) {
    return value
      .map(item => {
        if (item && typeof item === 'object') {
          return item.name || item.label || item.value || item.outlet || item.platform || '';
        }
        return item;
      })
      .map(item => String(item).trim())
      .filter(Boolean);
  }
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) return normalizeStringList(parsed);
    } catch {}
    return value.split(',').map(item => item.trim()).filter(Boolean);
  }
  if (typeof value === 'object') {
    return normalizeStringList(value.name || value.label || value.value || value.outlet || value.platform);
  }
  return [];
};

const normalizePlatformList = (value) => {
  const platforms = normalizeStringList(value);
  return platforms
    .map(platform => PLATFORM_NAMES.find(name => name.toLowerCase() === platform.toLowerCase()))
    .filter(Boolean);
};

const PlatformIcon = ({ platform }) => {
  if (platform === 'YouTube') {
    return (
      <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" focusable="false">
        <path fill="currentColor" d="M21.6 7.2a2.8 2.8 0 0 0-2-2C17.8 4.8 12 4.8 12 4.8s-5.8 0-7.6.4a2.8 2.8 0 0 0-2 2A29 29 0 0 0 2 12a29 29 0 0 0 .4 4.8 2.8 2.8 0 0 0 2 2c1.8.4 7.6.4 7.6.4s5.8 0 7.6-.4a2.8 2.8 0 0 0 2-2A29 29 0 0 0 22 12a29 29 0 0 0-.4-4.8ZM10 15.2V8.8l5.6 3.2L10 15.2Z" />
      </svg>
    );
  }
  if (platform === 'Instagram') {
    return (
      <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" focusable="false">
        <path fill="none" stroke="currentColor" strokeWidth="2" d="M7.5 2.8h9A4.7 4.7 0 0 1 21.2 7.5v9a4.7 4.7 0 0 1-4.7 4.7h-9a4.7 4.7 0 0 1-4.7-4.7v-9A4.7 4.7 0 0 1 7.5 2.8Z" />
        <path fill="none" stroke="currentColor" strokeWidth="2" d="M8.5 12a3.5 3.5 0 1 0 7 0 3.5 3.5 0 0 0-7 0Z" />
        <path fill="currentColor" d="M17.2 6.4a1 1 0 1 0 0 2 1 1 0 0 0 0-2Z" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" focusable="false">
      <path fill="currentColor" d="M14 8.3V6.7c0-.8.2-1.2 1.3-1.2h1.5V2.8c-.7-.1-1.5-.2-2.2-.2-2.3 0-3.8 1.4-3.8 3.9v1.8H8.3v3h2.5v8.1H14v-8.1h2.5l.4-3H14Z" />
    </svg>
  );
};

export default function CreateCampaign({ onCampaignCreated, onSuccess, editData, onCancelEdit, onClose }) {
  const { user } = useAuth();
  const { categories } = useCategories();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [mediaFiles, setMediaFiles] = useState([]);
  const [tags, setTags] = useState('');
  const [loading, setLoading] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [budget, setBudget] = useState('');
  const [category, setCategory] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [compensation, setCompensation] = useState('paid');
  const [requirements, setRequirements] = useState('');
  const [deliverables, setDeliverables] = useState('');
  const [platforms, setPlatforms] = useState([]);
  const [outlets, setOutlets] = useState([]);
  const [outletInput, setOutletInput] = useState('');
  const [showCampaignFields, setShowCampaignFields] = useState(true);
  const [toast, setToast] = useState(null);
  const campaignFieldsVisible = editData ? true : showCampaignFields;
  const categoryOptions = category && !categories.includes(category)
    ? [category, ...categories]
    : categories;

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
      const nextPlatforms = normalizePlatformList(editData.platforms);
      const fallbackPlatforms = normalizePlatformList(editData.platform);
      const nextOutlets = normalizeStringList(editData.outlets);
      const shouldUseFallbackPlatform = fallbackPlatforms.length > 0 && (
        nextPlatforms.length === 0 ||
        (nextPlatforms.length === 1 && nextPlatforms[0] === 'Other')
      );
      const hydratedPlatforms = shouldUseFallbackPlatform ? fallbackPlatforms : nextPlatforms;
      setPlatforms(hydratedPlatforms);
      setOutlets(nextOutlets);
      setRequirements(editData.requirements || '');
      setDeliverables(editData.deliverables ? editData.deliverables.join(', ') : '');
      setShowCampaignFields(true);
    }
  }, [editData]);

  React.useEffect(() => {
    if (!editData && !category && categories.length) {
      setCategory(categories[0]);
    }
  }, [categories, category, editData]);

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

  const togglePlatform = (platform) => {
    setPlatforms((current) => (
      current.includes(platform)
        ? current.filter((item) => item !== platform)
        : [...current, platform]
    ));
  };

  const addOutlet = () => {
    const nextOutlet = outletInput.trim();
      if (!nextOutlet || outlets.some(outlet => outlet.toLowerCase() === nextOutlet.toLowerCase())) return;
    setOutlets((current) => [...current, nextOutlet]);
    setOutletInput('');
  };

  const removeOutlet = (outlet) => {
    setOutlets((current) => current.filter((item) => item !== outlet));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim() && mediaFiles.length === 0) return;

    setLoading(true);
    try {
      const pendingOutlet = outletInput.trim();
      const finalPlatforms = campaignFieldsVisible ? normalizePlatformList(platforms) : [];
      const finalOutlets = campaignFieldsVisible
        ? [...outlets, pendingOutlet]
            .map(outlet => outlet.trim())
            .filter(Boolean)
            .filter((outlet, index, list) => list.findIndex(item => item.toLowerCase() === outlet.toLowerCase()) === index)
        : [];

      if (campaignFieldsVisible && finalPlatforms.length === 0) {
        setToast({ message: 'Select at least one platform before publishing the campaign.', type: 'warning' });
        return;
      }

      const payload = {
        title, content, tags, mediaFiles, budget, category, 
        startDate, endDate, compensation, requirements, deliverables,
        platforms: finalPlatforms,
        outlets: finalOutlets,
        campaignDetailsEnabled: campaignFieldsVisible
      };
      const formData = serializeCampaignPayload(payload);

      if (editData) {
        const updated = await api.updateCampaign(editData._id, formData);
        if (onCampaignCreated) onCampaignCreated(updated);
        if (onSuccess) onSuccess(updated);
      } else {
        const created = await api.createCampaign(formData);
        setTitle(''); setContent(''); setMediaFiles([]); setTags('');
        setBudget(''); setCategory(categories[0] || ''); setStartDate(''); setEndDate('');
        setCompensation('paid'); setRequirements(''); setDeliverables('');
        setPlatforms([]); setOutlets([]); setOutletInput('');
        setShowCampaignFields(true);
        if (onCampaignCreated) onCampaignCreated(created);
        if (onSuccess) onSuccess(created);
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

      {!editData && (
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
      )}

      {campaignFieldsVisible && (
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
              {categoryOptions.map(cat => (
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
            <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem', display: 'block' }}>Platforms</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {PLATFORM_OPTIONS.map(({ name: platform }) => (
                <button
                  key={platform}
                  type="button"
                  onClick={() => togglePlatform(platform)}
                  className="campaign-platform-option glass-indicator"
                  style={{
                    borderRadius: '999px',
                    border: platforms.includes(platform) ? '1px solid var(--accent)' : '1px solid var(--border)',
                    background: platforms.includes(platform) ? 'rgba(var(--accent-rgb), 0.14)' : 'var(--surface-alt)',
                    color: platforms.includes(platform) ? 'var(--accent)' : 'var(--text-primary)',
                    fontWeight: 800,
                    cursor: 'pointer'
                  }}
                  aria-label={platform}
                  title={platform}
                >
                  <PlatformIcon platform={platform} />
                  <span>{platform}</span>
                </button>
              ))}
            </div>
          </div>
          <div className="input-group">
            <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem', display: 'block' }}>Deliverables (comma separated)</label>
            <input type="text" className="input sm glass-indicator" placeholder="e.g. 1 Post, 2 Stories" value={deliverables} onChange={e => setDeliverables(e.target.value)}
              style={{ width: '100%', padding: '0.6rem 1rem', borderRadius: '20px', border: '1px solid var(--border)', background: 'var(--surface-alt)', color: 'var(--text-primary)' }} />
          </div>
          <div className="input-group">
            <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem', display: 'block' }}>Outlets</label>
            <input
              type="text"
              className="input sm glass-indicator"
              placeholder="Type outlet and press Enter"
              value={outletInput}
              onChange={e => setOutletInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addOutlet();
                }
              }}
              style={{ width: '100%', padding: '0.6rem 1rem', borderRadius: '20px', border: '1px solid var(--border)', background: 'var(--surface-alt)', color: 'var(--text-primary)' }}
            />
            {outlets.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.45rem', marginTop: '0.65rem' }}>
                {outlets.map((outlet) => (
                  <span key={outlet} className="badge badge-accent" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                    {outlet}
                    <button type="button" onClick={() => removeOutlet(outlet)} style={{ border: 0, background: 'transparent', color: 'inherit', cursor: 'pointer', padding: 0, display: 'inline-flex' }}>
                      <X size={13} />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
          <div className="input-group" style={{ gridColumn: 'span 2' }}>
            <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem', display: 'block' }}>Requirements</label>
            <textarea className="input sm glass-indicator" placeholder="Min 5k followers, Tech niche preferred..." value={requirements} onChange={e => setRequirements(e.target.value)}
              rows={3} style={{ width: '100%', padding: '1rem', background: 'var(--surface-alt)', border: '1px solid var(--border)', borderRadius: '16px', color: 'var(--text-primary)', resize: 'none', outline: 'none' }} />
          </div>
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

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', justifyContent: editData ? 'space-between' : 'flex-end', width: '100%' }}>
          {editData && (
            <LiquidButton variant="secondary" onClick={onCancelEdit || onClose} disabled={loading}
              style={{ padding: '0.5rem 1.5rem', display: 'flex', justifyContent: 'center', flex: '0 0 auto' }}>
              Cancel
            </LiquidButton>
          )}
          <LiquidButton variant="primary" onClick={handleSubmit}
            disabled={loading || (!content.trim() && mediaFiles.length === 0)}
            style={{ padding: '0.5rem 1.5rem', display: 'flex', justifyContent: 'center', flex: editData ? '0 0 auto' : 1, minWidth: editData ? '120px' : undefined, width: editData ? 'auto' : '100%' }}>
            {loading ? (editData ? 'Saving...' : 'Publishing...') : (
              editData ? <><Check size={16} style={{marginRight:'0.5rem'}}/> Save</> : <><Send size={16} style={{marginRight:'0.5rem'}}/> Publish</>
            )}
          </LiquidButton>
        </div>
      </div>
    </div>
  );
}
