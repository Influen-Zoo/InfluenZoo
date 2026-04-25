import React from 'react';
import { CheckCircle, Ban, Coins, Search } from 'lucide-react';
import { Box } from '@mui/material';
import LiquidButton from '../common/LiquidButton/LiquidButton';
import adminService from '../../services/admin.service';

export default function AdminUsers({ 
  filteredUsers, 
  userFilter, 
  setUserFilter, 
  handleUserStatus, 
  setCoinEditModal,
  stats = {}
}) {
  return (
    <Box sx={{ animation: 'fadeIn 0.3s ease' }}>
      {/* KPI Section */}
      <div className="admin-stats-grid" style={{ marginBottom: '2rem' }}>
        <div className="admin-stat-card">
          <div className="admin-stat-icon" style={{ background: 'var(--primary-bg)', color: 'var(--primary)' }}>👤</div>
          <div className="admin-stat-header" style={{ marginBottom: '4px' }}>
            <span style={{ fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>TOTAL USERS</span>
          </div>
          <div className="admin-stat-value" style={{ fontSize: '1.5rem', fontWeight: 800 }}>{(stats?.totalUsers) || filteredUsers.length}</div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-icon" style={{ background: 'var(--accent-bg)', color: 'var(--accent)' }}>🤳</div>
          <div className="admin-stat-header" style={{ marginBottom: '4px' }}>
            <span style={{ fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>INFLUENCERS</span>
          </div>
          <div className="admin-stat-value" style={{ fontSize: '1.5rem', fontWeight: 800 }}>{(stats?.totalInfluencers || 0)}</div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-icon" style={{ background: 'var(--info-bg)', color: 'var(--info)' }}>🏢</div>
          <div className="admin-stat-header" style={{ marginBottom: '4px' }}>
            <span style={{ fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>BRANDS</span>
          </div>
          <div className="admin-stat-value" style={{ fontSize: '1.5rem', fontWeight: 800 }}>{(stats?.totalBrands || 0)}</div>
        </div>
        <div className="admin-stat-card" style={{ background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.05), transparent)' }}>
          <div className="admin-stat-icon" style={{ background: 'rgba(34, 197, 94, 0.1)', color: 'var(--success)' }}>🛡️</div>
          <div className="admin-stat-header" style={{ marginBottom: '4px' }}>
            <span style={{ fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>VERIFIED</span>
          </div>
          <div className="admin-stat-value" style={{ fontSize: '1.5rem', fontWeight: 800 }}>{(stats?.verifiedUsers || 0)}</div>
        </div>
      </div>

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

      <div className="table-container">
        <table className="table">
          <thead>
            <tr><th>User</th><th>Role</th><th>Status</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {filteredUsers.map(u => (
              <tr key={u._id}>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div className="avatar avatar-sm" style={{ padding: 0, overflow: 'hidden' }}>
                      {u.avatar ? <img src={u.avatar} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : u.name?.[0]}
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.8125rem' }}>{u.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{u.email}</div>
                    </div>
                  </div>
                </td>
                <td><span className={`badge ${u.role === 'influencer' ? 'badge-accent' : u.role === 'brand' ? 'badge-primary' : 'badge-warning'}`}>{u.role}</span></td>
                <td><span className={`badge ${u.status === 'active' ? 'badge-success' : u.status === 'banned' ? 'badge-danger' : u.status === 'inactive' ? 'badge-paid' : 'badge-warning'}`}>{u.status}</span></td>
                <td>
                  <div style={{ display: 'flex', gap: '0.25rem' }}>
                    {u.status !== 'active' && u.role !== 'admin' && (
                      <LiquidButton circular variant="success" onClick={() => handleUserStatus(u.id, 'active')} title="Approve User">
                        <CheckCircle size={20} />
                      </LiquidButton>
                    )}
                    {u.status !== 'banned' && u.role !== 'admin' && (
                      <LiquidButton circular variant="error" onClick={() => handleUserStatus(u.id, 'banned')} title="Ban User">
                        <Ban size={20} />
                      </LiquidButton>
                    )}
                    {u.role === 'influencer' && (
                      <LiquidButton circular variant="secondary" title="Manage Coins" onClick={() => setCoinEditModal({ userId: u._id, name: u.name, currentCoins: Number(u.coins) || 0, amount: 100, action: 'credit', reason: '' })}>
                        <Coins size={20} />
                      </LiquidButton>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Box>
  );
}
