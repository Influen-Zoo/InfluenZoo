import { useState, useCallback, useEffect } from 'react';
import influencerService from '../../services/influencer.service';

export const useInfluencerMessages = (user, activeTab, initialConvId, showToast) => {
  const [conversations, setConversations] = useState([]);
  const [chatMessages, setChatMessages] = useState([]);
  const [selectedConvId, setSelectedConvId] = useState(initialConvId || null);
  const [replyText, setReplyText] = useState('');

  const loadConversations = useCallback(async () => {
    try {
      const data = await influencerService.getConversations();
      setConversations(data);
    } catch (e) {
      console.error('Error loading conversations:', e);
    }
  }, []);

  const loadMessages = useCallback(async (convId) => {
    if (!convId) return;
    try {
      const data = await influencerService.getMessages(convId);
      setChatMessages(data);
    } catch (e) {
      console.error('Error loading messages:', e);
    }
  }, []);

  const handleSendMessage = async (e, forcedText) => {
    if (e && e.preventDefault) e.preventDefault();
    const textToSend = forcedText || replyText;
    if (!textToSend?.trim() || !selectedConvId) return;
    try {
      const newMsg = await influencerService.sendMessage(selectedConvId, textToSend);
      setChatMessages(prev => [...prev, newMsg]);
      setReplyText('');
      loadConversations();
    } catch (e) {
      showToast('Error sending message', 'danger');
    }
  };

  useEffect(() => {
    if (user && activeTab === 'chat') {
      loadConversations();
    }
  }, [user, activeTab, loadConversations]);

  useEffect(() => {
    if (activeTab === 'chat' && selectedConvId) {
      loadMessages(selectedConvId);
      const interval = setInterval(() => loadMessages(selectedConvId), 5000);
      return () => clearInterval(interval);
    }
  }, [activeTab, selectedConvId, loadMessages]);

  return {
    conversations,
    chatMessages,
    selectedConvId,
    setSelectedConvId,
    replyText,
    setReplyText,
    handleSendMessage,
    loadConversations,
    loadMessages
  };
};

export default useInfluencerMessages;
