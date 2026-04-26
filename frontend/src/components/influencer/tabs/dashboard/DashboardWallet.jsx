import React, { useState } from 'react';
import LiquidButton from '../../../common/LiquidButton/LiquidButton';
import { getItemId } from '../../../../utils/helpers';
import WithdrawModal from '../../WithdrawModal';
import { getTransactionDecoration, formatCurrency } from '../../../../features/common/walletProcessor';

export default function DashboardWallet({ user, setShowTopUp, walletTransactions, coinBalance, onWithdraw }) {
  const [showWithdraw, setShowWithdraw] = useState(false);

  // Use coinBalance (from API) as the source of truth, fall back to user context only if necessary
  const displayBalance = coinBalance !== undefined ? coinBalance : (user?.coins || 0);

  return (
    <div className="dashboard-wallet-container" style={{ animation: 'fadeIn 0.3s ease' }}>
      
      {/* Single Balance Container */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '2rem' }}>
        
        {/* Unified Coins Card */}
        <div className="dash-section glass-panel" style={{ padding: '2.5rem', textAlign: 'center', maxWidth: 400, width: '100%', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: -50, right: -50, width: 150, height: 150, background: 'var(--accent)', filter: 'blur(60px)', opacity: 0.15 }} />
          <h3 style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Wallet Balance</h3>
          <div style={{ fontSize: '3.5rem', fontWeight: '900', marginBottom: '0.5rem', color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
            {formatCurrency(displayBalance)} <span style={{ color: 'var(--accent)', fontSize: '2.5rem' }}>🪙</span>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.8125rem', marginBottom: '2rem', marginTop: '1rem', lineHeight: 1.5 }}>Used for applying to campaigns and withdrawable as real money.</p>
          
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <LiquidButton variant="primary" onClick={() => setShowTopUp(true)}>Top Up</LiquidButton>
            <LiquidButton variant="outline" onClick={() => setShowWithdraw(true)}>Withdraw</LiquidButton>
          </div>
        </div>

      </div>

      <WithdrawModal 
        show={showWithdraw} 
        onClose={() => setShowWithdraw(false)} 
        walletBalance={displayBalance}
        onWithdraw={onWithdraw}
      />

      <div>
        <h3 style={{ marginBottom: '1rem' }}>Transaction History</h3>
        {walletTransactions.length === 0 ? (
          <div className="empty-state">
              <div style={{ fontSize: 48, opacity: 0.5, marginBottom: '1rem' }}>💸</div>
              <p>No transactions yet</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {walletTransactions.map((t, index) => {
              const { symbol, color, sign } = getTransactionDecoration(t);
              
              return (
                <div key={getItemId(t) || `transaction-${index}`} className="glass-panel" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.25rem', borderRadius: 'var(--radius-lg)', borderLeft: `4px solid ${color} !important`, background: 'rgba(255, 255, 255, 0.03)' }}>
                  <div>
                    <h4 style={{ fontSize: '0.9375rem', fontWeight: 700, marginBottom: '0.25rem', color: 'var(--text-primary)' }}>{t.description}</h4>
                    <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 500 }}>{new Date(t.createdAt).toLocaleDateString()}</span>
                      <span className="glass-indicator" style={{ fontSize: '0.65rem', padding: '2px 8px', fontWeight: 800, textTransform: 'uppercase', color: t.status === 'pending' ? 'var(--warning)' : 'var(--success)', background: t.status === 'pending' ? 'rgba(245, 158, 11, 0.1)' : 'rgba(34, 197, 94, 0.1)' }}>
                        {t.status}
                      </span>
                    </div>
                  </div>
                  <div style={{ fontWeight: 800, color, fontSize: '1.125rem' }}>
                    {sign}{Math.abs(t.amount)} {symbol}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
