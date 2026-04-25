import api from '../../services/api';
import { PROFILE_CATEGORIES, SOCIAL_PLATFORMS } from '../../constants/common';

const PREDEFINED_AVATARS = [
  'https://api.dicebear.com/7.x/notionists/svg?seed=Felix',
  'https://api.dicebear.com/7.x/notionists/svg?seed=Aneka',
  'https://api.dicebear.com/7.x/notionists/svg?seed=Jasper',
  'https://api.dicebear.com/7.x/notionists/svg?seed=Cleo',
  'https://api.dicebear.com/7.x/notionists/svg?seed=Dustin',
  'https://api.dicebear.com/7.x/notionists/svg?seed=Mia'
];

export default function CreatorSetupFlow({ user, onComplete }) {
  const [avatar, setAvatar] = useState(PREDEFINED_AVATARS[0]);
  const [bio, setBio] = useState('');
  const [location, setLocation] = useState('');
  const [niche, setNiche] = useState([]);
  const [socialLinks, setSocialLinks] = useState([{ platform: 'Instagram', url: '' }]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const categories = PROFILE_CATEGORIES;
  const platforms = SOCIAL_PLATFORMS;

  const handleAddLink = () => setSocialLinks([...socialLinks, { platform: 'Instagram', url: '' }]);
  const handleLinkChange = (index, field, value) => {
    const newLinks = [...socialLinks];
    newLinks[index][field] = value;
    setSocialLinks(newLinks);
  };
  const handleRemoveLink = (index) => setSocialLinks(socialLinks.filter((_, i) => i !== index));
  const toggleNiche = (c) => setNiche(prev => prev.includes(c) ? prev.filter(x => x !== c) : [...prev, c]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!bio.trim() || niche.length === 0 || socialLinks.length === 0 || !socialLinks[0].url.trim()) {
      setError('Please complete all required fields (bio, at least 1 category, at least 1 social link).');
      return;
    }
    setLoading(true);
    try {
      await api.updateProfile({ avatar, bio, location, niche, socialLinks, platforms: socialLinks.map(s => s.platform) });
      onComplete();
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="influencer-page page-enter" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem 1rem' }}>
      <div className="modal" style={{ position: 'relative', width: '100%', maxWidth: '600px', padding: '2rem' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '0.5rem' }}>Complete Your Profile</h2>
        <p style={{ textAlign: 'center', color: 'var(--text-secondary)', marginBottom: '2rem', fontSize: '0.875rem' }}>
          Brands want to know who you are. Fill out these details to activate your account.
        </p>
        
        {error && <div className="error-message" style={{ marginBottom: '1rem', textAlign: 'center' }}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Choose Avatar</label>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center', margin: '1rem 0' }}>
              {PREDEFINED_AVATARS.map(url => (
                <img 
                  key={url} src={url} alt="avatar option" 
                  style={{ width: '60px', height: '60px', borderRadius: '50%', cursor: 'pointer', border: avatar === url ? '3px solid var(--primary)' : '2px solid transparent', background: 'var(--surface-alt)' }}
                  onClick={() => setAvatar(url)}
                />
              ))}
            </div>
          </div>

          <div className="form-group">
            <label>Bio / Description *</label>
            <textarea 
              rows="3" 
              placeholder="Tell brands about yourself and the type of content you create..."
              value={bio} onChange={e => setBio(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Primary Niche / Category (Select multiple) *</label>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
              {categories.map(c => (
                <button 
                  type="button" 
                  key={c}
                  onClick={() => toggleNiche(c)}
                  style={{
                    padding: '0.5rem 1rem',
                    borderRadius: '20px',
                    border: '1px solid var(--border)',
                    background: niche.includes(c) ? 'var(--primary)' : 'var(--surface)',
                    color: niche.includes(c) ? 'white' : 'var(--text)',
                    cursor: 'pointer',
                    fontSize: '0.875rem'
                  }}
                >{c}</button>
              ))}
            </div>
          </div>

          <div className="form-group" style={{ marginTop: '1.5rem' }}>
            <label>Location (Optional)</label>
            <input type="text" placeholder="e.g., Delhi, India" value={location} onChange={e => setLocation(e.target.value)} />
          </div>

          <div className="form-group" style={{ marginTop: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <label style={{ margin: 0 }}>Social Media Links *</label>
              <button type="button" className="btn-secondary" style={{ padding: '0.25rem 0.75rem', fontSize: '0.75rem' }} onClick={handleAddLink}>+ Add Link</button>
            </div>
            {socialLinks.map((link, index) => (
              <div key={index} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <select 
                  value={link.platform} 
                  onChange={e => handleLinkChange(index, 'platform', e.target.value)}
                  style={{ width: '120px' }}
                >
                  {platforms.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
                <input 
                  type="url" 
                  placeholder="Profile URL" 
                  value={link.url} 
                  onChange={e => handleLinkChange(index, 'url', e.target.value)}
                  style={{ flex: 1 }}
                  required
                />
                {socialLinks.length > 1 && (
                  <button type="button" className="btn-icon" onClick={() => handleRemoveLink(index)} style={{ color: 'var(--danger)' }}>✕</button>
                )}
              </div>
            ))}
          </div>

          <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: '2rem', padding: '1rem' }} disabled={loading}>
            {loading ? 'Saving...' : 'Complete Profile'}
          </button>
        </form>
      </div>
    </div>
  );
}
