import React from 'react';
import {
  Award,
  BarChart3,
  Camera,
  ChevronLeft,
  ChevronRight,
  Image,
  IndianRupee,
  LineChart,
  LogOut,
  Megaphone,
  Scale,
  Tags,
  Users,
  Wallet,
} from 'lucide-react';
import logo from '../../assets/influenzoo-logo.png';
import { getOwnProfilePath, resolveAssetUrl } from '../../utils/helpers';

const sidebarIconMap = {
  overview: BarChart3,
  withdrawals: Wallet,
  users: Users,
  campaigns: Megaphone,
  posts: Camera,
  'brand-logos': Image,
  categories: Tags,
  badges: Award,
  'fee-structure': IndianRupee,
  analytics: LineChart,
  disputes: Scale,
};

const SidebarIcon = ({ item }) => {
  const Icon = sidebarIconMap[item.key];
  if (Icon) return <Icon className="sidebar-item-icon-svg" size={18} strokeWidth={2.1} />;
  return <span className="sidebar-item-icon-fallback">{item.icon}</span>;
};

export const AdminSidebar = ({ 
  sidebarOpen, 
  setSidebarOpen, 
  isSidebarCollapsed, 
  setIsSidebarCollapsed, 
  activeSection, 
  setActiveSection, 
  sidebarItems,
  user,
  logout,
  navigate 
}) => {
  const openProfile = () => {
    navigate(getOwnProfilePath(user?.role));
    setActiveSection?.('profile');
    setSidebarOpen(false);
  };

  return (
    <>
      {sidebarOpen && <div className="sidebar-overlay active" onClick={() => setSidebarOpen(false)} />}
      
      <aside className={`admin-sidebar ${sidebarOpen ? 'open' : ''} ${isSidebarCollapsed ? 'collapsed' : ''}`}>
        <div className="sidebar-logo">
          <div 
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', flex: 1 }} 
            onClick={() => {
              if (isSidebarCollapsed) setIsSidebarCollapsed(false);
              else navigate('/');
            }}
          >
            <img src={logo} alt="influenZoo Logo" style={{ height: '32px', width: 'auto', borderRadius: '50%' }} />
            {!isSidebarCollapsed && <span>influenZoo</span>}
          </div>
          {!isSidebarCollapsed && (
            <button 
              className="collapse-toggle" 
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              title={isSidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
            >
              {isSidebarCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
            </button>
          )}
        </div>
        
        <div className="sidebar-divider" />
        
        <nav className="sidebar-nav">
          <div className="sidebar-section">
            <div className="sidebar-section-title">Main Menu</div>
            {sidebarItems.map(item => (
              <div 
                key={item.key} 
                className={`sidebar-item ${activeSection === item.key ? 'active' : ''}`}
                onClick={() => { 
                  navigate(`/admin/${item.key}`);
                  setSidebarOpen(false); 
                }}
              >
                <span className="sidebar-item-icon">
                  <SidebarIcon item={item} />
                </span>
                <span className="sidebar-item-label">{item.label}</span>
                {item.badge > 0 && (
                  <span className="badge" style={{ marginLeft: 'auto', padding: '0.1rem 0.5rem', fontSize: 10, background: 'rgba(14,165,160,0.2)', color: 'var(--accent-light)' }}>
                    {item.badge}
                  </span>
                )}
              </div>
            ))}
          </div>
        </nav>
        
        <div className="sidebar-user">
          <div
            className="avatar"
            style={{ width: 36, height: 36, fontSize: '0.8125rem', cursor: 'pointer' }}
            onClick={openProfile}
            role="button"
            tabIndex={0}
            aria-label="Open profile"
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                openProfile();
              }
            }}
          >
            {user?.profilePicture ? <img src={resolveAssetUrl(user.profilePicture)} alt="Avatar" /> : user?.name?.[0]}
          </div>
          {!isSidebarCollapsed && (
            <div className="sidebar-user-info">
              <div className="sidebar-user-name">{user?.name}</div>
              <div className="sidebar-user-role">Super Admin</div>
            </div>
          )}
          {!isSidebarCollapsed && (
            <button onClick={logout} className="admin-sidebar-logout" title="Sign Out">
              <LogOut size={18} />
            </button>
          )}
        </div>
      </aside>
    </>
  );
};

export default AdminSidebar;
