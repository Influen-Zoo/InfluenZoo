import { useEffect, useState } from 'react';
import walletService from '../../services/wallet.service';
import LiquidButton from '../common/LiquidButton/LiquidButton';

const DEFAULT_CHECKOUT_LOGO = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="96" height="96" viewBox="0 0 96 96"%3E%3Crect width="96" height="96" rx="20" fill="%230ea5a0"/%3E%3Ctext x="48" y="58" text-anchor="middle" font-size="42" font-family="Arial,sans-serif" font-weight="700" fill="white"%3EI%3C/text%3E%3C/svg%3E';

const getCheckoutLogo = () => {
  const configuredLogo = import.meta.env.VITE_RAZORPAY_LOGO_URL;
  if (configuredLogo && /^https:\/\//i.test(configuredLogo) && !/localhost|127\.0\.0\.1|0\.0\.0\.0/i.test(configuredLogo)) {
    return configuredLogo;
  }
  return DEFAULT_CHECKOUT_LOGO;
};

const loadRazorpayCheckout = () => new Promise((resolve, reject) => {
  if (window.Razorpay) {
    resolve(true);
    return;
  }

  const existingScript = document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]');
  if (existingScript) {
    existingScript.addEventListener('load', () => resolve(true), { once: true });
    existingScript.addEventListener('error', () => reject(new Error('Unable to load Razorpay Checkout')), { once: true });
    return;
  }

  const script = document.createElement('script');
  script.src = 'https://checkout.razorpay.com/v1/checkout.js';
  script.async = true;
  script.onload = () => resolve(true);
  script.onerror = () => reject(new Error('Unable to load Razorpay Checkout'));
  document.body.appendChild(script);
});

export default function TopUpModal({
  showTopUp,
  setShowTopUp,
  onPaymentSuccess,
  user
}) {
  const [topUpAmount, setTopUpAmount] = useState('100');
  const [paymentConfig, setPaymentConfig] = useState(null);
  const [loadingConfig, setLoadingConfig] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!showTopUp) return;

    const loadConfig = async () => {
      setLoadingConfig(true);
      setError('');
      try {
        const config = await walletService.getPaymentConfig();
        setPaymentConfig(config);
      } catch (e) {
        setError(e.response?.data?.error || e.message || 'Unable to load payment settings');
      } finally {
        setLoadingConfig(false);
      }
    };

    loadConfig();
  }, [showTopUp]);

  if (!showTopUp) return null;

  const coinsPreview = Math.floor((Number(topUpAmount) || 0) * Number(paymentConfig?.coinRate || 1));

  const handleBuyCoins = async () => {
    const amount = Number(topUpAmount);
    if (!Number.isFinite(amount) || amount < 1) {
      setError('Enter a valid rupee amount');
      return;
    }

    setProcessing(true);
    setError('');

    try {
      const config = paymentConfig || await walletService.getPaymentConfig();
      if (!config?.enabled || !config?.keyId) {
        throw new Error('Coin purchases are not enabled yet');
      }

      await loadRazorpayCheckout();
      const order = await walletService.createCoinOrder(amount);

      const checkout = new window.Razorpay({
        key: order.keyId,
        amount: order.amount,
        currency: order.currency,
        name: 'influenZoo',
        image: getCheckoutLogo(),
        description: `${order.coins} coins`,
        order_id: order.orderId,
        prefill: {
          name: user?.name || '',
          email: user?.email || ''
        },
        handler: async (response) => {
          try {
            await walletService.verifyPayment(response);
            await onPaymentSuccess?.(order.coins);
            setShowTopUp(false);
          } catch (e) {
            setError(e.response?.data?.error || e.message || 'Payment verification failed');
          } finally {
            setProcessing(false);
          }
        },
        modal: {
          ondismiss: () => setProcessing(false)
        },
        theme: {
          color: '#0ea5a0'
        }
      });

      checkout.open();
    } catch (e) {
      setError(e.response?.data?.error || e.message || 'Unable to start payment');
      setProcessing(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={() => !processing && setShowTopUp(false)}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={() => !processing && setShowTopUp(false)}>x</button>
        <h3 style={{ marginBottom: '1.5rem' }}>Top Up Wallet</h3>

        {loadingConfig ? (
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>Loading payment settings...</p>
        ) : (
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
            Exchange Rate: INR 1 = {Number(paymentConfig?.coinRate || 1)} coins
          </p>
        )}

        {!paymentConfig?.enabled && !loadingConfig && (
          <div style={{ background: 'var(--warning-bg)', color: 'var(--warning)', padding: '0.75rem', borderRadius: 'var(--radius-md)', marginBottom: '1rem', fontSize: '0.8125rem' }}>
            Coin purchases are not enabled by admin yet.
          </div>
        )}

        <div className="input-group" style={{ marginBottom: '1rem' }}>
          <label>Amount (in Rupees)</label>
          <input
            type="number"
            className="input"
            min="1"
            placeholder="100"
            value={topUpAmount}
            onChange={e => setTopUpAmount(e.target.value)}
            disabled={processing}
          />
        </div>

        <div style={{ background: 'var(--surface-alt)', padding: '0.75rem', borderRadius: 'var(--radius-md)', marginBottom: '1rem', fontSize: '0.875rem', fontWeight: 700 }}>
          You will receive {coinsPreview} coins
        </div>

        {error && (
          <div style={{ background: 'var(--danger-bg)', color: 'var(--danger)', padding: '0.75rem', borderRadius: 'var(--radius-md)', marginBottom: '1rem', fontSize: '0.8125rem' }}>
            {error}
          </div>
        )}

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <LiquidButton variant="secondary" onClick={() => setShowTopUp(false)} disabled={processing} style={{ flex: 1 }}>Cancel</LiquidButton>
          <LiquidButton
            variant="primary"
            onClick={handleBuyCoins}
            disabled={processing || loadingConfig || !paymentConfig?.enabled}
            style={{ flex: 1 }}
          >
            {processing ? 'Processing...' : 'Buy Coins'}
          </LiquidButton>
        </div>
      </div>
    </div>
  );
}
