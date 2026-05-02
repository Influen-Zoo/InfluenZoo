const Analytics = require('../../models/Analytics');
const User = require('../../models/User');
const Application = require('../../models/Application');

/**
 * Compute day span from timeframe query param.
 */
const getDays = (timeframe) => {
  if (timeframe === 'today' || timeframe === '1') return 1;
  if (timeframe === '7') return 7;
  if (timeframe === '30' || timeframe === 'monthly') return 30;
  if (timeframe === '90') return 90;
  if (timeframe === '365' || timeframe === 'yearly') return 365;
  return 28; // default
};

const calcTrend = (current, previous) => {
  if (previous === 0 && current > 0) return 100;
  if (previous === 0 && current === 0) return 0;
  return Math.round(((current - previous) / previous) * 100);
};

const getDailyNetFollowersSeries = (analytics, days) => {
  const numPoints = Math.max(1, Math.min(days, 90));
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const followers = [];
  for (let i = 0; i < numPoints; i++) {
    const pointStart = new Date(startDate.getTime() + i * 86400000);
    pointStart.setHours(0, 0, 0, 0);
    const pointEnd = new Date(pointStart.getTime() + 86400000);
    const label = `${pointStart.getMonth() + 1}/${pointStart.getDate()}`;

    const slice = analytics.filter(a => a.timestamp >= pointStart && a.timestamp < pointEnd);
    const eCount = slice.filter(a => a.type === 'engagement').reduce((acc, curr) => {
      const m = curr.metadata || {};
      return acc + (m.likes || 0) + (m.comments || 0) + (m.shares || 0) + (m.saves || 0);
    }, 0);

    followers.push({ label, value: Math.floor(eCount * 0.015), date: pointStart });
  }

  return followers;
};

const buildTimeSeries = (analytics, applications, days) => {
  const groupInterval = days === 1 ? 'hour' : 'day';
  const numPoints = days === 1 ? 24 : Math.min(days, 90); 
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const views = [];
  const engagement = [];
  const earnings = [];

  for (let i = numPoints - 1; i >= 0; i--) {
    let pointStart, pointEnd, label;

    if (groupInterval === 'hour') {
      pointStart = new Date(startDate.getTime() + i * 3600000);
      pointEnd   = new Date(startDate.getTime() + (i + 1) * 3600000);
      label = `${pointStart.getHours()}:00`;
    } else {
      pointStart = new Date(startDate.getTime() + i * 86400000);
      pointStart.setHours(0, 0, 0, 0);
      pointEnd = new Date(pointStart.getTime() + 86400000);
      label = `${pointStart.getMonth() + 1}/${pointStart.getDate()}`;
    }

    const slice = analytics.filter(a => a.timestamp >= pointStart && a.timestamp < pointEnd);
    const sliceApps = applications.filter(ap => ap.updatedAt >= pointStart && ap.updatedAt < pointEnd && ap.status === 'completed');

    const vCount = slice.filter(a => a.type === 'impression').length;
    // SUM interaction counts from metadata for granular accuracy
    const eCount = slice.filter(a => a.type === 'engagement').reduce((acc, curr) => {
      const m = curr.metadata || {};
      return acc + (m.likes || 0) + (m.comments || 0) + (m.shares || 0) + (m.saves || 0);
    }, 0);
    const earnCount = sliceApps.reduce((acc, curr) => acc + (curr.proposedPrice || 0), 0);

    views.unshift({ label, value: vCount, date: pointStart });
    engagement.unshift({ label, value: eCount, date: pointStart });
    earnings.unshift({ label, value: earnCount, date: pointStart });
  }

  const followers = getDailyNetFollowersSeries(analytics, days);
  return { views, engagement, followers, earnings };
};

