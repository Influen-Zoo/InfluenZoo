import React from 'react';
import { useOutletContext } from 'react-router-dom';
import UserProfile from '../UserProfile';
import EditProfileModal from '../../components/influencer/EditProfileModal';
import LiquidButton from '../../components/common/LiquidButton/LiquidButton';

export const InfluencerProfilePage = () => {
  const { 
    user, 
    logout, 
    editProfileModal, 
    setEditProfileModal, 
    openEditProfileModal,
    profileData,
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
  } = useOutletContext();

  return (
    <div className="tab-container">
      <div className="tab-pane">
        <UserProfile 
          forcedUserId={user?._id} 
          embedded 
          onEditProfile={openEditProfileModal} 
        />
        <div className="profile-signout">
          <LiquidButton variant="error" fullWidth onClick={logout}>
            Sign Out
          </LiquidButton>
        </div>
      </div>

      {editProfileModal && (
        <EditProfileModal 
          profileData={profileData}
          setEditProfileModal={setEditProfileModal}
          handleProfileFieldChange={handleProfileFieldChange}
          handleBioFieldChange={handleBioFieldChange}
          handleSocialLinkChange={handleSocialLinkChange}
          addEducationEntry={addEducationEntry}
          removeEducationEntry={removeEducationEntry}
          handleEducationChange={handleEducationChange}
          addWorkEntry={addWorkEntry}
          removeWorkEntry={removeWorkEntry}
          handleWorkChange={handleWorkChange}
          handleFullProfileSave={handleFullProfileSave}
          savingProfile={savingProfile}
          uploading={uploading}
        />
      )}
    </div>
  );
};

export default InfluencerProfilePage;
