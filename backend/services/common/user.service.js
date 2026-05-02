const User = require('../../models/User');
const UserBio = require('../../models/UserBio');
const UserEducation = require('../../models/UserEducation');
const UserWork = require('../../models/UserWork');
const BrandProfile = require('../../models/BrandProfile');
const Post = require('../../models/Post');
const Campaign = require('../../models/Campaign');
const Notification = require('../../models/Notification');
const { fetchSocialMediaStats, SUPPORTED_PLATFORMS } = require('./socialMediaStats.service');
const { deleteUploadedFiles } = require('../../utils/uploadStorage');

const userService = {
  getProfile: async (userId) => {
    const user = await User.findById(userId).populate('badges');
    if (!user) throw new Error('User not found');

    const [userBio, education, work, brandProfile] = await Promise.all([
      UserBio.findOne({ userId: user._id }),
      UserEducation.find({ userId: user._id }).sort({ startDate: -1, createdAt: -1 }),
      UserWork.find({ userId: user._id }).sort({ startDate: -1, createdAt: -1 }),
      user.role === 'brand' ? BrandProfile.findOne({ userId: user._id }) : null
    ]);

    const profile = user.toJSON();
    profile.userBio = userBio || null;
    profile.education = education || [];
    profile.work = work || [];
    profile.brandProfile = brandProfile || null;

    return profile;
  },

  updateProfile: async (userId, updateData) => {
    const user = await User.findById(userId);
    if (!user) throw new Error('User not found');

    const allowedFields = user.role === 'influencer'
      ? ['name', 'bio', 'engagement', 'category', 'avatar', 'banner', 'socialLinks', 'location', 'niche', 'platforms']
      : ['name', 'avatar', 'banner', 'location'];

    const updates = {};
    const filesToDelete = [];
    for (const field of allowedFields) {
      if (updateData[field] !== undefined) {
        updates[field] = updateData[field];
        if (['avatar', 'banner'].includes(field) && user[field] && user[field] !== updateData[field]) {
          filesToDelete.push(user[field]);
        }
      }
    }

    Object.assign(user, updates);
    await user.save();
    await deleteUploadedFiles(filesToDelete);
    return user.toJSON();
  },

  saveUserBio: async (userId, bioData) => {
    let bio = await UserBio.findOne({ userId });
    if (!bio) {
      bio = new UserBio({ userId, ...bioData });
    } else {
      Object.assign(bio, bioData);
    }
    await bio.save();
    return bio;
  },

  addEducation: async (userId, data) => {
    const education = new UserEducation({ userId, ...data });
    await education.save();
    return education;
  },

  updateEducation: async (userId, eduId, data) => {
    const education = await UserEducation.findOneAndUpdate(
      { _id: eduId, userId },
      data,
      { new: true }
    );
    if (!education) throw new Error('Education record not found');
    return education;
  },

  deleteEducation: async (userId, eduId) => {
    const result = await UserEducation.findOneAndDelete({ _id: eduId, userId });
    if (!result) throw new Error('Education record not found');
    return { success: true };
  },

  addWork: async (userId, data) => {
    const work = new UserWork({ userId, ...data });
    await work.save();
    return work;
  },

  updateWork: async (userId, workId, data) => {
    const work = await UserWork.findOneAndUpdate(
      { _id: workId, userId },
      data,
      { new: true }
    );
    if (!work) throw new Error('Work record not found');
    return work;
  },

  deleteWork: async (userId, workId) => {
    const result = await UserWork.findOneAndDelete({ _id: workId, userId });
    if (!result) throw new Error('Work record not found');
    return { success: true };
  },

  searchUsers: async (query) => {
    if (!query) return [];
    return await User.find({
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { email: { $regex: query, $options: 'i' } },
      ]
    }).select('-password -refreshToken').limit(20);
  },

  getStats: async (userId) => {
    const user = await User.findById(userId);
    if (!user) throw new Error('User not found');

    let postsCount = 0;
    if (user.role === 'brand') {
      postsCount = await Campaign.countDocuments({ author: userId });
    } else {
      postsCount = await Post.countDocuments({ author: userId });
    }

    return {
      followersCount: user.followers.length,
      followingCount: user.following.length,
      postsCount,
      socialMediaAccounts: user.socialMediaAccounts,
    };
  }
};

