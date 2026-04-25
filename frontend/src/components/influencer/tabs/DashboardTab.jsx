import React from 'react';
import DashboardAnalytics from './dashboard/DashboardAnalytics';
import DashboardWallet from './dashboard/DashboardWallet';
import DashboardApplications from './dashboard/DashboardApplications';
import { BarChart3, Wallet, Briefcase } from 'lucide-react';
import { SubTabNav } from '../../common/LayoutBlocks';

export default function DashboardTab({
  user,
  setShowTopUp,
  filters,
  setFilters,
  applications,
  walletTransactions,
  coinBalance,
  savedCampaignIds,
  exploreItems,
  onCampaignClick,
  onWithdraw,
  activeSubTab,
  setActiveSubTab
}) {
  const tabs = [
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'wallet', label: 'Wallet', icon: Wallet },
    { id: 'applications', label: 'Applications', icon: Briefcase },
  ];

  return (
    <div className="tab-pane" style={{ animation: 'fadeIn 0.3s ease' }}>
      
      <SubTabNav 
        tabs={tabs} 
        activeTab={activeSubTab} 
        onChange={setActiveSubTab} 
      />

      {/* Tab Content */}
      <div style={{ marginTop: '1.5rem' }}>
        {activeSubTab === 'analytics' && (
          <DashboardAnalytics user={user} />
        )}

        {activeSubTab === 'wallet' && (
          <DashboardWallet 
            user={user} 
            setShowTopUp={setShowTopUp} 
            walletTransactions={walletTransactions} 
            coinBalance={coinBalance}
            onWithdraw={onWithdraw}
          />
        )}

        {activeSubTab === 'applications' && (
          <DashboardApplications 
            filters={filters} 
            setFilters={setFilters} 
            applications={applications} 
            savedCampaignIds={savedCampaignIds}
            exploreItems={exploreItems}
            onCampaignClick={onCampaignClick}
          />
        )}
      </div>

    </div>
  );
}
