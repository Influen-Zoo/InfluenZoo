const SUPPORTED_PLATFORMS = ['facebook', 'instagram', 'youtube'];

const toNumber = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : 0;
};

const toText = (value) => {
  if (value === null || value === undefined) return '';
  return typeof value === 'string' ? value : String(value);
};

const trimAt = (value = '') => toText(value).trim().replace(/^@/, '');

const getUrl = (value = '') => {
  const text = toText(value).trim();
  if (!text) return null;

  try {
    return new URL(text);
  } catch {
    try {
      return new URL(`https://${text}`);
    } catch {
      return null;
    }
  }
};

const getLastPathSegment = (accountUrl = '') => {
  const url = getUrl(accountUrl);
  if (!url) return '';
  const profileId = url.searchParams.get('id');
  if (profileId) return profileId;
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

const getPositiveInteger = (value, fallback) => {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
};

const getYoutubeHandle = ({ accountId, accountName, accountUrl }) => {
  const url = getUrl(accountUrl);
  const firstPathSegment = url?.pathname.split('/').filter(Boolean)[0] || '';

  if (firstPathSegment.startsWith('@')) return firstPathSegment;
  const name = toText(accountName).trim();
  const id = toText(accountId).trim();
  if (name.startsWith('@')) return name;
  if (id.startsWith('@')) return id;
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
  const pageId = data.id || pageIdOrUsername;
  const pageAccessToken = await resolveFacebookPageAccessToken(pageId, accessToken);
  const summaryPostCount = toNumber(data.posts?.summary?.total_count);
  const posts = summaryPostCount || await countFacebookPostsSafe(pageId, pageAccessToken);

  return {
    accountId: pageId,
    accountName: data.name || account.accountName,
    followers: toNumber(data.followers_count || data.fan_count),
    posts,
    videos: 0
  };
};

const resolveFacebookPageAccessToken = async (pageId, accessToken) => {
  const params = new URLSearchParams({
    fields: 'id,access_token',
    limit: '100',
    access_token: accessToken
  });
  let nextUrl = `https://graph.facebook.com/v19.0/me/accounts?${params}`;

  try {
    while (nextUrl) {
      const data = await requestJson(nextUrl, 'Unable to fetch Facebook page access token');
      const page = data.data?.find((item) => item.id === pageId);
      if (page?.access_token) return page.access_token;
      nextUrl = data.paging?.next || null;
    }
  } catch (error) {
    console.warn(`Unable to resolve Facebook page access token for ${pageId}: ${error.message}`);
  }

  return accessToken;
};

const countFacebookPostsSafe = async (pageId, accessToken) => {
  const edges = ['posts', 'published_posts', 'feed'];

  for (const edge of edges) {
    try {
      const count = await countFacebookPosts(pageId, accessToken, edge);
      if (count > 0) return count;
    } catch (error) {
      console.warn(`Unable to count Facebook page ${edge} for ${pageId}: ${error.message}`);
    }
  }

  return 0;
};

const countFacebookPosts = async (pageId, accessToken, edge = 'posts') => {
  const maxPages = getPositiveInteger(process.env.FACEBOOK_POST_COUNT_MAX_PAGES, 50);
  const params = new URLSearchParams({
    fields: 'id,created_time',
    limit: '100',
    access_token: accessToken
  });
  let nextUrl = `https://graph.facebook.com/v19.0/${pageId}/${edge}?${params}`;
  let count = 0;
  let pagesRead = 0;

  while (nextUrl && pagesRead < maxPages) {
    const data = await requestJson(nextUrl, `Unable to count Facebook page ${edge}`);
    const posts = Array.isArray(data.data) ? data.data : [];
    count += posts.length;
    pagesRead += 1;
    nextUrl = posts.length ? data.paging?.next : null;
  }

  return count;
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
