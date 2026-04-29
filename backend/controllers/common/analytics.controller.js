const Analytics = require('../../models/Analytics');
const Campaign = require('../../models/Campaign');
const mongoose = require('mongoose');
const analyticsAggregationService = require('../../services/common/analyticsAggregation.service');

const analyticsController = {
  getBrandAnalytics: async (req, res) => {
    try {
      const brandId = req.userId;
      const { timeframe = '28' } = req.query;

      // ── Resolve days ───────────────────────────────────────────────────
      const getDays = (tf) => {
        if (tf === 'today' || tf === '1') return 1;
        if (tf === '7') return 7;
        if (tf === '30' || tf === 'monthly') return 30;
        return 28;
      };
      const days = getDays(timeframe);

      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const prevStart = new Date(startDate);
      prevStart.setDate(prevStart.getDate() - days);

      // ── Fetch all brand campaigns ───────────────────────────────────────
      const allCampaigns = await Campaign.find({ author: brandId });

      const currentCampaigns = allCampaigns.filter(c => {
        const d = new Date(c.createdAt);
        return d >= startDate && d <= endDate;
      });

      const prevCampaigns = allCampaigns.filter(c => {
        const d = new Date(c.createdAt);
        return d >= prevStart && d <= startDate;
      });

      // ── KPI Totals ─────────────────────────────────────────────────────
      const calcTotals = (camps) => {
        const capitalFlow = camps.reduce((sum, c) => sum + (c.budget || 0), 0);
        return {
          total:             camps.length,
          active:            camps.filter(c => c.status === 'active').length,
          completed:         camps.filter(c => c.status === 'completed').length,
          pending:           camps.filter(c => c.status === 'cancelled').length,
          reach:             camps.reduce((s, c) => s + (c.applicants?.length || 0), 0),
          engagement:        camps.reduce((s, c) => s + (c.likes?.length || 0) + (c.comments?.length || 0), 0),
          totalCapitalFlow:  capitalFlow,
          platformRevenue:   Math.round(capitalFlow * 0.15)
        };
      };

      const totals = calcTotals(currentCampaigns);
      const prevTotals = calcTotals(prevCampaigns);

      const calcTrend = (cur, prev) => {
        if (prev === 0 && cur > 0) return 100;
        if (prev === 0) return 0;
        return Math.round(((cur - prev) / prev) * 100);
      };

      const trends = {
        total:     calcTrend(totals.total,     prevTotals.total),
        active:    calcTrend(totals.active,    prevTotals.active),
        completed: calcTrend(totals.completed, prevTotals.completed),
        reach:     calcTrend(totals.reach,     prevTotals.reach),
      };

      // ── Time Series ─────────────────────────────────────────────────────
      const groupInterval = days === 1 ? 'hour' : 'day';
      const numPoints = days === 1 ? 24 : Math.min(days, 90);

      const buildSeries = (key) => {
        const series = [];
        for (let i = numPoints - 1; i >= 0; i--) {
          let pointStart, pointEnd, label;
          if (groupInterval === 'hour') {
            pointStart = new Date(startDate.getTime() + i * 3600000);
            pointEnd   = new Date(startDate.getTime() + (i + 1) * 3600000);
            label = `${pointStart.getHours()}:00`;
          } else {
            pointStart = new Date(startDate.getTime() + i * 86400000);
            pointStart.setHours(0, 0, 0, 0);
            pointEnd = new Date(pointStart.getTime() + 86400000);
            label = `${pointStart.getMonth() + 1}/${pointStart.getDate()}`;
          }
          const slice = allCampaigns.filter(c => {
            const d = new Date(c.createdAt);
            return d >= pointStart && d < pointEnd;
          });
          let value = 0;
          if (key === 'total')     value = slice.length;
          if (key === 'active')    value = slice.filter(c => c.status === 'active').length;
          if (key === 'completed') value = slice.filter(c => c.status === 'completed').length;
          if (key === 'reach')     value = slice.reduce((s, c) => s + (c.applicants?.length || 0), 0);
          series.unshift({ label, value });
        }
        return series;
      };

      const timeSeries = {
        total:     buildSeries('total'),
        active:    buildSeries('active'),
        completed: buildSeries('completed'),
        reach:     buildSeries('reach'),
      };

      // ── Breakdown ────────────────────────────────────────────────────────
      const total = currentCampaigns.length || 1;
      const statusBreakdown = [
        { label: 'Active',    pct: Math.round((totals.active    / total) * 100), color: '#1877f2' },
        { label: 'Completed', pct: Math.round((totals.completed / total) * 100), color: '#18a340' },
        { label: 'Cancelled', pct: Math.round((totals.pending   / total) * 100), color: '#f7b731' },
      ].filter(s => s.pct > 0);

      const categoryMap = {};
      currentCampaigns.forEach(c => {
        const cat = c.category || 'Other';
        categoryMap[cat] = (categoryMap[cat] || 0) + 1;
      });
      const categoryBreakdown = Object.entries(categoryMap)
        .map(([label, value]) => ({ label, value }))
        .sort((a, b) => b.value - a.value);

      // ── Top Campaigns ────────────────────────────────────────────────────
      const topCampaigns = [...currentCampaigns]
        .sort((a, b) => (b.applicants?.length || 0) - (a.applicants?.length || 0))
        .slice(0, 5)
        .map(c => ({
          id:           c._id,
          title:        c.title || 'Untitled Campaign',
          applications: c.applicants?.length || 0,
          status:       c.status,
          category:     c.category || 'Other',
          budget:       c.budget || 0,
        }));

      // ── Engagement breakdown (for Completed Campaigns tab) ────────────────
      const completedCamps = currentCampaigns.filter(c => c.status === 'completed');
      const engLikes    = completedCamps.reduce((s, c) => s + (c.likes?.length    || 0), 0);
      const engComments = completedCamps.reduce((s, c) => s + (c.comments?.length || 0), 0);
      const engTotal    = engLikes + engComments || 1;

      const engagementBreakdown = {
        // Donut segments — same shape as influencer AnalyticsBreakdown engagement
        engagement: [
          { type: 'Likes',    value: engLikes,    pct: Math.round((engLikes    / engTotal) * 100), color: '#1877f2' },
          { type: 'Comments', value: engComments, pct: Math.round((engComments / engTotal) * 100), color: '#1d3461' },
          { type: 'Shares',   value: 0,           pct: 0,                                           color: '#3da1f7' },
          { type: 'Saves',    value: 0,           pct: 0,                                           color: '#aed6f1' },
        ],
        totals: {
          engagement: engLikes + engComments,
        },
      };

      // ── Follower breakdown (for Completed Campaigns tab - Brand Profile Growth) ──
      const followerBreakdown = {
        growth: [
          { label: 'Organic', pct: 85, color: '#1877f2' },
          { label: 'Paid',    pct: 15, color: '#1d3461' },
        ],
      };

      // ── Insights ─────────────────────────────────────────────────────────
      const avgApps = totals.total > 0 ? Math.round(totals.reach / totals.total) : 0;
      const topApps = topCampaigns[0]?.applications || 0;
      const topCampaignMultiplier = avgApps > 0 ? Math.round(topApps / avgApps) : 0;

      // ── Brand Profile Stats (Followers) ──────────────────────────────────
      const User = require('../../models/User');
      const brandUser = await User.findById(brandId).select('followers');
      const totalFollowersCount = brandUser?.followers?.length || 0;

      res.json({
        success: true,
        data: {
          totals: {
            ...totals,
            followers: totalFollowersCount,
          },
          trends,
          timeSeries,
          breakdown: { byStatus: statusBreakdown, byCategory: categoryBreakdown },
          engagementBreakdown,
          followerBreakdown,
          topCampaigns,
          insights: { topCampaignMultiplier, avgApplicationsPerCampaign: avgApps },
        },
      });
    } catch (error) {
      console.error('getBrandAnalytics error:', error);
      res.status(500).json({ error: 'Server error' });
    }
  },

  getCampaignAnalytics: async (req, res) => {
    try {
      const { campaignId } = req.params;
      const analytics = await Analytics.find({ campaignId });
      res.json({
        success: true,
        data: {
          impressions: analytics.filter(a => a.type === 'impression').length,
          clicks:      analytics.filter(a => a.type === 'click').length,
          engagement:  analytics.filter(a => a.type === 'engagement').length,
          conversions: analytics.filter(a => a.type === 'conversion').length,
          events:      analytics.slice(0, 50),
        }
      });
    } catch (error) {
      res.status(500).json({ error: 'Server error' });
    }
  },

  ingestEvent: async (req, res) => {
    try {
      const event = await analyticsAggregationService.recordEvent({
        ...req.body,
        actorId: req.userId,
        actorRole: req.role,
      });

      res.status(202).json({
        success: true,
        data: {
          eventId: event._id,
          status: event.status,
        },
      });
    } catch (error) {
      if (error.name === 'ValidationError') return res.status(400).json({ error: error.message });
      console.error('ingestEvent error:', error);
      res.status(500).json({ error: 'Server error' });
    }
  },

  runAggregation: async (req, res) => {
    try {
      if (req.role !== 'admin') return res.status(403).json({ error: 'Insufficient permissions' });
      const result = await analyticsAggregationService.aggregateEvents({
        limit: Number(req.body.limit || req.query.limit || 500),
      });
      res.json({ success: true, data: result });
    } catch (error) {
      console.error('runAggregation error:', error);
      res.status(500).json({ error: 'Server error' });
    }
  },

  getUserAnalyticsV2: async (req, res) => {
    try {
      const data = await analyticsAggregationService.getUserAnalytics({
        userId: req.params.userId,
        role: req.query.role,
        startDate: req.query.startDate,
        endDate: req.query.endDate,
        granularity: req.query.granularity,
      });
      res.json({ success: true, data });
    } catch (error) {
      console.error('getUserAnalyticsV2 error:', error);
      res.status(500).json({ error: 'Server error' });
    }
  },

  getContentAnalyticsV2: async (req, res) => {
    try {
      const data = await analyticsAggregationService.getContentAnalytics({
        contentId: req.params.contentId,
        contentType: req.params.contentType,
        startDate: req.query.startDate,
        endDate: req.query.endDate,
        granularity: req.query.granularity,
      });
      res.json({ success: true, data });
    } catch (error) {
      console.error('getContentAnalyticsV2 error:', error);
      res.status(500).json({ error: 'Server error' });
    }
  },

  getAdminDashboardAnalyticsV2: async (req, res) => {
    try {
      if (req.role !== 'admin') return res.status(403).json({ error: 'Insufficient permissions' });
      const data = await analyticsAggregationService.getAdminDashboardAnalytics({
        entityType: req.query.entityType,
        entityId: req.query.entityId,
        contentType: req.query.contentType,
        contentId: req.query.contentId,
        startDate: req.query.startDate,
        endDate: req.query.endDate,
        granularity: req.query.granularity,
      });
      res.json({ success: true, data });
    } catch (error) {
      console.error('getAdminDashboardAnalyticsV2 error:', error);
      res.status(500).json({ error: 'Server error' });
    }
  },

  getTrending: async (req, res) => {
    try {
      const data = await analyticsAggregationService.getTrendingContent({
        contentType: req.query.contentType,
        startDate: req.query.startDate,
        endDate: req.query.endDate,
        limit: req.query.limit,
      });
      res.json({ success: true, data });
    } catch (error) {
      console.error('getTrending error:', error);
      res.status(500).json({ error: 'Server error' });
    }
  },

  getComparison: async (req, res) => {
    try {
      const data = await analyticsAggregationService.getPeriodComparison({
        userId: req.params.userId,
        role: req.query.role,
        currentStartDate: req.query.currentStartDate,
        currentEndDate: req.query.currentEndDate,
        previousStartDate: req.query.previousStartDate,
        previousEndDate: req.query.previousEndDate,
      });
      res.json({ success: true, data });
    } catch (error) {
      console.error('getComparison error:', error);
      res.status(500).json({ error: 'Server error' });
    }
  }
};

module.exports = analyticsController;
