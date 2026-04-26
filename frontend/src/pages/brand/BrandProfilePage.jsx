import React from 'react';
import { useOutletContext } from 'react-router-dom';
import UserProfile from '../UserProfile';
import LiquidButton from '../../components/common/LiquidButton/LiquidButton';
import EditBrandProfileModal from '../../components/brand/EditBrandProfileModal';

export const BrandProfilePage = () => {
  const { 
    user, 
    logout, 
    editBrandProfileModal, 
    setEditBrandProfileModal, 
    openEditProfile,
    brandProfileData,
    setBrandProfileData,
    saveBrandProfile,
    savingBrandProfile
  } = useOutletContext();

  return (
    <div className="tab-container">
      <div className="tab-pane" style={{ animation: 'fadeIn 0.3s ease' }}>
        <UserProfile 
          forcedUserId={user?._id} 
          embedded 
          onEditProfile={openEditProfile} 
        />
        <div className="profile-signout">
          <LiquidButton variant="error" fullWidth onClick={logout}>
            Sign Out
          </LiquidButton>
        </div>
      </div>

      {editBrandProfileModal && (
        <EditBrandProfileModal 
          profileData={brandProfileData}
          setEditModal={setEditBrandProfileModal}
          handleFieldChange={(field, value) => setBrandProfileData(prev => ({ ...prev, [field]: value }))}
          handleSocialLinkChange={(platform, value) => setBrandProfileData(prev => ({ ...prev, socialLinks: { ...prev.socialLinks, [platform]: value } }))}
          handlePreferenceChange={(field, value) => setBrandProfileData(prev => ({ ...prev, campaignPreferences: { ...prev.campaignPreferences, [field]: value } }))}
          handleSave={saveBrandProfile}
          savingProfile={savingBrandProfile}
        />
      )}
    </div>
  );
};

export default BrandProfilePage;
