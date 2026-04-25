import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import AdminSidebar from './AdminSidebar';
import AdminTopbar from './AdminTopbar';
import '../../pages/AdminPanel.css'; // Link existing styles for now

export const AdminLayout = ({ children, activeSection, setActiveSection, sidebarItems, toast }) => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);

  const activeSectionTitle = sidebarItems.find(i => i.key === activeSection)?.label || 'Overview';

  return (
    <div className="admin-page">
      {toast && (
        <div className="toast-container">
          <div className={`toast toast-${toast.type}`}>
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      <AdminSidebar 
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        isSidebarCollapsed={isSidebarCollapsed}
        setIsSidebarCollapsed={setIsSidebarCollapsed}
        activeSection={activeSection}
        setActiveSection={setActiveSection}
        sidebarItems={sidebarItems}
        user={user}
        logout={logout}
        navigate={navigate}
      />

      <div className={`admin-content ${isSidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
        <AdminTopbar 
          setSidebarOpen={setSidebarOpen}
          activeSectionTitle={activeSectionTitle}
          theme={theme}
          toggleTheme={toggleTheme}
          user={user}
          showProfileDropdown={showProfileDropdown}
          setShowProfileDropdown={setShowProfileDropdown}
          setActiveSection={setActiveSection}
          logout={logout}
        />
        
        <div className="admin-body">
          {children}
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;