const getDashboardAnalytics = async (req, res) => {
  try {
    const userId = req.userId;
    const { timeframe = '28' } = req.query;
    const days = getDays(timeframe);

    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Current period analytics
    const analytics = await Analytics.find({
      userId,
      timestamp: { $gte: startDate, $lte: endDate },
    });

    const applications = await Application.find({
      influencerId: userId,
      updatedAt: { $gte: startDate, $lte: endDate }
    }).populate('campaignId', 'title category budget');

    // Previous period (for trend)
    const prevStart = new Date(startDate);
    prevStart.setDate(prevStart.getDate() - days);
    
    const prevAnalytics = await Analytics.find({
      userId,
      timestamp: { $gte: prevStart, $lt: startDate },
    });

    const prevApplications = await Application.find({
      influencerId: userId,
      status: 'completed',
      updatedAt: { $gte: prevStart, $lt: startDate }
    });

    const userProfile = await User.findById(userId).select('followers following');
    const totalCurrentFollowers = userProfile?.followers?.length || 1000;

    // ── Totals ─────────────────────────────────────────────────────────────────
    const views      = analytics.filter(a => a.type === 'impression').length;
    const engagement = analytics.filter(a => a.type === 'engagement').length;
    const earnings   = applications.filter(a => a.status === 'completed').reduce((acc, curr) => acc + (curr.proposedPrice || 0), 0);

    const prevViews      = prevAnalytics.filter(a => a.type === 'impression').length;
    const prevEngagement = prevAnalytics.filter(a => a.type === 'engagement').length;
    const prevEarnings   = prevApplications.reduce((acc, curr) => acc + (curr.proposedPrice || 0), 0);

    // ── Time Series ────────────────────────────────────────────────────────────
    const timeSeries = buildTimeSeries(analytics, applications, days);

    // net followers trend
    const netFollowers = totalCurrentFollowers;
    const prevNetFollowers = totalCurrentFollowers;

    // ── Breakdowns ─────────────────────────────────────────────────────────────
    const followerViews = analytics.filter(a => a.type === 'impression' && a.metadata?.isFollower === true).length;
    const followerPct = views > 0 ? Math.round((followerViews / views) * 100) : 54;
    const nonFollowerPct = 100 - followerPct;

    const platforms = ['Instagram', 'TikTok', 'YouTube', 'Twitter'];
    const mediaBreakdown = platforms.map(platform => {
      const pfViews = analytics.filter(a => a.type === 'impression' && a.metadata?.platform === platform).length;
      const pfEng   = analytics.filter(a => a.type === 'engagement' && a.metadata?.platform === platform).length;
      return { name: platform, views: pfViews, engagement: pfEng };
    });

    // Engagement interaction types - COLLECTED FROM METADATA
    const engEvents = analytics.filter(a => a.type === 'engagement');
    const likes = engEvents.reduce((acc, curr) => acc + (curr.metadata?.likes || 0), 0);
    const comments = engEvents.reduce((acc, curr) => acc + (curr.metadata?.comments || 0), 0);
    const shares = engEvents.reduce((acc, curr) => acc + (curr.metadata?.shares || 0), 0);
    const saves = engEvents.reduce((acc, curr) => acc + (curr.metadata?.saves || 0), 0);
    
    // REDEFINE Engagement total as the sum of all interactions for realistic percentages
    const totalInteractions = likes + comments + shares + saves;

    const engagementBreakdown = [
      { type: 'Likes',    value: likes },
      { type: 'Comments', value: comments },
      { type: 'Shares',   value: shares },
      { type: 'Saves',    value: saves },
    ];

    // Previous period engagement for trend
    const prevEngEvents = prevAnalytics.filter(a => a.type === 'engagement');
    const prevTotalInteractions = prevEngEvents.reduce((acc, curr) => 
        acc + (curr.metadata?.likes || 0) + (curr.metadata?.comments || 0) + (curr.metadata?.shares || 0) + (curr.metadata?.saves || 0), 0);

    // Earnings sources for the list
    const earningsSources = applications
      .filter(a => a.status === 'completed')
      .map(a => ({
        id: a._id,
        title: a.campaignId?.title || 'Private Campaign',
        amount: a.proposedPrice || 0,
        date: a.updatedAt,
        category: a.campaignId?.category || 'General'
      }))
      .sort((a,b) => new Date(b.date) - new Date(a.date));

    // ── Insights ───────────────────────────────────────────────────────────────
    const avgViews = views > 0 ? Math.round(views / Math.max(timeSeries.views.length, 1)) : 0;
    const maxDayViews = Math.max(...timeSeries.views.map(d => d.value), 0);
    const insightMultiplier = avgViews > 0 ? Math.round(maxDayViews / avgViews) : 0;

    res.json({
      success: true,
      data: {
        totals: {
          views,
          engagement: totalInteractions,
          earnings,
          netFollowers,
        },
        trends: {
          views:      calcTrend(views, prevViews),
          engagement: calcTrend(totalInteractions, prevTotalInteractions),
          earnings:   calcTrend(earnings, prevEarnings),
          netFollowers: calcTrend(netFollowers, prevNetFollowers),
        },
        timeSeries,
        earningsSources,
        breakdown: {
          viewerType: { followerPct, nonFollowerPct },
          mediaType:  mediaBreakdown,
          engagement: engagementBreakdown,
          earnings: [
              { label: 'Campaigns', pct: 100, color: '#1877f2' },
              { label: 'Other', pct: 0, color: '#65676b' }
          ]
        },
        insights: {
          topPostMultiplier: insightMultiplier,
          totalViewers: Math.round(views * 0.85), 
        },
      },
    });

  } catch (error) {
    console.error('Error fetching dashboard analytics:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = { getDashboardAnalytics };
