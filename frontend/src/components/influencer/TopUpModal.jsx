import LiquidButton from '../common/LiquidButton/LiquidButton';

export default function TopUpModal({
  showTopUp,
  setShowTopUp,
  topUpAmount,
  setTopUpAmount,
  handleTopUp
}) {
  if (!showTopUp) return null;

  return (
    <div className="modal-overlay" onClick={() => setShowTopUp(false)}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={() => setShowTopUp(false)}>✕</button>
        <h3 style={{ marginBottom: '1.5rem' }}>Top Up Wallet</h3>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>Exchange Rate: ₹1 = 1 🪙</p>
        <div className="input-group" style={{ marginBottom: '1.5rem' }}>
          <label>Amount (in Rupees)</label>
          <input type="number" className="input" min="10" placeholder="100" value={topUpAmount} onChange={e => setTopUpAmount(e.target.value)} />
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <LiquidButton variant="secondary" onClick={() => setShowTopUp(false)} style={{ flex: 1 }}>Cancel</LiquidButton>
          <LiquidButton variant="primary" onClick={handleTopUp} style={{ flex: 1 }}>Buy Coins</LiquidButton>
        </div>
      </div>
    </div>
  );
}
