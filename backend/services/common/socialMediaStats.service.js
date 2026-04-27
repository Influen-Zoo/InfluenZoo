const SUPPORTED_PLATFORMS = ['facebook', 'instagram', 'youtube'];

const toNumber = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : 0;
};

const trimAt = (value = '') => value.trim().replace(/^@/, '');

const getUrl = (value = '') => {
  try {
    return new URL(value);
  } catch {
    return null;
  }
};

const getLastPathSegment = (accountUrl = '') => {
  const url = getUrl(accountUrl);
  if (!url) return '';
  return url.pathname.split('/').filter(Boolean).pop() || '';
};

const getIdentifier = ({ accountId, accountName, accountUrl }) => {
  return trimAt(accountId || getLastPathSegment(accountUrl) || accountName);
};

const requestJson = async (url, errorMessage) => {
  const response = await fetch(url);
  const data = await response.json().catch(() => ({}));

  if (!response.ok || data.error) {
    const message = data.error?.message || data.error || response.statusText || errorMessage;
    throw new Error(`${errorMessage}: ${message}`);
  }

  return data;
};

const getYoutubeHandle = ({ accountId, accountName, accountUrl }) => {
  const url = getUrl(accountUrl);
  const firstPathSegment = url?.pathname.split('/').filter(Boolean)[0] || '';

  if (firstPathSegment.startsWith('@')) return firstPathSegment;
  if (accountName?.trim().startsWith('@')) return accountName.trim();
  if (accountId?.trim().startsWith('@')) return accountId.trim();
  return '';
};

const fetchYoutubeStats = async (account) => {
  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) throw new Error('YOUTUBE_API_KEY is required to fetch YouTube metrics');

  const identifier = getIdentifier(account);
  const handle = getYoutubeHandle(account);
  const baseUrl = 'https://www.googleapis.com/youtube/v3/channels';
  const params = new URLSearchParams({ part: 'snippet,statistics', key: apiKey });

  if (/^UC[\w-]{20,}$/.test(identifier)) {
    params.set('id', identifier);
  } else if (handle) {
    params.set('forHandle', handle);
  } else {
    params.set('forUsername', identifier);
  }

  let data = await requestJson(`${baseUrl}?${params}`, 'Unable to fetch YouTube metrics');

  if (!data.items?.length && identifier) {
    const searchParams = new URLSearchParams({
      part: 'snippet',
      type: 'channel',
      maxResults: '1',
      q: identifier,
      key: apiKey
    });
    const searchData = await requestJson(
      `https://www.googleapis.com/youtube/v3/search?${searchParams}`,
      'Unable to find YouTube channel'
    );
    const channelId = searchData.items?.[0]?.snippet?.channelId;
    if (channelId) {
      const idParams = new URLSearchParams({ part: 'snippet,statistics', id: channelId, key: apiKey });
      data = await requestJson(`${baseUrl}?${idParams}`, 'Unable to fetch YouTube metrics');
    }
  }

  const channel = data.items?.[0];
  if (!channel) throw new Error('Unable to find YouTube channel');

  return {
    accountId: channel.id,
    accountName: channel.snippet?.title || account.accountName,
    followers: 0,
    subscribers: toNumber(channel.statistics?.subscriberCount),
    posts: 0,
    videos: toNumber(channel.statistics?.videoCount)
  };
};

const fetchInstagramStats = async (account) => {
  const accessToken = process.env.META_ACCESS_TOKEN;
  const businessAccountId = process.env.INSTAGRAM_BUSINESS_ACCOUNT_ID;
  if (!accessToken || !businessAccountId) {
    throw new Error('META_ACCESS_TOKEN and INSTAGRAM_BUSINESS_ACCOUNT_ID are required to fetch Instagram metrics');
  }

  const username = getIdentifier(account);
  if (!username) throw new Error('Instagram username is required');

  const fields = `business_discovery.username(${username}){id,username,name,followers_count,media_count}`;
  const params = new URLSearchParams({ fields, access_token: accessToken });
  const data = await requestJson(
    `https://graph.facebook.com/v19.0/${businessAccountId}?${params}`,
    'Unable to fetch Instagram metrics'
  );
  const profile = data.business_discovery;
  if (!profile) throw new Error('Unable to find Instagram account');

  return {
    accountId: profile.id || username,
    accountName: profile.username || profile.name || account.accountName,
    followers: toNumber(profile.followers_count),
    posts: toNumber(profile.media_count),
    videos: 0
  };
};

const fetchFacebookStats = async (account) => {
  const accessToken = process.env.META_ACCESS_TOKEN;
  if (!accessToken) throw new Error('META_ACCESS_TOKEN is required to fetch Facebook metrics');

  const pageIdOrUsername = getIdentifier(account);
  if (!pageIdOrUsername) throw new Error('Facebook page ID or username is required');

  const fields = 'id,name,followers_count,fan_count,posts.limit(0).summary(true)';
  const params = new URLSearchParams({ fields, access_token: accessToken });
  const data = await requestJson(
    `https://graph.facebook.com/v19.0/${pageIdOrUsername}?${params}`,
    'Unable to fetch Facebook metrics'
  );

  return {
    accountId: data.id || pageIdOrUsername,
    accountName: data.name || account.accountName,
    followers: toNumber(data.followers_count || data.fan_count),
    posts: toNumber(data.posts?.summary?.total_count),
    videos: 0
  };
};

const fetchSocialMediaStats = async (account) => {
  if (!SUPPORTED_PLATFORMS.includes(account.platform)) {
    throw new Error('Invalid platform');
  }

  if (account.platform === 'youtube') return fetchYoutubeStats(account);
  if (account.platform === 'instagram') return fetchInstagramStats(account);
  return fetchFacebookStats(account);
};

module.exports = {
  fetchSocialMediaStats,
  SUPPORTED_PLATFORMS
};
