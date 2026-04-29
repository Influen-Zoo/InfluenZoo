const mongoose = require('mongoose');
const Analytics = require('../../models/Analytics');
const AnalyticsEvent = require('../../models/AnalyticsEvent');
const UserAnalytics = require('../../models/UserAnalytics');
const ContentAnalytics = require('../../models/ContentAnalytics');
const Post = require('../../models/Post');
const Campaign = require('../../models/Campaign');
const User = require('../../models/User');

const EVENT_METRIC_MAP = {
  VIEW: { views: 1 },
  CLICK: { clicks: 1 },
  LIKE: { likes: 1, engagement: 1 },
  SHARE: { shares: 1, engagement: 1 },
  COMMENT: { comments: 1, engagement: 1 },
  IMPRESSION: { impressions: 1 },
  ENGAGEMENT: { engagement: 1 },
};

const USER_ROLE_TO_ENTITY_TYPE = {
  admin: 'ADMIN',
  brand: 'BRAND',
  influencer: 'INFLUENCER',
};

const ENTITY_TYPE_TO_ROLE = {
  ADMIN: 'admin',
  BRAND: 'brand',
  INFLUENCER: 'influencer',
};

const cache = new Map();

const toObjectId = (value) => {
  if (!value || !mongoose.Types.ObjectId.isValid(value)) return null;
  return new mongoose.Types.ObjectId(value);
};

const getBucket = (timestamp = new Date()) => {
  const date = new Date(timestamp);
  return {
    date: date.toISOString().slice(0, 10),
    hour: date.getUTCHours(),
    timestamp: date,
  };
};

const getDateRange = ({ startDate, endDate, days = 30 }) => {
  const end = endDate ? new Date(endDate) : new Date();
  const start = startDate ? new Date(startDate) : new Date(end);
  if (!startDate) start.setUTCDate(end.getUTCDate() - Number(days || 30) + 1);
  return {
    startDate: start.toISOString().slice(0, 10),
    endDate: end.toISOString().slice(0, 10),
  };
};

const normalizeGranularity = (granularity = 'DAILY') => {
  const normalized = String(granularity).toUpperCase();
  return normalized === 'HOURLY' ? 'HOURLY' : 'DAILY';
};

const readCache = (key) => {
  const entry = cache.get(key);
  if (!entry) return null;
  if (entry.expiresAt < Date.now()) {
    cache.delete(key);
    return null;
  }
  return entry.value;
};

const writeCache = (key, value, ttlMs = Number(process.env.ANALYTICS_CACHE_TTL_MS || 30000)) => {
  cache.set(key, { value, expiresAt: Date.now() + ttlMs });
};

const resolveContentOwner = async ({ contentType, contentId }) => {
  if (!contentType || !contentId) return null;
  const Model = contentType === 'CAMPAIGN' ? Campaign : Post;
  const content = await Model.findById(contentId).select('author').lean();
  return content?.author || null;
};

const buildMetrics = (eventType, metrics = {}) => {
  const baseMetrics = EVENT_METRIC_MAP[eventType] || {};
  return Object.entries({ ...baseMetrics, ...metrics }).reduce((acc, [key, value]) => {
    const parsed = Number(value);
    acc[key] = Number.isFinite(parsed) ? parsed : 0;
    return acc;
  }, {});
};

const buildMetricIncrement = (metrics, prefix = 'metrics.') => {
  return Object.entries(metrics).reduce((acc, [key, value]) => {
    acc[`${prefix}${key}`] = value;
    return acc;
  }, {});
};

const getUserTotalsFromMetrics = (metrics) => ({
  totalViews: Number(metrics.views || metrics.impressions || 0),
  totalClicks: Number(metrics.clicks || 0),
  totalEngagement: Number(metrics.engagement || 0),
});

const getContentTotalsFromMetrics = (metrics) => ({
  views: Number(metrics.views || metrics.impressions || 0),
  clicks: Number(metrics.clicks || 0),
  likes: Number(metrics.likes || 0),
  shares: Number(metrics.shares || 0),
  comments: Number(metrics.comments || 0),
});

