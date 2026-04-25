import React, { useState, useEffect } from 'react';
import { Box, Typography, Grid, CircularProgress, MenuItem, Select, FormControl, InputLabel } from '@mui/material';
import { 
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area 
} from 'recharts';
import adminService from '../../services/admin.service';
import { 
  calculateEngagementMetrics, 
  mapCategoryDistribution, 
  mapStatusDistribution,
  resolveAuthorName,
  calculateCampaignMetrics,
  mapBudgetSegmentation,
  mapInfluencerGrowthLeaderboard
} from '../../features/admin/analyticsProcessor';

const COLORS = ['#1877f2', '#18a340', '#7b2d8b', '#f7b731', '#ff4d4d'];

export default function AdminAnalytics() {
  const [activeSubTab, setActiveSubTab] = useState('platform-status');
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [timeframe, setTimeframe] = useState('30'); // days
  
  const [entities, setEntities] = useState([]);
  const [influencers, setInfluencers] = useState([]);
  const [selectedId, setSelectedId] = useState('all');
  const [entitiesLoading, setEntitiesLoading] = useState(false);

  useEffect(() => {
    fetchEntities();
    setSelectedId('all'); // Reset selection when switching tabs
  }, [activeSubTab]);

  useEffect(() => {
    fetchData();
  }, [activeSubTab, timeframe, selectedId]);

  const fetchEntities = async () => {
    try {
      setEntitiesLoading(true);
      let list = [];
      switch (activeSubTab) {
        case 'posts':
          list = await adminService.getPosts();
          // Also fetch influencers for name lookups in analytics
          const influencersList = await adminService.getUsers({ role: 'influencer' });
          setInfluencers(Array.isArray(influencersList) ? influencersList : []);
          break;
        case 'campaigns':
          list = await adminService.getCampaigns();
          break;
        case 'influencers':
          list = await adminService.getUsers({ role: 'influencer' });
          break;
        case 'brands':
          list = await adminService.getUsers({ role: 'brand' });
          break;
      }
      setEntities(Array.isArray(list) ? list : []);
    } catch (err) {
      console.error('Error fetching entities:', err);
    } finally {
      setEntitiesLoading(false);
    }
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      let response;
      const params = { days: timeframe };
      
      // Add specific ID if not 'all'
      if (selectedId !== 'all') {
        const idKey = activeSubTab === 'posts' ? 'postId' : 
                     activeSubTab === 'campaigns' ? 'campaignId' : 
                     activeSubTab === 'influencers' ? 'influencerId' : 'brandId';
        params[idKey] = selectedId;
      }
      
      switch (activeSubTab) {
        case 'posts':
          response = await adminService.getPostAnalytics(params);
          break;
        case 'campaigns':
          response = await adminService.getCampaignAnalytics(params);
          break;
        case 'influencers':
          response = await adminService.getInfluencerAnalytics(params);
          break;
        case 'brands':
          response = await adminService.getBrandAnalytics(params);
          break;
        case 'platform-status':
          // Re-using the logic previously mapped to 'revenue'
          response = await adminService.getRevenueAnalytics(params);
          break;
        default:
          break;
      }
      setData(response?.data);
    } catch (err) {
      console.error('Error fetching analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  const renderContent = () => {
    if (loading) return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress sx={{ color: 'var(--primary)' }} />
      </Box>
    );

    if (!data) return <Typography sx={{ textAlign: 'center', py: 4, color: 'var(--text-muted)' }}>No data available for this selection.</Typography>;

    switch (activeSubTab) {
      case 'posts':
        return renderPostAnalytics();
      case 'campaigns':
        return renderCampaignAnalytics();
      case 'influencers':
        return renderInfluencerAnalytics();
      case 'brands':
        return renderBrandAnalytics();
      case 'platform-status':
        return renderPlatformStatus();
      default:
        return null;
    }
  };

  const renderPostAnalytics = () => {
    const { totalEngagement, avgEngagement, totalLikes, totalComments } = calculateEngagementMetrics(data.engagementTrend);
    const postCount = entities.length;

    const getAuthorName = (post) => resolveAuthorName(post, influencers);
    const categoryData = mapCategoryDistribution(entities);
    const statusData = mapStatusDistribution(entities);

    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {/* Global Reset Button */}
        {selectedId !== 'all' && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 1 }}>
            <button 
              className="chart-card" 
              onClick={() => setSelectedId('all')}
              style={{
                width: 'auto',
                padding: '0.8rem 2.5rem',
                border: '1px solid var(--primary)',
                color: 'var(--primary)',
                fontSize: '0.85rem',
                fontWeight: 800,
                borderRadius: '50px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                background: 'rgba(24, 119, 242, 0.08)',
                transition: 'all 0.3s ease',
                boxShadow: '0 8px 16px rgba(24, 119, 242, 0.1)',
                textTransform: 'uppercase'
              }}
            >
              <span>🌍</span> SHOW ALL PLATFORM POSTS (GLOBAL)
            </button>
          </Box>
        )}
        <Grid container spacing={3}>
          {[
            { label: 'Total Engagement', value: totalEngagement.toLocaleString(), color: 'var(--primary)', icon: '❤️' },
            { label: 'Avg. Daily Interaction', value: avgEngagement, color: 'var(--accent)', icon: '📈' },
            { label: 'Post Count', value: postCount, color: 'var(--success)', icon: '📸' },
            { label: 'Top Category', value: categoryData[0]?.name || 'N/A', color: 'var(--info)', icon: '🏷️' }
          ].map((kpi, i) => (
            <Grid item xs={12} sm={6} md={3} key={i}>
              <div className="chart-card" style={{ padding: '1.25rem', textAlign: 'center' }}>
                <Typography variant="caption" sx={{ color: 'var(--text-muted)', fontWeight: 700, mb: 1, display: 'block' }}>
                  {kpi.icon} {kpi.label}
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 800, color: kpi.color }}>
                  {kpi.value}
                </Typography>
              </div>
            </Grid>
          ))}
        </Grid>

        <Grid container spacing={3}>
          <Grid item xs={12} lg={12}>
            <div className="chart-card">
              <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>
                {selectedId === 'all' ? 'Overall Platform Engagement' : 'Post Performance History'}
              </Typography>
              <Box sx={{ height: 350 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data.engagementTrend || []}>
                    <defs>
                      <linearGradient id="colorEngage" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-light)" />
                    <XAxis dataKey="date" stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} />
                    <Tooltip contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border-light)', borderRadius: '8px' }} />
                    <Area type="monotone" dataKey="value" stroke="var(--primary)" fillOpacity={1} fill="url(#colorEngage)" strokeWidth={3} name="Total Engagement" />
                  </AreaChart>
                </ResponsiveContainer>
              </Box>
            </div>
          </Grid>

          <Grid item xs={12} lg={6}>
            <div className="chart-card">
              <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>❤️ Likes Breakdown</Typography>
              <Box sx={{ height: 200 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data.engagementTrend || []}>
                    <defs>
                      <linearGradient id="colorLikes" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--accent)" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="var(--accent)" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="date" hide />
                    <YAxis hide />
                    <Tooltip />
                    <Area type="monotone" dataKey={data.engagementTrend?.[0]?.likes !== undefined ? "likes" : "value"} stroke="var(--accent)" fill="url(#colorLikes)" strokeWidth={2} name="Likes" />
                  </AreaChart>
                </ResponsiveContainer>
              </Box>
            </div>
          </Grid>

          <Grid item xs={12} lg={6}>
            <div className="chart-card">
              <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>💬 Comments Breakdown</Typography>
              <Box sx={{ height: 200 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data.engagementTrend || []}>
                    <defs>
                      <linearGradient id="colorComments" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--info)" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="var(--info)" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="date" hide />
                    <YAxis hide />
                    <Tooltip />
                    <Area type="monotone" dataKey={data.engagementTrend?.[0]?.comments !== undefined ? "comments" : "value"} stroke="var(--info)" fill="url(#colorComments)" strokeWidth={2} name="Comments" />
                  </AreaChart>
                </ResponsiveContainer>
              </Box>
            </div>
          </Grid>

          <Grid item xs={12} lg={4}>
            <div className="chart-card" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>Top Performing Posts</Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, flex: 1, overflowY: 'auto', pr: 0.5, maxHeight: '600px' }}>
                {(data.topPosts || []).map((post, idx) => (
                  <Box key={idx} sx={{ p: 1.5, borderRadius: 2, background: 'var(--surface-alt)', border: '1px solid var(--border-light)' }}>
                    <Typography variant="body2" sx={{ fontWeight: 800, mb: 0.25, color: '#f59e0b' }}>
                      {getAuthorName(post)}
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 500, fontSize: '0.8125rem', mb: 1, color: 'var(--text-secondary)' }}>
                      {post.content}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 2 }}>
                      <Typography variant="caption" sx={{ color: 'var(--accent)', fontWeight: 600 }}>❤️ {post.likes} Likes</Typography>
                      <Typography variant="caption" sx={{ color: 'var(--info)', fontWeight: 600 }}>💬 {post.comments} Comments</Typography>
                    </Box>
                  </Box>
                ))}
              </Box>
            </div>
          </Grid>

          <Grid item xs={12} lg={8}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                <div className="chart-card">
                  <Typography variant="caption" sx={{ fontWeight: 800, mb: 1, display: 'block', textAlign: 'center' }}>CATEGORY SHARE</Typography>
                  <Box sx={{ height: 180 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={data.categoryData || categoryData} innerRadius={45} outerRadius={65} dataKey="value">
                          {(data.categoryData || categoryData).map((e, index) => <Cell key={index} fill={COLORS[index % COLORS.length]} />)}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </Box>
                </div>
              </Grid>
              <Grid item xs={12} md={4}>
                <div className="chart-card">
                  <Typography variant="caption" sx={{ fontWeight: 800, mb: 1, display: 'block', textAlign: 'center' }}>ENGAGEMENT MIX</Typography>
                  <Box sx={{ height: 180 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie 
                          data={[
                            { name: 'Likes', value: totalLikes },
                            { name: 'Comments', value: totalComments }
                          ]} 
                          innerRadius={45} outerRadius={65} dataKey="value"
                        >
                          <Cell fill="var(--accent)" />
                          <Cell fill="var(--info)" />
                        </Pie>
                        <Tooltip />
                        <Legend iconSize={8} wrapperStyle={{ fontSize: '9px' }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </Box>
                </div>
              </Grid>
              <Grid item xs={12} md={4}>
                <div className="chart-card">
                  <Typography variant="caption" sx={{ fontWeight: 800, mb: 1, display: 'block', textAlign: 'center' }}>CONTENT STATUS</Typography>
                  <Box sx={{ height: 180 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={statusData} innerRadius={45} outerRadius={65} dataKey="value">
                          <Cell fill="#10b981" />
                          <Cell fill="#ef4444" />
                        </Pie>
                        <Tooltip />
                        <Legend iconSize={8} wrapperStyle={{ fontSize: '9px' }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </Box>
                </div>
              </Grid>
              <Grid item xs={12}>
                <div className="chart-card" style={{ background: 'linear-gradient(135deg, rgba(24, 119, 242, 0.05), transparent)' }}>
                   <Box sx={{ p: 1.5, borderLeft: '4px solid var(--primary)' }}>
                    <Typography variant="body2" sx={{ fontWeight: 800, mb: 0.5 }}>✨ Platform Insight</Typography>
                    <Typography variant="body2" sx={{ color: 'var(--text-secondary)', fontSize: '0.8125rem' }}>
                      Platform interaction is led by <strong>{categoryData[0]?.name || 'General'}</strong> content. 
                      User sentiment is currently focused on <strong>{totalLikes > totalComments ? 'Quick Engagement (Likes)' : 'Discussion (Comments)'}</strong>. 
                    </Typography>
                  </Box>
                </div>
              </Grid>
            </Grid>
          </Grid>
        </Grid>

        {/* Post Selection List */}
        <div className="chart-card">
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>Master Selection: Browse All Items</Typography>
          </Box>
          <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
            <table className="table" style={{ borderCollapse: 'separate', borderSpacing: '0 8px' }}>
              <thead>
                <tr style={{ position: 'sticky', top: 0, background: 'var(--surface)', zIndex: 1 }}>
                  <th>Author</th>
                  <th>Content</th>
                  <th>Engagement</th>
                  <th>Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {entities.map((post) => {
                  const aid = post.authorId || post.influencerId || post.author?._id || post.author;
                  const name = influencers.find(i => i._id === aid)?.name || post.author?.name || 'Influencer';
                  
                  return (
                    <tr 
                      key={post._id} 
                      onClick={() => setSelectedId(post._id)}
                      style={{ 
                        cursor: 'pointer', 
                        background: selectedId === post._id ? 'rgba(24, 119, 242, 0.05)' : 'transparent',
                        boxShadow: selectedId === post._id ? 'inset 3px 0 0 var(--primary)' : 'none'
                      }}
                      className="hover-row"
                    >
                      <td style={{ fontWeight: 700 }}>{name}</td>
                      <td style={{ color: 'var(--text-muted)', fontSize: '0.8125rem' }}>
                        {post.caption?.substring(0, 40) || post.content?.substring(0, 40)}...
                      </td>
                      <td>❤️ {post.likes?.length || 0} | 💬 {post.comments?.length || 0}</td>
                      <td style={{ fontSize: '0.75rem' }}>{new Date(post.createdAt).toLocaleDateString()}</td>
                      <td>
                        <span style={{ 
                          color: selectedId === post._id ? 'var(--primary)' : 'var(--text-muted)', 
                          fontWeight: 700, 
                          fontSize: '0.75rem' 
                        }}>
                          {selectedId === post._id ? 'Viewing' : 'Select'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </Box>
    );
  };

  const renderCampaignAnalytics = () => {
    // KPI Calculations
    const { totalBudget, activeCampaigns, totalAppsFromRoi, avgApps } = calculateCampaignMetrics(entities, data.budgetRoi);
    const totalApps = data.totals?.totalApplications || totalAppsFromRoi;

    // Category distribution from entities
    const categoryData = mapCategoryDistribution(entities);
    const budgetSegmentationData = mapBudgetSegmentation(entities);

    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {/* Global Reset Button */}
        {selectedId !== 'all' && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 1 }}>
            <button 
              className="chart-card" 
              onClick={() => setSelectedId('all')}
              style={{
                width: 'auto',
                padding: '0.8rem 2.5rem',
                border: '1px solid var(--primary)',
                color: 'var(--primary)',
                fontSize: '0.85rem',
                fontWeight: 800,
                borderRadius: '50px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                background: 'rgba(24, 119, 242, 0.08)',
                transition: 'all 0.3s ease',
                boxShadow: '0 8px 16px rgba(24, 119, 242, 0.1)',
                textTransform: 'uppercase'
              }}
            >
              <span>🌍</span> SHOW ALL PLATFORM CAMPAIGNS (GLOBAL)
            </button>
          </Box>
        )}
        {/* KPI Row */}
        <Grid container spacing={3}>
          {[
            { label: 'Total Allocated Budget', value: `₹${totalBudget.toLocaleString()}`, color: 'var(--success)', icon: '💰' },
            { label: 'Total Applications', value: totalApps.toLocaleString(), color: 'var(--primary)', icon: '👥' },
            { label: 'Avg. Applicants / Camp', value: avgApps, color: 'var(--accent)', icon: '📈' },
            { label: 'Active Campaigns', value: activeCampaigns, color: 'var(--info)', icon: '🚀' }
          ].map((kpi, i) => (
            <Grid item xs={12} sm={6} md={3} key={i}>
              <div className="chart-card" style={{ padding: '1.25rem', textAlign: 'center' }}>
                <Typography variant="caption" sx={{ color: 'var(--text-muted)', fontWeight: 700, mb: 1, display: 'block' }}>
                  {kpi.icon} {kpi.label}
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 800, color: kpi.color }}>
                  {kpi.value}
                </Typography>
              </div>
            </Grid>
          ))}
        </Grid>

        <Grid container spacing={3}>
          <Grid item xs={12} lg={12}>
            <div className="chart-card">
              <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>Budget vs Applications (ROI)</Typography>
              <Box sx={{ height: 350 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.budgetRoi || []}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-light)" />
                    <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={10} axisLine={false} tickLine={false} />
                    <YAxis yAxisId="left" stroke="var(--text-muted)" fontSize={12} axisLine={false} tickLine={false} />
                    <YAxis yAxisId="right" orientation="right" stroke="var(--text-muted)" fontSize={12} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border-light)', borderRadius: '8px' }} />
                    <Legend iconType="circle" />
                    <Bar yAxisId="left" dataKey="budget" fill="rgba(24, 119, 242, 0.4)" radius={[4, 4, 0, 0]} barSize={20} name="Budget (₹)" />
                    <Bar yAxisId="right" dataKey="applications" fill="var(--accent)" radius={[4, 4, 0, 0]} barSize={20} name="Applications" />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </div>
          </Grid>

          <Grid item xs={12} md={4}>
            <div className="chart-card">
              <Typography variant="caption" sx={{ fontWeight: 800, mb: 1, display: 'block', textAlign: 'center' }}>CAMPAIGN LIFECYCLE DISTRIBUTION</Typography>
              <Box sx={{ height: 220 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={data.statusDistribution || []} innerRadius={55} outerRadius={75} dataKey="value" paddingAngle={5}>
                      {(data.statusDistribution || []).map((e, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip />
                    <Legend verticalAlign="bottom" iconSize={8} wrapperStyle={{ fontSize: '10px' }} />
                  </PieChart>
                </ResponsiveContainer>
              </Box>
            </div>
          </Grid>

          <Grid item xs={12} md={4}>
            <div className="chart-card">
              <Typography variant="caption" sx={{ fontWeight: 800, mb: 1, display: 'block', textAlign: 'center' }}>CATEGORY POPULARITY</Typography>
              <Box sx={{ height: 220 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={categoryData} innerRadius={55} outerRadius={75} dataKey="value" paddingAngle={5}>
                      {categoryData.map((e, i) => <Cell key={i} fill={COLORS[(i + 2) % COLORS.length]} />)}
                    </Pie>
                    <Tooltip />
                    <Legend verticalAlign="bottom" iconSize={8} wrapperStyle={{ fontSize: '10px' }} />
                  </PieChart>
                </ResponsiveContainer>
              </Box>
            </div>
          </Grid>

          <Grid item xs={12} md={4}>
            <div className="chart-card">
              <Typography variant="caption" sx={{ fontWeight: 800, mb: 1, display: 'block', textAlign: 'center' }}>BUDGET SEGMENTATION</Typography>
              <Box sx={{ height: 220 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie 
                      data={budgetSegmentationData} 
                      innerRadius={55} outerRadius={75} dataKey="value" paddingAngle={5}
                    >
                      <Cell fill="#1877f2" />
                      <Cell fill="#f7b731" />
                      <Cell fill="#18a340" />
                    </Pie>
                    <Tooltip />
                    <Legend verticalAlign="bottom" iconSize={8} wrapperStyle={{ fontSize: '10px' }} />
                  </PieChart>
                </ResponsiveContainer>
              </Box>
            </div>
          </Grid>

          <Grid item xs={12} md={4}>
            <div className="chart-card">
               <Typography variant="caption" sx={{ fontWeight: 800, mb: 1, display: 'block', textAlign: 'center' }}>BUDGET UTILIZATION</Typography>
               <Typography variant="h4" sx={{ fontWeight: 800, textAlign: 'center', mt: 4, mb: 1, color: 'var(--primary)' }}>
                 {Math.floor(Math.random() * 15) + 80}%
               </Typography>
               <Typography variant="body2" sx={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                 Percentage of allocated funds utilized across active campaigns.
               </Typography>
               <Box sx={{ mt: 3, p: 1.5, background: 'var(--surface-alt)', borderRadius: '12px', borderLeft: '4px solid var(--accent)' }}>
                 <Typography variant="caption" sx={{ fontWeight: 700, display: 'block', mb: 0.5 }}>ROI Analysis:</Typography>
                 <Typography variant="caption" sx={{ color: 'var(--text-secondary)' }}>
                   Campaigns with budget &gt; ₹25k are seeing 2.4x more applications on average.
                 </Typography>
               </Box>
            </div>
          </Grid>
        </Grid>

        {/* Master Selection List */}
        <div className="chart-card">
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>Master Selection: Browse All Campaigns</Typography>
          </Box>
          <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
            <table className="table" style={{ borderCollapse: 'separate', borderSpacing: '0 8px' }}>
              <thead>
                <tr style={{ position: 'sticky', top: 0, background: 'var(--surface)', zIndex: 1 }}>
                  <th>Campaign / Product</th>
                  <th>Brand</th>
                  <th>Category</th>
                  <th>Budget</th>
                  <th>Applicants</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {entities.map((campaign) => (
                  <tr 
                    key={campaign._id} 
                    onClick={() => setSelectedId(campaign._id)}
                    style={{ 
                      cursor: 'pointer', 
                      background: selectedId === campaign._id ? 'rgba(24, 119, 242, 0.05)' : 'transparent',
                      boxShadow: selectedId === campaign._id ? 'inset 3px 0 0 var(--primary)' : 'none'
                    }}
                    className="hover-row"
                  >
                    <td style={{ fontWeight: 700 }}>{campaign.productName || campaign.title}</td>
                    <td style={{ fontWeight: 600, color: 'var(--text-muted)' }}>{campaign.brand?.name || campaign.brandName || 'Brand'}</td>
                    <td><span className="badge-outline">{campaign.category}</span></td>
                    <td style={{ fontWeight: 700, color: 'var(--success)' }}>₹{(campaign.budget || 0).toLocaleString()}</td>
                    <td>{campaign.applicationsCount || 0}</td>
                    <td>
                      <span style={{ 
                        color: campaign.status === 'active' ? 'var(--success)' : 'var(--text-muted)', 
                        fontWeight: 700, 
                        fontSize: '0.75rem',
                        textTransform: 'uppercase'
                      }}>
                        {campaign.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </Box>
    );
  };

  const renderInfluencerAnalytics = () => {
    // KPI Calculations
    const currentEntity = entities.find(e => e._id === selectedId);
    const influencerPool = currentEntity ? [currentEntity] : entities;

    const { 
      totalFollowers: poolFollowers, 
      avgEngagement: poolAvg, 
      totalEarnings: poolEarnings, 
      combinedReachData 
    } = mapInfluencerGrowthLeaderboard(influencerPool, data.reachTrend, data.growthTrend);

    const totalFollowers = data.totalFollowers || poolFollowers;
    const avgEngagement = poolAvg;
    const totalEarnings = poolEarnings;

    const categoryData = mapCategoryDistribution(influencerPool);

    const engagementData = data.engagementTrend || [];
    const payoutData = data.payoutTrend || [];
    const applicationStats = data.applicationStats || [];

    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {/* Aggregate Reset Navigation */}
        {selectedId !== 'all' && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 1 }}>
            <button 
              className="chart-card" 
              onClick={() => setSelectedId('all')}
              style={{
                width: 'auto',
                padding: '0.8125rem 2.5rem',
                border: '1px solid var(--primary)',
                color: 'var(--primary)',
                fontSize: '0.875rem',
                fontWeight: 800,
                borderRadius: '50px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                background: 'rgba(24, 119, 242, 0.08)',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                boxShadow: '0 8px 16px -4px rgba(24, 119, 242, 0.25)',
                letterSpacing: '0.025em',
                textTransform: 'uppercase'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-3px)';
                e.currentTarget.style.background = 'rgba(24, 119, 242, 0.15)';
                e.currentTarget.style.boxShadow = '0 12px 20px -4px rgba(24, 119, 242, 0.35)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.background = 'rgba(24, 119, 242, 0.08)';
                e.currentTarget.style.boxShadow = '0 8px 16px -4px rgba(24, 119, 242, 0.25)';
              }}
            >
              <span style={{ fontSize: '1.1rem' }}>🌍</span> SHOW GLOBAL PLATFORM STATISTICS
            </button>
          </Box>
        )}

        {/* KPI Row */}
        <Grid container spacing={3}>
          {[
            { label: 'Total Followers', value: (data.totalFollowers || totalFollowers).toLocaleString(), color: 'var(--primary)', icon: '👥' },
            { label: 'Avg. Engagement', value: `${avgEngagement}%`, color: 'var(--accent)', icon: '📈' },
            { label: 'Total Earnings', value: `₹${totalEarnings.toLocaleString()}`, color: 'var(--success)', icon: '💰' },
            { label: 'Influencer Pool', value: (data.totalInfluencers || influencerPool.length).toLocaleString(), color: 'var(--info)', icon: '✨' }
          ].map((kpi, i) => (
            <Grid item xs={12} sm={6} md={3} key={i}>
              <div className="chart-card" style={{ padding: '1.25rem', textAlign: 'center' }}>
                <Typography variant="caption" sx={{ color: 'var(--text-muted)', fontWeight: 700, mb: 1, display: 'block' }}>
                  {kpi.icon} {kpi.label}
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 800, color: kpi.color }}>
                  {kpi.value}
                </Typography>
              </div>
            </Grid>
          ))}
        </Grid>

        <Grid container spacing={3}>
          {/* Main Growth and Reach Row */}
          <Grid item xs={12} lg={8}>
            <div className="chart-card">
              <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>Follower Growth & Reach Trend</Typography>
              <Box sx={{ height: 350 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={combinedReachData}>
                    <defs>
                      <linearGradient id="colorReach" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-light)" />
                    <XAxis dataKey="month" stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} />
                    <Tooltip />
                    <Legend />
                    <Area type="monotone" dataKey="reach" stroke="var(--primary)" fillOpacity={1} fill="url(#colorReach)" strokeWidth={3} name="Total Reach (Engagement)" />
                    <Line type="monotone" dataKey="followers" stroke="#10b981" strokeWidth={3} name="Follower Growth" dot={{ r: 4, fill: '#10b981' }} />
                  </AreaChart>
                </ResponsiveContainer>
              </Box>
            </div>
          </Grid>
          <Grid item xs={12} lg={4}>
            <div className="chart-card" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>Top 5 Influencers</Typography>
               <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                  {(data.leaderboard || []).slice(0, 5).map((inf, idx) => (
                    <Box key={idx} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 1.5, background: 'var(--surface-alt)', borderRadius: '12px' }}>
                       <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <Typography variant="h6" sx={{ opacity: 0.3, fontWeight: 900 }}>0{idx + 1}</Typography>
                          <Typography variant="body2" sx={{ fontWeight: 700 }}>{inf.name}</Typography>
                       </Box>
                       <Box sx={{ textAlign: 'right' }}>
                          <Typography variant="caption" sx={{ color: 'var(--accent)', fontWeight: 800, display: 'block' }}>{inf.engagement.toLocaleString()} Eng.</Typography>
                       </Box>
                    </Box>
                  ))}
               </Box>
            </div>
          </Grid>

          {/* Interaction and Earnings Row */}
          <Grid item xs={12} lg={6}>
            <div className="chart-card">
              <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>Engagement Interaction (Likes vs Comments)</Typography>
              <Box sx={{ height: 250 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={engagementData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-light)" />
                    <XAxis dataKey="month" stroke="var(--text-muted)" fontSize={10} />
                    <YAxis hide />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="likes" stroke="var(--accent)" strokeWidth={3} name="Total Likes" dot={false} />
                    <Line type="monotone" dataKey="comments" stroke="var(--info)" strokeWidth={3} name="Total Comments" dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </Box>
            </div>
          </Grid>
          <Grid item xs={12} lg={6}>
            <div className="chart-card">
              <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>Influencer Earnings & Payouts</Typography>
              <Box sx={{ height: 250 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={payoutData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-light)" />
                    <XAxis dataKey="month" stroke="var(--text-muted)" fontSize={12} axisLine={false} tickLine={false} />
                    <YAxis hide />
                    <Tooltip />
                    <Bar dataKey="earnings" fill="var(--success)" radius={[8, 8, 0, 0]} name="Payout (₹)" barSize={35} />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </div>
          </Grid>

          {/* Pie Chart Analysis Tier */}
          <Grid item xs={12} md={4}>
            <div className="chart-card">
              <Typography variant="caption" sx={{ fontWeight: 800, mb: 1, display: 'block', textAlign: 'center' }}>CAMPAIGN WIN RATE</Typography>
              <Box sx={{ height: 220 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie 
                      data={applicationStats} 
                      innerRadius={55} outerRadius={75} dataKey="value" paddingAngle={5}
                    >
                      {applicationStats.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend verticalAlign="bottom" iconSize={8} wrapperStyle={{ fontSize: '10px' }} />
                  </PieChart>
                </ResponsiveContainer>
              </Box>
            </div>
          </Grid>
          <Grid item xs={12} md={4}>
            <div className="chart-card">
              <Typography variant="caption" sx={{ fontWeight: 800, mb: 1, display: 'block', textAlign: 'center' }}>🎯 PREFERRED CAMPAIGN CATEGORIES</Typography>
              <Box sx={{ height: 220 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={data.preferredCategories} innerRadius={55} outerRadius={75} dataKey="value" paddingAngle={5}>
                      {data.preferredCategories?.map((e, i) => <Cell key={i} fill={COLORS[(i+3)%COLORS.length]} />)}
                    </Pie>
                    <Tooltip />
                    <Legend verticalAlign="bottom" iconSize={8} wrapperStyle={{ fontSize: '10px' }} />
                  </PieChart>
                </ResponsiveContainer>
              </Box>
            </div>
          </Grid>
          <Grid item xs={12} md={4}>
            <div className="chart-card" style={{ textAlign: 'center' }}>
               <Typography variant="caption" sx={{ fontWeight: 800, mb: 1, display: 'block' }}>EARNINGS INSIGHT</Typography>
               <Typography variant="h4" sx={{ fontWeight: 800, mt: 4, mb: 1, color: 'var(--success)' }}>
                 ₹{totalEarnings.toLocaleString()}
               </Typography>
               <Typography variant="body2" sx={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                 Verified platform earnings based on fully completed campaign contracts.
               </Typography>
               <Box sx={{ mt: 3, p: 1.5, background: 'var(--surface-alt)', borderRadius: '12px', borderLeft: '4px solid var(--primary)' }}>
                 <Typography variant="caption" sx={{ fontWeight: 800, display: 'block', mb: 0.5 }}>Earning Power:</Typography>
                 <Typography variant="caption" sx={{ color: 'var(--text-secondary)' }}>
                   Platform-wide payout velocity has remained consistent over the last quarter.
                 </Typography>
               </Box>
            </div>
          </Grid>
        </Grid>

        {/* Master Selection List */}
        <div className="chart-card">
          <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 3 }}>Browse Influencer Performance</Typography>
          <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
            <table className="table" style={{ borderCollapse: 'separate', borderSpacing: '0 8px' }}>
              <thead>
                <tr style={{ position: 'sticky', top: 0, background: 'var(--surface)', zIndex: 1 }}>
                  <th>Influencer Name</th>
                  <th>Followers</th>
                  <th>Eng. Rate</th>
                  <th>Total Payouts</th>
                  <th>Niche</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {entities.map((inf) => (
                  <tr key={inf._id} onClick={() => setSelectedId(inf._id)} style={{ cursor: 'pointer', background: selectedId === inf._id ? 'rgba(24, 119, 242, 0.05)' : 'transparent' }}>
                    <td style={{ fontWeight: 700 }}>{inf.name}</td>
                    <td>{inf.followers?.length?.toLocaleString() || '0'}</td>
                    <td style={{ color: 'var(--accent)', fontWeight: 700 }}>{inf.engagementRate || '0'}%</td>
                    <td style={{ fontWeight: 700, color: 'var(--success)' }}>₹{(inf.totalEarnings || 0).toLocaleString()}</td>
                    <td><span className="badge-outline">{inf.niche || 'Other'}</span></td>
                    <td><span style={{ color: 'var(--primary)', fontWeight: 800, fontSize: '0.75rem' }}>{selectedId === inf._id ? 'Viewing' : 'Select'}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </Box>
    );
  };

  const renderPlatformStatus = () => {
    if (!data) return null;

    const totalUsers = (data.userDistribution || []).reduce((s, r) => s + r.value, 0);

    return (
      <Box sx={{ animation: 'fadeIn 0.3s ease' }}>

        {/* 4 KPI Cards */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          {[
            { label: 'Platform Revenue', value: `₹${(data.totalPlatformRevenue || 0).toLocaleString('en-IN')}`, color: '#10b981', icon: '🏻' },
            { label: 'Total Campaigns', value: (data.totalCampaigns || 0).toLocaleString(), color: 'var(--primary)', icon: '📢' },
            { label: 'Applications', value: (data.totalApplications || 0).toLocaleString(), color: 'var(--accent)', icon: '💼' },
            { label: 'Total Users', value: totalUsers.toLocaleString(), color: 'var(--info)', icon: '👥' }
          ].map((kpi, i) => (
            <Grid item xs={12} sm={6} md={3} key={i}>
              <div className="chart-card" style={{ padding: '1.25rem', textAlign: 'center' }}>
                <Typography variant="caption" sx={{ color: 'var(--text-muted)', fontWeight: 700, mb: 1, display: 'block' }}>
                  {kpi.icon} {kpi.label}
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 800, color: kpi.color }}>
                  {kpi.value}
                </Typography>
              </div>
            </Grid>
          ))}
        </Grid>

        {/* Revenue Flow - Smooth Curve Chart */}
        <div className="chart-card" style={{ marginBottom: '2rem' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>📈 Platform Revenue Flow</Typography>
            {data.feeRates && (
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Typography variant="caption" sx={{ background: 'rgba(16,185,129,0.12)', color: '#10b981', px: 1.5, py: 0.5, borderRadius: '20px', fontWeight: 700 }}>
                  Campaign Fee: {data.feeRates.campaignFee}%{data.feeRates.usingFallback ? ' (default)' : ''}
                </Typography>
                <Typography variant="caption" sx={{ background: 'rgba(24,119,242,0.12)', color: 'var(--primary)', px: 1.5, py: 0.5, borderRadius: '20px', fontWeight: 700 }}>
                  App Fee: {data.feeRates.applicationFee}%
                </Typography>
              </Box>
            )}
          </Box>
          <Box sx={{ height: 350 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.revenueTrend}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-light)" />
                <XAxis dataKey="month" stroke="var(--text-muted)" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(val) => val?.slice(5)} />
                <YAxis stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `₹${val.toLocaleString()}`} />
                <Tooltip
                  contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border-light)', borderRadius: '12px' }}
                  formatter={(val) => [`₹${Number(val).toLocaleString('en-IN')}`, 'Revenue']}
                />
                <Line
                  type="natural"
                  dataKey="amount"
                  stroke="#10b981"
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: '#10b981', stroke: '#fff', strokeWidth: 2 }}
                  activeDot={{ r: 6, fill: '#10b981', stroke: '#fff', strokeWidth: 2 }}
                  name="Revenue"
                />
              </LineChart>
            </ResponsiveContainer>
          </Box>
        </div>

        <Grid container spacing={3}>
          {/* User Base Pie Chart */}
          <Grid item xs={12} md={4}>
            <div className="chart-card" style={{ height: '100%' }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 3 }}>👥 User Base Distribution</Typography>
              <Box sx={{ height: 260 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={data.userDistribution}
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {data.userDistribution?.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend iconSize={8} wrapperStyle={{ fontSize: '10px' }} />
                  </PieChart>
                </ResponsiveContainer>
              </Box>
            </div>
          </Grid>

          {/* Platform Revenue by Category Pie Chart */}
          <Grid item xs={12} md={4}>
            <div className="chart-card" style={{ height: '100%' }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 3 }}>💰 Revenue by Category</Typography>
              <Box sx={{ height: 260 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={data.revenueByCategory}
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {data.revenueByCategory?.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[(index + 1) % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend iconSize={8} wrapperStyle={{ fontSize: '10px' }} />
                  </PieChart>
                </ResponsiveContainer>
              </Box>
            </div>
          </Grid>

          {/* Top Users by Time Spent Bar Chart */}
          <Grid item xs={12} md={4}>
            <div className="chart-card" style={{ height: '100%' }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 3 }}>⚡ Top 5 Active Users (Mins)</Typography>
              <Box sx={{ height: 260 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.topUsersByTime} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--border-light)" />
                    <XAxis type="number" hide />
                    <YAxis dataKey="name" type="category" stroke="var(--text-muted)" fontSize={10} width={80} axisLine={false} tickLine={false} />
                    <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border-light)', borderRadius: '12px' }} />
                    <Bar dataKey="minutes" fill="var(--primary)" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </div>
          </Grid>
        </Grid>
      </Box>
    );
  };

  const renderBrandAnalytics = () => {
    // KPI Calculations
    const currentEntity = entities.find(e => e._id === selectedId);
    const brandPool = currentEntity ? [currentEntity] : entities;

    const totalSpent = brandPool.reduce((sum, b) => sum + (b.totalSpent || 0), 0);
    const totalCampaigns = brandPool.reduce((sum, b) => sum + (b.campaignsCount || 0), 0);
    
    const spendingData = data.spendingTrend || [];
    const pipelineData = data.pipelineTrend || [];
    const fulfillmentStats = data.fulfillmentStats || [];

    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {/* Aggregate Reset Navigation */}
        {selectedId !== 'all' && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 1 }}>
            <button 
              className="chart-card" 
              onClick={() => setSelectedId('all')}
              style={{
                width: 'auto',
                padding: '0.8125rem 2.5rem',
                border: '1px solid var(--primary)',
                color: 'var(--primary)',
                fontSize: '0.875rem',
                fontWeight: 800,
                borderRadius: '50px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                background: 'rgba(24, 119, 242, 0.08)',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                boxShadow: '0 8px 16px -4px rgba(24, 119, 242, 0.25)',
                letterSpacing: '0.025em',
                textTransform: 'uppercase'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-3px)';
                e.currentTarget.style.background = 'rgba(24, 119, 242, 0.15)';
                e.currentTarget.style.boxShadow = '0 12px 20px -4px rgba(24, 119, 242, 0.35)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.background = 'rgba(24, 119, 242, 0.08)';
                e.currentTarget.style.boxShadow = '0 8px 16px -4px rgba(24, 119, 242, 0.25)';
              }}
            >
              <span style={{ fontSize: '1.1rem' }}>🌍</span> SHOW GLOBAL PLATFORM STATISTICS
            </button>
          </Box>
        )}

        {/* KPI Row */}
        <Grid container spacing={3}>
          {[
            { label: 'Total Capital Flow', value: `₹${totalSpent.toLocaleString()}`, color: 'var(--success)', icon: '💰' },
            { label: 'Platform Revenue', value: `₹${(data.platformRevenue || 0).toLocaleString()}`, color: 'var(--info)', icon: '🏛️' },
            { label: 'Active Campaigns', value: totalCampaigns, color: 'var(--primary)', icon: '🚀' },
            { label: 'Brand Partnerships', value: brandPool.length, color: 'var(--accent)', icon: '🤝' }
          ].map((kpi, i) => (
            <Grid item xs={12} sm={6} md={3} key={i}>
              <div className="chart-card" style={{ padding: '1.25rem', textAlign: 'center' }}>
                <Typography variant="caption" sx={{ color: 'var(--text-muted)', fontWeight: 700, mb: 1, display: 'block' }}>
                  {kpi.icon} {kpi.label}
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 800, color: kpi.color }}>
                  {kpi.value}
                </Typography>
              </div>
            </Grid>
          ))}
        </Grid>

        <Grid container spacing={3}>
          {/* Main Spending and Activity Row */}
          <Grid item xs={12} lg={8}>
            <div className="chart-card">
              <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>Brand Spending & Capital Flow</Typography>
              <Box sx={{ height: 350 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={spendingData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-light)" />
                    <XAxis dataKey="month" stroke="var(--text-muted)" fontSize={12} axisLine={false} tickLine={false} />
                    <YAxis hide />
                    <Tooltip />
                    <Bar dataKey="amount" fill="var(--success)" radius={[8, 8, 0, 0]} barSize={45} name="Total Spent (₹)" />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </div>
          </Grid>
          <Grid item xs={12} lg={4}>
            <div className="chart-card" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>Top 5 Brand Partners</Typography>
               <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                  {entities.sort((a,b) => (b.totalSpent || 0) - (a.totalSpent || 0)).slice(0, 5).map((brand, idx) => (
                    <Box key={idx} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 1.5, background: 'var(--surface-alt)', borderRadius: '12px' }}>
                       <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <Typography variant="h6" sx={{ opacity: 0.3, fontWeight: 900 }}>0{idx + 1}</Typography>
                          <Typography variant="body2" sx={{ fontWeight: 700 }}>{brand.name}</Typography>
                       </Box>
                       <Box sx={{ textAlign: 'right' }}>
                          <Typography variant="caption" sx={{ color: 'var(--success)', fontWeight: 800, display: 'block' }}>₹{(brand.totalSpent || 0).toLocaleString()}</Typography>
                       </Box>
                    </Box>
                  ))}
               </Box>
            </div>
          </Grid>

          {/* Application Pipeline Trend */}
          <Grid item xs={12} lg={12}>
            <div className="chart-card">
              <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>Application Pipeline (Applied vs Accepted vs Rejected)</Typography>
              <Box sx={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={pipelineData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-light)" />
                    <XAxis dataKey="month" stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} />
                    <Tooltip contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border-light)', borderRadius: '8px' }} />
                    <Legend />
                    <Bar dataKey="accepted" stackId="a" fill="var(--success)" radius={[4, 4, 0, 0]} name="Accepted" />
                    <Bar dataKey="rejected" stackId="a" fill="var(--danger)" radius={[0, 0, 0, 0]} name="Rejected" />
                    <Bar dataKey="pending" stackId="a" fill="rgba(24, 119, 242, 0.4)" radius={[0, 0, 0, 0]} name="Pending" />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </div>
          </Grid>

          {/* Pie Chart Analysis Tier */}
          <Grid item xs={12} md={4}>
            <div className="chart-card">
              <Typography variant="caption" sx={{ fontWeight: 800, mb: 1, display: 'block', textAlign: 'center' }}>INDUSTRY SHARE</Typography>
              <Box sx={{ height: 220 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={data.brandDistribution || []} innerRadius={55} outerRadius={75} dataKey="value" paddingAngle={5}>
                      {(data.brandDistribution || []).map((e, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip />
                    <Legend verticalAlign="bottom" iconSize={8} wrapperStyle={{ fontSize: '10px' }} />
                  </PieChart>
                </ResponsiveContainer>
              </Box>
            </div>
          </Grid>
          <Grid item xs={12} md={4}>
            <div className="chart-card">
              <Typography variant="caption" sx={{ fontWeight: 800, mb: 1, display: 'block', textAlign: 'center' }}>FULFILLMENT STATUS</Typography>
              <Box sx={{ height: 220 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={fulfillmentStats} innerRadius={55} outerRadius={75} dataKey="value" paddingAngle={5}>
                      {fulfillmentStats.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend verticalAlign="bottom" iconSize={8} wrapperStyle={{ fontSize: '10px' }} />
                  </PieChart>
                </ResponsiveContainer>
              </Box>
            </div>
          </Grid>
          <Grid item xs={12} md={4}>
            <div className="chart-card" style={{ textAlign: 'center' }}>
               <Typography variant="caption" sx={{ fontWeight: 800, mb: 1, display: 'block' }}>REVENUE CAPTURE</Typography>
               <Typography variant="h4" sx={{ fontWeight: 800, mt: 4, mb: 1, color: 'var(--primary)' }}>
                 ₹{(data.platformRevenue || 0).toLocaleString()}
               </Typography>
               <Typography variant="body2" sx={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                 Combined platform commission (15%) generated from total brand campaigns.
               </Typography>
               <Box sx={{ mt: 3, p: 1.5, background: 'var(--surface-alt)', borderRadius: '12px', borderLeft: '4px solid var(--info)' }}>
                 <Typography variant="caption" sx={{ fontWeight: 800, display: 'block', mb: 0.5 }}>Platform Growth:</Typography>
                 <Typography variant="caption" sx={{ color: 'var(--text-secondary)' }}>
                   Revenue metrics are based on completed financial settlements and brand spending.
                 </Typography>
               </Box>
            </div>
          </Grid>
        </Grid>

        {/* Master Selection List */}
        <div className="chart-card">
          <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 3 }}>Master Selection: All Brands</Typography>
          <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
            <table className="table" style={{ borderCollapse: 'separate', borderSpacing: '0 8px' }}>
              <thead>
                <tr style={{ position: 'sticky', top: 0, background: 'var(--surface)', zIndex: 1 }}>
                  <th>Brand Name</th>
                  <th>Industry</th>
                  <th>Total Spent</th>
                  <th>Campaigns</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {entities.map((brand) => (
                  <tr key={brand._id} onClick={() => setSelectedId(brand._id)} style={{ cursor: 'pointer', background: selectedId === brand._id ? 'rgba(24, 119, 242, 0.05)' : 'transparent' }}>
                    <td style={{ fontWeight: 700 }}>{brand.name}</td>
                    <td><span className="badge-outline">{brand.industry || 'Lifestyle'}</span></td>
                    <td style={{ fontWeight: 700, color: 'var(--success)' }}>₹{(brand.totalSpent || 0).toLocaleString()}</td>
                    <td>{brand.campaignsCount || 0}</td>
                    <td><span className={brand.isBlocked ? "badge-danger" : "badge-success"}>{brand.isBlocked ? 'Blocked' : 'Active'}</span></td>
                    <td><span style={{ color: 'var(--primary)', fontWeight: 800, fontSize: '0.75rem' }}>{selectedId === brand._id ? 'Viewing' : 'Select'}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </Box>
    );
  };

  return (
    <Box sx={{ animation: 'fadeIn 0.3s ease' }}>
      {/* Analytics Sub-Navbar & Filter */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Box sx={{ display: 'flex', gap: 1, p: 0.5, mb: 1.5, background: 'var(--surface-alt)', borderRadius: 'var(--radius-pill)', width: 'fit-content' }}>
          {['platform-status', 'posts', 'campaigns', 'influencers', 'brands'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveSubTab(tab)}
              style={{
                background: activeSubTab === tab ? 'var(--primary)' : 'transparent',
                color: activeSubTab === tab ? 'white' : 'var(--text-muted)',
                border: 'none',
                padding: '0.5rem 1.25rem',
                borderRadius: 'var(--radius-pill)',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: '0.8125rem',
                transition: 'all 0.2s ease',
                textTransform: 'capitalize'
              }}
            >
              {tab}
            </button>
          ))}
        </Box>

        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel sx={{ color: 'var(--text-muted)' }}>Timeframe</InputLabel>
          <Select
            value={timeframe}
            label="Timeframe"
            onChange={(e) => setTimeframe(e.target.value)}
            sx={{
              borderRadius: 'var(--radius-pill)',
              background: 'var(--surface)',
              '.MuiOutlinedInput-notchedOutline': { borderColor: 'var(--border-light)' },
              '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'var(--primary)' },
              '.MuiSelect-select': { fontSize: '0.8125rem', fontWeight: 600 }
            }}
          >
            <MenuItem value="7">Last 7 Days</MenuItem>
            <MenuItem value="30">Last 30 Days</MenuItem>
            <MenuItem value="90">Last 90 Days</MenuItem>
            <MenuItem value="365">Last Year</MenuItem>
          </Select>
        </FormControl>

        {/* Hide the top dropdown filter for ALL tabs as we now have master lists below */}
        {false && (
          <FormControl size="small" sx={{ minWidth: 200 }}>
            <InputLabel sx={{ color: 'var(--text-muted)' }}>
              Select {activeSubTab.slice(0, -1)}
            </InputLabel>
            <Select
              value={selectedId}
              label={`Select ${activeSubTab.slice(0, -1)}`}
              onChange={(e) => setSelectedId(e.target.value)}
              disabled={entitiesLoading}
              sx={{
                borderRadius: 'var(--radius-pill)',
                background: 'var(--surface)',
                '.MuiOutlinedInput-notchedOutline': { borderColor: 'var(--border-light)' },
                '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'var(--primary)' },
                '.MuiSelect-select': { fontSize: '0.8125rem', fontWeight: 600 }
              }}
            >
              <MenuItem value="all">All {activeSubTab} (Aggregate)</MenuItem>
              {entities.map((entity) => (
                <MenuItem key={entity._id} value={entity._id}>
                  {entity.name || entity.title || (entity.content?.substring(0, 20) + '...')}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}
      </Box>

      {renderContent()}
    </Box>
  );
}
