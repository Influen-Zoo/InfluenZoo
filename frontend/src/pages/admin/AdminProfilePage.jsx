import React from 'react';
import AdminLayout from '../../components/layout/AdminLayout';
import useAdminDashboard from '../../hooks/admin/useAdminDashboard';
import LiquidButton from '../../components/common/LiquidButton/LiquidButton';
import { Camera } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import userService from '../../services/user.service';

export const AdminProfilePage = () => {
  const { user } = useAuth();
  const { 
    stats, toast, showToast, withdrawals, campaigns, posts
  } = useAdminDashboard();

  const [editMode, setEditMode] = React.useState(false);
  const [formData, setFormData] = React.useState({
    name: user?.name || '',
    email: user?.email || ''
  });

  const sidebarItems = [
    { key: 'overview', icon: '📊', label: 'Overview' },
    { key: 'withdrawals', icon: '🏦', label: 'Withdrawals', badge: withdrawals.length || undefined },
    { key: 'users', icon: '👥', label: 'Users', badge: Number(stats?.totalUsers) || 0 },
    { key: 'campaigns', icon: '📢', label: 'Campaigns', badge: campaigns.length || 0 },
    { key: 'posts', icon: '📸', label: 'Posts', badge: posts.length || 0 },
    { key: 'fee-structure', icon: '💰', label: 'Fee Structure' },
    { key: 'analytics', icon: '📈', label: 'Analytics' },
    { key: 'disputes', icon: '⚖️', label: 'Disputes', badge: Number(stats?.openDisputes) || 0 },
  ];

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      showToast('Updating profile...', 'info');
      await userService.updateProfile(formData);
      showToast('Profile updated successfully! 👤');
      setEditMode(false);
      // Optional: window.location.reload(); or update local user context if possible
    } catch (err) {
      showToast('Update failed: ' + err.message, 'danger');
    }
  };

  const handleUpdateProfilePicture = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    try {
      showToast('Uploading picture...', 'info');
      const uploadRes = await userService.uploadFile(file);
      if (uploadRes) {
        await userService.updateProfile({ profilePicture: uploadRes });
        showToast('Profile picture updated! ✨');
        window.location.reload(); 
      }
    } catch (err) {
      showToast('Failed to update picture: ' + err.message, 'danger');
    }
  };

  return (
    <AdminLayout 
      activeSection="profile" 
      setActiveSection={() => {}} 
      sidebarItems={sidebarItems}
      toast={toast}
    >
      <div className="admin-profile-card page-enter" style={{ maxWidth: '600px', margin: '0 auto' }}>
        <div style={{ 
          margin: '0 auto 2rem', 
          width: '140px', 
          height: '140px', 
          position: 'relative',
          padding: '4px',
          background: 'var(--accent-gradient)',
          borderRadius: '50%',
          boxShadow: '0 8px 30px rgba(var(--accent-rgb), 0.2)'
        }}>
          <div style={{ 
            width: '100%', 
            height: '100%', 
            borderRadius: '50%', 
            overflow: 'hidden', 
            background: 'var(--surface)', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            fontSize: '3.5rem', 
            fontWeight: 800,
            border: '4px solid var(--surface)'
          }}>
            {user?.profilePicture ? (
              <img src={user.profilePicture} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <span style={{ background: 'var(--accent-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                {user?.name?.[0]}
              </span>
            )}
          </div>
          <label style={{ 
            position: 'absolute', 
            bottom: '5px', 
            right: '5px', 
            width: '42px',
            height: '42px',
            background: 'var(--surface)', 
            color: 'var(--text-primary)', 
            borderRadius: '50%', 
            cursor: 'pointer', 
            display: 'flex', 
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            border: '1px solid var(--border)',
            transition: 'transform 0.2s ease',
            zIndex: 10
          }}
          className="hover-scale"
          >
            <Camera size={20} />
            <input type="file" hidden accept="image/*" onChange={handleUpdateProfilePicture} />
          </label>
        </div>

        {editMode ? (
          <form onSubmit={handleUpdateProfile} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', width: '100%' }}>
            <div className="input-group">
              <label style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.5rem', display: 'block' }}>Full Name</label>
              <input 
                className="input" 
                value={formData.name} 
                onChange={e => setFormData({...formData, name: e.target.value})}
                required
                style={{ background: 'var(--surface-alt)' }}
              />
            </div>
            <div className="input-group">
              <label style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.5rem', display: 'block' }}>Email Address</label>
              <input 
                className="input" 
                type="email"
                value={formData.email} 
                onChange={e => setFormData({...formData, email: e.target.value})}
                required
                style={{ background: 'var(--surface-alt)' }}
              />
            </div>
            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
              <LiquidButton type="submit" variant="primary" style={{ flex: 1 }}>Save Changes</LiquidButton>
              <LiquidButton variant="secondary" style={{ flex: 1 }} onClick={() => setEditMode(false)}>Cancel</LiquidButton>
            </div>
          </form>
        ) : (
          <div style={{ textAlign: 'center' }}>
            <h2 style={{ fontWeight: 800, fontSize: '1.75rem', marginBottom: '0.25rem' }}>{user?.name}</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', fontSize: '0.875rem' }}>{user?.email} • Platform Administrator</p>
            
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(3, 1fr)', 
              gap: '1rem',
              marginBottom: '2.5rem'
            }}>
              <div style={{ background: 'var(--surface-alt)', padding: '1.25rem 1rem', borderRadius: '16px', border: '1px solid var(--border-light)' }}>
                <span style={{ fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Systems</span>
                <div style={{ fontWeight: 800, fontSize: '1.125rem' }}>8 Active</div>
              </div>
              <div style={{ background: 'var(--surface-alt)', padding: '1.25rem 1rem', borderRadius: '16px', border: '1px solid var(--border-light)' }}>
                <span style={{ fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Security</span>
                <div style={{ fontWeight: 800, fontSize: '1.125rem' }}>Level 5</div>
              </div>
              <div style={{ background: 'var(--surface-alt)', padding: '1.25rem 1rem', borderRadius: '16px', border: '1px solid var(--border-light)' }}>
                <span style={{ fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Uptime</span>
                <div style={{ fontWeight: 800, fontSize: '1.125rem' }}>99.9%</div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem' }}>
              <LiquidButton variant="primary" style={{ flex: 1 }} onClick={() => setEditMode(true)}>
                Edit Profile
              </LiquidButton>
              <div style={{ flex: 1, position: 'relative' }}>
                <LiquidButton variant="secondary" style={{ width: '100%', opacity: 0.6, cursor: 'not-allowed' }} onClick={() => showToast('Security settings coming soon...', 'info')}>
                  Security Settings
                </LiquidButton>
                <span style={{ 
                  position: 'absolute', 
                  top: '-10px', 
                  right: '10px', 
                  background: 'var(--accent-gradient)', 
                  color: 'white', 
                  fontSize: '0.6rem', 
                  padding: '2px 8px', 
                  borderRadius: 'var(--radius-pill)',
                  fontWeight: 700,
                  boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                }}>COMING SOON</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminProfilePage;
