import React, { useState, useRef } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { Image, Video, Music, Smile, X, Send, Film, Check } from 'lucide-react';
import LiquidButton from '../LiquidButton/LiquidButton';
import api from '../../../services/api';
import { resolveAssetUrl } from '../../../utils/helpers';
import { serializePostPayload } from '../../../features/influencer/postSerializer';
import EmojiPicker from 'emoji-picker-react';
import './CreatePost.css';

export default function CreatePost({ onPostCreated, editData, onCancelEdit }) {
  const { user } = useAuth();
  const [content, setContent] = useState('');
  const [mediaFiles, setMediaFiles] = useState([]);
  const [tags, setTags] = useState('');
  const [loading, setLoading] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const imageRef = useRef(null);
  const videoRef = useRef(null);
  const audioRef = useRef(null);
  const gifRef = useRef(null);

  React.useEffect(() => {
    if (editData) {
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
    }
  }, [editData]);

  const handleMediaSelect = (e, ref) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      if (filesArray.length + mediaFiles.length > 4) {
        alert('You can only upload up to 4 media files at once.');
        return;
      }
      const newMediaFiles = filesArray.map(file => ({
        file,
        preview: URL.createObjectURL(file),
        type: file.type.split('/')[0]
      }));
      setMediaFiles(prev => [...prev, ...newMediaFiles]);
    }
    // reset file input
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
      const formData = serializePostPayload(content, mediaFiles, tags);

      if (editData) {
        const updatedPost = await api.updatePost(editData._id, formData);
        if (onPostCreated) onPostCreated(updatedPost); // acts as onPostUpdated here
      } else {
        const newPost = await api.createPost(formData);
        setContent('');
        setMediaFiles([]);
        setTags('');
        if (onPostCreated) onPostCreated(newPost);
      }
    } catch (err) {
      console.error(err);
      alert('Failed to save post: ' + (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-post-container glass-panel">
      <div className="create-post-header" style={{ position: 'relative' }}>
        <div className="create-post-avatar">
          {user?.avatar ? <img src={resolveAssetUrl(user.avatar)} alt="Avatar" /> : user?.name?.[0] || 'U'}
        </div>
        <textarea 
          placeholder="What's on your mind? Share your update..." 
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="create-post-input"
          rows={3}
        />
        {showEmojiPicker && (
          <div style={{ position: 'absolute', zIndex: 10, left: '0', top: 'calc(100% + 5px)' }}>
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

          <button type="button" className="action-btn" title="Add Image" onClick={() => imageRef.current?.click()}>
            <Image size={18} />
          </button>
          <button type="button" className="action-btn" title="Add Video" onClick={() => videoRef.current?.click()}>
            <Video size={18} />
          </button>
          <button type="button" className="action-btn" title="Add Audio" onClick={() => audioRef.current?.click()}>
            <Music size={18} />
          </button>
          <button type="button" className="action-btn" title="Add GIF" onClick={() => gifRef.current?.click()}>
            <Film size={18} />
          </button>
          <button type="button" className="action-btn" title="Add Emoji" onClick={() => setShowEmojiPicker(!showEmojiPicker)}>
            <Smile size={18} />
          </button>
          <input 
            type="text" 
            placeholder="Tags (comma separated)" 
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            className="tags-input"
          />
        </div>
        
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', width: '100%' }}>
          {editData && (
            <LiquidButton 
              variant="secondary" 
              onClick={onCancelEdit} 
              disabled={loading}
              style={{ padding: '0.5rem 1.5rem', display: 'flex', justifyContent: 'center' }}
            >
              Cancel
            </LiquidButton>
          )}
          <LiquidButton 
            variant="primary" 
            onClick={handleSubmit} 
            disabled={loading || (!content.trim() && mediaFiles.length === 0)}
            style={{ padding: '0.5rem 1.5rem', display: 'flex', justifyContent: 'center', flex: 1, width: '100%' }}
          >
            {loading ? (editData ? 'Saving...' : 'Posting...') : (
              <>
                {editData ? <><Check size={16} style={{marginRight:'0.5rem'}}/> Save</> : <><Send size={16} style={{marginRight:'0.5rem'}}/> Post</>}
              </>
            )}
          </LiquidButton>
        </div>

      </div>
    </div>
  );
}
