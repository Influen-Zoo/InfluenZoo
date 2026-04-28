import React from 'react';
import AdminLayout from '../../components/layout/AdminLayout';
import UserStats from '../../components/admin/UserStats';
import UserFilters from '../../components/admin/UserFilters';
import UserTable from '../../components/admin/UserTable';
import CoinEditModal from '../../components/admin/modals/CoinEditModal';
import FollowerEditModal from '../../components/admin/modals/FollowerEditModal';
import useUsers from '../../hooks/admin/useUsers';

export const UsersPage = () => {
  const { 
    filteredUsers, stats, loading, toast, withdrawals, campaigns, posts,
    userFilter, setUserFilter, coinEditModal, setCoinEditModal,
    followerEditModal, setFollowerEditModal,
    handleUserStatus, handleUpdateCoins, handleUpdateFollowers
  } = useUsers();

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

  return (
    <AdminLayout 
      activeSection="users" 
      setActiveSection={() => {}} 
      sidebarItems={sidebarItems}
      toast={toast}
    >
      <div className="page-enter" style={{ background: 'none' }}>
        <UserStats stats={stats} filteredUsersCount={filteredUsers.length} />

        <UserFilters userFilter={userFilter} setUserFilter={setUserFilter} />

        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem' }}>
            <div className="spinner" style={{ margin: '0 auto 1rem' }} />
            Crunching user data...
          </div>
        ) : (
          <UserTable 
            filteredUsers={filteredUsers} 
            handleUserStatus={handleUserStatus} 
            setCoinEditModal={setCoinEditModal} 
            setFollowerEditModal={setFollowerEditModal}
          />
        )}

        <CoinEditModal 
          isOpen={!!coinEditModal}
          onClose={() => setCoinEditModal(null)}
          user={coinEditModal}
          onUpdate={handleUpdateCoins}
        />

        <FollowerEditModal
          isOpen={!!followerEditModal}
          onClose={() => setFollowerEditModal(null)}
          user={followerEditModal}
          onUpdate={handleUpdateFollowers}
        />
      </div>
    </AdminLayout>
  );
};

export default UsersPage;
