const mongoose = require('mongoose');

const analyticsSchema = new mongoose.Schema(
  {
    entityType: {
      type: String,
      enum: ['ADMIN', 'BRAND', 'INFLUENCER'],
      uppercase: true,
    },
    entityId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    date: {
      type: String,
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
    metrics: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    // Legacy fields kept so existing campaign analytics routes continue to work.
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    campaignId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Campaign',
    },
    type: {
      type: String,
      enum: ['impression', 'click', 'engagement', 'conversion'],
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
    metadata: mongoose.Schema.Types.Mixed,
  },
  { timestamps: true }
);

analyticsSchema.index(
  { entityType: 1, entityId: 1, date: 1, granularity: 1, hour: 1 },
  {
    name: 'entity_date_bucket_idx',
    partialFilterExpression: { entityType: { $exists: true }, entityId: { $exists: true }, date: { $exists: true } }
  }
);
analyticsSchema.index({ campaignId: 1, type: 1, timestamp: -1 }, { name: 'legacy_campaign_event_idx' });

module.exports = mongoose.model('Analytics', analyticsSchema);
