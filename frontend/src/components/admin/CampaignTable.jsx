import React from 'react';
import { Check, Ban, X } from 'lucide-react';
import LiquidButton from '../common/LiquidButton/LiquidButton';

const getStatusClass = (status, isBlocked) => {
  if (isBlocked) return 'badge-danger';
  if (status === 'active') return 'badge-success';
  if (status === 'pending') return 'badge-warning';
  if (status === 'rejected') return 'badge-danger';
  return 'badge-paid';
};

const CampaignTable = ({
  campaigns,
  handleCampaignClick,
  setCampaignCostModal,
  handleUnblockCampaign,
  handleCampaignStatus,
  setBlockingCampaign
}) => {
  const truncate = (text, length = 30) => {
    if (!text) return '-';
    return text.length > length ? text.substring(0, length) + '...' : text;
  };

  const formatDate = (date) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: '2-digit'
    });
  };

  return (
    <div style={{ overflowX: 'auto', marginTop: '1.5rem' }}>
      <table className="table" style={{ width: '100%', minWidth: '900px' }}>
        <thead>
          <tr>
            <th style={{ minWidth: '120px' }}>Brand</th>
            <th style={{ minWidth: '140px' }}>Title</th>
            <th style={{ minWidth: '140px' }}>Content</th>
            <th style={{ minWidth: '100px' }}>Category</th>
            <th style={{ minWidth: '80px' }}>Date</th>
            <th style={{ minWidth: '70px' }}>Fee</th>
            <th style={{ minWidth: '90px' }}>Status</th>
            <th style={{ minWidth: '140px' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {campaigns.map(campaign => {
            const isBlocked = campaign.blocked;
            const status = campaign.status || 'pending';

            return (
              <tr
                key={campaign._id}
                style={{ opacity: isBlocked ? 0.6 : 1, cursor: 'pointer' }}
                onClick={() => handleCampaignClick(campaign)}
              >
                <td title={campaign.author?.name || campaign.brandName || '-'}>
                  <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>
                    {truncate(campaign.author?.name || campaign.brandName || '-', 15)}
                  </span>
                </td>
                <td title={campaign.title}>
                  <span style={{ fontSize: '0.875rem' }}>
                    {truncate(campaign.title, 18)}
                  </span>
                </td>
                <td title={campaign.description || campaign.content}>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.8125rem' }}>
                    {truncate(campaign.description || campaign.content, 20)}
                  </span>
                </td>
                <td>
                  <span className="badge badge-primary" style={{ fontSize: '0.75rem' }}>
                    {truncate(campaign.category || 'General', 10)}
                  </span>
                </td>
                <td>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {formatDate(campaign.createdAt)}
                  </span>
                </td>
                <td>
                  <span
                    className="badge badge-accent"
                    style={{ cursor: 'pointer', fontWeight: 600, fontSize: '0.75rem' }}
                    onClick={(e) => {
                      e.stopPropagation();
                      setCampaignCostModal({
                        id: campaign._id,
                        title: campaign.title || 'Campaign',
                        type: 'campaign',
                        cost: Number(campaign.coinCost) || 0
                      });
                    }}
                    title="Click to edit fee"
                  >
                    {Number(campaign.coinCost || 0).toLocaleString('en-IN')} Edit
                  </span>
                </td>
                <td>
                  <span className={`badge ${getStatusClass(status, isBlocked)}`} style={{ fontSize: '0.75rem' }}>
                    {isBlocked ? 'Blocked' : status}
                  </span>
                </td>
                <td style={{ display: 'flex', gap: '0.4rem' }}>
                  {status === 'pending' && !isBlocked && (
                    <>
                      <LiquidButton
                        circular
                        variant="success"
                        onClick={(e) => { e.stopPropagation(); handleCampaignStatus(campaign._id, 'active'); }}
                        title="Approve campaign"
                      >
                        <Check size={18} />
                      </LiquidButton>
                      <LiquidButton
                        circular
                        variant="error"
                        onClick={(e) => { e.stopPropagation(); handleCampaignStatus(campaign._id, 'rejected'); }}
                        title="Reject campaign"
                      >
                        <X size={18} />
                      </LiquidButton>
                    </>
                  )}
                  {isBlocked ? (
                    <LiquidButton
                      circular
                      variant="success"
                      onClick={(e) => { e.stopPropagation(); handleUnblockCampaign(campaign._id); }}
                      title="Unblock campaign"
                    >
                      <Check size={18} />
                    </LiquidButton>
                  ) : (
                    <LiquidButton
                      circular
                      variant="error"
                      onClick={(e) => {
                        e.stopPropagation();
                        setBlockingCampaign(campaign);
                      }}
                      title="Block campaign"
                    >
                      <Ban size={18} />
                    </LiquidButton>
                  )}
                </td>
              </tr>
            );
          })}
          {campaigns.length === 0 && (
            <tr><td colSpan="8" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>No campaigns found</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default CampaignTable;
