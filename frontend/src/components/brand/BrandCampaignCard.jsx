import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, MessageCircle, Share2, Send, MoreVertical, Edit2, Trash2 } from 'lucide-react';
import CreateCampaign from './CreateCampaign';
import LiquidButton from '../common/LiquidButton/LiquidButton';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import '../common/PostCard/PostCard.css';

export default function BrandCampaignCard({ campaign, onCampaignUpdated, onCampaignDeleted, onJumpToCampaign }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [likes, setLikes] = useState(campaign.likes || []);
  const [comments, setComments] = useState(campaign.comments || []);
  const [brokenMedia, setBrokenMedia] = useState([]);
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [isLiking, setIsLiking] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const isLiked = user && likes.includes(user.id || user._id);
  const isAuthor = user && campaign.author && (user.id === campaign.author._id || user._id === campaign.author._id);

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this campaign?')) {
      try {
        await api.deleteCampaign(campaign._id);
        if (onCampaignDeleted) onCampaignDeleted(campaign._id);
      } catch (err) {
        console.error('Delete error', err);
        alert('Failed to delete campaign');
      }
    }
  };

  const handleLike = async () => {
    if (isLiking) return;
    setIsLiking(true);
    try {
      const res = await api.likeCampaign(campaign._id);
      setLikes(res.likes);
      if (onCampaignUpdated) onCampaignUpdated({ ...campaign, likes: res.likes });
    } catch (err) {
      console.error(err);
    } finally {
      setIsLiking(false);
    }
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    try {
      const res = await api.commentOnCampaign(campaign._id, newComment);
      setComments(res.comments);
      setNewComment('');
      if (onCampaignUpdated) onCampaignUpdated({ ...campaign, comments: res.comments });
    } catch (err) {
      console.error(err);
    }
  };

  const markMediaBroken = (index) => {
    setBrokenMedia((prev) => (prev.includes(index) ? prev : [...prev, index]));
  };

  return (
    <div className="post-card glass-panel">
      <div className="post-header">
        <div className="post-avatar" onClick={() => navigate(`/profile/${campaign.author?._id}`)} style={{ cursor: 'pointer' }}>
          {campaign.author?.avatar
            ? <img src={campaign.author.avatar.startsWith('http') ? campaign.author.avatar : `http://localhost:5000${campaign.author.avatar}`} alt="Avatar" />
            : campaign.author?.name?.[0]}
        </div>
        <div className="post-author-info">
          <h4>{campaign.author?.name}</h4>
          <span>{new Date(campaign.createdAt).toLocaleDateString()} at {new Date(campaign.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
        </div>
        {isAuthor && (
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ position: 'relative' }}>
              <button className="action-btn" onClick={() => setShowDropdown(!showDropdown)} style={{ padding: '0.25rem' }}>
                <MoreVertical size={16} />
              </button>
              {showDropdown && (
                <div style={{ position: 'absolute', right: 0, top: '100%', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '0.5rem', zIndex: 10, boxShadow: '0 4px 12px rgba(0,0,0,0.1)', display: 'flex', flexDirection: 'column', gap: '0.5rem', minWidth: '120px' }}>
                  <button type="button" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'transparent', border: 'none', color: 'var(--text)', cursor: 'pointer', textAlign: 'left', padding: '0.25rem 0.5rem' }} onClick={() => { setIsEditing(true); setShowDropdown(false); }}>
                    <Edit2 size={14} /> Edit
                  </button>
                  <button type="button" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'transparent', border: 'none', color: 'var(--danger)', cursor: 'pointer', textAlign: 'left', padding: '0.25rem 0.5rem' }} onClick={() => { handleDelete(); setShowDropdown(false); }}>
                    <Trash2 size={14} /> Delete
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="post-content" style={{ marginTop: '0.5rem' }}>
        {isEditing ? (
          <CreateCampaign
            editData={campaign}
            onCancelEdit={() => setIsEditing(false)}
            onCampaignCreated={(updated) => {
              setIsEditing(false);
              if (onCampaignUpdated) onCampaignUpdated(updated);
            }}
          />
        ) : (
          <>
            {campaign.title && (
              <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.1rem', fontWeight: '600' }}>{campaign.title}</h3>
            )}
            <p>{campaign.content}</p>
            {campaign.tags && campaign.tags.length > 0 && (
              <div className="post-tags" style={{ marginTop: '0.5rem' }}>
                {campaign.tags.map((tag, i) => <span key={i}>#{tag}</span>)}
              </div>
            )}
            {campaign.budget && (
              <div className="announcement-campaign-details glass-indicator" style={{
                marginTop: '1rem', padding: '1.25rem',
                border: '1.5px solid rgba(255, 255, 255, 0.1) !important',
                background: 'rgba(255, 255, 255, 0.05) !important',
                fontSize: '0.9rem', color: 'var(--text-primary)'
              }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.75rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontSize: '1.1rem' }}>💰</span>
                    <div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Budget</div>
                      <div style={{ fontWeight: '600' }}>₹{campaign.budget?.toLocaleString()}</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontSize: '1.1rem' }}>🏷️</span>
                    <div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Category</div>
                      <div style={{ fontWeight: '600' }}>{campaign.category}</div>
                    </div>
                  </div>
                  {campaign.startDate && campaign.endDate && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ fontSize: '1.1rem' }}>📅</span>
                      <div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Timeline</div>
                        <div style={{ fontWeight: '600', fontSize: '0.8rem' }}>
                          {new Date(campaign.startDate).toLocaleDateString()} – {new Date(campaign.endDate).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  )}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontSize: '1.1rem' }}>🎁</span>
                    <div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Compensation</div>
                      <div style={{ fontWeight: '600', textTransform: 'capitalize' }}>{campaign.compensation}</div>
                    </div>
                  </div>
                </div>

                {campaign.deliverables && campaign.deliverables.length > 0 && (
                  <div style={{ marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border)' }}>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Deliverables</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                      {campaign.deliverables.map((d, i) => (
                        <span key={i} className="glass-indicator" style={{ padding: '0.3rem 0.75rem', fontSize: '0.75rem', fontWeight: 600 }}>{d}</span>
                      ))}
                    </div>
                  </div>
                )}

                {campaign.requirements && (
                  <div style={{ marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border)' }}>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Requirements</div>
                    <div style={{ fontSize: '0.85rem', lineHeight: '1.4' }}>{campaign.requirements}</div>
                  </div>
                )}

                <div style={{ marginTop: '1rem' }}>
                  <LiquidButton variant="primary" style={{ width: '100%', padding: '0.6rem' }}
                    onClick={() => onJumpToCampaign?.(campaign._id)}>
                    View Applications
                  </LiquidButton>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {!isEditing && campaign.media && campaign.media.length > 0 && (
        <div className={`post-media grid-${Math.min(campaign.media.length, 4)}`}>
          {campaign.media.map((media, i) => {
            if (brokenMedia.includes(i)) return null;
            const src = media.url.startsWith('http') ? media.url : `http://localhost:5000${media.url}`;
            return (
              <div key={i} className="media-wrapper">
                {media.type === 'video' ? (
                  <video src={src} controls onError={() => markMediaBroken(i)} />
                ) : media.type === 'audio' ? (
                  <audio src={src} controls onError={() => markMediaBroken(i)} />
                ) : (
                  <img src={src} alt="Campaign media" onError={() => markMediaBroken(i)} />
                )}
              </div>
            );
          })}
        </div>
      )}

      <div className="post-stats">
        <span>{likes.length} Likes</span>
        <span>{comments.length} Comments</span>
      </div>

      <div className="post-actions">
        <button className={`action-btn ${isLiked ? 'liked' : ''}`} onClick={handleLike}>
          <Heart size={20} fill={isLiked ? 'currentColor' : 'none'} />
          <span>Like</span>
        </button>
        <button className="action-btn" onClick={() => setShowComments(!showComments)}>
          <MessageCircle size={20} />
          <span>Comment</span>
        </button>
        <button className="action-btn" onClick={() => {
          const shareUrl = `${window.location.origin}/profile/${campaign.author?._id}`;
          if (navigator.share) {
            navigator.share({ title: `Campaign by ${campaign.author?.name}`, url: shareUrl });
          } else {
            navigator.clipboard.writeText(shareUrl);
            alert('Profile link copied to clipboard!');
          }
        }}>
          <Share2 size={20} />
          <span>Share</span>
        </button>
      </div>

      {showComments && (
        <div className="post-comments-section">
          <div className="comments-list">
            {comments.map((comment, i) => (
              <div key={i} className="comment-item">
                <div className="comment-avatar">
                  {comment.user?.avatar
                    ? <img src={comment.user.avatar.startsWith('http') ? comment.user.avatar : `http://localhost:5000${comment.user.avatar}`} alt="Avatar" />
                    : comment.user?.name?.[0]}
                </div>
                <div className="comment-bubble glass-indicator" style={{ background: 'rgba(255, 255, 255, 0.05)', backdropFilter: 'blur(8px)', padding: '0.75rem 1.25rem', borderRadius: '0 16px 16px 16px', fontSize: '0.9rem', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                  <strong style={{ display: 'block', fontSize: '0.8125rem', marginBottom: '0.25rem', color: 'var(--text-primary)' }}>{comment.user?.name}</strong>
                  <p style={{ margin: 0, color: 'var(--text-muted)' }}>{comment.text}</p>
                </div>
              </div>
            ))}
          </div>
          <form className="comment-form" onSubmit={handleComment}>
            <div className="comment-avatar me">
              {user?.avatar ? <img src={user.avatar} alt="Avatar" /> : user?.name?.[0]}
            </div>
            <input
              type="text"
              placeholder="Write a comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              style={{ flex: 1, padding: '0.75rem 1.25rem', borderRadius: '20px', border: '1px solid rgba(255, 255, 255, 0.1)', background: 'rgba(255, 255, 255, 0.05)', color: 'var(--text-primary)', outline: 'none', backdropFilter: 'blur(10px)' }}
            />
            <button type="submit" disabled={!newComment.trim()}>
              <Send size={16} />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
