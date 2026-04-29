const mongoose = require('mongoose');

const analyticsEventSchema = new mongoose.Schema(
  {
    eventType: {
      type: String,
      enum: ['VIEW', 'CLICK', 'LIKE', 'SHARE', 'COMMENT', 'IMPRESSION', 'ENGAGEMENT'],
      required: true,
      uppercase: true,
    },
    entityType: {
      type: String,
      enum: ['ADMIN', 'BRAND', 'INFLUENCER'],
      uppercase: true,
    },
    entityId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    actorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    actorRole: {
      type: String,
      enum: ['admin', 'brand', 'influencer'],
      lowercase: true,
    },
    contentType: {
      type: String,
      enum: ['POST', 'CAMPAIGN'],
      uppercase: true,
    },
    contentId: {
      type: mongoose.Schema.Types.ObjectId,
    },
    metrics: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    date: {
      type: String,
      required: true,
      trim: true,
    },
    hour: {
      type: Number,
      required: true,
      min: 0,
      max: 23,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ['PENDING', 'PROCESSING', 'AGGREGATED', 'FAILED'],
      default: 'PENDING',
    },
    aggregatedAt: Date,
    error: String,
    expiresAt: {
      type: Date,
      default: () => {
        const retentionDays = Number(process.env.ANALYTICS_EVENT_RETENTION_DAYS || 30);
        return new Date(Date.now() + retentionDays * 24 * 60 * 60 * 1000);
      },
    },
  },
  { timestamps: true }
);

analyticsEventSchema.index({ status: 1, timestamp: 1 }, { name: 'event_processing_idx' });
analyticsEventSchema.index({ entityType: 1, entityId: 1, date: 1, hour: 1 }, { name: 'event_entity_bucket_idx' });
analyticsEventSchema.index({ contentType: 1, contentId: 1, date: 1, hour: 1 }, { name: 'event_content_bucket_idx' });
analyticsEventSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0, name: 'event_ttl_idx' });

module.exports = mongoose.model('AnalyticsEvent', analyticsEventSchema);
