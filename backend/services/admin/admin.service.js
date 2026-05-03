const mongoose = require('mongoose');
const User = require('../../models/User');
const Campaign = require('../../models/Campaign');
const Application = require('../../models/Application');
const Analytics = require('../../models/Analytics');
const Transaction = require('../../models/Transaction');
const Dispute = require('../../models/Dispute');
const Post = require('../../models/Post');
const AppSetting = require('../../models/AppSetting');
const CampaignRevenue = require('../../models/CampaignRevenue');
const Badge = require('../../models/Badge');
const { deleteUploadedFile } = require('../../utils/uploadStorage');

const resizeObjectIdArray = (items = [], targetCount = 0) => {
  const nextCount = Math.max(0, Number(targetCount) || 0);
  const existing = Array.isArray(items)
    ? items
        .filter((item) => mongoose.Types.ObjectId.isValid(String(item)))
        .map((item) => new mongoose.Types.ObjectId(String(item)))
        .slice(0, nextCount)
    : [];

  while (existing.length < nextCount) {
    existing.push(new mongoose.Types.ObjectId());
  }

  return existing;
};

const enrichAdminUserReferralCounts = async (users = []) => {
  if (!users.length) return users;

  const userIdStrings = users
    .map((user) => user._id)
    .filter((id) => mongoose.Types.ObjectId.isValid(String(id)))
    .map((id) => String(id));

  const referralGroups = await User.aggregate([
    { $match: { referredBy: { $exists: true, $ne: null } } },
    { $addFields: { referrerIdString: { $toString: '$referredBy' } } },
    { $match: { referrerIdString: { $in: userIdStrings } } },
    {
      $group: {
        _id: '$referrerIdString',
        total: { $sum: 1 },
        referredUserIds: { $addToSet: '$_id' }
      }
    }
  ]);

  const referredUserIds = referralGroups.flatMap((group) => group.referredUserIds || []);
  const completedReferralUserIds = referredUserIds.length > 0
    ? await Transaction.distinct('user', {
        user: { $in: referredUserIds },
        type: 'topup',
        status: 'completed',
      })
    : [];
  const completedSet = new Set(completedReferralUserIds.map(String));
  const totalByReferrer = new Map();
  const completedByReferrer = new Map();

  referralGroups.forEach((group) => {
    const referrerId = String(group._id);
    const referredIds = group.referredUserIds || [];
    totalByReferrer.set(referrerId, group.total || referredIds.length || 0);
    completedByReferrer.set(
      referrerId,
      referredIds.filter((id) => completedSet.has(String(id))).length
    );
  });

  return users.map((user) => ({
    ...user,
    referralsCount: totalByReferrer.get(String(user._id)) || 0,
    completedReferralsCount: completedByReferrer.get(String(user._id)) || 0,
  }));
};

