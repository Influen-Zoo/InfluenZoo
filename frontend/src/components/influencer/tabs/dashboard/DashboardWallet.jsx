import React, { useEffect, useMemo, useState } from 'react';
import LiquidButton from '../../../common/LiquidButton/LiquidButton';
import { getItemId } from '../../../../utils/helpers';
import WithdrawModal from '../../WithdrawModal';
import { getTransactionDecoration, formatCurrency } from '../../../../features/common/walletProcessor';
import walletService from '../../../../services/wallet.service';

export default function DashboardWallet({ user, setShowTopUp, walletTransactions, coinBalance, onWithdraw }) {
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [referralSummary, setReferralSummary] = useState(null);
  const [copied, setCopied] = useState(false);
  const [shared, setShared] = useState(false);

  // Use coinBalance (from API) as the source of truth, fall back to user context only if necessary
  const displayBalance = coinBalance !== undefined ? coinBalance : (user?.coins || 0);
  const referralLink = useMemo(() => {
    const code = referralSummary?.referralCode;
    if (!code) return '';
    return `${window.location.origin}/auth?mode=signup&ref=${code}`;
  }, [referralSummary?.referralCode]);

  useEffect(() => {
    let active = true;
    walletService.getReferralSummary()
      .then((data) => {
        if (active) setReferralSummary(data);
      })
      .catch(() => {
        if (active) setReferralSummary(null);
      });

    return () => {
      active = false;
    };
  }, []);

  const copyReferralLink = async () => {
    if (!referralLink) return;
    try {
      await navigator.clipboard.writeText(referralLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  };

  const shareReferralLink = async () => {
    if (!referralLink) return;
    const shareData = {
      title: 'Join InfluenZoo',
      text: `Use my referral code ${referralSummary?.referralCode} on InfluenZoo.`,
      url: referralLink,
    };

    try {
      if (navigator.share && navigator.canShare?.(shareData)) {
        await navigator.share(shareData);
        setShared(true);
      } else {
        await navigator.clipboard.writeText(referralLink);
        setShared(true);
      }
      setTimeout(() => setShared(false), 1600);
    } catch {
      setShared(false);
    }
  };

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

      <div className="glass-panel" style={{ marginTop: '2rem', padding: '1.5rem', borderRadius: 'var(--radius-lg)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
          <div>
            <h3 style={{ margin: '0 0 0.35rem' }}>Referral Program</h3>
            <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '0.8125rem' }}>
              Invite brands or influencers and earn rewards after completed referral payments.
            </p>
          </div>
          <span className="badge badge-accent" style={{ alignSelf: 'flex-start' }}>
            Code: {referralSummary?.referralCode || 'Loading...'}
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
          <div style={{ background: 'var(--surface-alt)', borderRadius: 'var(--radius-md)', padding: '1rem' }}>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 800 }}>Completed</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 900 }}>{referralSummary?.stats?.completedReferrals || 0}</div>
          </div>
          <div style={{ background: 'var(--surface-alt)', borderRadius: 'var(--radius-md)', padding: '1rem' }}>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 800 }}>Required</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 900 }}>{referralSummary?.settings?.requiredCompletedReferrals || 10}</div>
          </div>
          <div style={{ background: 'var(--surface-alt)', borderRadius: 'var(--radius-md)', padding: '1rem' }}>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 800 }}>Reward</div>
            <div style={{ fontSize: '1.1rem', fontWeight: 900 }}>
              {referralSummary?.settings?.referrerRewardMode === 'fixed'
                ? `${referralSummary?.settings?.referrerRewardValue || 0} coins`
                : `${referralSummary?.settings?.referrerRewardValue || 5}%`}
            </div>
          </div>
          <div style={{ background: 'var(--surface-alt)', borderRadius: 'var(--radius-md)', padding: '1rem' }}>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 800 }}>Friend Gets</div>
            <div style={{ fontSize: '1.1rem', fontWeight: 900 }}>{referralSummary?.settings?.referredRewardCoins || 200} coins</div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <input
            className="input"
            readOnly
            value={referralLink}
            placeholder="Referral link loading..."
            style={{ flex: '1 1 260px' }}
          />
          <LiquidButton variant="secondary" onClick={copyReferralLink} disabled={!referralLink}>
            {copied ? 'Copied' : 'Copy Link'}
          </LiquidButton>
          <LiquidButton variant="primary" onClick={shareReferralLink} disabled={!referralLink}>
            {shared ? 'Shared' : 'Share Link'}
          </LiquidButton>
        </div>

        {referralSummary?.referrals?.length > 0 && (
          <div style={{ marginTop: '1rem', display: 'grid', gap: '0.6rem' }}>
            {referralSummary.referrals.slice(0, 5).map((item) => (
              <div key={item._id} style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                <span>{item.name} · {item.role}</span>
                <span className={`badge ${item.completed ? 'badge-success' : 'badge-warning'}`}>{item.completed ? 'completed' : 'pending'}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
