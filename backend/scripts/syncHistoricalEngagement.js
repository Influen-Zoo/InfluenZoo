const mongoose = require('mongoose');
require('dotenv').config();
const Campaign = require('../models/Campaign');
const Post = require('../models/Post');
const Analytics = require('../models/Analytics');
const User = require('../models/User');

async function sync() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to DB');

    const user = await User.findOne({ email: 'priya@example.com' });
    if (!user) {
        console.log('User not found');
        process.exit(1);
    }
    const userId = user._id;

    // Clear previous partial syncs to avoid duplicates
    await Analytics.deleteMany({ 'metadata.platform': 'Influence', userId });

    // ─────────────────────────────────────────────────────────────────────────
    // CAMPAIGN SYNC - Find campaigns OWNED by Priya and count likes/comments received
    // ─────────────────────────────────────────────────────────────────────────
    const ownedCampaigns = await Campaign.find({ author: userId });
    console.log(`Found ${ownedCampaigns.length} campaigns owned by Priya`);

    for (const campaign of ownedCampaigns) {
        // Log Likes Received
        for (const likerId of campaign.likes) {
            await Analytics.create({
                userId, // Influencer who owns the campaign
                campaignId: campaign._id,
                type: 'engagement',
                timestamp: campaign.updatedAt,
                metadata: { likes: 1, platform: 'Influence', action: 'like', fromUser: likerId }
            });
            console.log(`Synced received like for campaign: ${campaign.title}`);
        }

        // Log Comments Received
        for (const comment of campaign.comments) {
            await Analytics.create({
                userId, // Influencer who owns the campaign
                campaignId: campaign._id,
                type: 'engagement',
                timestamp: comment.createdAt,
                metadata: { comments: 1, platform: 'Influence', action: 'comment', fromUser: comment.user }
            });
            console.log(`Synced received comment for campaign: ${campaign.title}`);
        }
    }

    // ─────────────────────────────────────────────────────────────────────────
    // POST SYNC - Find posts OWNED by Priya and count likes/comments received
    // ─────────────────────────────────────────────────────────────────────────
    const ownedPosts = await Post.find({ author: userId });
    console.log(`Found ${ownedPosts.length} posts owned by Priya`);

    for (const post of ownedPosts) {
        // Log Likes Received
        for (const likerId of post.likes) {
            await Analytics.create({
                userId,
                type: 'engagement',
                timestamp: post.updatedAt,
                metadata: { likes: 1, platform: 'Influence', action: 'like', postId: post._id, fromUser: likerId }
            });
            console.log(`Synced received like for post: ${post._id}`);
        }

        // Log Comments Received
        for (const comment of post.comments) {
            await Analytics.create({
                userId,
                type: 'engagement',
                timestamp: comment.createdAt,
                metadata: { comments: 1, platform: 'Influence', action: 'comment', postId: post._id, fromUser: comment.user }
            });
            console.log(`Synced received comment for post: ${post._id}`);
        }
    }

    console.log('Sync complete');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

sync();
