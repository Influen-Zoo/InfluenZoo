import React from 'react';
import useCategories from '../../hooks/useCategories';

const CampaignFilters = ({ campaignFilter, setCampaignFilter }) => {
  const { categories } = useCategories();

  return (
    <div className="admin-section-filters" style={{ background: 'var(--surface-alt)', padding: '1.25rem', borderRadius: '16px', marginBottom: '1.5rem', display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'flex-end' }}>
      <div style={{ flex: '1 1 200px' }}>
        <label style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.5rem', display: 'block' }}>Search Campaigns</label>
        <input 
          className="input" 
          placeholder="Search by title or brand..." 
          value={campaignFilter.search}
          onChange={e => setCampaignFilter({ ...campaignFilter, search: e.target.value })}
        />
      </div>
      <div style={{ minWidth: '180px' }}>
        <label style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.5rem', display: 'block' }}>Category</label>
        <select 
          className="select"
          value={campaignFilter.category}
          onChange={e => setCampaignFilter({ ...campaignFilter, category: e.target.value })}
        >
          <option value="">All Categories</option>
          {categories.map((category) => (
            <option key={category} value={category}>{category}</option>
          ))}
        </select>
      </div>
      <div style={{ minWidth: '180px' }}>
        <label style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.5rem', display: 'block' }}>Status</label>
        <select 
          className="select"
          value={campaignFilter.status}
          onChange={e => setCampaignFilter({ ...campaignFilter, status: e.target.value })}
        >
          <option value="">All Status</option>
          <option value="pending">Pending Approval</option>
          <option value="active">Active</option>
          <option value="rejected">Rejected</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>
    </div>
  );
};

export default CampaignFilters;
