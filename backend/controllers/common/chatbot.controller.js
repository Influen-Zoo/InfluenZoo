const ChatbotMessage = require('../../models/ChatbotMessage');

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';
const API_KEY = process.env.OPENROUTER_API_KEY || process.env.OPENAI_API_KEY;
const DEFAULT_MODEL = process.env.OPENROUTER_MODEL || 'openai/gpt-3.5-turbo';
const DEFAULT_MAX_TOKENS = Number(process.env.OPENROUTER_MAX_TOKENS || 1200);
const MAX_MESSAGES = 12;
const MAX_MESSAGE_LENGTH = 4000;

/**
 * AI Assistant Instructions Builder
 */
const buildInstructions = (user) => {
  const shared = [
    'You are InfluenZoo AI, the in-app assistant for an influencer-brand collaboration platform.',
    'Be warm, practical, and concise.',
    'Help with campaign ideas, outreach copy, creator-brand fit, content planning, profile improvement, and general platform guidance.',
    'If asked for platform actions you cannot perform, say so clearly and suggest the next manual step inside the app.',
    'Do not claim to have access to hidden account data, payments, or private analytics beyond what the user shares in chat.',
  ];

  const byRole = {
    influencer: [
      'Prioritize helping influencers improve bios, pitch messages, content ideas, negotiation prep, and campaign applications.',
      'When useful, suggest short ready-to-copy text the user can paste into applications or messages.',
    ],
    brand: [
      'Prioritize helping brands write stronger campaign briefs, shortlist creators, evaluate applications, and draft acceptance or rejection messages.',
      'When useful, provide structured templates with headings and bullet points.',
    ],
    admin: [
      'Prioritize moderation, policy wording, dispute handling language, and dashboard communication.',
    ],
  };

  const roleHints = byRole[user.role] || [];

  return [
    ...shared,
    ...roleHints,
    `The current user is a ${user.role} named ${user.name}.`,
  ].join('\n');
};

/**
 * Message normalizer
 */
const normalizeMessages = (messages) => {
  if (!Array.isArray(messages)) return [];

  return messages
    .filter((message) => message && ['user', 'assistant'].includes(message.role))
    .map((message) => ({
      role: message.role,
      content: String(message.content || '').trim().slice(0, MAX_MESSAGE_LENGTH),
    }))
    .filter((message) => message.content)
    .slice(-MAX_MESSAGES);
};

/**
 * Output text extractor
 */
const extractOutputText = (data) => {
  const content = data?.choices?.[0]?.message?.content;

  if (typeof content === 'string' && content.trim()) {
    return content.trim();
  }

  if (!Array.isArray(content)) return '';

  return content
    .filter((part) => typeof part?.text === 'string')
    .map((part) => part.text)
    .join('\n')
    .trim();
};

/**
 * POST /api/chatbot
 * Send message and get AI response
 */
exports.sendMessage = async (req, res) => {
  if (!API_KEY) {
    return res.status(500).json({
      error: 'AI assistant is not configured. Add OPENROUTER_API_KEY to backend/.env',
    });
  }

  const messages = normalizeMessages(req.body?.messages);

  if (messages.length === 0) {
    return res.status(400).json({ error: 'Please send at least one message.' });
  }

  try {
    const userInfo = {
      id: req.userId,
      role: req.role,
      name: 'User',
    };

    const openRouterResponse = await fetch(OPENROUTER_API_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': process.env.OPENROUTER_SITE_URL || 'http://localhost:5173',
        'X-OpenRouter-Title': process.env.OPENROUTER_APP_NAME || 'InfluenZoo',
      },
      body: JSON.stringify({
        model: DEFAULT_MODEL,
        messages: [
          {
            role: 'system',
            content: buildInstructions(userInfo),
          },
          ...messages,
        ],
        max_tokens: DEFAULT_MAX_TOKENS,
      }),
    });

    const data = await openRouterResponse.json();

    if (!openRouterResponse.ok) {
      return res.status(openRouterResponse.status).json({
        error: data?.error?.message || 'AI service request failed.',
      });
    }

    const reply = extractOutputText(data);

    if (!reply) {
      return res.status(502).json({
        error: 'The AI service returned an empty response. Please try again.',
      });
    }

    // Save message to database
    const lastMessage = messages[messages.length - 1];
    const chatbotMessage = new ChatbotMessage({
      userId: req.userId,
      message: lastMessage.content,
      response: reply,
      category: 'general',
    });
    
    await chatbotMessage.save();

    res.json({
      success: true,
      reply,
      model: data.model || DEFAULT_MODEL,
      messageId: chatbotMessage._id,
    });
  } catch (error) {
    console.error('Chatbot error:', error);
    res.status(500).json({ error: 'Unable to reach the AI service right now.' });
  }
};

/**
 * GET /api/chatbot/history
 * Get chat history for user
 */
exports.getHistory = async (req, res) => {
  try {
    const messages = await ChatbotMessage.find({ userId: req.userId })
      .sort({ timestamp: -1 })
      .limit(50);

    res.json({ success: true, data: messages });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};
