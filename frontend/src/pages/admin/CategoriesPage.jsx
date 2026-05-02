import React, { useEffect, useMemo, useState } from 'react';
import { Plus, Save, Trash2 } from 'lucide-react';
import AdminLayout from '../../components/layout/AdminLayout';
import LiquidButton from '../../components/common/LiquidButton/LiquidButton';
import { getAdminSidebarItems } from '../../constants/adminSidebarItems';
import { DEFAULT_CATEGORIES } from '../../constants/common';
import adminService from '../../services/admin.service';

export default function CategoriesPage() {
  const sidebarItems = useMemo(() => getAdminSidebarItems(), []);
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES);
  const [newCategory, setNewCategory] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    let active = true;

    const loadCategories = async () => {
      try {
        const data = await adminService.getCategories();
        if (active && Array.isArray(data) && data.length) setCategories(data);
      } catch (error) {
        if (active) setToast({ message: error.message || 'Failed to load categories', type: 'danger' });
      } finally {
        if (active) setLoading(false);
      }
    };

    loadCategories();

    return () => {
      active = false;
    };
  }, []);

  const normalizedCategories = categories
    .map((category) => category.trim())
    .filter(Boolean);

  const addCategory = () => {
    const nextCategory = newCategory.trim();
    if (!nextCategory) return;

    const exists = categories.some((category) => category.toLowerCase() === nextCategory.toLowerCase());
    if (exists) {
      setToast({ message: 'Category already exists', type: 'warning' });
      return;
    }

    setCategories((current) => [...current, nextCategory]);
    setNewCategory('');
  };

  const removeCategory = (categoryToRemove) => {
    setCategories((current) => current.filter((category) => category !== categoryToRemove));
  };

  const saveCategories = async () => {
    if (!normalizedCategories.length) {
      setToast({ message: 'Add at least one category before saving', type: 'warning' });
      return;
    }

    setSaving(true);
    try {
      const updated = await adminService.updateCategories(normalizedCategories);
      setCategories(updated);
      setToast({ message: 'Categories saved successfully', type: 'success' });
    } catch (error) {
      setToast({ message: error.message || 'Failed to save categories', type: 'danger' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminLayout activeSection="categories" sidebarItems={sidebarItems} toast={toast}>
      <div className="page-enter">
        <div className="page-header" style={{ marginBottom: '1.5rem' }}>
          <div>
            <h1 style={{ marginBottom: '0.35rem' }}>Categories</h1>
            <p style={{ color: 'var(--text-muted)', margin: 0 }}>
              Create and manage the dropdown categories used by influencers, brands, campaigns, and admin filters.
            </p>
          </div>
          <LiquidButton
            variant="primary"
            onClick={saveCategories}
            disabled={saving || loading}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
          >
            <Save size={16} />
            {saving ? 'Saving...' : 'Save Categories'}
          </LiquidButton>
        </div>

        <div className="chart-card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) auto', gap: '0.75rem', alignItems: 'center' }}>
            <input
              className="input"
              value={newCategory}
              onChange={(event) => setNewCategory(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  event.preventDefault();
                  addCategory();
                }
              }}
              placeholder="Create category, e.g. Education"
              disabled={loading}
            />
            <LiquidButton
              variant="secondary"
              onClick={addCategory}
              disabled={loading || !newCategory.trim()}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
            >
              <Plus size={16} />
              Add
            </LiquidButton>
          </div>
        </div>

        <div className="admin-four-card-grid" style={{ gap: '1rem' }}>
          {loading ? (
            <div className="chart-card" style={{ padding: '1.5rem' }}>Loading categories...</div>
          ) : normalizedCategories.map((category) => (
            <div
              key={category}
              className="chart-card"
              style={{ padding: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}
            >
              <div style={{ minWidth: 0 }}>
                <div style={{ fontWeight: 800, color: 'var(--text-primary)', wordBreak: 'break-word' }}>{category}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>Dropdown option</div>
              </div>
              <button
                type="button"
                onClick={() => removeCategory(category)}
                aria-label={`Remove ${category}`}
                title={`Remove ${category}`}
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border)',
                  background: 'var(--surface-alt)',
                  color: 'var(--danger)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  flex: '0 0 auto'
                }}
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
}
