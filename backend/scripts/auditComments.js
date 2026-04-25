const mongoose = require('mongoose');
require('dotenv').config();
const Campaign = require('../models/Campaign');
const Post = require('../models/Post');
const User = require('../models/User');

async function findTodayComments() {
  await mongoose.connect(process.env.MONGODB_URI);
  const today = new Date();
  today.setHours(0,0,0,0);

  // Search Campaigns
  const campaigns = await Campaign.find({ 'comments.createdAt': { $gte: today } }).populate('comments.user');
  console.log('--- CAMPAIGN COMMENTS ---');
  campaigns.forEach(c => {
    c.comments.forEach(cm => {
        if(cm.createdAt >= today) {
            console.log(`User: ${cm.user?.email || cm.user}, Text: ${cm.text}, Time: ${cm.createdAt}`);
        }
    });
  });

  // Search Posts
  const posts = await Post.find({ 'comments.createdAt': { $gte: today } }).populate('comments.user');
  console.log('--- POST COMMENTS ---');
  posts.forEach(p => {
    p.comments.forEach(cm => {
        if(cm.createdAt >= today) {
            console.log(`User: ${cm.user?.email || cm.user}, Text: ${cm.text}, Time: ${cm.createdAt}`);
        }
    });
  });

  process.exit(0);
}
findTodayComments();
