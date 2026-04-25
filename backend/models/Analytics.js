const mongoose = require('mongoose');

const analyticsSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    campaignId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Campaign',
    },
    type: {
      type: String,
      enum: ['impression', 'click', 'engagement', 'conversion'],
      required: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
    metadata: mongoose.Schema.Types.Mixed,
  },
  { timestamps: true }
);

module.exports = mongoose.model('Analytics', analyticsSchema);