const recalculateContentEngagementRate = async ({ contentType, contentId, date, granularity, hour }) => {
  const query = { contentType, contentId, date, granularity };
  if (granularity === 'HOURLY') query.hour = hour;

  const current = await ContentAnalytics.findOne(query).lean();
  if (!current) return;

  const engagement = (current.likes || 0) + (current.shares || 0) + (current.comments || 0);
  const denominator = current.views > 0 ? current.views : 1;
  const engagementRate = Number(((engagement / denominator) * 100).toFixed(2));
  await ContentAnalytics.updateOne(query, { $set: { engagementRate } });
};

const upsertAnalyticsBucket = async ({ entityType, entityId, date, hour, granularity, metrics, timestamp }) => {
  const query = { entityType, entityId, date, granularity };
  if (granularity === 'HOURLY') query.hour = hour;

  const update = {
    $setOnInsert: { entityType, entityId, date, granularity, hour: granularity === 'HOURLY' ? hour : undefined },
    $set: { timestamp },
    $inc: buildMetricIncrement(metrics),
  };

  return Analytics.findOneAndUpdate(query, update, { new: true, upsert: true, setDefaultsOnInsert: true });
};

const applyEventToBucket = async (event, granularity) => {
  const entityType = event.entityType;
  const entityId = event.entityId;
  if (!entityType || !entityId) return;

  const metrics = buildMetrics(event.eventType, event.metrics);
  const analytics = await upsertAnalyticsBucket({
    entityType,
    entityId,
    date: event.date,
    hour: event.hour,
    granularity,
    metrics,
    timestamp: event.timestamp,
  });

  const role = ENTITY_TYPE_TO_ROLE[entityType];
  if (role) {
    const userTotals = getUserTotalsFromMetrics(metrics);
    const userQuery = { userId: entityId, role, date: event.date, granularity };
    if (granularity === 'HOURLY') userQuery.hour = event.hour;

    await UserAnalytics.updateOne(
      userQuery,
      {
        $setOnInsert: {
          analyticsId: analytics._id,
          userId: entityId,
          role,
          date: event.date,
          granularity,
          hour: granularity === 'HOURLY' ? event.hour : undefined,
        },
        $set: { timestamp: event.timestamp, analyticsId: analytics._id },
        $inc: userTotals,
      },
      { upsert: true }
    );
  }

  if (event.contentType && event.contentId) {
    const contentTotals = getContentTotalsFromMetrics(metrics);
    const contentQuery = { contentType: event.contentType, contentId: event.contentId, date: event.date, granularity };
    if (granularity === 'HOURLY') contentQuery.hour = event.hour;

    await ContentAnalytics.updateOne(
      contentQuery,
      {
        $setOnInsert: {
          analyticsId: analytics._id,
          contentType: event.contentType,
          contentId: event.contentId,
          contentRef: event.contentType === 'CAMPAIGN' ? 'Campaign' : 'Post',
          date: event.date,
          granularity,
          hour: granularity === 'HOURLY' ? event.hour : undefined,
        },
        $set: { timestamp: event.timestamp, analyticsId: analytics._id },
        $inc: contentTotals,
      },
      { upsert: true }
    );

    await recalculateContentEngagementRate({
      contentType: event.contentType,
      contentId: event.contentId,
      date: event.date,
      granularity,
      hour: event.hour,
    });
  }
};

const recordEvent = async (payload) => {
  const timestamp = payload.timestamp ? new Date(payload.timestamp) : new Date();
  const bucket = getBucket(timestamp);
  const contentType = payload.contentType ? String(payload.contentType).toUpperCase() : undefined;
  const contentId = toObjectId(payload.contentId);
  const actorId = toObjectId(payload.actorId);
  let entityType = payload.entityType ? String(payload.entityType).toUpperCase() : USER_ROLE_TO_ENTITY_TYPE[payload.actorRole];
  let entityId = toObjectId(payload.entityId);

  if (!entityId && contentType && contentId) {
    entityId = await resolveContentOwner({ contentType, contentId });
  }

  if (!entityType && entityId) {
    const owner = await User.findById(entityId).select('role').lean();
    entityType = USER_ROLE_TO_ENTITY_TYPE[owner?.role];
  }

  if (!entityType && payload.entityRole) entityType = USER_ROLE_TO_ENTITY_TYPE[payload.entityRole];

  const event = await AnalyticsEvent.create({
    eventType: String(payload.eventType || '').toUpperCase(),
    entityType,
    entityId,
    actorId,
    actorRole: payload.actorRole,
    contentType,
    contentId,
    metrics: payload.metrics || {},
    metadata: payload.metadata || {},
    date: bucket.date,
    hour: bucket.hour,
    timestamp: bucket.timestamp,
  });

  if (process.env.ANALYTICS_REALTIME_AGGREGATION !== 'false') {
    await aggregateEvents({ eventIds: [event._id] });
  }

  return event;
};

