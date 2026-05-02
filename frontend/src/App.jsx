import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import { isTokenExpired } from './features/auth/authUtils';
import Landing from './pages/Landing'
import PrivacyPolicyPage from './pages/PrivacyPolicyPage'
import TermsOfServicePage from './pages/TermsOfServicePage'
import Auth from './pages/Auth'
import InfluencerDashboard from './components/layout/InfluencerLayout'
import InfluencerHome from './pages/influencer/InfluencerHomePage'
import InfluencerExplore from './pages/influencer/InfluencerExplorePage'
import InfluencerChat from './pages/influencer/InfluencerChatPage'
import InfluencerStats from './pages/influencer/InfluencerDashboardPage'
import InfluencerProfile from './pages/influencer/InfluencerProfilePage'
import BrandDashboard from './components/layout/BrandLayout'
import BrandHome from './pages/brand/BrandHomePage'
import BrandExplore from './pages/brand/BrandExplorePage'
import BrandChat from './pages/brand/BrandChatPage'
import BrandStats from './pages/brand/BrandDashboardAnalyticsPage'
import BrandProfilePage from './pages/brand/BrandProfilePage'
import Notifications from './pages/Notifications'
import UserProfile from './pages/UserProfile'

// Admin Modular Pages
import AdminDashboard from './pages/admin/DashboardPage'
import AdminUsers from './pages/admin/UsersPage'
import AdminCampaigns from './pages/admin/CampaignsPage'
import AdminPosts from './pages/admin/PostsPage'
import AdminFees from './pages/admin/FeeStructurePage'
import AdminAnalytics from './pages/admin/AnalyticsPage'
import AdminDisputes from './pages/admin/DisputesPage'
import AdminWithdrawals from './pages/admin/WithdrawalsPage'
import AdminProfile from './pages/admin/AdminProfilePage'
import AdminBrandLogos from './pages/admin/BrandLogosPage'
import AdminBadges from './pages/admin/BadgesPage'
import AdminCategories from './pages/admin/CategoriesPage'


function ProtectedRoute({ children, roles }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <div className="spinner" />
      </div>
    );
  }

  if (!user) return <Navigate to="/auth" replace />;
  if (roles && !roles.includes(user.role)) {
    const redirectMap = { influencer: '/influencer', brand: '/brand', admin: '/admin' };
    return <Navigate to={redirectMap[user.role] || '/'} replace />;
  }

  return children;
}

export default function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh',
        background: 'var(--secondary)', flexDirection: 'column', gap: '1rem'
      }}>
        <div style={{
          width: 48, height: 48, borderRadius: 'var(--radius-md)',
          background: 'var(--accent-gradient)', display: 'flex', alignItems: 'center',
          justifyContent: 'center', color: 'white', fontSize: 24, fontWeight: 800,
          animation: 'pulse 1.5s ease infinite'
        }}>C</div>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Loading...</p>
      </div>
    );
  }

  return (
    <>
      <div className="liquid-orb-overlay" />
      <div className="material-grain" />
      <Routes>
        <Route path="/" element={user ? <Navigate to={`/${user.role === 'influencer' ? 'influencer' : user.role}`} replace /> : <Landing />} />
        <Route path="/auth" element={user ? <Navigate to={`/${user.role === 'influencer' ? 'influencer' : user.role}`} replace /> : <Auth />} />
        <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
        <Route path="/terms-of-service" element={<TermsOfServicePage />} />
        <Route path="/profile/:userId" element={<ProtectedRoute><UserProfile /></ProtectedRoute>} />
        <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />

        <Route path="/influencer/*" element={<ProtectedRoute roles={['influencer']}><InfluencerDashboard /></ProtectedRoute>}>
          <Route index element={<InfluencerHome />} />
          <Route path="explore" element={<InfluencerExplore />} />
          <Route path="chat" element={<InfluencerChat />} />
          <Route path="dashboard" element={<InfluencerStats />} />
          <Route path="profile" element={<InfluencerProfile />} />
        </Route>
        <Route path="/brand/*" element={<ProtectedRoute roles={['brand']}><BrandDashboard /></ProtectedRoute>}>
          <Route index element={<BrandHome />} />
          <Route path="explore" element={<BrandExplore />} />
          <Route path="chat" element={<BrandChat />} />
          <Route path="dashboard" element={<BrandStats />} />
          <Route path="profile" element={<BrandProfilePage />} />
        </Route>
        <Route path="/admin/*" element={<ProtectedRoute roles={['admin']}>
          <Routes>
            <Route index element={<AdminDashboard />} />
            <Route path="overview" element={<AdminDashboard />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="campaigns" element={<AdminCampaigns />} />
            <Route path="posts" element={<AdminPosts />} />
            <Route path="brand-logos" element={<AdminBrandLogos />} />
            <Route path="categories" element={<AdminCategories />} />
            <Route path="badges" element={<AdminBadges />} />
            <Route path="fee-structure" element={<AdminFees />} />
            <Route path="analytics" element={<AdminAnalytics />} />
            <Route path="disputes" element={<AdminDisputes />} />
            <Route path="withdrawals" element={<AdminWithdrawals />} />
            <Route path="profile" element={<AdminProfile />} />
            <Route path="*" element={<Navigate to="/admin" replace />} />
          </Routes>
        </ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}
