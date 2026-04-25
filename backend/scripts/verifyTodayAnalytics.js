const mongoose = require('mongoose');
require('dotenv').config();
const Analytics = require('../models/Analytics');
const User = require('../models/User');

async function verify() {
  await mongoose.connect(process.env.MONGODB_URI);
  const user = await User.findOne({ email: 'priya@example.com' });
  const startOfToday = new Date();
  startOfToday.setHours(0,0,0,0);

  const entries = await Analytics.find({
    userId: user._id,
    timestamp: { $gte: startOfToday }
  });

  console.log('--- TODAY ANALYTICS ENTRIES ---');
  entries.forEach(e => {
    console.log(`Type: ${e.type}, Action: ${e.metadata?.action}, Time: ${e.timestamp}`);
  });
  console.log('Total Count:', entries.length);
  process.exit(0);
}
verify();