const aggregateEvents = async ({ limit = Number(process.env.ANALYTICS_AGGREGATION_BATCH_SIZE || 500), eventIds = null } = {}) => {
  const query = eventIds ? { _id: { $in: eventIds } } : { status: 'PENDING' };
  const events = await AnalyticsEvent.find(query).sort({ timestamp: 1 }).limit(limit);
  const processed = [];
  const failed = [];

  for (const event of events) {
    try {
      await AnalyticsEvent.updateOne({ _id: event._id, status: event.status }, { $set: { status: 'PROCESSING' } });
      await applyEventToBucket(event, 'HOURLY');
      await applyEventToBucket(event, 'DAILY');
      await AnalyticsEvent.updateOne({ _id: event._id }, { $set: { status: 'AGGREGATED', aggregatedAt: new Date() }, $unset: { error: '' } });
      processed.push(event._id);
    } catch (error) {
      await AnalyticsEvent.updateOne({ _id: event._id }, { $set: { status: 'FAILED', error: error.message } });
      failed.push({ id: event._id, error: error.message });
    }
  }

  if (processed.length) cache.clear();
  return { processed: processed.length, failed };
};

const getUserAnalytics = async ({ userId, role, startDate, endDate, granularity = 'DAILY' }) => {
  const bucket = normalizeGranularity(granularity);
  const range = getDateRange({ startDate, endDate });
  const cacheKey = `user:${userId}:${role}:${range.startDate}:${range.endDate}:${bucket}`;
  const cached = readCache(cacheKey);
  if (cached) return cached;

  const query = {
    userId: toObjectId(userId),
    date: { $gte: range.startDate, $lte: range.endDate },
    granularity: bucket,
  };
  if (role) query.role = String(role).toLowerCase();

  const buckets = await UserAnalytics.find(query).sort({ date: 1, hour: 1 }).lean();
  const totals = buckets.reduce((acc, item) => {
    acc.totalViews += item.totalViews || 0;
    acc.totalEngagement += item.totalEngagement || 0;
    acc.totalClicks += item.totalClicks || 0;
    return acc;
  }, { totalViews: 0, totalEngagement: 0, totalClicks: 0 });

  const result = { range, granularity: bucket, totals, buckets };
  writeCache(cacheKey, result);
  return result;
};

const getContentAnalytics = async ({ contentId, contentType, startDate, endDate, granularity = 'DAILY' }) => {
  const bucket = normalizeGranularity(granularity);
  const range = getDateRange({ startDate, endDate });
  const normalizedContentType = String(contentType || '').toUpperCase();
  const cacheKey = `content:${normalizedContentType}:${contentId}:${range.startDate}:${range.endDate}:${bucket}`;
  const cached = readCache(cacheKey);
  if (cached) return cached;

  const buckets = await ContentAnalytics.find({
    contentType: normalizedContentType,
    contentId: toObjectId(contentId),
    date: { $gte: range.startDate, $lte: range.endDate },
    granularity: bucket,
  }).sort({ date: 1, hour: 1 }).lean();

  const totals = buckets.reduce((acc, item) => {
    acc.views += item.views || 0;
    acc.likes += item.likes || 0;
    acc.shares += item.shares || 0;
    acc.comments += item.comments || 0;
    acc.clicks += item.clicks || 0;
    return acc;
  }, { views: 0, likes: 0, shares: 0, comments: 0, clicks: 0 });
  const engagement = totals.likes + totals.shares + totals.comments;
  totals.engagementRate = Number(((engagement / (totals.views || 1)) * 100).toFixed(2));

  const result = { range, granularity: bucket, totals, buckets };
  writeCache(cacheKey, result);
  return result;
};

