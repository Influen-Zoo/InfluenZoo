import { useState, useEffect } from 'react';
import adminService from '../../services/admin.service';

export const useAdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [posts, setPosts] = useState([]);
  const [disputes, setDisputes] = useState([]);
  const [withdrawals, setWithdrawals] = useState([]);
  const [platformAnalytics, setPlatformAnalytics] = useState(null);
  const [feeStructure, setFeeStructure] = useState({});
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const loadAllData = async () => {
    try {
      setLoading(true);
      const [s, u, c, p, d, a, anns, w, fees] = await Promise.all([
        adminService.getStats().catch(() => ({})),
        adminService.getUsers().catch(() => []),
        adminService.getCampaigns().catch(() => []),
        adminService.getPosts().catch(() => []),
        adminService.getDisputes().catch(() => []),
        adminService.getPlatformAnalytics().catch(() => ({})),
        adminService.getAdminAnnouncements().catch(() => []),
        adminService.getWithdrawals('all').catch(() => []),
        adminService.getFeeStructure().catch(() => ({})),
      ]);
      setStats(s || {});
      setUsers(Array.isArray(u) ? u : []);
      setCampaigns(Array.isArray(c) ? c : []);
      setPosts(Array.isArray(p) ? p : []);
      setDisputes(Array.isArray(d) ? d : []);
      setPlatformAnalytics(a || {});
      setAnnouncements(Array.isArray(anns) ? anns : []);
      setWithdrawals(Array.isArray(w) ? w : []);
      setFeeStructure(fees || {});
    } catch (e) {
      console.error('Error loading admin data:', e);
      showToast('Failed to load dashboard data', 'danger');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  const handleApproveWithdrawal = async (id) => {
    try {
      await adminService.approveWithdrawal(id);
      showToast('Withdrawal approved! ✅');
      loadAllData();
    } catch (e) {
      showToast(e.message, 'danger');
    }
  };

  const handleRejectWithdrawal = async (id, reason) => {
    try {
      await adminService.rejectWithdrawal(id, reason);
      showToast('Withdrawal rejected! ❌');
      loadAllData();
    } catch (e) {
      showToast(e.message, 'danger');
    }
  };

  return {
    stats, users, campaigns, posts, disputes, withdrawals, 
    platformAnalytics, feeStructure, announcements, loading, toast,
    loadAllData, showToast, handleApproveWithdrawal, handleRejectWithdrawal,
    setUsers, setCampaigns, setPosts, setDisputes, setWithdrawals, setStats
  };
};

export default useAdminDashboard;
