import React from 'react';

const WithdrawalFilters = ({ searchTerm, setSearchTerm, statusFilter, setStatusFilter, filters, setFilters }) => {
  return (
    <div className="admin-section-filters" style={{ marginBottom: '1.5rem', display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'flex-end', background: 'var(--surface-alt)', padding: '1.25rem', borderRadius: '16px' }}>
      <div style={{ flex: '1 1 200px' }}>
        <label style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.5rem', display: 'block' }}>Search User</label>
        <input 
          className="input" 
          placeholder="Search name or email..." 
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
      </div>
      <div style={{ minWidth: '150px' }}>
        <label style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.5rem', display: 'block' }}>Status</label>
        <select className="select" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="completed">Approved</option>
          <option value="failed">Rejected</option>
        </select>
      </div>
      <div style={{ minWidth: '150px' }}>
        <label style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.5rem', display: 'block' }}>From Date</label>
        <input 
          type="date" 
          className="input" 
          value={filters.fromDate}
          onChange={e => setFilters({...filters, fromDate: e.target.value})}
        />
      </div>
      <div style={{ minWidth: '150px' }}>
        <label style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.5rem', display: 'block' }}>To Date</label>
        <input 
          type="date" 
          className="input" 
          value={filters.toDate}
          onChange={e => setFilters({...filters, toDate: e.target.value})}
        />
      </div>
    </div>
  );
};

export default WithdrawalFilters;