const getAdminDashboardAnalytics = async ({ entityType, entityId, contentType, contentId, startDate, endDate, granularity = 'DAILY' }) => {
  const bucket = normalizeGranularity(granularity);
  const range = getDateRange({ startDate, endDate });
  const analyticsQuery = { date: { $gte: range.startDate, $lte: range.endDate }, granularity: bucket };
  if (entityType) analyticsQuery.entityType = String(entityType).toUpperCase();
  if (entityId) analyticsQuery.entityId = toObjectId(entityId);

  const contentQuery = { date: { $gte: range.startDate, $lte: range.endDate }, granularity: bucket };
  if (contentType) contentQuery.contentType = String(contentType).toUpperCase();
  if (contentId) contentQuery.contentId = toObjectId(contentId);

  const [entityBuckets, contentBuckets] = await Promise.all([
    Analytics.find(analyticsQuery).sort({ date: 1, hour: 1 }).lean(),
    ContentAnalytics.find(contentQuery).sort({ date: 1, hour: 1 }).lean(),
  ]);

  const totals = entityBuckets.reduce((acc, item) => {
    const metrics = item.metrics || {};
    Object.entries(metrics).forEach(([key, value]) => {
      acc[key] = (acc[key] || 0) + Number(value || 0);
    });
    return acc;
  }, {});

  const contentTotals = contentBuckets.reduce((acc, item) => {
    acc.views += item.views || 0;
    acc.likes += item.likes || 0;
    acc.shares += item.shares || 0;
    acc.comments += item.comments || 0;
    acc.clicks += item.clicks || 0;
    return acc;
  }, { views: 0, likes: 0, shares: 0, comments: 0, clicks: 0 });

  return { range, granularity: bucket, totals, contentTotals, entityBuckets, contentBuckets };
};

const getTrendingContent = async ({ contentType, startDate, endDate, limit = 10 }) => {
  const range = getDateRange({ startDate, endDate, days: 7 });
  const match = { date: { $gte: range.startDate, $lte: range.endDate }, granularity: 'DAILY' };
  if (contentType) match.contentType = String(contentType).toUpperCase();

  return ContentAnalytics.aggregate([
    { $match: match },
    {
      $group: {
        _id: { contentType: '$contentType', contentId: '$contentId' },
        views: { $sum: '$views' },
        likes: { $sum: '$likes' },
        shares: { $sum: '$shares' },
        comments: { $sum: '$comments' },
      }
    },
    {
      $addFields: {
        score: {
          $add: [
            '$views',
            { $multiply: ['$likes', 3] },
            { $multiply: ['$comments', 4] },
            { $multiply: ['$shares', 5] },
          ]
        }
      }
    },
    { $sort: { score: -1 } },
    { $limit: Number(limit) || 10 },
  ]);
};

const getPeriodComparison = async ({ userId, role, currentStartDate, currentEndDate, previousStartDate, previousEndDate }) => {
  const [current, previous] = await Promise.all([
    getUserAnalytics({ userId, role, startDate: currentStartDate, endDate: currentEndDate }),
    getUserAnalytics({ userId, role, startDate: previousStartDate, endDate: previousEndDate }),
  ]);

  const changes = Object.keys(current.totals).reduce((acc, key) => {
    const cur = current.totals[key] || 0;
    const prev = previous.totals[key] || 0;
    acc[key] = {
      current: cur,
      previous: prev,
      delta: cur - prev,
      percent: prev > 0 ? Number((((cur - prev) / prev) * 100).toFixed(2)) : (cur > 0 ? 100 : 0),
    };
    return acc;
  }, {});

  return { current, previous, changes };
};

module.exports = {
  recordEvent,
  aggregateEvents,
  getUserAnalytics,
  getContentAnalytics,
  getAdminDashboardAnalytics,
  getTrendingContent,
  getPeriodComparison,
};
