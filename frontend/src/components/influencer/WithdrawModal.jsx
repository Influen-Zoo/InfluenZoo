import React, { useState } from 'react';
import LiquidButton from '../common/LiquidButton/LiquidButton';

export default function WithdrawModal({ show, onClose, walletBalance, onWithdraw }) {
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [method, setMethod] = useState('upi'); // upi, bank, paypal, other

  // Method specific states
  const [upiId, setUpiId] = useState('');
  const [bankDetails, setBankDetails] = useState({
    accountHolder: '',
    bankName: '',
    accountNumber: '',
    ifsc: ''
  });
  const [paypalEmail, setPaypalEmail] = useState('');
  const [otherDetails, setOtherDetails] = useState('');

  if (!show) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    let finalDetails = '';
    if (method === 'upi') {
      finalDetails = `UPI: ${upiId}`;
    } else if (method === 'bank') {
      finalDetails = `BANK: ${bankDetails.bankName} | A/C: ${bankDetails.accountNumber} | Holder: ${bankDetails.accountHolder} | IFSC: ${bankDetails.ifsc}`;
    } else if (method === 'paypal') {
      finalDetails = `PAYPAL: ${paypalEmail}`;
    } else {
      finalDetails = `OTHER: ${otherDetails}`;
    }

    await onWithdraw(amount, finalDetails);
    setLoading(false);
    
    // Reset fields
    setAmount('');
    setUpiId('');
    setBankDetails({ accountHolder: '', bankName: '', accountNumber: '', ifsc: '' });
    setPaypalEmail('');
    setOtherDetails('');
    onClose();
  };

  const handleMax = () => setAmount(walletBalance.toString());

  const methodTabs = [
    { id: 'upi', label: 'UPI', icon: '⚡' },
    { id: 'bank', label: 'Bank', icon: '🏦' },
    { id: 'paypal', label: 'PayPal', icon: '🅿️' },
    { id: 'other', label: 'Other', icon: '📄' }
  ];

  return (
    <div className="modal-overlay" onClick={onClose} style={{ 
      zIndex: 10001, 
      alignItems: 'center', // Standard center to avoid footer overlap
      paddingBottom: '100px' // Added safe area for bottom nav
    }}>
      <div className="modal" onClick={e => e.stopPropagation()} style={{ 
        maxWidth: 500, 
        width: '95%',
        maxHeight: '75vh', // Slightly shorter to ensure it never touches the nav bar
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 'var(--radius-xl)'
      }}>
        
        <div style={{ padding: '2rem 2rem 1rem', borderBottom: '1px solid var(--border-light)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ margin: 0, fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span>💸</span> Withdraw Funds
            </h2>
            <button className="modal-close" onClick={onClose} style={{ position: 'static' }}>✕</button>
          </div>
        </div>

        <div style={{ overflowY: 'auto', padding: '1.5rem 2rem 2rem', flex: 1 }}>
          
          {/* Balance Display */}
          <div style={{ background: 'var(--surface-alt)', padding: '1rem', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem', textAlign: 'center' }}>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', margin: '0 0 0.5rem 0' }}>Wallet Balance</p>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--accent)' }}>
              {new Intl.NumberFormat('en-IN').format(walletBalance)} 🪙
            </div>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            
            {/* Amount Field */}
            <div className="form-group">
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, fontSize: '0.875rem' }}>Amount (Coins)</label>
              <div style={{ position: 'relative' }}>
                <input 
                  type="number" 
                  className="input"
                  value={amount} 
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Min 500"
                  required
                  min="500"
                  max={walletBalance}
                  style={{ paddingRight: '70px' }}
                />
                <button 
                  type="button" 
                  onClick={handleMax}
                  style={{ 
                    position: 'absolute', 
                    right: '10px', 
                    top: '50%', 
                    transform: 'translateY(-50%)',
                    background: 'var(--surface-alt)',
                    border: '1px solid var(--border)',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  MAX
                </button>
              </div>
            </div>

            {/* Method Selection */}
            <div>
              <label style={{ display: 'block', marginBottom: '0.75rem', fontWeight: 600, fontSize: '0.875rem' }}>Transfer Method</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem' }}>
                {methodTabs.map(tab => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setMethod(tab.id)}
                    style={{
                      padding: '0.75rem 0.25rem',
                      borderRadius: '12px',
                      border: '1px solid',
                      borderColor: method === tab.id ? 'var(--accent)' : 'var(--border)',
                      background: method === tab.id ? 'rgba(var(--accent-rgb), 0.1)' : 'var(--surface)',
                      color: method === tab.id ? 'var(--accent)' : 'var(--text-secondary)',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '0.25rem',
                      cursor: 'pointer',
                      fontSize: '0.7rem',
                      fontWeight: 600,
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <span>{tab.icon}</span>
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Dynamic Fields */}
            <div style={{ background: 'var(--surface-alt)', padding: '1.25rem', borderRadius: '16px', border: '1px dashed var(--border)' }}>
              {method === 'upi' && (
                <div className="form-group">
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, fontSize: '0.8125rem' }}>UPI ID</label>
                  <input 
                    className="input"
                    value={upiId}
                    onChange={e => setUpiId(e.target.value)}
                    placeholder="e.g. username@okaxis"
                    required
                  />
                </div>
              )}

              {method === 'bank' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div className="form-group">
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, fontSize: '0.8125rem' }}>Account Holder Name</label>
                    <input 
                      className="input"
                      value={bankDetails.accountHolder}
                      onChange={e => setBankDetails({...bankDetails, accountHolder: e.target.value})}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, fontSize: '0.8125rem' }}>Bank Name</label>
                    <input 
                      className="input"
                      value={bankDetails.bankName}
                      onChange={e => setBankDetails({...bankDetails, bankName: e.target.value})}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, fontSize: '0.8125rem' }}>Account Number</label>
                    <input 
                      className="input"
                      value={bankDetails.accountNumber}
                      onChange={e => setBankDetails({...bankDetails, accountNumber: e.target.value})}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, fontSize: '0.8125rem' }}>IFSC Code</label>
                    <input 
                      className="input"
                      value={bankDetails.ifsc}
                      onChange={e => setBankDetails({...bankDetails, ifsc: e.target.value})}
                      required
                      placeholder="e.g. SBIN0001234"
                    />
                  </div>
                </div>
              )}

              {method === 'paypal' && (
                <div className="form-group">
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, fontSize: '0.8125rem' }}>PayPal Email</label>
                  <input 
                    type="email"
                    className="input"
                    value={paypalEmail}
                    onChange={e => setPaypalEmail(e.target.value)}
                    placeholder="email@example.com"
                    required
                  />
                </div>
              )}

              {method === 'other' && (
                <div className="form-group">
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, fontSize: '0.8125rem' }}>Manual Transfer Details</label>
                  <textarea 
                    className="input"
                    value={otherDetails}
                    onChange={e => setOtherDetails(e.target.value)}
                    placeholder="Specify payment method and ID (e.g. Payoneer: id@mail.com)"
                    required
                    rows={4}
                  />
                </div>
              )}
            </div>

            <LiquidButton 
              variant="primary" 
              type="submit" 
              disabled={loading || !amount || Number(amount) < 500 || Number(amount) > walletBalance}
              style={{ width: '100%' }}
            >
              {loading ? 'Processing...' : 'Request Withdrawal'}
            </LiquidButton>

          </form>
        </div>
      </div>
    </div>
  );
}
