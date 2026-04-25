const mongoose = require('mongoose');

const disputeSchema = new mongoose.Schema(
  {
    reporter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    reported: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    campaign: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Campaign',
    },
    reason: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['open', 'resolved', 'closed'],
      default: 'open',
    },
    resolution: {
      type: String,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Dispute', disputeSchema);
