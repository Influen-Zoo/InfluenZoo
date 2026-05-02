import React, { useEffect, useMemo, useState } from 'react';
import AdminLayout from '../../components/layout/AdminLayout';
import LiquidButton from '../../components/common/LiquidButton/LiquidButton';
import api from '../../services/api';
import { getAdminSidebarItems } from '../../constants/adminSidebarItems';
import { resolveAssetUrl } from '../../utils/helpers';

const emptyForm = {
  name: '',
  website: '',
  sortOrder: 0,
  isActive: true,
  logo: null,
};

export default function BrandLogosPage() {
  const [logos, setLogos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [toast, setToast] = useState(null);
  const [loadError, setLoadError] = useState('');
  const [scrollSpeed, setScrollSpeed] = useState(18);
  const [spacing, setSpacing] = useState(40);
  const [showSeparator, setShowSeparator] = useState(false);
  const [updatingSettings, setUpdatingSettings] = useState(false);

  const sidebarItems = useMemo(() => getAdminSidebarItems(), []);

  const loadLogos = async () => {
    setLoading(true);
    setLoadError('');
    try {
      setLogos(await api.getAdminBrandLogos());
    } catch (error) {
      const message = error.message || error.response?.data?.error || 'Could not load brand logos';
      setLoadError(message);
      setToast({ type: 'error', message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogos();
    api.getAdminBrandLogoSettings()
      .then(settings => {
        setScrollSpeed(settings.scrollSpeed ?? 18);
        setSpacing(settings.spacing ?? 40);
        setShowSeparator(!!settings.showSeparator);
      })
      .catch(() => {});
  }, []);

  const resetForm = () => {
    setEditingId(null);
    setForm(emptyForm);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!form.name.trim()) {
      setToast({ type: 'error', message: 'Brand name is required' });
      return;
    }
    if (!editingId && !form.logo) {
      setToast({ type: 'error', message: 'Upload a transparent PNG logo' });
      return;
    }

    const formData = new FormData();
    formData.append('name', form.name.trim());
    formData.append('website', form.website.trim());
    formData.append('sortOrder', String(form.sortOrder || 0));
    formData.append('isActive', String(form.isActive));
    if (form.logo) formData.append('logo', form.logo);

    setSaving(true);
    try {
      if (editingId) await api.updateAdminBrandLogo(editingId, formData);
      else await api.createAdminBrandLogo(formData);
      setToast({ type: 'success', message: editingId ? 'Brand logo updated' : 'Brand logo added' });
      resetForm();
      await loadLogos();
    } catch (error) {
      setToast({ type: 'error', message: error.response?.data?.error || 'Could not save brand logo' });
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (logo) => {
    setEditingId(logo._id);
    setForm({
      name: logo.name || '',
      website: logo.website || '',
      sortOrder: logo.sortOrder || 0,
      isActive: logo.isActive !== false,
      logo: null,
    });
  };

  const handleDelete = async (logo) => {
    if (!window.confirm(`Delete ${logo.name}?`)) return;
    try {
      await api.deleteAdminBrandLogo(logo._id);
      setToast({ type: 'success', message: 'Brand logo deleted' });
      await loadLogos();
    } catch (error) {
      setToast({ type: 'error', message: error.response?.data?.error || 'Could not delete brand logo' });
    }
  };

  const handleUpdateSettings = async () => {
    setUpdatingSettings(true);
    try {
      await api.updateAdminBrandLogoSettings({ 
        scrollSpeed, 
        spacing, 
        showSeparator 
      });
      setToast({ type: 'success', message: 'Settings updated' });
    } catch (error) {
      setToast({ type: 'error', message: 'Could not update settings' });
    } finally {
      setUpdatingSettings(false);
    }
  };

  const visibleCount = logos.filter((logo) => logo.isActive !== false).length;
  const previewLogos = logos.length ? logos.slice(0, 5) : [{ _id: 'sample', name: 'Brand', image: '' }];
  const previewLoopLogos = [...previewLogos, ...previewLogos];

  return (
    <AdminLayout
      activeSection="brand-logos"
      setActiveSection={() => {}}
      sidebarItems={sidebarItems}
      toast={toast}
    >
      <div className="page-enter admin-brand-logos-page">
        <div className="admin-brand-logo-hero glass-panel">
          <div>
            <div className="admin-brand-logo-eyebrow">Landing Page</div>
            <h2>Brand Logos</h2>
            <p>Manage the transparent PNG logos that appear in the glass carousel below the homepage banner.</p>
          </div>
          <div className="admin-brand-logo-stats">
            <div>
              <strong>{logos.length}</strong>
              <span>Total logos</span>
            </div>
            <div>
              <strong>{visibleCount}</strong>
              <span>Visible</span>
            </div>
          </div>
        </div>

        {loadError && (
          <div className="brand-logo-api-alert glass-panel">
            <strong>Brand logo API unavailable</strong>
            <span>{loadError}</span>
          </div>
        )}

        <div className="brand-logo-admin-layout">
          <form className="brand-logo-form glass-panel" onSubmit={handleSubmit}>
            <div className="brand-logo-form-title">
              <strong>{editingId ? 'Edit logo' : 'Add new logo'}</strong>
              <span>PNG only, 2MB max (300x150px rec.)</span>
            </div>

            <div className="brand-logo-form-grid">
              <label>
                Brand name
                <input
                  className="input"
                  value={form.name}
                  onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
                  placeholder="NovaSkin"
                />
              </label>
              <label>
                Website
                <input
                  className="input"
                  value={form.website}
                  onChange={(event) => setForm((prev) => ({ ...prev, website: event.target.value }))}
                  placeholder="https://brand.com"
                />
              </label>
              <label>
                Sort order
                <input
                  className="input"
                  type="number"
                  value={form.sortOrder}
                  onChange={(event) => setForm((prev) => ({ ...prev, sortOrder: event.target.value }))}
                />
              </label>
              <label className="brand-logo-file-field" title="Wide logos: 2:1 ratio (300x150px). Round/Square: 1:1 ratio (200x200px). Use transparent PNG with minimal padding.">
                Brand Logo (PNG) ⓘ
                <span className="brand-logo-upload-control">
                  <input
                    type="file"
                    accept="image/png"
                    onChange={(event) => setForm((prev) => ({ ...prev, logo: event.target.files?.[0] || null }))}
                  />
                  <span className="brand-logo-upload-button">Choose PNG</span>
                  <span className="brand-logo-upload-name">{form.logo?.name || 'No file selected'}</span>
                </span>
              </label>
              <label className="brand-logo-active-field">
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(event) => setForm((prev) => ({ ...prev, isActive: event.target.checked }))}
                />
                Show on landing page
              </label>
            </div>

            <div className="brand-logo-form-actions">
              {editingId && (
                <LiquidButton type="button" variant="secondary" size="small" onClick={resetForm}>
                  Cancel
                </LiquidButton>
              )}
              <LiquidButton type="submit" variant="primary" size="small" disabled={saving}>
                {saving ? 'Saving...' : editingId ? 'Update Logo' : 'Add Logo'}
              </LiquidButton>
            </div>
          </form>

          <div className="brand-logo-preview glass-panel">
            <div className="brand-logo-preview-header">
              <span>Carousel Preview</span>
            </div>
            <div className="brand-logo-settings-inline">
              <div className="brand-logo-settings-group">
                <label title="Control how fast the logos scroll (lower is faster)">
                  Speed: <strong>{scrollSpeed}s</strong>
                  <input
                    type="range"
                    min="5"
                    max="60"
                    step="1"
                    value={scrollSpeed}
                    onChange={(e) => setScrollSpeed(Number(e.target.value))}
                  />
                </label>
                <label title="Gap between logos in pixels">
                  Spacing: <strong>{spacing}px</strong>
                  <input
                    type="range"
                    min="0"
                    max="120"
                    step="4"
                    value={spacing}
                    onChange={(e) => setSpacing(Number(e.target.value))}
                  />
                </label>
                <label className="checkbox-label" title="Add a vertical line between logos">
                  <span>Separator</span>
                  <input
                    type="checkbox"
                    checked={showSeparator}
                    onChange={(e) => setShowSeparator(e.target.checked)}
                  />
                </label>
              </div>
              <LiquidButton 
                variant="primary" 
                size="small" 
                onClick={handleUpdateSettings}
                disabled={updatingSettings}
                style={{ alignSelf: 'flex-end', marginTop: '0.5rem' }}
              >
                Save All
              </LiquidButton>
            </div>
            <div className="brand-logo-carousel-container">
              <div 
                className="brand-logo-preview-track"
                style={{ 
                  animationDuration: `${scrollSpeed}s`,
                  gap: `${showSeparator ? spacing / 2 : spacing}px`
                }}
              >
                {previewLoopLogos.map((logo, index) => (
                  <React.Fragment key={`${logo._id}-${index}`}>
                    <div className="brand-logo-preview-chip">
                      {logo.image ? <img src={resolveAssetUrl(logo.image)} alt={logo.name} /> : <strong>PNG</strong>}
                    </div>
                    {showSeparator && index < previewLoopLogos.length - 1 && (
                      <div className="brand-logo-preview-separator" />
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="empty-state">Loading brand logos...</div>
        ) : (
          <div className="brand-logo-admin-grid">
            {logos.map((logo) => (
              <article className="brand-logo-admin-card glass-panel" key={logo._id}>
                <div className="brand-logo-admin-image">
                  <img src={resolveAssetUrl(logo.image)} alt={logo.name} />
                </div>
                <div className="brand-logo-admin-copy">
                  <div>
                    <strong>{logo.name}</strong>
                    <span>{logo.website || 'No website added'}</span>
                  </div>
                  <span className={logo.isActive ? 'is-visible' : 'is-hidden'}>
                    {logo.isActive ? 'Visible' : 'Hidden'}
                  </span>
                </div>
                <div className="brand-logo-admin-meta">
                  <span>Sort order</span>
                  <strong>{logo.sortOrder || 0}</strong>
                </div>
                <div className="brand-logo-admin-actions">
                  <button type="button" onClick={() => handleEdit(logo)}>Edit</button>
                  <button type="button" onClick={() => handleDelete(logo)}>Delete</button>
                </div>
              </article>
            ))}
            {!logos.length && (
              <div className="brand-logo-empty glass-panel">
                <strong>No logos yet</strong>
                <span>Add transparent PNG brand logos to activate the landing carousel.</span>
              </div>
            )}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
