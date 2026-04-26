import React from 'react';
import { Sparkles, Globe, UserCheck } from 'lucide-react';
import CampaignCard from '../../common/CampaignCard/CampaignCard';
import BrandCard from '../BrandCard';
import { getItemId } from '../../../utils/helpers';
import { SubTabNav } from '../../common/LayoutBlocks';

export default function ExploreTab({
  categories,
  filters,
  setFilters,
  exploreSubTab,
  setExploreSubTab,
  items,
  appliedCampaignIds,
  savedCampaignIds,
  setApplyModal,
  handleToggleSave,
  handleCardClick,
  handleFollow,
  handleUnfollow,
  followingIds,
  currentUserId,
  onViewProfile
}) {
  const tabs = [
    { id: 'new', icon: Sparkles, label: 'New Brand' },
    { id: 'all', icon: Globe, label: 'All Campaign' },
    { id: 'followed', icon: UserCheck, label: 'Followed Brand' },
  ];

  return (
    <div className="tab-pane" style={{ animation: 'fadeIn 0.3s ease' }}>
      
      <SubTabNav 
        tabs={tabs} 
        activeTab={exploreSubTab} 
        onChange={setExploreSubTab} 
      />

      <div className="filter-bar glass-indicator" style={{ display: 'flex', gap: '0.75rem', padding: '0.75rem', marginBottom: '1.5rem', background: 'rgba(255, 255, 255, 0.05)', border: '1.5px solid rgba(255, 255, 255, 0.1)', borderRadius: 'var(--radius-pill)' }}>
        <select className="input glass-indicator" style={{ width: 'auto', padding: '0.4rem 2rem 0.4rem 0.75rem', fontSize: '0.75rem', borderRadius: 'var(--radius-pill)', background: 'transparent', border: 'none', color: 'var(--text-primary)' }}
          value={filters.category} onChange={e => setFilters({ ...filters, category: e.target.value })}>
          <option value="" style={{ background: 'var(--bg-color)' }}>All Categories</option>
          {categories.map(c => <option key={c} value={c} style={{ background: 'var(--bg-color)' }}>{c}</option>)}
        </select>
        <select className="input glass-indicator" style={{ width: 'auto', padding: '0.4rem 2rem 0.4rem 0.75rem', fontSize: '0.75rem', borderRadius: 'var(--radius-pill)', background: 'transparent', border: 'none', color: 'var(--text-primary)' }}
          value={filters.type} onChange={e => setFilters({ ...filters, type: e.target.value })}>
          <option value="" style={{ background: 'var(--bg-color)' }}>All Types</option>
          <option value="paid" style={{ background: 'var(--bg-color)' }}>Paid</option>
          <option value="product" style={{ background: 'var(--bg-color)' }}>Product Only</option>
          <option value="both" style={{ background: 'var(--bg-color)' }}>Both</option>
        </select>
      </div>

      {items.length === 0 ? (
        <div className="empty-state">
          <div style={{ fontSize: 48, opacity: 0.5, marginBottom: '1rem' }}>🔍</div>
          <p>No results found</p>
        </div>
      ) : (
        <div className={exploreSubTab === 'all' ? 'responsive-feed responsive-stack' : 'responsive-card-grid'}>
          {items.map((item, index) => {
            const itemId = getItemId(item);
            
            if (exploreSubTab === 'new' || exploreSubTab === 'followed') {
              return (
                <BrandCard 
                  key={itemId || `brand-explore-${index}`}
                  brand={item}
                  onFollow={handleFollow}
                  onUnfollow={handleUnfollow}
                  isFollowing={followingIds.includes(itemId)}
                  onClick={() => onViewProfile(itemId)}
                />
              );
            }

            return (
              <CampaignCard
                key={itemId || `campaign-explore-${index}`}
                campaign={item}
                applied={appliedCampaignIds.includes(itemId)}
                saved={savedCampaignIds.includes(itemId)}
                onApply={() => setApplyModal(item)}
                onSave={() => handleToggleSave(item)}
                onClick={() => handleCardClick(item)}
                onViewBrand={onViewProfile}
                currentUserId={currentUserId}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
