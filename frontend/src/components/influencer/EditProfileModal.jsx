import React from 'react';
import LiquidButton from '../common/LiquidButton/LiquidButton';
import { PROFILE_CATEGORIES, SOCIAL_PLATFORMS } from '../../constants/common';

export default function EditProfileModal({
  profileData,
  setEditProfileModal,
  handleProfileFieldChange,
  handleBioFieldChange,
  handleSocialLinkChange,
  addEducationEntry,
  removeEducationEntry,
  handleEducationChange,
  addWorkEntry,
  removeWorkEntry,
  handleWorkChange,
  handleFullProfileSave,
  savingProfile,
  uploading
}) {
  return (
    <div className="modal-overlay" onClick={() => setEditProfileModal(false)}>
      <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '960px', maxHeight: '90vh', overflowY: 'auto' }}>
        <button className="modal-close" onClick={() => setEditProfileModal(false)}>x</button>
        <h3 style={{ marginBottom: '1.5rem' }}>Edit Full Profile</h3>

        <div className="input-group" style={{ marginBottom: '1rem' }}>
          <label>Name</label>
          <input className="input" value={profileData.name} onChange={e => handleProfileFieldChange('name', e.target.value)} />
        </div>
        <div className="input-group" style={{ marginBottom: '1rem' }}>
          <label>Bio</label>
          <textarea className="input" value={profileData.bio} onChange={e => handleProfileFieldChange('bio', e.target.value)} style={{ minHeight: '80px' }} />
        </div>
        <div className="input-group" style={{ marginBottom: '1rem' }}>
          <label>Location</label>
          <input className="input" value={profileData.location} onChange={e => handleProfileFieldChange('location', e.target.value)} />
        </div>
        <div className="input-group" style={{ marginBottom: '1rem' }}>
          <label>Category</label>
          <select className="input" value={profileData.category} onChange={e => handleProfileFieldChange('category', e.target.value)}>
            <option value="">Select category</option>
            {PROFILE_CATEGORIES.map(category => <option key={category} value={category}>{category}</option>)}
          </select>
        </div>
        <div className="input-group" style={{ marginBottom: '1.5rem' }}>
          <label>Niche / Tags</label>
          <input className="input" placeholder="Fashion, Lifestyle, Reels" value={profileData.nicheText} onChange={e => handleProfileFieldChange('nicheText', e.target.value)} />
        </div>

        <div className="divider" />
        <h4 style={{ marginBottom: '1rem' }}>Social Links</h4>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.75rem', marginBottom: '1.5rem' }}>
          {SOCIAL_PLATFORMS.map((platform) => (
            <div key={platform} className="input-group" style={{ marginBottom: 0 }}>
              <label style={{ textTransform: 'capitalize' }}>{platform}</label>
              <input className="input" placeholder={`https://${platform}.com/...`} value={profileData.socialLinks?.[platform] || ''} onChange={e => handleSocialLinkChange(platform, e.target.value)} />
            </div>
          ))}
        </div>

        <div className="divider" />
        <h4 style={{ marginBottom: '1rem' }}>Personal Information</h4>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.75rem' }}>
          <div className="input-group" style={{ marginBottom: 0, gridColumn: '1 / -1' }}>
            <label>About</label>
            <textarea className="input" value={profileData.userBio.about} onChange={e => handleBioFieldChange('about', e.target.value)} style={{ minHeight: '90px' }} />
          </div>
          <div className="input-group" style={{ marginBottom: 0 }}>
            <label>Date of Birth</label>
            <input type="date" className="input" value={profileData.userBio.dateOfBirth} onChange={e => handleBioFieldChange('dateOfBirth', e.target.value)} />
          </div>
          <div className="input-group" style={{ marginBottom: 0 }}>
            <label>Gender</label>
            <select className="input" value={profileData.userBio.gender} onChange={e => handleBioFieldChange('gender', e.target.value)}>
              <option value="">Select gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
              <option value="prefer-not-to-say">Prefer not to say</option>
            </select>
          </div>
          <div className="input-group" style={{ marginBottom: 0 }}>
            <label>Relationship Status</label>
            <select className="input" value={profileData.userBio.relationshipStatus} onChange={e => handleBioFieldChange('relationshipStatus', e.target.value)}>
              <option value="not-specified">Not specified</option>
              <option value="single">Single</option>
              <option value="relationship">In a relationship</option>
              <option value="married">Married</option>
              <option value="divorced">Divorced</option>
              <option value="widowed">Widowed</option>
            </select>
          </div>
          <div className="input-group" style={{ marginBottom: 0 }}>
            <label>Phone</label>
            <input className="input" value={profileData.userBio.phone} onChange={e => handleBioFieldChange('phone', e.target.value)} />
          </div>
          <div className="input-group" style={{ marginBottom: 0 }}>
            <label>Website</label>
            <input className="input" value={profileData.userBio.website} onChange={e => handleBioFieldChange('website', e.target.value)} />
          </div>
          <div className="input-group" style={{ marginBottom: 0 }}>
            <label>Address</label>
            <input className="input" value={profileData.userBio.address} onChange={e => handleBioFieldChange('address', e.target.value)} />
          </div>
          <div className="input-group" style={{ marginBottom: 0 }}>
            <label>City</label>
            <input className="input" value={profileData.userBio.city} onChange={e => handleBioFieldChange('city', e.target.value)} />
          </div>
          <div className="input-group" style={{ marginBottom: 0 }}>
            <label>State</label>
            <input className="input" value={profileData.userBio.state} onChange={e => handleBioFieldChange('state', e.target.value)} />
          </div>
          <div className="input-group" style={{ marginBottom: 0 }}>
            <label>Country</label>
            <input className="input" value={profileData.userBio.country} onChange={e => handleBioFieldChange('country', e.target.value)} />
          </div>
          <div className="input-group" style={{ marginBottom: 0 }}>
            <label>Zip Code</label>
            <input className="input" value={profileData.userBio.zipCode} onChange={e => handleBioFieldChange('zipCode', e.target.value)} />
          </div>
          <div className="input-group" style={{ marginBottom: 0 }}>
            <label>Hometown</label>
            <input className="input" value={profileData.userBio.hometown} onChange={e => handleBioFieldChange('hometown', e.target.value)} />
          </div>
          <div className="input-group" style={{ marginBottom: 0 }}>
            <label>Current City</label>
            <input className="input" value={profileData.userBio.currentCity} onChange={e => handleBioFieldChange('currentCity', e.target.value)} />
          </div>
          <div className="input-group" style={{ marginBottom: 0 }}>
            <label>Pronouns</label>
            <input className="input" value={profileData.userBio.pronouns} onChange={e => handleBioFieldChange('pronouns', e.target.value)} />
          </div>
          <div className="input-group" style={{ marginBottom: 0 }}>
            <label>Hobbies</label>
            <input className="input" placeholder="Photography, Travel" value={profileData.userBio.hobbiesText} onChange={e => handleBioFieldChange('hobbiesText', e.target.value)} />
          </div>
          <div className="input-group" style={{ marginBottom: 0 }}>
            <label>Interests</label>
            <input className="input" placeholder="Fashion, Fitness" value={profileData.userBio.interestsText} onChange={e => handleBioFieldChange('interestsText', e.target.value)} />
          </div>
          <div className="input-group" style={{ marginBottom: 0 }}>
            <label>Languages</label>
            <input className="input" placeholder="English, Hindi" value={profileData.userBio.languagesText} onChange={e => handleBioFieldChange('languagesText', e.target.value)} />
          </div>
        </div>

        <div className="divider" />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', gap: '0.75rem', flexWrap: 'wrap' }}>
          <h4 style={{ margin: 0 }}>Education</h4>
          <LiquidButton variant="secondary" onClick={addEducationEntry}>Add Education</LiquidButton>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
          {profileData.education.map((item, index) => (
            <div key={item._id || `education-${index}`} style={{ padding: '1rem', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', background: 'var(--surface-alt)' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.75rem' }}>
                <div className="input-group" style={{ marginBottom: 0 }}>
                  <label>School Name</label>
                  <input className="input" value={item.schoolName} onChange={e => handleEducationChange(index, 'schoolName', e.target.value)} />
                </div>
                <div className="input-group" style={{ marginBottom: 0 }}>
                  <label>Degree</label>
                  <input className="input" value={item.degree} onChange={e => handleEducationChange(index, 'degree', e.target.value)} />
                </div>
                <div className="input-group" style={{ marginBottom: 0 }}>
                  <label>Field of Study</label>
                  <input className="input" value={item.fieldOfStudy} onChange={e => handleEducationChange(index, 'fieldOfStudy', e.target.value)} />
                </div>
                <div className="input-group" style={{ marginBottom: 0 }}>
                  <label>Start Date</label>
                  <input type="date" className="input" value={item.startDate} onChange={e => handleEducationChange(index, 'startDate', e.target.value)} />
                </div>
                <div className="input-group" style={{ marginBottom: 0 }}>
                  <label>End Date</label>
                  <input type="date" className="input" value={item.endDate} disabled={item.currentlyStudying} onChange={e => handleEducationChange(index, 'endDate', e.target.value)} />
                </div>
                <div className="input-group" style={{ marginBottom: 0 }}>
                  <label>Grade</label>
                  <input className="input" value={item.grade} onChange={e => handleEducationChange(index, 'grade', e.target.value)} />
                </div>
                <div className="input-group" style={{ marginBottom: 0, gridColumn: '1 / -1' }}>
                  <label>Activities</label>
                  <input className="input" placeholder="Club, Society" value={item.activitiesText} onChange={e => handleEducationChange(index, 'activitiesText', e.target.value)} />
                </div>
                <div className="input-group" style={{ marginBottom: 0, gridColumn: '1 / -1' }}>
                  <label>Description</label>
                  <textarea className="input" style={{ minHeight: '80px' }} value={item.description} onChange={e => handleEducationChange(index, 'description', e.target.value)} />
                </div>
              </div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.75rem' }}>
                <input type="checkbox" checked={item.currentlyStudying} onChange={e => handleEducationChange(index, 'currentlyStudying', e.target.checked)} />
                Currently studying here
              </label>
              <div style={{ marginTop: '0.75rem' }}>
                <LiquidButton variant="error" onClick={() => removeEducationEntry(index)}>Remove Education</LiquidButton>
              </div>
            </div>
          ))}
        </div>

        <div className="divider" />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', gap: '0.75rem', flexWrap: 'wrap' }}>
          <h4 style={{ margin: 0 }}>Work Experience</h4>
          <LiquidButton variant="secondary" onClick={addWorkEntry}>Add Work</LiquidButton>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
          {profileData.work.map((item, index) => (
            <div key={item._id || `work-${index}`} style={{ padding: '1rem', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', background: 'var(--surface-alt)' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.75rem' }}>
                <div className="input-group" style={{ marginBottom: 0 }}>
                  <label>Company Name</label>
                  <input className="input" value={item.companyName} onChange={e => handleWorkChange(index, 'companyName', e.target.value)} />
                </div>
                <div className="input-group" style={{ marginBottom: 0 }}>
                  <label>Job Title</label>
                  <input className="input" value={item.jobTitle} onChange={e => handleWorkChange(index, 'jobTitle', e.target.value)} />
                </div>
                <div className="input-group" style={{ marginBottom: 0 }}>
                  <label>Employment Type</label>
                  <select className="input" value={item.employmentType} onChange={e => handleWorkChange(index, 'employmentType', e.target.value)}>
                    <option value="">Select type</option>
                    <option value="full-time">Full-time</option>
                    <option value="part-time">Part-time</option>
                    <option value="self-employed">Self-employed</option>
                    <option value="freelance">Freelance</option>
                    <option value="contract">Contract</option>
                    <option value="internship">Internship</option>
                    <option value="seasonal">Seasonal</option>
                  </select>
                </div>
                <div className="input-group" style={{ marginBottom: 0 }}>
                  <label>Location</label>
                  <input className="input" value={item.location} onChange={e => handleWorkChange(index, 'location', e.target.value)} />
                </div>
                <div className="input-group" style={{ marginBottom: 0 }}>
                  <label>Start Date</label>
                  <input type="date" className="input" value={item.startDate} onChange={e => handleWorkChange(index, 'startDate', e.target.value)} />
                </div>
                <div className="input-group" style={{ marginBottom: 0 }}>
                  <label>End Date</label>
                  <input type="date" className="input" value={item.endDate} disabled={item.currentlyWorking} onChange={e => handleWorkChange(index, 'endDate', e.target.value)} />
                </div>
                <div className="input-group" style={{ marginBottom: 0, gridColumn: '1 / -1' }}>
                  <label>Skills</label>
                  <input className="input" placeholder="Content Creation, Strategy" value={item.skillsText} onChange={e => handleWorkChange(index, 'skillsText', e.target.value)} />
                </div>
                <div className="input-group" style={{ marginBottom: 0, gridColumn: '1 / -1' }}>
                  <label>Description</label>
                  <textarea className="input" style={{ minHeight: '80px' }} value={item.description} onChange={e => handleWorkChange(index, 'description', e.target.value)} />
                </div>
              </div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.75rem' }}>
                <input type="checkbox" checked={item.currentlyWorking} onChange={e => handleWorkChange(index, 'currentlyWorking', e.target.checked)} />
                I currently work here
              </label>
              <div style={{ marginTop: '0.75rem' }}>
                <LiquidButton variant="error" onClick={() => removeWorkEntry(index)}>Remove Work</LiquidButton>
              </div>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <LiquidButton variant="secondary" onClick={() => setEditProfileModal(false)} style={{ flex: 1 }}>Cancel</LiquidButton>
          <LiquidButton variant="primary" onClick={handleFullProfileSave} style={{ flex: 1 }} disabled={savingProfile || uploading}>
            {savingProfile ? 'Saving...' : 'Save Changes'}
          </LiquidButton>
        </div>
      </div>
    </div>
  );
}
