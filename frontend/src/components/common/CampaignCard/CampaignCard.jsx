import React, { useState, useEffect } from 'react';
import { Heart, MessageCircle, Share2, Bookmark, Send } from 'lucide-react';
import api from '../../../services/api';
import { resolveAssetUrl, getItemId } from '../../../utils/helpers';
import { useAuth } from '../../../context/AuthContext';
import '../PostCard/PostCard.css';

export default function CampaignCard({ campaign, applied, onApply, saved, onSave, onClick, currentUserId, onViewBrand }) {
  const { user } = useAuth();
  const [isSaved, setIsSaved] = useState(saved || false);
  const [likes, setLikes] = useState(campaign.likes || []);
  const [comments, setComments] = useState(campaign.comments || []);
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  
  const campaignId = getItemId(campaign);
  const isLiked = likes.includes(currentUserId);
  const isAuthor = campaign.author?._id === currentUserId;

  useEffect(() => {
    setIsSaved(saved);
  }, [saved]);

  const handleSave = (e) => {
    e.stopPropagation();
    setIsSaved(!isSaved);
    if (onSave) onSave(campaign);
  };

  const handleApplyClick = (e) => {
    e.stopPropagation();
    onApply();
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim() || isSubmittingComment) return;

    try {
      setIsSubmittingComment(true);
      const resp = await api.commentOnCampaign(campaignId, newComment);
      if (resp.success) {
        setComments(resp.comments);
        setNewComment('');
      }
    } catch (e) {
      console.error('Comment error:', e);
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleLike = async (e) => {
    e.stopPropagation();
    try {
      const resp = await api.likeCampaign(campaignId);
      if (resp.success) {
        setLikes(resp.likes);
      }
    } catch (e) {
      console.error('Like error:', e);
    }
  };

  const handleShare = (e) => {
    e.stopPropagation();
    const shareUrl = `${window.location.origin}/campaign/${campaignId}`;
    if (navigator.share) {
      navigator.share({
        title: campaign.title,
        text: campaign.description,
        url: shareUrl,
      }).catch(console.error);
    } else {
      navigator.clipboard.writeText(shareUrl);
      alert('Link copied to clipboard!');
    }
  };

  // Banned campaigns: hide from non-authors entirely; show only the admin ban notice to the author
  if (campaign.blocked && !isAuthor) return null;

  // Author of a banned campaign sees only the removal notice
  if (campaign.blocked && isAuthor) {
    return (
      <div className="post-card" style={{ marginBottom: '1.5rem', padding: '1rem' }}>
        <div style={{
          background: '#ff6b6b1a',
          border: '1px solid #ff6b6b',
          borderRadius: '8px',
          padding: '1rem',
          color: '#ff6b6b'
        }}>
          <strong>⚠️ Campaign Removed by Admin</strong>
          <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.875rem' }}>
            Your campaign was removed for not meeting community standards and is no longer visible to others.
          </p>
          {campaign.blockedReason && (
            <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.75rem', opacity: 0.8 }}>
              Admin reason: {campaign.blockedReason}
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="post-card glass-panel" style={{ marginBottom: '1.5rem', position: 'relative', cursor: 'pointer' }} onClick={onClick}>
      <div className="post-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '1.25rem 1.25rem 0' }}>
        <div 
          style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}
          onClick={(e) => {
            e.stopPropagation();
            if (onViewBrand && campaign.author?._id) onViewBrand(campaign.author._id);
          }}
          className="brand-link"
        >
          <div className="post-avatar">
            {campaign.author?.avatar 
              ? <img src={resolveAssetUrl(campaign.author.avatar)} alt="Avatar" /> 
              : (campaign.brandName?.[0] || campaign.author?.name?.[0] || 'B')}
          </div>
          <div className="post-author-info">
            <h4 style={{ margin: 0, fontSize: '1rem' }}>{campaign.brandName}</h4>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Brand • {campaign.category}</span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <span className={`badge ${campaign.type === 'paid' ? 'badge-paid' : 'badge-free'}`} style={{ alignSelf: 'center' }}>
            {campaign.type === 'paid' ? '💰 Paid' : '🎁 Free'}
          </span>
          <button 
            className="action-btn-bubble glass-indicator" 
            onClick={handleSave}
            title={isSaved ? "Saved" : "Save for later"}
            style={{ color: isSaved ? 'var(--primary)' : 'var(--text-muted)', border: 'none', cursor: 'pointer', display: 'flex' }}
          >
            <Bookmark size={18} fill={isSaved ? 'currentColor' : 'none'} />
          </button>
        </div>
      </div>

      {/* Campaign Details */}
      <div className="post-content" style={{ margin: '1rem 0', padding: '0 1.25rem' }}>
        <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem', color: 'var(--text)', fontWeight: 'bold' }}>{campaign.title}</h3>
        <p style={{ fontSize: '0.95rem', lineHeight: '1.6', color: 'var(--text-secondary)', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {campaign.description}
        </p>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', padding: '0 1.25rem' }}>
         <div className="collab-budget">
            <div style={{ fontSize: '1.1rem', fontWeight: 'bold', color: 'var(--text)' }}>
              {campaign.type === 'paid' ? `₹${(campaign.budget || 0).toLocaleString()}` : 'Free Collab'}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--accent)' }}>
              Fee: {campaign.coinCost || 0} 🪙
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <button 
              onClick={(e) => { e.stopPropagation(); setShowComments(!showComments); }}
              style={{ padding: '0.5rem 1.25rem', background: 'var(--surface-alt)', color: 'var(--text-primary)', border: '1px solid var(--border)', borderRadius: 'var(--radius-pill)', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s' }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--accent-light)'; e.currentTarget.style.color = 'white'; e.currentTarget.style.borderColor = 'var(--accent-light)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--surface-alt)'; e.currentTarget.style.color = 'var(--text-primary)'; e.currentTarget.style.borderColor = 'var(--border)'; }}
            >
              Collab
            </button>
            {!applied ? (
              <button 
                onClick={handleApplyClick}
                style={{ padding: '0.5rem 1.25rem', background: 'var(--primary)', color: 'white', border: 'none', borderRadius: 'var(--radius-pill)', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 4px 12px rgba(var(--primary-rgb), 0.3)' }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
              >
                Apply Now
              </button>
            ) : (
               <span style={{ padding: '0.5rem 1rem', background: 'var(--success)', color: 'white', borderRadius: 'var(--radius-pill)', fontSize: '0.875rem', fontWeight: '600' }}>
                 ✓ Applied
               </span>
            )}
          </div>
      </div>

      {/* Social Engagement Section - Matching Image */}
      <div className="social-engagement" style={{ marginTop: '0.5rem', borderTop: '1px solid var(--border-light)', padding: '0.5rem 1.25rem 1.25rem' }}>
        {/* Counts Row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
          <span>{likes.length} Likes</span>
          <span>{campaign.comments?.length || 0} Comments</span>
        </div>

        {/* Separator Line */}
        <div style={{ height: '1px', background: 'var(--border-light)', margin: '0 0 0.5rem 0' }} />

        {/* Action Buttons Row */}
        <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center' }}>
          <button 
            className={`social-action-btn ${isLiked ? 'active' : ''}`}
            onClick={handleLike}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'none', border: 'none', color: isLiked ? 'var(--danger)' : 'var(--text-secondary)', cursor: 'pointer', padding: '8px 12px', borderRadius: '8px', transition: 'all 0.2s', fontWeight: '500' }}
          >
            <Heart size={20} fill={isLiked ? 'currentColor' : 'none'} />
            <span>Like</span>
          </button>

          <button 
            className="social-action-btn"
            onClick={(e) => { 
               e.stopPropagation(); 
               setShowComments(!showComments); 
            }}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: '8px 12px', borderRadius: '8px', transition: 'all 0.2s', fontWeight: '500' }}
          >
            <MessageCircle size={20} />
            <span>Comment</span>
          </button>

          <button 
            className="social-action-btn"
            onClick={handleShare}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: '8px 12px', borderRadius: '8px', transition: 'all 0.2s', fontWeight: '500' }}
          >
            <Share2 size={20} />
            <span>Share</span>
          </button>
        </div>
      </div>

      {showComments && (
        <div className="post-comments-section" onClick={(e) => e.stopPropagation()} style={{ marginTop: '1rem', borderTop: '1px solid var(--border-light)', paddingTop: '1rem' }}>
          <div className="comments-list" style={{ maxHeight: '200px', overflowY: 'auto', marginBottom: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {comments.map((comment, i) => (
              <div key={i} className="comment-item" style={{ display: 'flex', gap: '0.75rem' }}>
                <div className="comment-avatar" style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--surface-alt)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0 }}>
                  {comment.user?.avatar
                    ? <img src={resolveAssetUrl(comment.user.avatar)} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : <span style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>{comment.user?.name?.[0]}</span>}
                </div>
                <div className="comment-bubble" style={{ background: 'var(--surface-alt)', backdropFilter: 'blur(8px)', padding: '0.75rem 1rem', borderRadius: '0 16px 16px 16px', fontSize: '0.9rem', border: '1px solid var(--border)' }}>
                  <strong style={{ display: 'block', fontSize: '0.8125rem', marginBottom: '0.25rem', color: 'var(--text-primary)' }}>{comment.user?.name}</strong>
                  <p style={{ margin: 0, color: 'var(--text-muted)' }}>{comment.text}</p>
                </div>
              </div>
            ))}
            {comments.length === 0 && (
              <div style={{ textAlign: 'center', padding: '1rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                No comments yet. Be the first to comment!
              </div>
            )}
          </div>
          <form className="comment-form" onSubmit={handleComment} onClick={(e) => e.stopPropagation()}>
            <div className="comment-avatar me">
              {user?.avatar ? <img src={resolveAssetUrl(user.avatar)} alt="Avatar" /> : user?.name?.[0]}
            </div>
            <input
              type="text"
              placeholder="Write a comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              style={{ flex: 1, padding: '0.75rem 1.25rem', borderRadius: '20px', border: '1px solid var(--border)', background: 'var(--surface-alt)', color: 'var(--text-primary)', outline: 'none', backdropFilter: 'blur(10px)' }}
            />
            <button type="submit" disabled={!newComment.trim() || isSubmittingComment}>
              <Send size={16} />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
