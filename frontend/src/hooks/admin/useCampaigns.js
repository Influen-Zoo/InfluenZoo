import { useState, useMemo, useEffect } from 'react';
import useAdminDashboard from './useAdminDashboard';
import adminService from '../../services/admin.service';
import { filterAdminCampaigns, getAdminCampaignStats } from '../../features/admin/adminProcessor';

export const useCampaigns = () => {
  const { 
    campaigns, stats, loading, toast, showToast, withdrawals, posts, setCampaigns
  } = useAdminDashboard();

  const [campaignFilter, setCampaignFilter] = useState({ search: '', category: '', status: '' });
  const [campaignCostModal, setCampaignCostModal] = useState(null);
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [applications, setApplications] = useState([]);
  const [appsLoading, setAppsLoading] = useState(false);
  const [blockReason, setBlockReason] = useState('Not meeting community standards');
  const [blockingCampaign, setBlockingCampaign] = useState(null);

  const filteredCampaigns = useMemo(() => filterAdminCampaigns(campaigns, campaignFilter), [campaigns, campaignFilter]);
  const statsData = useMemo(() => getAdminCampaignStats(campaigns), [campaigns]);

  const fetchApplications = async (campaignId) => {
    try {
      setAppsLoading(true);
      const res = await adminService.getAdminCampaignApplications(campaignId);
      const data = Array.isArray(res) ? res : (res?.data || []);
      setApplications(data);
    } catch (err) {
      console.error('Error fetching applications:', err);
    } finally {
      setAppsLoading(false);
    }
  };

  const handleCampaignClick = (campaign) => {
    setSelectedCampaign(campaign);
    fetchApplications(campaign._id);
  };

  const handleBlockCampaign = async () => {
    if (!blockingCampaign) return;
    try {
      await adminService.blockCampaign(blockingCampaign._id, blockReason);
      setBlockingCampaign(null);
      const updated = await adminService.getCampaigns();
      setCampaigns(updated);
      showToast('Campaign blocked successfully');
    } catch (error) {
      showToast('Failed to block campaign: ' + error.message, 'danger');
    }
  };

  const handleUnblockCampaign = async (campaignId) => {
    try {
      await adminService.unblockCampaign(campaignId);
      const updated = await adminService.getCampaigns();
      setCampaigns(updated);
      showToast('Campaign unblocked successfully');
    } catch (error) {
      showToast('Failed to unblock campaign', 'danger');
    }
  };

  const handleUpdateCoinCost = async (e) => {
    e.preventDefault();
    if (!campaignCostModal) return;
    const formData = new FormData(e.target);
    const cost = Number(formData.get('cost'));

    try {
      if (campaignCostModal.type === 'campaign') {
        await adminService.updateCampaignCost(campaignCostModal.id, cost);
        showToast('Campaign fee updated!');
      } else {
        await adminService.updateAnnouncementCoinCost(campaignCostModal.id, cost);
        showToast('Announcement fee updated!');
      }
      setCampaignCostModal(null);
      const updated = await adminService.getCampaigns();
      setCampaigns(updated);
    } catch (e) {
      showToast(e.message, 'danger');
    }
  };

  return {
    campaigns,
    filteredCampaigns,
    stats,
    loading,
    toast,
    withdrawals,
    posts,
    campaignFilter,
    setCampaignFilter,
    campaignCostModal,
    setCampaignCostModal,
    selectedCampaign,
    setSelectedCampaign,
    applications,
    appsLoading,
    handleCampaignClick,
    handleBlockCampaign,
    handleUnblockCampaign,
    handleUpdateCoinCost,
    blockingCampaign,
    setBlockingCampaign,
    blockReason,
    setBlockReason,
    statsData
  };
};

export default useCampaigns;
