import React from 'react';
import { useOutletContext } from 'react-router-dom';
import ChatTab from '../../components/brand/tabs/ChatTab';

export const BrandChatPage = () => {
  const { 
    conversations, 
    selectedConvId, 
    setSelectedConvId, 
    chatMessages, 
    handleSendMessage,
    loadingConv,
    user,
    replyText,
    setReplyText
  } = useOutletContext();

  return (
    <div className="tab-container" style={{ height: 'calc(100vh - 120px)' }}>
      <ChatTab 
        conversations={conversations}
        selectedConvId={selectedConvId}
        setSelectedConvId={setSelectedConvId}
        chatMessages={chatMessages}
        handleSendMessage={handleSendMessage}
        loadingConv={loadingConv}
        user={user}
        replyText={replyText}
        setReplyText={setReplyText}
      />
    </div>
  );
};

export default BrandChatPage;
