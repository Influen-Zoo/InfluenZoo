const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema(
  {
    campaignId: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: 'onModel',
      required: true,
    },
    onModel: {
      type: String,
      required: true,
      enum: ['Campaign'],
      default: 'Campaign'
    },
    influencerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected', 'completed'],
      default: 'pending',
    },
    portfolio: String,
    coverLetter: String,
    proposedPrice: Number,
    deliveryDate: Date,
    proposedContent: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model('Application', applicationSchema);
