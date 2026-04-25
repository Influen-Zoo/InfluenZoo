import { useEffect, useMemo, useRef, useState } from 'react';
import LiquidButton from '../LiquidButton/LiquidButton';
import api from '../../../services/api';
import { getAssistantCopy, createWelcomeMessage } from '../../../features/common/chatAssistantProcessor';
import './AiChatbot.css';

export default function AiChatbot({ role = 'influencer' }) {
  const copy = useMemo(() => getAssistantCopy(role), [role]);
  const [messages, setMessages] = useState(() => [createWelcomeMessage(role)]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const messageEndRef = useRef(null);

  useEffect(() => {
    setMessages([createWelcomeMessage(role)]);
  }, [role]);

  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const submitMessage = async (rawValue) => {
    const value = rawValue.trim();
    if (!value || loading) return;

    const nextMessages = [...messages, { role: 'user', content: value }];
    setMessages(nextMessages);
    setInput('');
    setError('');
    setLoading(true);

    try {
      const data = await api.chat(nextMessages);
      setMessages([...nextMessages, { role: 'assistant', content: data.reply }]);
    } catch (err) {
      setMessages(nextMessages);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    await submitMessage(input);
  };

  const handleKeyDown = async (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      await submitMessage(input);
    }
  };

  return (
    <div className="ai-chatbot-card">
      <div className="ai-chatbot-header">
        <div>
          <h3>{copy.title}</h3>
          <p>{copy.subtitle}</p>
        </div>
        <span className="ai-chatbot-badge">AI</span>
      </div>

      <div className="ai-chatbot-starters">
        {copy.starters.map((starter) => (
          <LiquidButton
            key={starter}
            variant="secondary"
            size="small"
            onClick={() => submitMessage(starter)}
            disabled={loading}
            style={{ width: '100%', textAlign: 'left', marginBottom: '8px' }}
          >
            {starter}
          </LiquidButton>
        ))}
      </div>

      <div className="ai-chatbot-thread">
        {messages.map((message, index) => (
          <div
            key={`${message.role}-${index}`}
            className={`ai-chatbot-message ai-chatbot-message-${message.role}`}
          >
            <span className="ai-chatbot-role">
              {message.role === 'assistant' ? 'AI' : 'You'}
            </span>
            <p>{message.content}</p>
          </div>
        ))}

        {loading && (
          <div className="ai-chatbot-message ai-chatbot-message-assistant">
            <span className="ai-chatbot-role">AI</span>
            <p>Thinking...</p>
          </div>
        )}

        <div ref={messageEndRef} />
      </div>

      {error && <div className="ai-chatbot-error">{error}</div>}

      <form className="ai-chatbot-form" onSubmit={handleSubmit}>
        <textarea
          className="ai-chatbot-input"
          placeholder="Ask for campaign ideas, profile help, outreach copy, or strategy..."
          value={input}
          onChange={(event) => setInput(event.target.value)}
          onKeyDown={handleKeyDown}
          rows={3}
          disabled={loading}
        />
        <LiquidButton 
          variant="primary" 
          type="submit" 
          disabled={loading || !input.trim()}
          fullWidth
        >
          {loading ? 'Sending...' : 'Send'}
        </LiquidButton>
      </form>
    </div>
  );
}