const influencerService = {
  getInfluencersForBrands: async (filters) => {
    let query = { role: 'influencer', isVerified: true };
    if (filters.category) query.category = filters.category;
    if (filters.minFollowers) query.followers = { $gte: Number(filters.minFollowers) };
    if (filters.search) {
      query.$or = [
        { name: { $regex: filters.search, $options: 'i' } },
        { bio: { $regex: filters.search, $options: 'i' } },
      ];
    }
    return await User.find(query).select('-password -refreshToken').limit(50);
  },

  followUser: async (followerId, targetUserId) => {
    if (targetUserId === followerId) throw new Error('You cannot follow yourself');

    const userToFollow = await User.findById(targetUserId);
    if (!userToFollow) throw new Error('User not found');

    const follower = await User.findById(followerId);
    
    if (!userToFollow.followers.includes(followerId)) {
      userToFollow.followers.push(followerId);
      await userToFollow.save();
    }
    
    if (!follower.following.includes(targetUserId)) {
      follower.following.push(targetUserId);
      await follower.save();

      // Send notification
      const notification = new Notification({
        recipient: targetUserId,
        sender: followerId,
        type: 'follow',
        title: 'New Follower',
        message: `${follower.name || 'Someone'} started following you`,
        relatedId: followerId
      });
      await notification.save();
    }
    return { success: true };
  },

  unfollowUser: async (followerId, targetUserId) => {
    const userToUnfollow = await User.findById(targetUserId);
    if (!userToUnfollow) throw new Error('User not found');

    const follower = await User.findById(followerId);
    
    userToUnfollow.followers = userToUnfollow.followers.filter(id => id.toString() !== followerId.toString());
    await userToUnfollow.save();
    
    follower.following = follower.following.filter(id => id.toString() !== targetUserId.toString());
    await follower.save();
    return { success: true };
  },

  isFollowing: async (followerId, targetUserId) => {
    const follower = await User.findById(followerId);
    if (!follower) throw new Error('User not found');
    return follower.following.includes(targetUserId);
  },

  connectSocialMedia: async (userId, data) => {
    const { platform, accountId, accountName, accountUrl } = data;
    if (!SUPPORTED_PLATFORMS.includes(platform)) {
      throw new Error('Invalid platform');
    }
    if (!accountId && !accountName && !accountUrl) {
      throw new Error('Social account identifier is required');
    }

    const user = await User.findById(userId);
    if (!user) throw new Error('User not found');

    const stats = await fetchSocialMediaStats({ platform, accountId, accountName, accountUrl });
    const resolvedAccountId = stats.accountId || accountId;
    const resolvedAccountName = stats.accountName || accountName;
    const followers = platform === 'youtube' ? 0 : (stats.followers || 0);
    const subscribers = platform === 'youtube' ? (stats.subscribers || stats.followers || 0) : 0;

    const existingIndex = user.socialMediaAccounts.findIndex(acc => acc.platform === platform);
    if (existingIndex >= 0) {
      const existing = user.socialMediaAccounts[existingIndex];
      existing.accountId = resolvedAccountId;
      existing.accountName = resolvedAccountName;
      existing.accountUrl = accountUrl;
      existing.followers = followers;
      existing.subscribers = subscribers;
      existing.posts = stats.posts || 0;
      existing.videos = stats.videos || 0;
      existing.lastSyncedAt = new Date();
    } else {
      user.socialMediaAccounts.push({
        platform,
        accountId: resolvedAccountId,
        accountName: resolvedAccountName,
        accountUrl,
        followers,
        subscribers,
        posts: stats.posts || 0,
        videos: stats.videos || 0,
        lastSyncedAt: new Date(),
      });
    }

    await user.save();
    return user.toJSON();
  },

  disconnectSocialMedia: async (userId, platform) => {
    if (!['facebook', 'instagram', 'youtube'].includes(platform)) throw new Error('Invalid platform');
    const user = await User.findById(userId);
    if (!user) throw new Error('User not found');

    user.socialMediaAccounts = user.socialMediaAccounts.filter(acc => acc.platform !== platform);
    await user.save();
    return user.toJSON();
  },

  toggleSaveCampaign: async (userId, campaignId) => {
    const user = await User.findById(userId);
    if (!user) throw new Error('User not found');

    // Ensure array exists
    if (!user.savedCampaigns) user.savedCampaigns = [];

    const index = user.savedCampaigns.indexOf(campaignId);
    let isSaved = false;
    if (index === -1) {
      user.savedCampaigns.push(campaignId);
      isSaved = true;
    } else {
      user.savedCampaigns.splice(index, 1);
    }

    await user.save();

    if (isSaved) {
      try {
        const campaign = await Campaign.findById(campaignId);
        if (campaign && campaign.author.toString() !== userId.toString()) {
          const notification = new Notification({
            recipient: campaign.author,
            sender: userId,
            type: 'save',
            title: 'Campaign Saved',
            message: `${user.name || 'Someone'} saved your campaign "${campaign.title || 'Campaign'}"`,
            relatedId: campaignId
          });
          await notification.save();
        }
      } catch (err) {
        console.error('Error sending save notification', err);
      }
    }

    return user.savedCampaigns;
  }
};

module.exports = { userService, influencerService };
