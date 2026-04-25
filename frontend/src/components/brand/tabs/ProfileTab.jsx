import { useNavigate } from 'react-router-dom';
import LiquidButton from '../../common/LiquidButton/LiquidButton';

import { resolveAssetUrl } from '../../../utils/helpers';

export default function ProfileTab({ 
  user, 
  logout 
}) {
  const navigate = useNavigate();
  return (
    <div style={{ animation: 'fadeIn 0.3s ease' }}>
      <div className="profile-panel glass-panel" style={{ padding: '2.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div className="profile-panel-avatar">
          {user?.avatar ? <img src={resolveAssetUrl(user.avatar)} alt="Brand avatar" className="profile-panel-avatar-img" /> : <span>{user?.name?.[0] || 'B'}</span>}
        </div>
        <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>{user?.name}</h3>
        <p className="profile-panel-subtitle" style={{ color: 'var(--text-muted)', fontSize: '0.9375rem', fontWeight: 500, marginBottom: '2rem' }}>{user?.email}</p>
        <div className="profile-panel-actions" style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <LiquidButton variant="primary" onClick={() => navigate('/brand/profile')} style={{ width: '100%' }}>Manage Profile</LiquidButton>
          <LiquidButton variant="outline" onClick={logout} style={{ width: '100%', borderColor: 'rgba(255, 71, 87, 0.3) !important', color: 'var(--danger) !important' }}>Sign Out</LiquidButton>
        </div>
      </div>
    </div>
  );
}
