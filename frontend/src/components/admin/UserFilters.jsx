import React from 'react';

const UserFilters = ({ userFilter, setUserFilter }) => {
  return (
    <div className="admin-section-filters" style={{ background: 'var(--surface-alt)', padding: '1.25rem', borderRadius: '16px', marginBottom: '1.5rem', display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'flex-end' }}>
      <div style={{ flex: '1 1 200px' }}>
        <label style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.5rem', display: 'block' }}>Search Users</label>
        <input 
          className="input" 
          placeholder="Search name or email..." 
          value={userFilter.search} 
          onChange={e => setUserFilter({ ...userFilter, search: e.target.value })} 
        />
      </div>
      <div style={{ minWidth: '150px' }}>
        <label style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.5rem', display: 'block' }}>Role</label>
        <select 
          className="select"
          value={userFilter.role} 
          onChange={e => setUserFilter({ ...userFilter, role: e.target.value })}
        >
          <option value="">All Roles</option>
          <option value="influencer">Influencer</option>
          <option value="brand">Brand</option>
          <option value="admin">Admin</option>
        </select>
      </div>
      <div style={{ minWidth: '150px' }}>
        <label style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.5rem', display: 'block' }}>Status</label>
        <select 
          className="select"
          value={userFilter.status} 
          onChange={e => setUserFilter({ ...userFilter, status: e.target.value })}
        >
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="pending">Pending</option>
          <option value="banned">Banned</option>
        </select>
      </div>
    </div>
  );
};

export default UserFilters;
