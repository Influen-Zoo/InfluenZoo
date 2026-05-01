import React from 'react';
import AdminLayout from '../../components/layout/AdminLayout';
import UserStats from '../../components/admin/UserStats';
import UserFilters from '../../components/admin/UserFilters';
import UserTable from '../../components/admin/UserTable';
import { getAdminSidebarItems } from '../../constants/adminSidebarItems';
import CoinEditModal from '../../components/admin/modals/CoinEditModal';
import FollowerEditModal from '../../components/admin/modals/FollowerEditModal';
import UserBadgeModal from '../../components/admin/modals/UserBadgeModal';
import useUsers from '../../hooks/admin/useUsers';

export const UsersPage = () => {
  const { 
    filteredUsers, stats, loading, toast, withdrawals, campaigns, posts,
    userFilter, setUserFilter, coinEditModal, setCoinEditModal,
    followerEditModal, setFollowerEditModal,
    badgeModal, setBadgeModal,
    handleUserStatus, handleUpdateCoins, handleUpdateFollowers, handleBulkUpdateBadges
  } = useUsers();

  const sidebarItems = getAdminSidebarItems({ stats, withdrawals, campaigns, posts });

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
            setBadgeModal={setBadgeModal}
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

        <UserBadgeModal
          isOpen={!!badgeModal}
          onClose={() => setBadgeModal(null)}
          user={badgeModal}
          onBulkUpdate={handleBulkUpdateBadges}
        />
      </div>
    </AdminLayout>
  );
};

export default UsersPage;
