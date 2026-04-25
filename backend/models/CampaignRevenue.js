const mongoose = require('mongoose');

/**
 * CampaignRevenue — Stores platform revenue per campaign, with fee rates
 * snapshotted at the time each event occurred.
 *
 * Revenue is calculated as:
 *   totalFee = campaignFee + coinCost + totalApplicationFee
 * Where:
 *   campaignFee      = campaign.budget × campaignFeeRate (at campaign creation time)
 *   coinCost         = campaign.coinCost (individual per-campaign admin fee, updated live)
 *   applicationFee   = application.proposedPrice × applicationFeeRate (at acceptance time)
 */
const campaignRevenueSchema = new mongoose.Schema(
  {
    campaign: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Campaign',
      required: true,
      unique: true, // One record per campaign
    },
    brand: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    category: {
      type: String,
      default: 'Other',
    },

    // ── Campaign Fee (locked at creation time) ──────────────────────────
    campaignBudget: { type: Number, default: 0 },
    campaignFeeRate: { type: Number, default: 0 }, // e.g., 5 = 5%
    campaignFee: { type: Number, default: 0 },     // budget × (feeRate/100)

    // ── Individual Campaign Fee set by Admin (updated when coinCost changes) ─
    coinCost: { type: Number, default: 0 },

    // ── Application Fees (one entry per accepted/completed application) ──
    applicationFees: [
      {
        application: { type: mongoose.Schema.Types.ObjectId, ref: 'Application' },
        influencer: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        proposedPrice: { type: Number, default: 0 },
        feeRate: { type: Number, default: 0 }, // applicationFeeRate snapshot
        fee: { type: Number, default: 0 },     // proposedPrice × (feeRate/100)
        recordedAt: { type: Date, default: Date.now },
      }
    ],
    totalApplicationFee: { type: Number, default: 0 }, // sum of applicationFees[].fee

    // ── Grand Total ─────────────────────────────────────────────────────
    totalFee: { type: Number, default: 0 }, // campaignFee + coinCost + totalApplicationFee
  },
  { timestamps: true }
);

// Auto-recompute totalFee before save
campaignRevenueSchema.pre('save', function (next) {
  this.totalApplicationFee = this.applicationFees.reduce((sum, a) => sum + (a.fee || 0), 0);
  this.totalFee = (this.campaignFee || 0) + (this.coinCost || 0) + this.totalApplicationFee;
  next();
});

module.exports = mongoose.model('CampaignRevenue', campaignRevenueSchema);
