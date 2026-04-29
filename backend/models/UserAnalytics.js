const mongoose = require('mongoose');

const userAnalyticsSchema = new mongoose.Schema(
  {
    analyticsId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Analytics',
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    role: {
      type: String,
      enum: ['admin', 'brand', 'influencer'],
      required: true,
      lowercase: true,
    },
    totalViews: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalEngagement: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalClicks: {
      type: Number,
      default: 0,
      min: 0,
    },
    date: {
      type: String,
      required: true,
      trim: true,
    },
    hour: {
      type: Number,
      min: 0,
      max: 23,
    },
    granularity: {
      type: String,
      enum: ['HOURLY', 'DAILY'],
      default: 'DAILY',
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

userAnalyticsSchema.index({ userId: 1, role: 1, date: 1, granularity: 1, hour: 1 }, { name: 'user_role_date_bucket_idx' });
userAnalyticsSchema.index({ analyticsId: 1 }, { name: 'user_analytics_parent_idx' });

module.exports = mongoose.model('UserAnalytics', userAnalyticsSchema);
