#!/usr/bin/env node

/**
 * Master Database Seeder Script
 * 
 * Usage:
 *   npm run seed              - Run seeders
 *   npm run seed:fresh        - Fresh seed (clears and seeds)
 * 
 * This script:
 * 1. Connects to MongoDB
 * 2. Clears all collections (if fresh)
 * 3. Seeds data in topological order to maintain integrity
 * 4. Displays summary of seeded data
 * 5. Closes connection
 */

require('dotenv').config();
const mongoose = require('mongoose');

// Models
const User = require('../models/User');
const Campaign = require('../models/Campaign');
const Application = require('../models/Application');
const Analytics = require('../models/Analytics');
const ChatbotMessage = require('../models/ChatbotMessage');
const Post = require('../models/Post');
const UserBio = require('../models/UserBio');
const UserEducation = require('../models/UserEducation');
const UserWork = require('../models/UserWork');
const BrandProfile = require('../models/BrandProfile');
const CampaignRevenue = require('../models/CampaignRevenue');
const Notification = require('../models/Notification');
const Transaction = require('../models/Transaction');
const Dispute = require('../models/Dispute');
const Conversation = require('../models/Conversation');
const Message = require('../models/Message');

// Seeders
const { seedUsers } = require('./userSeeder');
const { seedCampaigns } = require('./campaignSeeder');
const { seedApplications } = require('./applicationSeeder');
const { seedAnalytics } = require('./analyticsSeeder');
const { seedChatbot } = require('./chatbotSeeder');
const { seedPosts } = require('./postSeeder');
const { seedBrandProfiles } = require('./brandProfileSeeder');
const { seedNotifications } = require('./notificationSeeder');
const { seedTransactions } = require('./transactionSeeder');
const { seedDisputes } = require('./disputeSeeder');
const { seedMessages } = require('./messageSeeder');
const { seedCampaignRevenue } = require('./campaignRevenueSeeder');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/influZoo';

/**
 * Clear all collections
 */
const clearCollections = async () => {
    try {
        console.log('\n🗑️  Clearing existing data...');

        const models = [
            User, Campaign, Application, Analytics, ChatbotMessage, Post,
            UserBio, UserEducation, UserWork, BrandProfile, CampaignRevenue,
            Notification, Transaction, Dispute, Conversation, Message
        ];

        for (const model of models) {
            const count = await model.countDocuments();
            if (count > 0) {
                await model.deleteMany({});
                console.log(`  ✓ Cleared ${model.collection.name} (${count} documents)`);
            }
        }

        console.log('✅ All collections cleared\n');
    } catch (error) {
        console.error('❌ Error clearing collections:', error.message);
        throw error;
    }
};

/**
 * Connect to MongoDB
 */
const connectDB = async () => {
    try {
        console.log('📡 Connecting to MongoDB...');
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected to MongoDB\n');
    } catch (error) {
        console.error('❌ Connection failed:', error.message);
        process.exit(1);
    }
};

/**
 * Disconnect from MongoDB
 */
const disconnectDB = async () => {
    try {
        await mongoose.disconnect();
        console.log('\n✅ Disconnected from MongoDB');
    } catch (error) {
        console.error('❌ Disconnect error:', error.message);
        process.exit(1);
    }
};

/**
 * Main seeding function
 */
const seed = async () => {
    try {
        console.log('\n╔════════════════════════════════════════╗');
        console.log('║   InflunZoo Comprehensive Seeder       ║');
        console.log('╚════════════════════════════════════════╝\n');

        await connectDB();
        
        const isFresh = process.argv.includes('--fresh') || process.env.SEED_FRESH === 'true';
        if (isFresh) {
            await clearCollections();
        }

        console.log('🌱 Starting multi-phase seeding process...\n');

        // Phase 1: Core Identities
        console.log('Phase 1/5: Identities & Basic Profiles');
        const users = await seedUsers();
        const brandProfiles = await seedBrandProfiles(users);
        console.log();

        // Phase 2: Engagement Foundations
        console.log('Phase 2/5: Campaigns & Applications');
        const campaigns = await seedCampaigns(users);
        const applications = await seedApplications(users, campaigns);
        console.log();

        // Phase 3: Financial Framework
        console.log('Phase 3/5: Revenue & Transactions');
        const revenue = await seedCampaignRevenue(campaigns, applications);
        const transactions = await seedTransactions(users, campaigns);
        console.log();

        // Phase 4: Social & Interactive Data
        console.log('Phase 4/5: Posts, Analytics & Chat');
        const posts = await seedPosts(users);
        const analytics = await seedAnalytics(users, campaigns);
        const chatbotMessages = await seedChatbot(users);
        const { createdConversations, createdMessages } = await seedMessages(users);
        console.log();

        // Phase 5: Feedback & Notifications
        console.log('Phase 5/5: Disputes & Notifications');
        const disputes = await seedDisputes(users, campaigns);
        const notifications = await seedNotifications(users, campaigns, applications);
        console.log();

        // Display summary
        displaySummary({
            users, brandProfiles, campaigns, applications, revenue, 
            transactions, posts, analytics, chatbotMessages, 
            conversations: createdConversations, messages: createdMessages, 
            disputes, notifications
        });

        await disconnectDB();

        console.log('\n🎉 Comprehensive seeding completed successfully!\n');
        process.exit(0);
    } catch (error) {
        console.error('\n❌ Seeding failed:', error.message);
        console.error(error.stack);
        await disconnectDB();
        process.exit(1);
    }
};

/**
 * Display seeding summary
 */
const displaySummary = (counts) => {
    console.log('╔════════════════════════════════════════╗');
    console.log('║        Seeding Summary                  ║');
    console.log('╚════════════════════════════════════════╝\n');

    console.log('📊 Records Created:');
    console.log(`  Users:            ${counts.users.length}`);
    console.log(`  Brand Profiles:   ${counts.brandProfiles.length}`);
    console.log(`  Campaigns:        ${counts.campaigns.length}`);
    console.log(`  Applications:     ${counts.applications.length}`);
    console.log(`  Revenue Snapshots: ${counts.revenue.length}`);
    console.log(`  Transactions:     ${counts.transactions.length}`);
    console.log(`  Social Posts:     ${counts.posts.length}`);
    console.log(`  Analytics Events: ${counts.analytics.length}`);
    console.log(`  Chatbot Logs:     ${counts.chatbotMessages.length}`);
    console.log(`  Conversations:    ${counts.conversations.length}`);
    console.log(`  Messages:         ${counts.messages.length}`);
    console.log(`  Disputes:         ${counts.disputes.length}`);
    console.log(`  Notifications:    ${counts.notifications.length}\n`);

    // Group users by role
    const usersByRole = counts.users.reduce((acc, user) => {
        acc[user.role] = (acc[user.role] || 0) + 1;
        return acc;
    }, {});

    console.log('👥 Users by Role:');
    Object.entries(usersByRole).forEach(([role, count]) => {
        console.log(`  ${role.charAt(0).toUpperCase() + role.slice(1)}s:     ${count}`);
    });
    console.log();

    console.log('🔐 Admin Access:');
    const admin = counts.users.find(u => u.role === 'admin');
    if (admin) {
        console.log(`  Email:    ${admin.email}`);
        console.log(`  Password: password123`);
    }
    console.log();
};

// Run seeding
if (require.main === module) {
    seed();
}

module.exports = { seed, clearCollections, connectDB, disconnectDB };

