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

  const filteredUsers = useMemo(() => filterAdminUsers(users, userFilter), [users, userFilter]);

  const handleUserStatus = async (id, status) => {
    try {
      await adminService.verifyUser(id); // Using verifyUser for activation/status
      showToast('User status updated');
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
    handleUserStatus,
    handleUpdateCoins
  };
};

export default useUsers;
