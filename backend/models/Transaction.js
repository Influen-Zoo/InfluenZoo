const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    type: {
      type: String,
      enum: ['topup', 'withdraw', 'earning', 'deduction'],
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    asset: {
      type: String,
      enum: ['coins', 'money'],
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed'],
      default: 'completed',
    },
    description: {
      type: String,
      required: true,
    },
    referenceId: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: 'referenceModel'
    },
    referenceModel: {
      type: String,
      enum: ['Campaign', 'Application', 'User']
    },
    method: {
      type: String,
      enum: ['bank_transfer', 'razorpay', 'wallet', 'referral_bonus'],
      default: 'bank_transfer'
    },
    details: {
      type: mongoose.Schema.Types.Mixed
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Transaction', transactionSchema);
