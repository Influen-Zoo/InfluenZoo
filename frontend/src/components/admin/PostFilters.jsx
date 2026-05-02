import React from 'react';
import useCategories from '../../hooks/useCategories';

const PostFilters = ({ postFilter, setPostFilter }) => {
  const { categories } = useCategories();

  return (
    <div className="admin-section-filters" style={{ background: 'var(--surface-alt)', padding: '1.25rem', borderRadius: '16px', marginBottom: '1.5rem', display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'flex-end' }}>
      <div style={{ flex: '1 1 200px' }}>
        <label style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.5rem', display: 'block' }}>Search Posts</label>
        <input 
          className="input" 
          placeholder="Search by caption or author..." 
          value={postFilter.search}
          onChange={e => setPostFilter({ ...postFilter, search: e.target.value })}
        />
      </div>
      <div style={{ minWidth: '180px' }}>
        <label style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.5rem', display: 'block' }}>Category</label>
        <select 
          className="select"
          value={postFilter.category}
          onChange={e => setPostFilter({ ...postFilter, category: e.target.value })}
        >
          <option value="">All Categories</option>
          {categories.map((category) => (
            <option key={category} value={category}>{category}</option>
          ))}
        </select>
      </div>
      <div style={{ minWidth: '180px' }}>
        <label style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.5rem', display: 'block' }}>Status</label>
        <select 
          className="select"
          value={postFilter.status}
          onChange={e => setPostFilter({ ...postFilter, status: e.target.value })}
        >
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="blocked">Blocked</option>
        </select>
      </div>
    </div>
  );
};

export default PostFilters;
