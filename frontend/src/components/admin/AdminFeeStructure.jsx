import React, { useState, useEffect } from 'react';
import { Box } from '@mui/material';
import LiquidButton from '../common/LiquidButton/LiquidButton';

export default function AdminFeeStructure({ 
  feeStructure = {},
  razorpaySettings = {},
  categories = [],
  onUpdateFees,
  onUpdateRazorpaySettings,
  onUpdateCategories,
  loading = false 
}) {
  const [campaignFee, setCampaignFee] = useState(0);
  const [applicationFee, setApplicationFee] = useState(0);
  const [minInfluencerBalance, setMinInfluencerBalance] = useState(500);
  const [minRechargeAmount, setMinRechargeAmount] = useState(500);
  const [razorpayEnabled, setRazorpayEnabled] = useState(false);
  const [razorpayKeyId, setRazorpayKeyId] = useState('');
  const [razorpayKeySecret, setRazorpayKeySecret] = useState('');
  const [coinRate, setCoinRate] = useState(1);
  const [editMode, setEditMode] = useState(false);
  const [paymentEditMode, setPaymentEditMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savingPayment, setSavingPayment] = useState(false);
  const [categoryText, setCategoryText] = useState('');
  const [savingCategories, setSavingCategories] = useState(false);

  useEffect(() => {
    if (feeStructure) {
      setCampaignFee(feeStructure.campaignFee || 0);
      setApplicationFee(feeStructure.applicationFee || 0);
      setMinInfluencerBalance(feeStructure.minInfluencerBalance !== undefined ? feeStructure.minInfluencerBalance : 500);
      setMinRechargeAmount(feeStructure.minRechargeAmount !== undefined ? feeStructure.minRechargeAmount : 500);
    }
  }, [feeStructure]);

  useEffect(() => {
    if (razorpaySettings) {
      setRazorpayEnabled(Boolean(razorpaySettings.enabled));
      setRazorpayKeyId(razorpaySettings.keyId || '');
      setRazorpayKeySecret('');
      setCoinRate(razorpaySettings.coinRate || 1);
    }
  }, [razorpaySettings]);

  useEffect(() => {
    setCategoryText((categories || []).join(', '));
  }, [categories]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await onUpdateFees({
        campaignFee: Number(campaignFee),
        applicationFee: Number(applicationFee),
        minInfluencerBalance: Number(minInfluencerBalance),
        minRechargeAmount: Number(minRechargeAmount)
      });
      setEditMode(false);
    } catch (error) {
      console.error('Error saving fees:', error);
    } finally {
      setSaving(false);
    }
  };

  const handlePaymentSave = async () => {
    setSavingPayment(true);
    try {
      await onUpdateRazorpaySettings({
        enabled: razorpayEnabled,
        keyId: razorpayKeyId,
        keySecret: razorpayKeySecret,
        coinRate: Number(coinRate)
      });
      setPaymentEditMode(false);
      setRazorpayKeySecret('');
    } catch (error) {
      console.error('Error saving Razorpay settings:', error);
    } finally {
      setSavingPayment(false);
    }
  };

  const handleCategorySave = async () => {
    setSavingCategories(true);
    try {
      const nextCategories = categoryText
        .split(',')
        .map((category) => category.trim())
        .filter(Boolean);
      await onUpdateCategories(nextCategories);
    } catch (error) {
      console.error('Error saving categories:', error);
    } finally {
      setSavingCategories(false);
    }
  };

  return (
    <Box sx={{ animation: 'fadeIn 0.3s ease' }}>
      <div style={{ marginBottom: '2rem' }}>
        <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
          Configure platform fee structure. These fees are charged to different user groups for various actions.
        </p>

        <div className="admin-four-card-grid" style={{ gap: '1.5rem' }}>
          {/* Campaign Fee Card */}
          <div className="chart-card" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0 }}>📢 Campaign Fee</h3>
              {!editMode && (
                <button
                  onClick={() => setEditMode(true)}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '1.25rem',
                    color: 'var(--accent)'
                  }}
                  title="Edit"
                >
                  ✎
                </button>
              )}
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                Fee charged by brands to launch a campaign
              </p>
              <div style={{ 
                fontSize: '2rem', 
                fontWeight: 800, 
                color: 'var(--accent)',
                marginBottom: '1rem'
              }}>
                {Number(campaignFee).toFixed(2)}%
              </div>
              {editMode && (
                <div style={{ position: 'relative', marginBottom: '0.75rem' }}>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.5"
                    className="input"
                    value={campaignFee}
                    onChange={(e) => setCampaignFee(e.target.value)}
                    placeholder="Enter % (e.g. 10 = 10%)"
                    style={{ paddingRight: '2.5rem' }}
                  />
                  <span style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontWeight: 700 }}>%</span>
                </div>
              )}
            </div>

            <div style={{ 
              background: 'var(--surface-alt)',
              padding: '0.75rem',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.75rem',
              color: 'var(--text-muted)'
            }}>
              💡 Platform earns this % of the campaign budget when a campaign is created.
            </div>
          </div>

          {/* Application Fee Card */}
          <div className="chart-card" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0 }}>👥 Application Fee</h3>
              {!editMode && (
                <button
                  onClick={() => setEditMode(true)}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '1.25rem',
                    color: 'var(--accent)'
                  }}
                  title="Edit"
                >
                  ✎
                </button>
              )}
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                Fee charged to influencers when applying to campaigns
              </p>
              <div style={{ 
                fontSize: '2rem', 
                fontWeight: 800, 
                color: 'var(--accent)',
                marginBottom: '1rem'
              }}>
                {Number(applicationFee).toFixed(2)}%
              </div>
              {editMode && (
                <div style={{ position: 'relative', marginBottom: '0.75rem' }}>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.5"
                    className="input"
                    value={applicationFee}
                    onChange={(e) => setApplicationFee(e.target.value)}
                    placeholder="Enter % (e.g. 5 = 5%)"
                    style={{ paddingRight: '2.5rem' }}
                  />
                  <span style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontWeight: 700 }}>%</span>
                </div>
              )}
            </div>

            <div style={{ 
              background: 'var(--surface-alt)',
              padding: '0.75rem',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.75rem',
              color: 'var(--text-muted)'
            }}>
              💡 Platform earns this % of the influencer's proposed price when they apply to a campaign.
            </div>
          </div>


          {/* Min Balance Card */}
          <div className="chart-card" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0 }}>💼 Minimum Balance</h3>
              {!editMode && (
                <button
                  onClick={() => setEditMode(true)}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '1.25rem',
                    color: 'var(--accent)'
                  }}
                  title="Edit"
                >
                  ✎
                </button>
              )}
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                Minimum wallet balance required to apply for campaigns
              </p>
              <div style={{ 
                fontSize: '2rem', 
                fontWeight: 800, 
                color: 'var(--accent)',
                marginBottom: '1rem'
              }}>
                {Number(minInfluencerBalance)}
              </div>
              {editMode && (
                <div style={{ position: 'relative', marginBottom: '0.75rem' }}>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    className="input"
                    value={minInfluencerBalance}
                    onChange={(e) => setMinInfluencerBalance(e.target.value)}
                    placeholder="Enter amount (e.g. 500)"
                    style={{ paddingRight: '2.5rem' }}
                  />
                  <span style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontWeight: 700 }}>🪙</span>
                </div>
              )}
            </div>

            <div style={{ 
              background: 'var(--surface-alt)',
              padding: '0.75rem',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.75rem',
              color: 'var(--text-muted)'
            }}>
              💡 Influencers must maintain this balance to submit applications.
            </div>
          </div>

          {/* Min Recharge Card */}
          <div className="chart-card" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0 }}>💳 Minimum Recharge</h3>
              {!editMode && (
                <button
                  onClick={() => setEditMode(true)}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '1.25rem',
                    color: 'var(--accent)'
                  }}
                  title="Edit"
                >
                  ✎
                </button>
              )}
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                Minimum amount (INR) an influencer can top-up
              </p>
              <div style={{ 
                fontSize: '2rem', 
                fontWeight: 800, 
                color: 'var(--accent)',
                marginBottom: '1rem'
              }}>
                ₹{Number(minRechargeAmount)}
              </div>
              {editMode && (
                <div style={{ position: 'relative', marginBottom: '0.75rem' }}>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    className="input"
                    value={minRechargeAmount}
                    onChange={(e) => setMinRechargeAmount(e.target.value)}
                    placeholder="Enter amount (e.g. 500)"
                    style={{ paddingLeft: '1.5rem' }}
                  />
                  <span style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontWeight: 700 }}>₹</span>
                </div>
              )}
            </div>

            <div style={{ 
              background: 'var(--surface-alt)',
              padding: '0.75rem',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.75rem',
              color: 'var(--text-muted)'
            }}>
              💡 The lowest allowed top-up value in the wallet modal.
            </div>
          </div>
        </div>

        {editMode && (
          <div style={{ 
            marginTop: '2rem',
            padding: '1rem',
            background: 'var(--warning-bg)',
            borderRadius: 'var(--radius-md)',
            borderLeft: '4px solid var(--warning)',
            fontSize: '0.8125rem'
          }}>
            <p style={{ margin: '0 0 1rem 0' }}>
              ⚠️ <strong>Warning:</strong> Changing fee structure will affect all future transactions. 
              Existing campaigns will not be affected.
            </p>

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
              <LiquidButton 
                variant="secondary" 
                onClick={() => {
                  setEditMode(false);
                  setCampaignFee(feeStructure.campaignFee || 0);
                  setApplicationFee(feeStructure.applicationFee || 0);
                  setMinInfluencerBalance(feeStructure.minInfluencerBalance !== undefined ? feeStructure.minInfluencerBalance : 500);
                  setMinRechargeAmount(feeStructure.minRechargeAmount !== undefined ? feeStructure.minRechargeAmount : 500);
                }}
                disabled={saving}
                style={{ minWidth: '120px' }}
              >
                Cancel
              </LiquidButton>
              <LiquidButton 
                variant="primary" 
                onClick={handleSave}
                disabled={saving || loading}
                style={{ minWidth: '160px' }}
              >
                {saving ? '⏳ Saving...' : '💾 Save Changes'}
              </LiquidButton>
            </div>
          </div>
        )}
      </div>

      <div className="chart-card" style={{ padding: '1.5rem', marginTop: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', marginBottom: '1rem' }}>
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: '0 0 0.5rem 0' }}>Platform Categories</h3>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', margin: 0 }}>
              These categories appear in influencer profiles, brand campaign forms, and admin filters.
            </p>
          </div>
        </div>
        <textarea
          className="input"
          value={categoryText}
          onChange={(event) => setCategoryText(event.target.value)}
          placeholder="Beauty, Fitness, Tech, Travel"
          style={{ width: '100%', minHeight: '90px', resize: 'vertical', marginBottom: '1rem' }}
        />
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <LiquidButton
            variant="primary"
            onClick={handleCategorySave}
            disabled={savingCategories || loading}
          >
            {savingCategories ? 'Saving...' : 'Save Categories'}
          </LiquidButton>
        </div>
      </div>

      <div className="chart-card" style={{ padding: '1.5rem', marginTop: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', marginBottom: '1.5rem' }}>
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: '0 0 0.5rem 0' }}>Razorpay Coin Purchases</h3>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', margin: 0 }}>
              Configure Razorpay credentials before users can buy coins from their wallet.
            </p>
          </div>
          {!paymentEditMode && (
            <LiquidButton variant="secondary" onClick={() => setPaymentEditMode(true)}>
              Edit
            </LiquidButton>
          )}
        </div>

        <div className="admin-four-card-grid" style={{ gap: '1rem', marginBottom: paymentEditMode ? '1.5rem' : 0 }}>
          <div style={{ background: 'var(--surface-alt)', borderRadius: 'var(--radius-md)', padding: '1rem' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.5rem' }}>Status</div>
            <div style={{ fontSize: '1.125rem', fontWeight: 800, color: razorpaySettings.enabled ? 'var(--success)' : 'var(--warning)' }}>
              {razorpaySettings.enabled ? 'Enabled' : 'Disabled'}
            </div>
          </div>
          <div style={{ background: 'var(--surface-alt)', borderRadius: 'var(--radius-md)', padding: '1rem' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.5rem' }}>Key ID</div>
            <div style={{ fontSize: '1rem', fontWeight: 700, wordBreak: 'break-word' }}>{razorpaySettings.keyId || 'Not set'}</div>
          </div>
          <div style={{ background: 'var(--surface-alt)', borderRadius: 'var(--radius-md)', padding: '1rem' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.5rem' }}>Secret</div>
            <div style={{ fontSize: '1rem', fontWeight: 700 }}>{razorpaySettings.keySecretConfigured ? 'Configured' : 'Not set'}</div>
          </div>
          <div style={{ background: 'var(--surface-alt)', borderRadius: 'var(--radius-md)', padding: '1rem' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.5rem' }}>Coin Rate</div>
            <div style={{ fontSize: '1rem', fontWeight: 700 }}>1 INR = {Number(razorpaySettings.coinRate || 1)} coins</div>
          </div>
        </div>

        {paymentEditMode && (
          <div style={{ display: 'grid', gap: '1rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontWeight: 700 }}>
              <input
                type="checkbox"
                checked={razorpayEnabled}
                onChange={(e) => setRazorpayEnabled(e.target.checked)}
              />
              Enable Razorpay coin purchases
            </label>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.5rem', display: 'block' }}>Razorpay Key ID</label>
                <input
                  className="input"
                  value={razorpayKeyId}
                  onChange={(e) => setRazorpayKeyId(e.target.value)}
                  placeholder="rzp_live_..."
                />
              </div>
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.5rem', display: 'block' }}>Razorpay Key Secret</label>
                <input
                  className="input"
                  type="password"
                  value={razorpayKeySecret}
                  onChange={(e) => setRazorpayKeySecret(e.target.value)}
                  placeholder={razorpaySettings.keySecretConfigured ? 'Leave blank to keep current secret' : 'Enter key secret'}
                />
              </div>
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.5rem', display: 'block' }}>Coins Per INR</label>
                <input
                  className="input"
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={coinRate}
                  onChange={(e) => setCoinRate(e.target.value)}
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              <LiquidButton
                variant="secondary"
                onClick={() => {
                  setPaymentEditMode(false);
                  setRazorpayEnabled(Boolean(razorpaySettings.enabled));
                  setRazorpayKeyId(razorpaySettings.keyId || '');
                  setRazorpayKeySecret('');
                  setCoinRate(razorpaySettings.coinRate || 1);
                }}
                disabled={savingPayment}
              >
                Cancel
              </LiquidButton>
              <LiquidButton
                variant="primary"
                onClick={handlePaymentSave}
                disabled={savingPayment || loading}
              >
                {savingPayment ? 'Saving...' : 'Save Razorpay Settings'}
              </LiquidButton>
            </div>
          </div>
        )}
      </div>

      {/* Fee History / Info */}
      <div className="chart-card" style={{ padding: '1.5rem', marginTop: '2rem' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem' }}>ℹ️ Fee Guidelines</h3>
        <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', lineHeight: 1.8 }}>
          <p><strong>Campaign Fee %:</strong> Charged as a % of the campaign budget when a brand creates a new campaign.</p>
          <p><strong>Application Fee %:</strong> Charged as a % of the influencer's proposed price when they apply.</p>
          <p><strong>Individual Campaign Fee:</strong> An additional fixed fee (coinCost) set per campaign by the admin, added directly to platform revenue.</p>
          <p><strong>Refunds:</strong> Fees are non-refundable once deducted.</p>
          <p><strong>Revenue Calculation:</strong> <em>Revenue = (Budget × Campaign Fee%) + (Proposed Price × App Fee%) + Coin Cost</em> per campaign.</p>
        </div>
      </div>
    </Box>
  );
}