const adminService = {
  getStats: async () => {
    const totalUsers = await User.countDocuments();
    const totalInfluencers = await User.countDocuments({ role: 'influencer' });
    const totalBrands = await User.countDocuments({ role: 'brand' });
    const activeCampaigns = await Campaign.countDocuments({ status: 'active' });
    const pendingCampaigns = await Campaign.countDocuments({ status: 'pending' });
    const totalApplications = await Application.countDocuments();
    const openDisputes = await Dispute.countDocuments({ status: 'open' });

    const totalBudget = await Campaign.aggregate([
      { $match: { status: 'active' } },
      { $group: { _id: null, total: { $sum: '$budget' } } },
    ]);

    const totalCapitalFlow = await Campaign.aggregate([
      { $group: { _id: null, total: { $sum: '$budget' } } },
    ]);

    const postStats = await Post.aggregate([
      {
        $group: {
          _id: null,
          count: { $sum: 1 },
          likes: { $sum: { $size: { $ifNull: ["$likes", []] } } },
          comments: { $sum: { $size: { $ifNull: ["$comments", []] } } }
        }
      }
    ]);

    const revenueStats = await CampaignRevenue.aggregate([
      { $group: { 
        _id: null, 
        total: { $sum: { $ifNull: ['$totalFee', 0] } },
        totalBudget: { $sum: { $ifNull: ['$campaignBudget', 0] } },
        coinRevenue: { $sum: { $ifNull: ['$coinCost', 0] } }
      } }
    ]);
    const totalRevenueVal = Math.round(revenueStats[0]?.total || 0);
    const totalCapitalFlowVal = Math.round(revenueStats[0]?.totalBudget || 0);
    const totalCoinRevenueVal = Math.round(revenueStats[0]?.coinRevenue || 0);

    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const usersThisMonth = await User.countDocuments({ createdAt: { $gte: thirtyDaysAgo } });
    const activeUsers30d = await User.countDocuments({ 
      updatedAt: { $gte: thirtyDaysAgo } 
    });

    const engagementCount = await Analytics.countDocuments({ type: 'engagement' });
    const totalReach = engagementCount; // Redefined as Likes + Comments for consistency with Analytics tab request

    const totalCirculatingCoins = await User.aggregate([
      { $group: { _id: null, total: { $sum: '$coins' } } }
    ]);

    const monthlyGrowth = totalUsers > 0 ? ((usersThisMonth / totalUsers) * 100).toFixed(1) : 0;

    const totalEngagements = engagementCount;
    const avgEngagementRate = totalReach > 0 ? 100 : 0; // Simplified aggregate rate since Reach=Engagement in this context, or pull from impressions if available

    const brandStats = await Campaign.aggregate([
      { $group: { _id: '$author', count: { $sum: 1 } } },
      { $group: { 
        _id: null, 
        repeatBrands: { $sum: { $cond: [{ $gt: ['$count', 1] }, 1, 0] } }, 
        totalBrands: { $sum: 1 } 
      } }
    ]);
    const brandRetention = brandStats[0]?.totalBrands > 0 
      ? ((brandStats[0]?.repeatBrands / brandStats[0]?.totalBrands) * 100).toFixed(1) 
      : 0;

    return {
      totalUsers,
      activeUsers30d,
      totalInfluencers,
      totalBrands,
      activeCampaigns,
      pendingCampaigns,
      totalApplications,
      openDisputes,
      totalBudget: totalBudget[0]?.total || 0,
      totalCapitalFlow: totalCapitalFlowVal,
      totalPosts: postStats[0]?.count || 0,
      totalEngagement: totalEngagements,
      totalReach,
      avgEngagementRate,
      brandRetention,
      totalRevenue: totalRevenueVal,
      totalCoinRevenue: totalCoinRevenueVal,
      totalCoinsCirculation: totalCirculatingCoins[0]?.total || 0,
      monthlyGrowth
    };
  },

  getUsers: async (filter) => {
    // If filtering by brand, aggregate campaign metrics
    if (filter.role === 'brand') {
      const users = await User.aggregate([
        { $match: filter },
        { $addFields: { status: { $ifNull: ['$status', 'active'] } } },
        {
          $lookup: {
            from: 'campaigns',
            localField: '_id',
            foreignField: 'author',
            as: 'campaignData'
          }
        },
        {
          $addFields: {
            totalSpent: { $sum: '$campaignData.budget' },
            campaignsCount: { $size: '$campaignData' }
          }
        },
        {
          $lookup: {
            from: 'users',
            localField: '_id',
            foreignField: 'referredBy',
            as: 'referralData'
          }
        },
        {
          $lookup: {
            from: 'transactions',
            localField: 'referralData._id',
            foreignField: 'user',
            as: 'referralTransactionData'
          }
        },
        {
          $addFields: {
            referralsCount: { $size: '$referralData' },
            completedReferralsCount: {
              $size: {
                $setUnion: [
                  {
                    $map: {
                      input: {
                        $filter: {
                          input: '$referralTransactionData',
                          as: 'transaction',
                          cond: {
                            $and: [
                              { $eq: ['$$transaction.type', 'topup'] },
                              { $eq: ['$$transaction.status', 'completed'] }
                            ]
                          }
                        }
                      },
                      as: 'transaction',
                      in: '$$transaction.user'
                    }
                  },
                  []
                ]
              }
            }
          }
        },
        {
          $project: {
            password: 0,
            refreshToken: 0,
            campaignData: 0,
            referralData: 0,
            referralTransactionData: 0
          }
        },
        {
          $lookup: {
            from: 'badges',
            localField: 'badges',
            foreignField: '_id',
            as: 'badges'
          }
        },
        { $sort: { totalSpent: -1 } },
        { $limit: 100 }
      ]);
      return await enrichAdminUserReferralCounts(users);
    }

    // If filtering by influencer, aggregate post metrics and earnings
    if (filter.role === 'influencer') {
      const users = await User.aggregate([
        { $match: filter },
        { $addFields: { status: { $ifNull: ['$status', 'active'] } } },
        {
          $lookup: {
            from: 'posts',
            localField: '_id',
            foreignField: 'author',
            as: 'postData'
          }
        },
        {
          $lookup: {
            from: 'transactions',
            localField: '_id',
            foreignField: 'user',
            as: 'transactionData'
          }
        },
        {
          $addFields: {
            totalLikes: { $sum: { $map: { input: '$postData', as: 'p', in: { $size: { $ifNull: ['$$p.likes', []] } } } } },
            totalComments: { $sum: { $map: { input: '$postData', as: 'p', in: { $size: { $ifNull: ['$$p.comments', []] } } } } },
            postCount: { $size: '$postData' },
            totalEarnings: { 
              $sum: { 
                $map: { 
                  input: { 
                    $filter: { 
                      input: '$transactionData', 
                      as: 't', 
                      cond: { $and: [{ $eq: ['$$t.type', 'earning'] }, { $eq: ['$$t.status', 'completed'] }] } 
                    } 
                  }, 
                  as: 't', 
                  in: '$$t.amount' 
                } 
              } 
            }
          }
        },
        {
          $addFields: {
            followersCount: { $size: { $ifNull: ['$followers', []] } }
          }
        },
        {
          $lookup: {
            from: 'users',
            localField: '_id',
            foreignField: 'referredBy',
            as: 'referralData'
          }
        },
        {
          $lookup: {
            from: 'transactions',
            localField: 'referralData._id',
            foreignField: 'user',
            as: 'referralTransactionData'
          }
        },
        {
          $addFields: {
            referralsCount: { $size: '$referralData' },
            completedReferralsCount: {
              $size: {
                $setUnion: [
                  {
                    $map: {
                      input: {
                        $filter: {
                          input: '$referralTransactionData',
                          as: 'transaction',
                          cond: {
                            $and: [
                              { $eq: ['$$transaction.type', 'topup'] },
                              { $eq: ['$$transaction.status', 'completed'] }
                            ]
                          }
                        }
                      },
                      as: 'transaction',
                      in: '$$transaction.user'
                    }
                  },
                  []
                ]
              }
            }
          }
        },
        {
          $addFields: {
            engagementRate: {
              $cond: [
                { $gt: ['$followersCount', 0] },
                { 
                  $multiply: [
                    { $divide: [{ $add: ['$totalLikes', '$totalComments'] }, '$followersCount'] },
                    100
                  ]
                },
                0
              ]
            }
          }
        },
        {
          $project: {
            password: 0,
            refreshToken: 0,
            postData: 0,
            transactionData: 0,
            referralData: 0,
            referralTransactionData: 0
          }
        },
        {
          $lookup: {
            from: 'badges',
            localField: 'badges',
            foreignField: '_id',
            as: 'badges'
          }
        },
        { $sort: { totalEarnings: -1 } },
        { $limit: 100 }
      ]);
      return await enrichAdminUserReferralCounts(users);
    }

    // Default fetch for others
    const users = await User.aggregate([
      { $match: filter },
      { $addFields: { status: { $ifNull: ['$status', 'active'] } } },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: 'referredBy',
          as: 'referralData'
        }
      },
      {
        $lookup: {
          from: 'transactions',
          localField: 'referralData._id',
          foreignField: 'user',
          as: 'referralTransactionData'
        }
      },
      {
        $addFields: {
          referralsCount: { $size: '$referralData' },
          completedReferralsCount: {
            $size: {
              $setUnion: [
                {
                  $map: {
                    input: {
                      $filter: {
                        input: '$referralTransactionData',
                        as: 'transaction',
                        cond: {
                          $and: [
                            { $eq: ['$$transaction.type', 'topup'] },
                            { $eq: ['$$transaction.status', 'completed'] }
                          ]
                        }
                      }
                    },
                    as: 'transaction',
                    in: '$$transaction.user'
                  }
                },
                []
              ]
            }
          }
        }
      },
      {
        $project: {
          password: 0,
          refreshToken: 0,
          referralData: 0,
          referralTransactionData: 0
        }
      },
      {
        $lookup: {
          from: 'badges',
          localField: 'badges',
          foreignField: '_id',
          as: 'badges'
        }
      },
      { $sort: { createdAt: -1 } },
      { $limit: 100 }
    ]);
    return await enrichAdminUserReferralCounts(users);
  },

  toggleUserVerification: async (userId) => {
    const user = await User.findById(userId);
    if (!user) throw new Error('User not found');

    user.isVerified = !user.isVerified;
    await user.save();
    return user;
  },

  updateUserStatus: async (userId, status) => {
    if (!mongoose.Types.ObjectId.isValid(String(userId))) {
      throw new Error('Invalid user id');
    }

    if (!['active', 'banned'].includes(status)) {
      throw new Error('Invalid status');
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { status },
      { new: true, runValidators: false }
    ).select('-password -refreshToken');

    if (!user) throw new Error('User not found');
    return user;
  },

  getCampaigns: async (status) => {
    let match = {};
    if (status) match.status = status;

    return await Campaign.aggregate([
      { $match: match },
      {
        $lookup: {
          from: 'users',
          localField: 'author',
          foreignField: '_id',
          as: 'author'
        }
      },
      { $unwind: { path: '$author', preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: 'analytics',
          let: { campaignId: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ['$campaignId', '$$campaignId'] },
                type: 'engagement'
              }
            }
          ],
          as: 'engagementData'
        }
      },
      {
        $addFields: {
          likesCount: {
            $size: {
              $filter: {
                input: '$engagementData',
                as: 'e',
                cond: { $eq: ['$$e.metadata.action', 'like'] }
              }
            }
          },
          commentsCount: {
            $size: {
              $filter: {
                input: '$engagementData',
                as: 'e',
                cond: { $eq: ['$$e.metadata.action', 'comment'] }
              }
            }
          }
        }
      },
      {
        $lookup: {
          from: 'applications',
          localField: '_id',
          foreignField: 'campaignId',
          as: 'applications'
        }
      },
      {
        $addFields: {
          applicantsCount: { $size: '$applications' }
        }
      },
      {
        $project: {
          engagementData: 0,
          applications: 0,
          'author.password': 0,
          'author.refreshToken': 0
        }
      },
      { $sort: { createdAt: -1 } },
      { $limit: 100 }
    ]);
  },

  updateCampaignStatus: async (campaignId, status) => {
    if (!['draft', 'pending', 'active', 'completed', 'cancelled', 'rejected'].includes(status)) {
      throw new Error('Invalid status');
    }

    const campaign = await Campaign.findByIdAndUpdate(
      campaignId,
      { status },
      { new: true }
    );

    if (!campaign) throw new Error('Campaign not found');
    return campaign;
  },

  getCampaignApplications: async (campaignId) => {
    return await Application.find({ campaignId })
      .populate('influencerId', 'name email profilePicture followers')
      .sort({ createdAt: -1 });
  },

  updateUserFollowers: async (userId, followers) => {
    if (!mongoose.Types.ObjectId.isValid(String(userId))) {
      throw new Error('Invalid user id');
    }

    const followerCount = Number(followers);
    if (!Number.isInteger(followerCount) || followerCount < 0) {
      throw new Error('Followers must be a non-negative number');
    }

    const userObjectId = new mongoose.Types.ObjectId(String(userId));
    const user = await User.collection.findOne(
      { _id: userObjectId },
      { projection: { followers: 1 } }
    );
    if (!user) throw new Error('User not found');

    const followersList = resizeObjectIdArray(user.followers, followerCount);
    await User.collection.updateOne(
      { _id: userObjectId },
      { $set: { followers: followersList } }
    );

    return await User.findById(userObjectId).select('-password -refreshToken');
  },

  updatePostLikes: async (postId, likes) => {
    if (!mongoose.Types.ObjectId.isValid(String(postId))) {
      throw new Error('Invalid post id');
    }

    const likeCount = Number(likes);
    if (!Number.isInteger(likeCount) || likeCount < 0) {
      throw new Error('Likes must be a non-negative number');
    }

    const post = await Post.findById(postId);
    if (!post) throw new Error('Post not found');

    post.likes = resizeObjectIdArray(post.likes, likeCount);
    await post.save();

    return await Post.findById(postId)
      .populate('author', 'name email avatar')
      .populate('likes', 'name');
  },

  getAnalytics: async () => {
    // 1. Monthly Revenue Trend
    const monthlyRevenue = await Transaction.aggregate([
      { $match: { type: 'topup', status: 'completed' } },
      {
        $group: {
          _id: {
            month: { $month: '$createdAt' },
            year: { $year: '$createdAt' }
          },
          revenue: { $sum: '$amount' }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
      { $limit: 12 }
    ]).then(results => results.map(r => ({
      month: new Date(r._id.year, r._id.month - 1).toLocaleString('en-US', { month: 'short' }),
      revenue: r.revenue
    })));

    // 2. Platform Distribution (Calculated from Campaigns)
    const platformDistributionData = await Campaign.aggregate([
      { $unwind: '$platforms' },
      { $group: { _id: '$platforms', count: { $sum: 1 } } }
    ]);
    
    const totalCampaigns = await Campaign.countDocuments();
    const platformDistribution = {};
    platformDistributionData.forEach(p => {
      platformDistribution[p._id] = totalCampaigns > 0 ? Math.round((p.count / totalCampaigns) * 100) : 0;
    });

    const activeUsers = await User.countDocuments({ updatedAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } });
    const growthRate = 12.5; // We could calculate this properly but keeping as placeholder for now since we have monthlyGrowth above

    return {
      monthlyRevenue: monthlyRevenue.length > 0 ? monthlyRevenue : [{ month: 'Current', revenue: 0 }],
      platformDistribution: Object.keys(platformDistribution).length > 0 ? platformDistribution : { 'Instagram': 45, 'YouTube': 30, 'TikTok': 25 },
      totalUsers: await User.countDocuments(),
      totalCampaigns: await Campaign.countDocuments(),
      totalRevenue: (await Transaction.aggregate([
        { $match: { type: 'topup', status: 'completed' } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]))[0]?.total || 0,
      activeUsers,
      growthRate
    };
  },

  getDisputes: async () => {
    return await Dispute.find()
      .populate('reporter', 'name email')
      .populate('reported', 'name email')
      .populate('campaign', 'title')
      .sort({ createdAt: -1 })
      .limit(100);
  },

  getAnnouncements: async () => {
    return await Campaign.find()
      .populate('author', 'name email')
      .sort({ createdAt: -1 })
      .limit(200);
  },

  updateAnnouncementCost: async (announcementId, cost) => {
    const campaign = await Campaign.findByIdAndUpdate(
      announcementId,
      { coinCost: Number(cost) || 0 },
      { new: true }
    );
    if (!campaign) throw new Error('Campaign not found');
    // Sync the CampaignRevenue record (fire-and-forget)
    const campaignRevenueService = require('../campaignRevenue.service');
    campaignRevenueService.updateCoinCost(announcementId, Number(cost) || 0).catch(() => {});
    return campaign;
  },

  getPosts: async (filter = {}) => {
    return await Post.find(filter)
      .populate('author', 'name email avatar')
      .populate('likes', 'name')
      .sort({ createdAt: -1 })
      .limit(100);
  },

  getFeeStructure: async () => {
    const campaignFeeSetting = await AppSetting.findOne({ key: 'platformFeeStructure.campaignFee' });
    const applicationFeeSetting = await AppSetting.findOne({ key: 'platformFeeStructure.applicationFee' });
    const minInfluencerBalanceSetting = await AppSetting.findOne({ key: 'platformFeeStructure.minInfluencerBalance' });
    const minRechargeAmountSetting = await AppSetting.findOne({ key: 'platformFeeStructure.minRechargeAmount' });
    const firstCampaignCoinCostSetting = await AppSetting.findOne({ key: 'platformFeeStructure.firstCampaignCoinCost' });
    const referralRequiredSetting = await AppSetting.findOne({ key: 'referral.requiredCompletedReferrals' });
    const referralRewardModeSetting = await AppSetting.findOne({ key: 'referral.referrerRewardMode' });
    const referralRewardValueSetting = await AppSetting.findOne({ key: 'referral.referrerRewardValue' });
    const referralReferredRewardSetting = await AppSetting.findOne({ key: 'referral.referredRewardCoins' });

    return {
      campaignFee: campaignFeeSetting?.value || 0,
      applicationFee: applicationFeeSetting?.value || 0,
      minInfluencerBalance: minInfluencerBalanceSetting?.value !== undefined ? minInfluencerBalanceSetting.value : 500,
      minRechargeAmount: minRechargeAmountSetting?.value !== undefined ? minRechargeAmountSetting.value : 500,
      firstCampaignCoinCost: firstCampaignCoinCostSetting?.value !== undefined ? firstCampaignCoinCostSetting.value : 50,
      referralRequiredCompleted: referralRequiredSetting?.value !== undefined ? referralRequiredSetting.value : 10,
      referralReferrerRewardMode: referralRewardModeSetting?.value || 'percentage',
      referralReferrerRewardValue: referralRewardValueSetting?.value !== undefined ? referralRewardValueSetting.value : 5,
      referralReferredRewardCoins: referralReferredRewardSetting?.value !== undefined ? referralReferredRewardSetting.value : 200,
    };
  },

  updateFeeStructure: async (campaignFee, applicationFee, minInfluencerBalance, minRechargeAmount, firstCampaignCoinCost, referralSettings = {}) => {
    if (campaignFee !== undefined) {
      await AppSetting.findOneAndUpdate(
        { key: 'platformFeeStructure.campaignFee' },
        { value: Number(campaignFee) || 0, description: 'Fee charged to brands when creating a campaign' },
        { upsert: true }
      );
    }

    if (applicationFee !== undefined) {
      await AppSetting.findOneAndUpdate(
        { key: 'platformFeeStructure.applicationFee' },
        { value: Number(applicationFee) || 0, description: 'Fee charged to influencers when applying to a campaign' },
        { upsert: true }
      );
    }

    if (minInfluencerBalance !== undefined) {
      await AppSetting.findOneAndUpdate(
        { key: 'platformFeeStructure.minInfluencerBalance' },
        { value: Number(minInfluencerBalance) || 0, description: 'Minimum wallet balance an influencer must have to apply for a campaign' },
        { upsert: true }
      );
    }

    if (minRechargeAmount !== undefined) {
      await AppSetting.findOneAndUpdate(
        { key: 'platformFeeStructure.minRechargeAmount' },
        { value: Number(minRechargeAmount) || 0, description: 'Minimum INR amount an influencer can recharge' },
        { upsert: true }
      );
    }

    if (firstCampaignCoinCost !== undefined) {
      await AppSetting.findOneAndUpdate(
        { key: 'platformFeeStructure.firstCampaignCoinCost' },
        { value: Number(firstCampaignCoinCost) || 0, description: 'Coin fee charged to a brand for launching their first campaign' },
        { upsert: true }
      );
    }

    if (referralSettings.requiredCompleted !== undefined) {
      await AppSetting.findOneAndUpdate(
        { key: 'referral.requiredCompletedReferrals' },
        { value: Math.max(1, Number(referralSettings.requiredCompleted) || 10), description: 'Completed referrals required before referral rewards are paid' },
        { upsert: true }
      );
    }

    if (referralSettings.referrerRewardMode !== undefined) {
      await AppSetting.findOneAndUpdate(
        { key: 'referral.referrerRewardMode' },
        { value: referralSettings.referrerRewardMode === 'fixed' ? 'fixed' : 'percentage', description: 'Referral reward mode for referrers' },
        { upsert: true }
      );
    }

    if (referralSettings.referrerRewardValue !== undefined) {
      await AppSetting.findOneAndUpdate(
        { key: 'referral.referrerRewardValue' },
        { value: Math.max(0, Number(referralSettings.referrerRewardValue) || 0), description: 'Referral reward value for referrers' },
        { upsert: true }
      );
    }

    if (referralSettings.referredRewardCoins !== undefined) {
      await AppSetting.findOneAndUpdate(
        { key: 'referral.referredRewardCoins' },
        { value: Math.max(0, Number(referralSettings.referredRewardCoins) || 0), description: 'Coin reward given to referred users after their first payment' },
        { upsert: true }
      );
    }

    return await adminService.getFeeStructure();
  },

  getRazorpaySettings: async () => {
    const setting = await AppSetting.findOne({ key: 'payment.razorpay' });
    const value = setting?.value || {};

    return {
      enabled: Boolean(value.enabled),
      keyId: value.keyId || '',
      keySecretConfigured: Boolean(value.keySecret),
      coinRate: Number(value.coinRate) > 0 ? Number(value.coinRate) : 1,
      currency: value.currency || 'INR'
    };
  },

  updateRazorpaySettings: async (payload = {}) => {
    const existing = await AppSetting.findOne({ key: 'payment.razorpay' });
    const current = existing?.value || {};
    const coinRate = Number(payload.coinRate);
    const nextValue = {
      enabled: Boolean(payload.enabled),
      keyId: typeof payload.keyId === 'string' ? payload.keyId.trim() : current.keyId || '',
      keySecret: payload.keySecret ? String(payload.keySecret).trim() : current.keySecret || '',
      coinRate: Number.isFinite(coinRate) && coinRate > 0 ? coinRate : (Number(current.coinRate) || 1),
      currency: 'INR'
    };

    await AppSetting.findOneAndUpdate(
      { key: 'payment.razorpay' },
      {
        value: nextValue,
        description: 'Razorpay credentials and coin purchase settings'
      },
      { upsert: true }
    );

    return adminService.getRazorpaySettings();
  },

  blockPost: async (postId, userId, blockedReason = 'Not meeting community standards') => {
    const post = await Post.findByIdAndUpdate(
      postId,
      { 
        blocked: true, 
        blockedReason, 
        blockedAt: new Date(), 
        blockedBy: userId 
      },
      { new: true }
    ).populate('author', 'name email');
    if (!post) throw new Error('Post not found');
    return post;
  },

  unblockPost: async (postId) => {
    const post = await Post.findByIdAndUpdate(
      postId,
      { 
        blocked: false,
        blockedReason: null,
        blockedAt: null,
        blockedBy: null
      },
      { new: true }
    ).populate('author', 'name email');
    if (!post) throw new Error('Post not found');
    return post;
  },

  blockCampaign: async (campaignId, userId, blockedReason = 'Not meeting community standards') => {
    const campaign = await Campaign.findByIdAndUpdate(
      campaignId,
      { 
        blocked: true, 
        blockedReason, 
        blockedAt: new Date(), 
        blockedBy: userId 
      },
      { new: true }
    ).populate('author', 'name email');
    if (!campaign) throw new Error('Campaign not found');
    return campaign;
  },

  unblockCampaign: async (campaignId) => {
    const campaign = await Campaign.findByIdAndUpdate(
      campaignId,
      { 
        blocked: false,
        blockedReason: null,
        blockedAt: null,
        blockedBy: null
      },
      { new: true }
    ).populate('author', 'name email');
    if (!campaign) throw new Error('Campaign not found');
    return campaign;
  },

  // Badge Management
  getBadges: async () => {
    return await Badge.find().sort({ createdAt: -1 });
  },

  createBadge: async (badgeData) => {
    return await Badge.create(badgeData);
  },

  updateBadge: async (badgeId, badgeData) => {
    const existingBadge = await Badge.findById(badgeId);
    if (!existingBadge) throw new Error('Badge not found');

    const badge = await Badge.findByIdAndUpdate(badgeId, badgeData, { new: true });
    if (
      badgeData.icon &&
      existingBadge.isCustomIcon &&
      existingBadge.icon !== badgeData.icon
    ) {
      await deleteUploadedFile(existingBadge.icon);
    }
    return badge;
  },

  deleteBadge: async (badgeId) => {
    const badge = await Badge.findByIdAndDelete(badgeId);
    if (!badge) throw new Error('Badge not found');
    if (badge.isCustomIcon) {
      await deleteUploadedFile(badge.icon);
    }
    
    // Remove this badge from all users
    await User.updateMany(
      { badges: badgeId },
      { $pull: { badges: badgeId } }
    );
    
    return badge;
  },

  assignBadgeToUser: async (userId, badgeId) => {
    const user = await User.findByIdAndUpdate(
      userId,
      { $addToSet: { badges: badgeId } },
      { new: true }
    ).populate('badges');
    if (!user) throw new Error('User not found');
    return user;
  },

  removeBadgeFromUser: async (userId, badgeId) => {
    const user = await User.findByIdAndUpdate(
      userId,
      { $pull: { badges: badgeId } },
      { new: true }
    ).populate('badges');
    if (!user) throw new Error('User not found');
    return user;
  }
};

module.exports = adminService;
