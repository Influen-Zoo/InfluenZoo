import React from 'react';
import { CheckCircle, Ban, Coins } from 'lucide-react';
import LiquidButton from '../common/LiquidButton/LiquidButton';

const UserTable = ({ filteredUsers, handleUserStatus, setCoinEditModal }) => {
  return (
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
          {filteredUsers.length === 0 && (
            <tr><td colSpan="4" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>No users found matching filters</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default UserTable;
