const mongoose = require('mongoose');

const contentAnalyticsSchema = new mongoose.Schema(
  {
    analyticsId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Analytics',
      required: true,
    },
    contentType: {
      type: String,
      enum: ['POST', 'CAMPAIGN'],
      required: true,
      uppercase: true,
    },
    contentId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: 'contentRef',
    },
    contentRef: {
      type: String,
      enum: ['Post', 'Campaign'],
      required: true,
      default: function getContentRef() {
        return this.contentType === 'CAMPAIGN' ? 'Campaign' : 'Post';
      },
    },
    views: {
      type: Number,
      default: 0,
      min: 0,
    },
    likes: {
      type: Number,
      default: 0,
      min: 0,
    },
    shares: {
      type: Number,
      default: 0,
      min: 0,
    },
    comments: {
      type: Number,
      default: 0,
      min: 0,
    },
    clicks: {
      type: Number,
      default: 0,
      min: 0,
    },
    engagementRate: {
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

contentAnalyticsSchema.index({ contentType: 1, contentId: 1, date: 1, granularity: 1, hour: 1 }, { name: 'content_date_bucket_idx' });
contentAnalyticsSchema.index({ analyticsId: 1 }, { name: 'content_analytics_parent_idx' });
contentAnalyticsSchema.index({ contentType: 1, date: 1, views: -1, likes: -1, comments: -1 }, { name: 'content_trending_idx' });

module.exports = mongoose.model('ContentAnalytics', contentAnalyticsSchema);
