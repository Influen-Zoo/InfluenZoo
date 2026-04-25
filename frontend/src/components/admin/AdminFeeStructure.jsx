import React, { useState, useEffect } from 'react';
import { Box } from '@mui/material';
import LiquidButton from '../common/LiquidButton/LiquidButton';

export default function AdminFeeStructure({ 
  feeStructure = {},
  onUpdateFees,
  loading = false 
}) {
  const [campaignFee, setCampaignFee] = useState(0);
  const [applicationFee, setApplicationFee] = useState(0);
  const [editMode, setEditMode] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (feeStructure) {
      setCampaignFee(feeStructure.campaignFee || 0);
      setApplicationFee(feeStructure.applicationFee || 0);
    }
  }, [feeStructure]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await onUpdateFees({
        campaignFee: Number(campaignFee),
        applicationFee: Number(applicationFee)
      });
      setEditMode(false);
    } catch (error) {
      console.error('Error saving fees:', error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box sx={{ animation: 'fadeIn 0.3s ease' }}>
      <div style={{ marginBottom: '2rem' }}>
        <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
          Configure platform fee structure. These fees are charged to different user groups for various actions.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
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

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <LiquidButton 
                variant="secondary" 
                onClick={() => {
                  setEditMode(false);
                  setCampaignFee(feeStructure.campaignFee || 0);
                  setApplicationFee(feeStructure.applicationFee || 0);
                }}
                disabled={saving}
                style={{ flex: 1 }}
              >
                Cancel
              </LiquidButton>
              <LiquidButton 
                variant="primary" 
                onClick={handleSave}
                disabled={saving || loading}
                style={{ flex: 1 }}
              >
                {saving ? '⏳ Saving...' : '💾 Save Changes'}
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
