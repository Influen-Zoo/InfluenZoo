import { useState, useMemo } from 'react';
import useAdminDashboard from './useAdminDashboard';
import adminService from '../../services/admin.service';
import { filterAdminUsers } from '../../features/admin/adminProcessor';

export const useUsers = () => {
  const { 
    users, stats, loading, toast, showToast, withdrawals, campaigns, posts, setUsers, setStats
  } = useAdminDashboard();

  const [userFilter, setUserFilter] = useState({ 
    search: '', 
    role: '', 
    status: ''
  });
  const [coinEditModal, setCoinEditModal] = useState(null);
  const [followerEditModal, setFollowerEditModal] = useState(null);
  const [badgeModal, setBadgeModal] = useState(null);

  const filteredUsers = useMemo(() => filterAdminUsers(users, userFilter), [users, userFilter]);

  const handleUserStatus = async (id, status) => {
    try {
      await adminService.updateUserStatus(id, status);
      showToast(status === 'banned' ? 'User blocked' : 'User unblocked');
      const updatedUsers = await adminService.getUsers();
      setUsers(updatedUsers);
    } catch (e) {
      showToast(e.message, 'danger');
    }
  };

  const handleUpdateCoins = async (e) => {
    e.preventDefault();
    if (!coinEditModal) return;
    const formData = new FormData(e.target);
    const amount = Number(formData.get('amount'));
    const action = formData.get('action');
    const reason = formData.get('reason');

    try {
      await adminService.updateUserCoins(coinEditModal.userId, { amount, action, reason });
      showToast('Coins updated successfully! 🪙');
      setCoinEditModal(null);
      const [u, s] = await Promise.all([adminService.getUsers(), adminService.getStats()]);
      setUsers(u);
      setStats(s);
    } catch (e) {
      showToast(e.message, 'danger');
    }
  };

  const handleUpdateFollowers = async (e) => {
    e.preventDefault();
    if (!followerEditModal) return;

    const formData = new FormData(e.target);
    const amount = Number(formData.get('amount'));
    const nextFollowers = (Number(followerEditModal.currentFollowers) || 0) + amount;

    try {
      await adminService.updateUserFollowers(followerEditModal.userId, nextFollowers);
      showToast('Followers updated successfully!');
      setFollowerEditModal(null);
      const [u, s] = await Promise.all([adminService.getUsers(), adminService.getStats()]);
      setUsers(u);
      setStats(s);
    } catch (e) {
      showToast(e.response?.data?.error || e.message, 'danger');
    }
  };

  const handleUpdateBadges = async (userId, badgeId, isRemoving = false) => {
    try {
      if (isRemoving) {
        await adminService.removeBadgeFromUser(userId, badgeId);
      } else {
        await adminService.assignBadgeToUser(userId, badgeId);
      }
      showToast(isRemoving ? 'Badge removed' : 'Badge assigned');
      const updatedUsers = await adminService.getUsers();
      setUsers(updatedUsers);
      return true;
    } catch (e) {
      showToast(e.message, 'danger');
      return false;
    }
  };

  const handleBulkUpdateBadges = async (userId, toAdd, toRemove) => {
    try {
      // Execute all additions
      for (const badgeId of toAdd) {
        await adminService.assignBadgeToUser(userId, badgeId);
      }
      // Execute all removals
      for (const badgeId of toRemove) {
        await adminService.removeBadgeFromUser(userId, badgeId);
      }
      
      if (toAdd.length > 0 || toRemove.length > 0) {
        showToast('Privileges updated successfully');
        const updatedUsers = await adminService.getUsers();
        setUsers(updatedUsers);
      }
      return true;
    } catch (e) {
      showToast(e.message, 'danger');
      return false;
    }
  };

  return {
    users,
    filteredUsers,
    stats,
    loading,
    toast,
    showToast,
    withdrawals,
    campaigns,
    posts,
    userFilter,
    setUserFilter,
    coinEditModal,
    setCoinEditModal,
    followerEditModal,
    setFollowerEditModal,
    handleUserStatus,
    handleUpdateCoins,
    handleUpdateFollowers,
    badgeModal,
    setBadgeModal,
    handleUpdateBadges,
    handleBulkUpdateBadges
  };
};

export default useUsers;
