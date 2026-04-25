import React from 'react';

import { resolveAssetUrl } from '../../../utils/helpers';

export default function ChatTab({ 
  selectedConvId, 
  setSelectedConvId, 
  loadingConv, 
  conversations, 
  user, 
  chatMessages, 
  replyText, 
  setReplyText, 
  handleSendMessage 
}) {
  return (
    <div className="tab-pane chat-dashboard-container" style={{ animation: 'fadeIn 0.3s ease', marginTop: '0' }}>
      <div className="chat-layout">
        {/* Sidebar */}
        <div className={`chat-sidebar ${selectedConvId ? 'hide-mobile' : ''}`}>
          <div className="chat-sidebar-header">
            <h3>Messages</h3>
          </div>
          <div className="conversation-list">
            {loadingConv ? (
              <div style={{ padding: '2rem', textAlign: 'center' }}><div className="spinner" /></div>
            ) : conversations.length === 0 ? (
              <div className="empty-chat-state">
                <div className="empty-chat-icon">📭</div>
                <p>You haven't started any chats yet. Browse influencers to initiate contact.</p>
              </div>
            ) : conversations.map(conv => {
              const otherUser = conv.participants.find(p => p._id !== user._id);
              return (
                <div 
                  key={conv._id} 
                  className={`conversation-item ${selectedConvId === conv._id ? 'active' : ''}`}
                  onClick={() => setSelectedConvId(conv._id)}
                >
                  <div className="conv-avatar">
                    {otherUser?.avatar ? <img src={resolveAssetUrl(otherUser.avatar)} alt={otherUser?.name} /> : otherUser?.name?.[0]}
                  </div>
                  <div className="conv-info">
                    <div className="conv-name-row">
                      <span className="conv-name">{otherUser?.name}</span>
                      <span className="conv-time">{new Date(conv.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <p className="conv-last-msg">{conv.lastMessage?.text || 'New conversation'}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Chat Window */}
        <div className={`chat-window ${!selectedConvId ? 'hide-mobile' : ''}`}>
          {selectedConvId ? (
            <>
              <div className="chat-window-header">
                <button className="back-btn show-mobile" onClick={() => setSelectedConvId(null)}>←</button>
                <div className="chat-header-user">
                  <div className="avatar sm">
                    {resolveAssetUrl(conversations.find(c => c._id === selectedConvId)?.participants.find(p => p._id !== user._id)?.avatar) ? 
                      <img src={resolveAssetUrl(conversations.find(c => c._id === selectedConvId)?.participants.find(p => p._id !== user._id)?.avatar)} alt="" /> : 
                      conversations.find(c => c._id === selectedConvId)?.participants.find(p => p._id !== user._id)?.name?.[0]
                    }
                  </div>
                  <div>
                    <h4>{conversations.find(c => c._id === selectedConvId)?.participants.find(p => p._id !== user._id)?.name}</h4>
                    <span className="status-online">Online</span>
                  </div>
                </div>
              </div>
              
              <div className="chat-messages">
                {chatMessages.map((msg, i) => (
                  <div key={msg._id || i} className={`message-bubble-wrapper ${msg.sender === user._id ? 'sent' : 'received'}`}>
                    <div className="message-bubble">
                      {msg.text}
                      <span className="msg-time">{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </div>
                ))}
              </div>

              <form className="chat-input-area" onSubmit={handleSendMessage}>
                <input 
                  className="input" 
                  placeholder="Type a message..." 
                  value={replyText}
                  onChange={e => setReplyText(e.target.value)}
                />
                <button type="submit" className="btn-send-chat" disabled={!replyText.trim()}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20"><path d="m22 2-7 20-4-9-9-4 20-7z"/><path d="M22 2 11 13"/></svg>
                </button>
              </form>
            </>
          ) : (
            <div className="chat-empty-view">
              <div className="chat-empty-icon">💬</div>
              <h3>Your Messages</h3>
              <p>Select a conversation from the sidebar to continue chatting.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
