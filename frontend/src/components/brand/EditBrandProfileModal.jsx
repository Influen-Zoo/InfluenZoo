import React from 'react';
import LiquidButton from '../common/LiquidButton/LiquidButton';
import { Camera, Globe, Mail, Phone, MapPin, Building2, Calendar, Users, Link } from 'lucide-react';

export default function EditBrandProfileModal({
  profileData,
  setEditModal,
  handleFieldChange,
  handleSocialLinkChange,
  handlePreferenceChange,
  handleSave,
  saving,
  uploading,
  categories = []
}) {
  return (
    <div className="modal-overlay" onClick={() => setEditModal(false)}>
      <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '900px', maxHeight: '90vh', overflowY: 'auto', padding: '2.5rem' }}>
        <button className="modal-close" onClick={() => setEditModal(false)}>✕</button>
        
        <div style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text)' }}>Edit Brand Profile</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Update your brand identity and preferences.</p>
        </div>

        <div className="input-group" style={{ marginBottom: '1rem' }}>
          <label>Brand Name</label>
          <input className="input" value={profileData.brandName} onChange={e => handleFieldChange('brandName', e.target.value)} />
        </div>

        <div className="input-group" style={{ marginBottom: '1rem' }}>
          <label>About Brand</label>
          <textarea className="input" style={{ minHeight: '100px' }} value={profileData.about} onChange={e => handleFieldChange('about', e.target.value)} placeholder="Tell influencers about your brand..." />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
          <div className="input-group">
            <label>Industry</label>
            <select className="input" value={profileData.industry} onChange={e => handleFieldChange('industry', e.target.value)}>
              <option value="">Select Industry</option>
              {categories.map((category) => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
          <div className="input-group">
            <label>Current Location</label>
            <input className="input" value={profileData.hometown || ''} onChange={e => handleFieldChange('hometown', e.target.value)} placeholder="Current Location" />
          </div>
        </div>

        <div className="divider" style={{ margin: '2rem 0', height: '1px', background: 'var(--border)' }} />
        
        <h4 style={{ marginBottom: '1.2rem', color: 'var(--primary)', fontWeight: 700 }}>Social Presence</h4>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
          <div className="input-group">
            <label>Instagram URL</label>
            <input className="input" placeholder="Instagram URL" value={profileData.socialLinks?.instagram || ''} onChange={e => handleSocialLinkChange('instagram', e.target.value)} />
          </div>
          <div className="input-group">
            <label>LinkedIn URL</label>
            <input className="input" placeholder="LinkedIn URL" value={profileData.socialLinks?.linkedin || ''} onChange={e => handleSocialLinkChange('linkedin', e.target.value)} />
          </div>
          <div className="input-group">
            <label>Twitter/X URL</label>
            <input className="input" placeholder="Twitter/X URL" value={profileData.socialLinks?.twitter || ''} onChange={e => handleSocialLinkChange('twitter', e.target.value)} />
          </div>
        </div>

        <div className="divider" style={{ margin: '2rem 0', height: '1px', background: 'var(--border)' }} />

        <h4 style={{ marginBottom: '1.2rem', color: 'var(--primary)', fontWeight: 700 }}>Personal Information</h4>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
          <div className="input-group">
            <label>Website URL</label>
            <input className="input" value={profileData.website} onChange={e => handleFieldChange('website', e.target.value)} placeholder="https://..." />
          </div>
          <div className="input-group">
            <label>Headquarters</label>
            <input className="input" value={profileData.headquarters || ''} onChange={e => handleFieldChange('headquarters', e.target.value)} placeholder="Headquarters" />
          </div>
          <div className="input-group">
            <label>Office Address</label>
            <input className="input" value={profileData.address || ''} onChange={e => handleFieldChange('address', e.target.value)} placeholder="Full Address" />
          </div>
          <div className="input-group">
            <label>City</label>
            <input className="input" value={profileData.city || ''} onChange={e => handleFieldChange('city', e.target.value)} placeholder="City" />
          </div>
          <div className="input-group">
            <label>State</label>
            <input className="input" value={profileData.state || ''} onChange={e => handleFieldChange('state', e.target.value)} placeholder="State" />
          </div>
          <div className="input-group">
            <label>Country</label>
            <input className="input" value={profileData.country || ''} onChange={e => handleFieldChange('country', e.target.value)} placeholder="Country" />
          </div>
          <div className="input-group">
            <label>Zip Code</label>
            <input className="input" value={profileData.zipCode || ''} onChange={e => handleFieldChange('zipCode', e.target.value)} placeholder="Zip Code" />
          </div>

          <div className="input-group">
            <label>Company Size</label>
            <select className="input" value={profileData.companySize} onChange={e => handleFieldChange('companySize', e.target.value)}>
              <option value="">Scale</option>
              <option value="1-10">1-10</option>
              <option value="11-50">11-50</option>
              <option value="51-200">51-200</option>
              <option value="200+">200+</option>
            </select>
          </div>
          <div className="input-group">
            <label>Founded Year</label>
            <input type="number" className="input" value={profileData.foundedYear} onChange={e => handleFieldChange('foundedYear', e.target.value)} />
          </div>
        </div>

        <div className="divider" style={{ margin: '2rem 0', height: '1px', background: 'var(--border)' }} />

        <h4 style={{ marginBottom: '1.2rem', color: 'var(--primary)', fontWeight: 700 }}>Campaign Preferences</h4>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
          <div className="input-group">
            <label>Typical Budget Range</label>
            <input className="input" value={profileData.campaignPreferences?.budgetRange || ''} onChange={e => handlePreferenceChange('budgetRange', e.target.value)} placeholder="e.g. ₹10k - ₹50k" />
          </div>
          <div className="input-group">
            <label>Niches / Categories</label>
            <select
              className="input"
              multiple
              value={profileData.campaignPreferences?.categories || []}
              onChange={e => handlePreferenceChange('categories', Array.from(e.target.selectedOptions).map(option => option.value))}
              style={{ minHeight: '120px' }}
            >
              {categories.map((category) => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
        </div>

        <div style={{ marginTop: '3rem', display: 'flex', gap: '1rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border)' }}>
          <LiquidButton variant="secondary" onClick={() => setEditModal(false)} style={{ flex: 1 }}>Cancel</LiquidButton>
          <LiquidButton variant="primary" onClick={handleSave} style={{ flex: 1 }} disabled={saving || uploading}>
            {saving ? 'Saving...' : 'Save Profile'}
          </LiquidButton>
        </div>
      </div>
    </div>
  );
}
