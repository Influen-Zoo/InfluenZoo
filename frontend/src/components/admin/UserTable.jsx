import React from 'react';
import { Ban, CheckCircle, Coins, Users, Award } from 'lucide-react';
import LiquidButton from '../common/LiquidButton/LiquidButton';
import UserBadge from '../common/UserBadge/UserBadge';

const getCount = (value) => Array.isArray(value) ? value.length : (Number(value) || 0);

const UserTable = ({ filteredUsers, handleUserStatus, setCoinEditModal, setFollowerEditModal, setBadgeModal }) => {
  return (
    <div className="table-container">
      <table className="table">
        <thead>
          <tr><th>User</th><th>Role</th><th>Followers</th><th>Referrals</th><th>Status</th><th>Moderation</th><th>Growth</th></tr>
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
                    <div style={{ fontWeight: 600, fontSize: '0.8125rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      {u.name}
                      <div className="user-badges-list" style={{ display: 'flex', gap: '2px' }}>
                        {u.badges?.map(badge => (
                          <UserBadge key={badge._id} badge={badge} />
                        ))}
                      </div>
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{u.email}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{u.phone || 'No phone number'}</div>
                  </div>
                </div>
              </td>
              <td><span className={`badge ${u.role === 'influencer' ? 'badge-accent' : u.role === 'brand' ? 'badge-primary' : 'badge-warning'}`}>{u.role}</span></td>
              <td>{getCount(u.followers).toLocaleString('en-IN')}</td>
              <td>
                <span className="badge badge-accent">
                  {Number(u.completedReferralsCount || 0).toLocaleString('en-IN')} / {Number(u.referralsCount || 0).toLocaleString('en-IN')}
                </span>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                  paid / total
                </div>
              </td>
              <td><span className={`badge ${u.status === 'active' ? 'badge-success' : u.status === 'banned' ? 'badge-danger' : u.status === 'inactive' ? 'badge-paid' : 'badge-warning'}`}>{u.status}</span></td>
              <td>
                <div style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap' }}>
                  {u.status !== 'banned' && u.role !== 'admin' && (
                    <LiquidButton circular variant="error" onClick={() => handleUserStatus(u._id, 'banned')} title="Block User">
                      <Ban size={20} />
                    </LiquidButton>
                  )}
                  {u.status === 'banned' && u.role !== 'admin' && (
                    <LiquidButton circular variant="success" onClick={() => handleUserStatus(u._id, 'active')} title="Unblock User">
                      <CheckCircle size={20} />
                    </LiquidButton>
                  )}
                  {u.role === 'influencer' && (
                    <LiquidButton circular variant="secondary" title="Manage Coins" onClick={() => setCoinEditModal({ userId: u._id, name: u.name, currentCoins: Number(u.coins) || 0, amount: 100, action: 'credit', reason: '' })}>
                      <Coins size={20} />
                    </LiquidButton>
                  )}
                  {u.role !== 'admin' && (
                    <LiquidButton circular variant="accent" title="Manage Badges" onClick={() => setBadgeModal(u)}>
                      <Award size={20} />
                    </LiquidButton>
                  )}
                </div>
              </td>
              <td>
                  {u.role !== 'admin' && (
                    <LiquidButton
                      variant="primary"
                      title="Add Followers"
                      onClick={() => setFollowerEditModal({ userId: u._id, name: u.name, currentFollowers: getCount(u.followers) })}
                      style={{ whiteSpace: 'nowrap', padding: '0.45rem 0.85rem', fontSize: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
                    >
                      <Users size={20} />
                      Add Followers
                    </LiquidButton>
                  )}
              </td>
            </tr>
          ))}
          {filteredUsers.length === 0 && (
            <tr><td colSpan="7" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>No users found matching filters</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default UserTable;
