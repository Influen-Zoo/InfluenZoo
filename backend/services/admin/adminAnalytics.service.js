const User = require('../../models/User');
const Campaign = require('../../models/Campaign');
const Application = require('../../models/Application');
const Analytics = require('../../models/Analytics');
const Transaction = require('../../models/Transaction');
const Post = require('../../models/Post');
const CampaignRevenue = require('../../models/CampaignRevenue');
const Dispute = require('../../models/Dispute');
const AppSetting = require('../../models/AppSetting');
const { ObjectId } = require('mongoose').Types;


const adminAnalyticsService = {
  getOverviewAnalytics: async (filters = {}) => {
    const { startDate, endDate } = filters;
    const dateQuery = {};
    if (startDate || endDate) {
      dateQuery.createdAt = {};
      if (startDate) dateQuery.createdAt.$gte = new Date(startDate);
      if (endDate) dateQuery.createdAt.$lte = new Date(endDate);
    }

    // Basic Counts (All-time totals to ensure consistency with master lists)
    const [
      totalUsers, 
      totalInfluencers, 
      totalBrands, 
      totalCampaigns, 
      activeCampaigns, 
      pendingCampaigns,
      totalApplications, 
      totalPosts,
      openDisputes,
      revenueStats
    ] = await Promise.all([
      User.countDocuments({}),
      User.countDocuments({ role: 'influencer' }),
      User.countDocuments({ role: 'brand' }),
      Campaign.countDocuments({}),
      Campaign.countDocuments({ status: 'active' }),
      Campaign.countDocuments({ status: 'pending' }),
      Application.countDocuments({}),
      Post.countDocuments({}),
      Dispute.countDocuments({ status: 'open' }),
      CampaignRevenue.aggregate([
        { $group: { 
          _id: null, 
          total: { $sum: '$totalFee' },
          totalBudget: { $sum: '$campaignBudget' },
          coinRevenue: { $sum: '$coinCost' }
        } }
      ])
    ]);

    // Active Engagement Rate & Reach (Combined Analytics)
    const analyticsQuery = {};
    if (startDate || endDate) {
      analyticsQuery.timestamp = {};
      if (startDate) analyticsQuery.timestamp.$gte = new Date(startDate);
      if (endDate) analyticsQuery.timestamp.$lte = new Date(endDate);
    }

    const [engagementCount, impressionCount, clickCount] = await Promise.all([
      Analytics.countDocuments({ type: 'engagement', ...analyticsQuery }),
      Analytics.countDocuments({ type: 'impression', ...analyticsQuery }),
      Analytics.countDocuments({ type: 'click', ...analyticsQuery })
    ]);
    
    // Engagement Rate = (Total Engagements / Total Impressions) * 100
    const engagementRate = impressionCount > 0 ? ((engagementCount / impressionCount) * 100).toFixed(1) : 0;

    // Coins in Circulation (sum of wallet balances and coins)
    const coinAgg = await User.aggregate([
      { $group: { _id: null, totalCoins: { $sum: '$coins' }, totalBalance: { $sum: '$walletBalance' } } }
    ]);

    const activeUsers30d = await User.countDocuments({ 
      updatedAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } 
    });

    return {
      stats: {
        totalUsers,
        totalInfluencers,
        totalBrands,
        totalCampaigns,
        activeCampaigns,
        pendingCampaigns,
        totalApplications,
        totalPosts,
        totalEngagement: engagementCount,
        totalReach: engagementCount, // Redefined as Likes + Comments per user request
        totalImpressions: impressionCount,
        totalClick: clickCount,
        activeUsers30d,
        avgEngagementRate: engagementRate,
        totalRevenue: Math.round(revenueStats[0]?.total || 0),
        totalCapitalFlow: Math.round(revenueStats[0]?.totalBudget || 0),
        totalCoinRevenue: Math.round(revenueStats[0]?.coinRevenue || 0),
        totalCoinsCirculation: Math.round(coinAgg[0]?.totalCoins || 0),
        openDisputes,
        monthlyGrowth: 12.5, // Placeholder for trend calculation
      }
    };
  },

  getPostAnalytics: async (filters = {}) => {
    const { startDate, endDate, postId } = filters;
    const dateQuery = {};
    if (startDate || endDate) {
      dateQuery.createdAt = {};
      if (startDate) dateQuery.createdAt.$gte = new Date(startDate);
      if (endDate) dateQuery.createdAt.$lte = new Date(endDate);
    }

    // Engagement Over Time (Line Chart)
    const engagementMatch = { 
      type: 'engagement',
      ...(postId ? { 'metadata.postId': postId } : {}),
      ...(startDate || endDate ? { timestamp: { $gte: new Date(startDate || 0), $lte: new Date(endDate || Date.now()) } } : {})
    };

    const engagementTrend = await Analytics.aggregate([
      { $match: engagementMatch },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$timestamp" } },
          likes: { $sum: { $cond: [{ $eq: ["$metadata.action", "like"] }, 1, 0] } },
          comments: { $sum: { $cond: [{ $eq: ["$metadata.action", "comment"] }, 1, 0] } },
          total: { $sum: 1 }
        }
      },
      { $sort: { "_id": 1 } }
    ]);

    // Top Performing Posts
    let topPosts = [];
    if (postId) {
      const post = await Post.findById(postId).populate('author', 'name avatar').lean();
      if (post) topPosts = [post];
    } else {
      topPosts = await Post.find(dateQuery)
        .populate('author', 'name avatar')
        .sort({ 'likes': -1 })
        .limit(5)
        .lean();
    }

    const formattedTopPosts = topPosts.map(p => ({
      id: p._id,
      content: p.content?.substring(0, 50),
      likes: p.likes?.length || 0,
      comments: p.comments?.length || 0,
      author: p.author?.name,
      authorId: p.author?._id,
      authorDetails: {
        id: p.author?._id,
        name: p.author?.name,
        avatar: p.author?.avatar
      }
    }));

    // Category Distribution (Pie Chart)
    const categoryStats = await Post.aggregate([
      { $match: dateQuery },
      { $group: { _id: "$category", count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    return {
      engagementTrend: (engagementTrend || []).map(d => ({ 
        date: d._id, 
        value: d.total || 0,
        likes: d.likes || 0,
        comments: d.comments || 0
      })),
      topPosts: formattedTopPosts || [],
      categoryData: (categoryStats || []).map(c => ({ name: c._id || 'General', value: c.count })),
      summary: {
        totalPosts: postId ? 1 : await Post.countDocuments(dateQuery),
        totalEngagements: await Analytics.countDocuments({ type: 'engagement', ...(postId ? { 'metadata.postId': postId } : dateQuery) })
      }
    };
  },

  getCampaignAnalytics: async (filters = {}) => {
    const { startDate, endDate, campaignId } = filters;
    const dateQuery = {};
    if (startDate || endDate) {
      dateQuery.createdAt = {};
      if (startDate) dateQuery.createdAt.$gte = new Date(startDate);
      if (endDate) dateQuery.createdAt.$lte = new Date(endDate);
    }

    // Success Rate (Pie Chart) or Status if single
    const matchQuery = campaignId ? { _id: require('mongoose').Types.ObjectId(campaignId) } : dateQuery;
    const [statusStats, categoryStats, appCounts] = await Promise.all([
      Campaign.aggregate([
        { $match: matchQuery },
        { $group: { _id: "$status", count: { $sum: 1 } } }
      ]),
      Campaign.aggregate([
        { $match: dateQuery },
        { $group: { _id: "$category", count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]),
      Application.aggregate([
        { $match: campaignId ? { campaignId: require('mongoose').Types.ObjectId(campaignId) } : {} },
        { $group: { _id: "$campaignId", count: { $sum: 1 } } }
      ])
    ]);

    const appCountMap = appCounts.reduce((acc, curr) => {
      acc[curr._id.toString()] = curr.count;
      return acc;
    }, {});

    // Budget vs ROI
    let budgetData = [];
    if (campaignId) {
      const campaign = await Campaign.findById(campaignId).select('title budget status').lean();
      if (campaign) budgetData = [campaign];
    } else {
      budgetData = await Campaign.find(dateQuery)
        .select('title budget status')
        .limit(15)
        .lean();
    }

    const roiData = budgetData.map(c => {
      const apps = appCountMap[c._id.toString()] || 0;
      return {
        id: c._id,
        name: c.title?.substring(0, 15),
        budget: c.budget || 0,
        roi: c.budget > 0 ? (apps / c.budget).toFixed(4) : 0,
        applications: apps
      };
    });

    return {
      statusDistribution: (statusStats || []).map(s => ({ name: s._id || 'Unknown', value: s.count || 0 })),
      categoryDistribution: (categoryStats || []).map(c => ({ name: c._id || 'General', value: c.count })),
      budgetRoi: roiData || [],
      totals: {
        totalCampaigns: campaignId ? 1 : await Campaign.countDocuments(dateQuery),
        activeCampaigns: await Campaign.countDocuments({ status: 'active', ...(campaignId ? { _id: campaignId } : dateQuery) }),
        completedCampaigns: await Campaign.countDocuments({ status: 'completed', ...(campaignId ? { _id: campaignId } : dateQuery) }),
        totalApplications: Object.values(appCountMap).reduce((s, c) => s + c, 0)
      }
    };
  },

  getInfluencerAnalytics: async (filters = {}) => {
    const { startDate, endDate, influencerId } = filters;
    const dateQuery = {};
    if (startDate || endDate) {
      dateQuery.createdAt = {};
      if (startDate) dateQuery.createdAt.$gte = new Date(startDate);
      if (endDate) dateQuery.createdAt.$lte = new Date(endDate);
    }

    const { ObjectId } = require('mongoose').Types;
    const analyticsMatch = {
      ...(influencerId ? { userId: ObjectId(influencerId) } : {}),
      ...(startDate || endDate ? { timestamp: { $gte: new Date(startDate || 0), $lte: new Date(endDate || Date.now()) } } : {})
    };

    const applicationMatch = {
      ...(influencerId ? { influencerId: ObjectId(influencerId) } : {})
      // No date filter: campaign win rate and category prefs should reflect all-time data
    };

    const [influencerStats, reachTrend, engagementTrend, payoutTrend, applicationStats, categoryPrefs] = await Promise.all([
      // Leaderboard / Basic Stats
      Post.aggregate([
        { $match: influencerId ? { author: ObjectId(influencerId) } : dateQuery },
        {
          $group: {
            _id: "$author",
            totalLikes: { $sum: { $size: { $ifNull: ["$likes", []] } } },
            totalComments: { $sum: { $size: { $ifNull: ["$comments", []] } } },
            postCount: { $sum: 1 }
          }
        },
        { $sort: { totalLikes: -1 } },
        { $limit: influencerId ? 1 : 10 },
        {
          $lookup: {
            from: "users",
            localField: "_id",
            foreignField: "_id",
            as: "userDetails"
          }
        },
        { $unwind: "$userDetails" }
      ]),
      // Reach Trend (Impressions)
      Analytics.aggregate([
        { $match: { ...analyticsMatch, type: 'engagement' } },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m", date: "$timestamp" } },
            reach: { $sum: 1 } // Now reflecting Engagement count for "Reach"
          }
        },
        { $sort: { "_id": 1 } }
      ]),
      // Engagement Split
      Analytics.aggregate([
        { $match: { ...analyticsMatch, type: 'engagement' } },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m", date: "$timestamp" } },
            likes: { $sum: { $cond: [{ $eq: ["$metadata.action", "like"] }, 1, 0] } },
            comments: { $sum: { $cond: [{ $eq: ["$metadata.action", "comment"] }, 1, 0] } }
          }
        },
        { $sort: { "_id": 1 } }
      ]),
      // Payouts (Earning Transactions)
      Transaction.aggregate([
        { $match: { 
          ...(influencerId ? { user: ObjectId(influencerId) } : {}), 
          type: 'earning', 
          asset: 'money', 
          status: 'completed',
          ...dateQuery 
        } },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
            earnings: { $sum: "$amount" }
          }
        },
        { $sort: { "_id": 1 } }
      ]),
      // Application Success Rate
      Application.aggregate([
        { $match: applicationMatch },
        { $group: { _id: "$status", count: { $sum: 1 } } }
      ]),
      // Preferred categories based on applications
      Application.aggregate([
        { $match: applicationMatch },
        {
          $lookup: {
            from: 'campaigns',
            localField: 'campaignId',
            foreignField: '_id',
            as: 'campaign'
          }
        },
        { $unwind: { path: '$campaign', preserveNullAndEmptyArrays: true } },
        {
          $group: {
            _id: { $ifNull: ['$campaign.category', 'Other'] },
            count: { $sum: 1 }
          }
        },
        { $sort: { count: -1 } }
      ])
    ]);

    const leaderboard = influencerStats.map(stat => {
      const followersCount = Array.isArray(stat.userDetails.followers) ? stat.userDetails.followers.length : (stat.userDetails.followers || 0);
      return {
        id: stat._id,
        name: stat.userDetails.name,
        engagement: stat.totalLikes + stat.totalComments,
        posts: stat.postCount,
        rate: followersCount > 0 ? (((stat.totalLikes + stat.totalComments) / followersCount) * 100).toFixed(2) : 0,
        totalEarnings: stat.userDetails.totalEarnings || 0,
        followersCount: followersCount
      };
    });

    // Monthly Growth (New Users)
    const growthTrend = await User.aggregate([
      { $match: { role: 'influencer', ...dateQuery } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
          count: { $sum: 1 }
        }
      },
      { $sort: { "_id": 1 } }
    ]);

    const totalFollowersCount = await User.aggregate([
      { $match: { role: 'influencer' } },
      { $project: { count: { $size: { $ifNull: ["$followers", []] } } } },
      { $group: { _id: null, total: { $sum: "$count" } } }
    ]);

    return {
      leaderboard: leaderboard || [],
      growthTrend: (growthTrend || []).map(d => ({ month: d._id, count: d.count || 0 })),
      reachTrend: reachTrend.map(r => ({ month: r._id, reach: r.reach })),
      engagementTrend: engagementTrend.map(e => ({ month: e._id, likes: e.likes, comments: e.comments })),
      payoutTrend: payoutTrend.map(p => ({ month: p._id, earnings: p.earnings })),
      applicationStats: applicationStats.map(a => ({ name: a._id || 'Unknown', value: a.count || 0 })),
      preferredCategories: categoryPrefs.map(c => ({ name: c._id || 'Other', value: c.count || 0 })),
      totalInfluencers: influencerId ? 1 : await User.countDocuments({ role: 'influencer' }),
      totalFollowers: totalFollowersCount[0]?.total || 0
    };
  },

  getBrandAnalytics: async (filters = {}) => {
    const { startDate, endDate, brandId } = filters;
    const dateQuery = {};
    if (startDate || endDate) {
      dateQuery.createdAt = {};
      if (startDate) dateQuery.createdAt.$gte = new Date(startDate);
      if (endDate) dateQuery.createdAt.$lte = new Date(endDate);
    }

    const { ObjectId } = require('mongoose').Types;
    const spendingMatch = { 
      ...(brandId ? { user: ObjectId(brandId) } : {}),
      type: { $in: ['deduction', 'spending', 'topup'] }, 
      status: 'completed',
      ...dateQuery 
    };

    const campaignMatch = {
      ...(brandId ? { author: ObjectId(brandId) } : {}),
      ...dateQuery
    };

    const [spendingTrend, distribution, applicationPipeline, fulfillmentStats, revenueData] = await Promise.all([
      // Spending Flow
      Transaction.aggregate([
        { $match: spendingMatch },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
            amount: { $sum: "$amount" }
          }
        },
        { $sort: { "_id": 1 } }
      ]),
      // Brand Distribution based on Investment
      Campaign.aggregate([
        { $match: campaignMatch },
        { $group: { _id: "$author", totalInvestment: { $sum: "$budget" }, count: { $sum: 1 } } },
        { $sort: { totalInvestment: -1 } },
        { $limit: brandId ? 1 : 10 },
        {
          $lookup: {
            from: "users",
            localField: "_id",
            foreignField: "_id",
            as: "brandDetails"
          }
        },
        { $unwind: "$brandDetails" }
      ]),
      // Application Pipeline (Applied vs Accepted vs Rejected)
      Application.aggregate([
        { 
          $lookup: {
            from: 'campaigns',
            localField: 'campaignId',
            foreignField: '_id',
            as: 'campaign'
          }
        },
        { $unwind: '$campaign' },
        { 
          $match: { 
            ...(brandId ? { 'campaign.author': ObjectId(brandId) } : {}),
            ...dateQuery 
          } 
        },
        {
          $group: {
            _id: { 
              month: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
              status: "$status"
            },
            count: { $sum: 1 }
          }
        },
        { $sort: { "_id.month": 1 } }
      ]),
      // Fulfillment Status
      Campaign.aggregate([
        { $match: campaignMatch },
        { $group: { _id: "$status", value: { $sum: 1 } } }
      ])
    ]);

    // Platform Revenue — read from CampaignRevenue (fee-snapshot DB) for accuracy
    const revenueQuery = brandId ? { brand: ObjectId(brandId) } : {};
    const revenueAgg = await CampaignRevenue.aggregate([
      { $match: revenueQuery },
      { $group: { _id: null, total: { $sum: '$totalFee' } } }
    ]);
    const platformRevenue = Math.round(revenueAgg[0]?.total || 0);

    // Format Application Pipeline for Recharts
    const pipelineMap = applicationPipeline.reduce((acc, curr) => {
      const { month, status } = curr._id;
      if (!acc[month]) acc[month] = { month, applied: 0, accepted: 0, rejected: 0, pending: 0 };
      if (status === 'pending') {
        acc[month].pending += curr.count;
        acc[month].applied += curr.count;
      }
      else if (status === 'accepted') {
        acc[month].accepted += curr.count;
        acc[month].applied += curr.count;
      }
      else if (status === 'rejected') {
        acc[month].rejected += curr.count;
        acc[month].applied += curr.count;
      }
      return acc;
    }, {});

    return {
      spendingTrend: (spendingTrend || []).map(d => ({ month: d._id, amount: d.amount || 0 })),
      brandDistribution: (distribution || []).map(d => ({ name: d.brandDetails?.name || 'Unknown', value: d.totalInvestment || 0 })),
      pipelineTrend: Object.values(pipelineMap).sort((a,b) => a.month.localeCompare(b.month)),
      fulfillmentStats: fulfillmentStats.map(s => ({ name: s._id, value: s.value })),
      platformRevenue,
      totalBrands: brandId ? 1 : await User.countDocuments({ role: 'brand' })
    };
  },

  getRevenueAnalytics: async (filters = {}) => {
    const { startDate, endDate } = filters;

    // ── Read all stored CampaignRevenue records ───────────────────────────
    // These have fee rates snapshotted at the time of each event,
    // so changing fees today doesn't alter past campaign revenue.
    const revenueRecords = await CampaignRevenue.find({}).lean();

    // Build daily trend (using campaign creation date stored in the record via timestamps)
    const trendStart = startDate ? new Date(startDate) : null;
    const trendEnd = endDate ? new Date(endDate) : null;

    const dailyRevenueMap = {};
    const categoryRevenueMap = {};
    let totalPlatformRevenue = 0;

    revenueRecords.forEach(r => {
      const fee = r.totalFee || 0;
      totalPlatformRevenue += fee;

      // Category breakdown
      const cat = r.category || 'Other';
      categoryRevenueMap[cat] = (categoryRevenueMap[cat] || 0) + fee;

      const d = new Date(r.createdAt);
      if (trendStart && d < trendStart) return;
      if (trendEnd && d > trendEnd) return;

      const day = d.toISOString().slice(0, 10);
      dailyRevenueMap[day] = (dailyRevenueMap[day] || 0) + fee;
    });

    // 30-day range for smoothing the chart
    const daysToFill = 30;
    const allDays = [];
    for (let i = daysToFill; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      allDays.push(d.toISOString().slice(0, 10));
    }

    allDays.forEach(day => {
      if (!dailyRevenueMap[day]) dailyRevenueMap[day] = 0;
    });

    const revenueTrend = Object.keys(dailyRevenueMap).sort().map(day => ({
        month: day,
        amount: Math.round(dailyRevenueMap[day])
    }));

    // Revenue by Category
    const revenueByCategory = Object.entries(categoryRevenueMap)
      .filter(([, v]) => v > 0)
      .map(([name, value]) => ({ name, value: Math.round(value) }))
      .sort((a, b) => b.value - a.value);

    // Fallback: if no revenue data yet (no campaigns), show category counts
    const categoryFallback = revenueByCategory.length === 0
      ? await (async () => {
          const cats = await Campaign.aggregate([
            { $group: { _id: '$category', count: { $sum: 1 } } }
          ]);
          return cats.map(c => ({ name: c._id || 'Other', value: c.count }));
        })()
      : revenueByCategory;

    // User Role Distribution
    const userRoles = await User.aggregate([
      { $group: { _id: '$role', count: { $sum: 1 } } }
    ]);

    // Top Users by Time Spent
    const analyticsDateQuery = {};
    if (startDate) analyticsDateQuery.timestamp = { ...analyticsDateQuery.timestamp, $gte: new Date(startDate) };
    if (endDate) analyticsDateQuery.timestamp = { ...analyticsDateQuery.timestamp, $lte: new Date(endDate) };

    const activeTimeRecords = await Analytics.aggregate([
      { $match: Object.keys(analyticsDateQuery).length ? analyticsDateQuery : {} },
      { $sort: { userId: 1, timestamp: 1 } },
      { $group: { _id: '$userId', events: { $push: '$timestamp' } } }
    ]);

    const sessionThreshold = 1800000; // 30 min
    const userTimeMap = activeTimeRecords
      .map(record => {
        let totalMs = 0;
        for (let i = 1; i < record.events.length; i++) {
          const diff = new Date(record.events[i]) - new Date(record.events[i - 1]);
          if (diff < sessionThreshold) totalMs += diff;
        }
        return { userId: record._id, timeMs: totalMs };
      })
      .sort((a, b) => b.timeMs - a.timeMs)
      .slice(0, 5);

    const topUsersWithNames = await Promise.all(userTimeMap.map(async u => {
      const user = await User.findById(u.userId).select('name');
      return { name: user?.name || 'Unknown', minutes: Math.round(u.timeMs / 60000) };
    }));

    // Read current fee rates for display purposes
    const [cfSetting, afSetting] = await Promise.all([
      AppSetting.findOne({ key: 'platformFeeStructure.campaignFee' }),
      AppSetting.findOne({ key: 'platformFeeStructure.applicationFee' })
    ]);

    return {
      revenueTrend,
      userDistribution: (userRoles || []).map(r => ({ name: r._id || 'Unknown', value: r.count })),
      revenueByCategory: categoryFallback,
      topUsersByTime: topUsersWithNames,
      totalPlatformRevenue: Math.round(totalPlatformRevenue),
      totalCampaigns: revenueRecords.length,
      totalApplications: revenueRecords.reduce((s, r) => s + r.applicationFees.length, 0),
      feeRates: {
        campaignFee: Number(cfSetting?.value || 0).toFixed(1),
        applicationFee: Number(afSetting?.value || 0).toFixed(1),
        usingFallback: false
      }
    };
  }
};

module.exports = adminAnalyticsService;

