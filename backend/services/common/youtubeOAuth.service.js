const jwt = require('jsonwebtoken');
const User = require('../../models/User');

const YOUTUBE_READONLY_SCOPE = 'https://www.googleapis.com/auth/youtube.readonly';

const getRequiredEnv = (key) => {
  const value = process.env[key];
  if (!value) throw new Error(`${key} is required for YouTube OAuth`);
  return value;
};

const toNumber = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : 0;
};

const getJwtSecret = () => process.env.JWT_SECRET || 'your_secret_key';

const getRedirectUri = () => (
  process.env.YOUTUBE_OAUTH_REDIRECT_URI ||
  `${process.env.API_PUBLIC_URL || 'http://localhost:5000'}/api/users/social-media/youtube/callback`
);

const getFrontendRedirectUrl = () => (
  process.env.FRONTEND_URL ||
  process.env.CLIENT_URL ||
  'http://localhost:5173'
);

const requestJson = async (url, options, errorMessage) => {
  const response = await fetch(url, options);
  const data = await response.json().catch(() => ({}));

  if (!response.ok || data.error) {
    const message = data.error_description || data.error?.message || data.error || response.statusText;
    throw new Error(`${errorMessage}: ${message}`);
  }

  return data;
};

const createAuthUrl = (userId) => {
  const clientId = getRequiredEnv('GOOGLE_CLIENT_ID');
  const state = jwt.sign(
    { userId, provider: 'youtube' },
    getJwtSecret(),
    { expiresIn: '10m' }
  );

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: getRedirectUri(),
    response_type: 'code',
    scope: YOUTUBE_READONLY_SCOPE,
    access_type: 'offline',
    include_granted_scopes: 'true',
    prompt: 'consent',
    state
  });

  return `https://accounts.google.com/o/oauth2/v2/auth?${params}`;
};

const exchangeCodeForToken = async (code) => {
  const params = new URLSearchParams({
    code,
    client_id: getRequiredEnv('GOOGLE_CLIENT_ID'),
    client_secret: getRequiredEnv('GOOGLE_CLIENT_SECRET'),
    redirect_uri: getRedirectUri(),
    grant_type: 'authorization_code'
  });

  return requestJson(
    'https://oauth2.googleapis.com/token',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params
    },
    'Unable to exchange YouTube authorization code'
  );
};

const fetchOwnChannel = async (accessToken) => {
  const params = new URLSearchParams({
    part: 'snippet,statistics',
    mine: 'true'
  });

  const data = await requestJson(
    `https://www.googleapis.com/youtube/v3/channels?${params}`,
    { headers: { Authorization: `Bearer ${accessToken}` } },
    'Unable to fetch authenticated YouTube channel'
  );

  const channel = data.items?.[0];
  if (!channel) throw new Error('No YouTube channel found for this Google account');

  return channel;
};

const saveYouTubeChannel = async (userId, channel) => {
  const user = await User.findById(userId);
  if (!user) throw new Error('User not found');

  const subscribers = toNumber(channel.statistics?.subscriberCount);
  const videos = toNumber(channel.statistics?.videoCount);
  const account = {
    platform: 'youtube',
    accountId: channel.id,
    accountName: channel.snippet?.title || 'YouTube Channel',
    accountUrl: channel.snippet?.customUrl
      ? `https://youtube.com/${channel.snippet.customUrl}`
      : `https://youtube.com/channel/${channel.id}`,
    followers: 0,
    subscribers,
    posts: 0,
    videos,
    lastSyncedAt: new Date()
  };

  const existingIndex = user.socialMediaAccounts.findIndex(item => item.platform === 'youtube');
  if (existingIndex >= 0) {
    user.socialMediaAccounts[existingIndex] = account;
  } else {
    user.socialMediaAccounts.push(account);
  }

  await user.save();
  return user.toJSON();
};

const handleCallback = async ({ code, state }) => {
  if (!code) throw new Error('Missing YouTube authorization code');
  if (!state) throw new Error('Missing YouTube OAuth state');

  const decoded = jwt.verify(state, getJwtSecret());
  if (decoded.provider !== 'youtube' || !decoded.userId) {
    throw new Error('Invalid YouTube OAuth state');
  }

  const tokenData = await exchangeCodeForToken(code);
  const channel = await fetchOwnChannel(tokenData.access_token);
  await saveYouTubeChannel(decoded.userId, channel);

  return decoded.userId;
};

module.exports = {
  createAuthUrl,
  handleCallback,
  getFrontendRedirectUrl
};
