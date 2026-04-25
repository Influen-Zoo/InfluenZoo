import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, MessageCircle, Share2, Send, MoreVertical, Edit2, Trash2 } from 'lucide-react';
import CreatePost from '../CreatePost/CreatePost';

import { useAuth } from '../../../context/AuthContext';
import api from '../../../services/api';
import './PostCard.css';

export default function PostCard({ post, onPostUpdated, onPostDeleted, onViewProfile }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [likes, setLikes] = useState(post.likes || []);
  const [comments, setComments] = useState(post.comments || []);
  const [brokenMedia, setBrokenMedia] = useState([]);
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [isLiking, setIsLiking] = useState(false);

  const [isEditing, setIsEditing] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const isLiked = user && likes.includes(user.id || user._id);
  const isAuthor = user && post.author && (user.id === post.author._id || user._id === post.author._id);

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      try {
        await api.deletePost(post._id);
        if (onPostDeleted) onPostDeleted(post._id);
      } catch (err) {
        console.error('Delete error', err);
        alert('Failed to delete post');
      }
    }
  };

  const handleLike = async () => {
    if (isLiking) return;
    setIsLiking(true);
    try {
      const res = await api.likePost(post._id);
      setLikes(res.likes);
      if (onPostUpdated) onPostUpdated({ ...post, likes: res.likes });
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
      const res = await api.commentOnPost(post._id, newComment);
      setComments(res.comments);
      setNewComment('');
      if (onPostUpdated) onPostUpdated({ ...post, comments: res.comments });
    } catch (err) {
      console.error(err);
    }
  };

  const markMediaBroken = (index) => {
    setBrokenMedia((prev) => (prev.includes(index) ? prev : [...prev, index]));
  };

  // Banned posts: completely hide from non-authors; show only the ban notice to the author
  if (post.blocked && !isAuthor) return null;

  return (
    <div className="post-card glass-panel">
      {post.blocked && isAuthor && (
        <div style={{
          background: '#ff6b6b1a',
          border: '1px solid #ff6b6b',
          borderRadius: '8px',
          padding: '1rem',
          color: '#ff6b6b'
        }}>
          <strong>⚠️ Post Removed by Admin</strong>
          <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.875rem' }}>
            Your post was removed for not meeting community standards and is no longer visible to others.
          </p>
          {post.blockedReason && (
            <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.75rem', opacity: 0.8 }}>
              Admin reason: {post.blockedReason}
            </p>
          )}
        </div>
      )}
      <div className="post-header">
        <div 
          className="post-avatar" 
          onClick={() => {
            if (onViewProfile && post.author?._id) onViewProfile(post.author._id);
            else navigate(`/profile/${post.author?._id}`);
          }} 
          style={{ cursor: 'pointer' }}
        >
          {post.author?.avatar ? <img src={post.author.avatar.startsWith('http') ? post.author.avatar : `http://localhost:5000${post.author.avatar}`} alt="Avatar" /> : post.author?.name?.[0]}
        </div>
        <div className="post-author-info">
          <h4>{post.author?.name}</h4>
          <span>{new Date(post.createdAt).toLocaleDateString()} at {new Date(post.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
        </div>
        {isAuthor && (
          <div style={{ marginLeft: 'auto', position: 'relative' }}>
            <button className="action-btn" onClick={() => setShowDropdown(!showDropdown)} style={{ padding: '0.25rem' }}>
              <MoreVertical size={16} />
            </button>
            {showDropdown && (
              <div style={{ position: 'absolute', right: 0, top: '100%', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '0.5rem', zIndex: 10, boxShadow: '0 4px 12px rgba(0,0,0,0.1)', display: 'flex', flexDirection: 'column', gap: '0.5rem', minWidth: '120px' }}>
                <button type="button" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'transparent', border: 'none', color: 'var(--text)', cursor: 'pointer', textAlign: 'left', padding: '0.25rem 0.5rem' }} onClick={() => { setIsEditing(!isEditing); setShowDropdown(false); }}>
                  <Edit2 size={14} /> Edit
                </button>
                <button type="button" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'transparent', border: 'none', color: 'var(--danger)', cursor: 'pointer', textAlign: 'left', padding: '0.25rem 0.5rem' }} onClick={() => { handleDelete(); setShowDropdown(false); }}>
                  <Trash2 size={14} /> Delete
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="post-content" style={{ marginTop: '0.5rem' }}>
        {isEditing ? (
          <CreatePost 
            editData={post} 
            onCancelEdit={() => setIsEditing(false)} 
            onPostCreated={(updatedPost) => {
              setIsEditing(false);
              if (onPostUpdated) onPostUpdated(updatedPost);
            }} 
          />
        ) : (
          <>
            <p>{post.content}</p>
            {post.tags && post.tags.length > 0 && (
              <div className="post-tags" style={{ marginTop: '0.5rem' }}>
                {post.tags.map((tag, i) => <span key={i}>#{tag}</span>)}
              </div>
            )}
          </>
        )}
      </div>


      {!isEditing && post.media && post.media.length > 0 && (
        <div className={`post-media grid-${Math.min(post.media.length, 4)}`}>
          {post.media.map((media, i) => {
            if (brokenMedia.includes(i)) {
              return null;
            }

            const src = media.url.startsWith('http') ? media.url : `http://localhost:5000${media.url}`;
            return (
              <div key={i} className="media-wrapper">
                {media.type === 'video' ? (
                  <video src={src} controls onError={() => markMediaBroken(i)} />
                ) : media.type === 'audio' ? (
                  <audio src={src} controls onError={() => markMediaBroken(i)} />
                ) : (
                  <img src={src} alt="Post media" onError={() => markMediaBroken(i)} />
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
          <Heart size={20} fill={isLiked ? "currentColor" : "none"} />
          <span>Like</span>
        </button>
        <button className="action-btn" onClick={() => setShowComments(!showComments)}>
          <MessageCircle size={20} />
          <span>Comment</span>
        </button>
        <button className="action-btn" onClick={() => {
          const shareUrl = `${window.location.origin}/profile/${post.author?._id}`;
          const shareText = `Check out this post by ${post.author?.name}!`;
          
          if (onViewProfile && post.author?._id) {
            onViewProfile(post.author._id);
            return;
          }

          if (navigator.share) {
            navigator.share({ title: shareText, url: shareUrl });
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
                   {comment.user?.avatar ? <img src={comment.user.avatar.startsWith('http') ? comment.user.avatar : `http://localhost:5000${comment.user.avatar}`} alt="Avatar" /> : comment.user?.name?.[0]}
                </div>
                <div className="comment-bubble">
                  <strong>{comment.user?.name}</strong>
                  <p>{comment.text}</p>
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
