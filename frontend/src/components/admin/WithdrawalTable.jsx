import React from 'react';
import LiquidButton from '../common/LiquidButton/LiquidButton';
import { Check, X } from 'lucide-react';

const WithdrawalTable = ({ withdrawals, handleApproveWithdrawal, handleRejectWithdrawal }) => {
  return (
    <div className="table-container" style={{ background: 'none', border: 'none', padding: 0 }}>
      <table className="table">
        <thead>
          <tr><th>User</th><th>Amount</th><th>Method</th><th>Details</th><th>Date</th><th>Status</th><th>Actions</th></tr>
        </thead>
        <tbody>
          {withdrawals.map(w => (
            <tr key={w._id}>
              <td>
                <div style={{ fontWeight: 600 }}>{w.user?.name || 'Unknown User'}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{w.user?.email || '-'}</div>
              </td>
              <td style={{ fontWeight: 800, color: 'var(--success)' }}>₹{Number(w.amount || 0).toLocaleString('en-IN')}</td>
              <td><span className="badge badge-primary">{w.method || 'Bank Transfer'}</span></td>
              <td style={{ maxWidth: '200px', fontSize: '0.8125rem' }}>
                {typeof w.details === 'object' ? JSON.stringify(w.details) : (w.details || w.description || '-')}
              </td>
              <td style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                {new Date(w.createdAt).toLocaleDateString()}
              </td>
              <td>
                <span className={`badge badge-${w.status === 'completed' ? 'success' : w.status === 'pending' ? 'warning' : 'danger'}`}>
                  {w.status.toUpperCase()}
                </span>
              </td>
              <td>
                {w.status === 'pending' && (
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <LiquidButton circular variant="success" onClick={() => handleApproveWithdrawal(w._id)} title="Approve">
                      <Check size={18} />
                    </LiquidButton>
                    <LiquidButton circular variant="error" onClick={() => {
                      const reason = window.prompt('Reason for rejection:');
                      if (reason) handleRejectWithdrawal(w._id, reason);
                    }} title="Reject">
                      <X size={18} />
                    </LiquidButton>
                  </div>
                )}
              </td>
            </tr>
          ))}
          {withdrawals.length === 0 && (
            <tr><td colSpan="7" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>No withdrawals found matching filters</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default WithdrawalTable;
