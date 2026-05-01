export const getAdminSidebarItems = ({ stats = {}, withdrawals = [], campaigns = [], posts = [] } = {}) => [
  { key: 'overview', icon: '📊', label: 'Overview' },
  { key: 'withdrawals', icon: '🏦', label: 'Withdrawals', badge: withdrawals.length || undefined },
  { key: 'users', icon: '👥', label: 'Users', badge: Number(stats?.totalUsers) || 0 },
  { key: 'campaigns', icon: '📢', label: 'Campaigns', badge: campaigns.length || 0 },
  { key: 'posts', icon: '📸', label: 'Posts', badge: posts.length || 0 },
  { key: 'brand-logos', icon: 'B', label: 'Brand Logos' },
  { key: 'fee-structure', icon: '💰', label: 'Fee Structure' },
  { key: 'analytics', icon: '📈', label: 'Analytics' },
  { key: 'disputes', icon: '⚖️', label: 'Disputes', badge: Number(stats?.openDisputes) || 0 },
];
