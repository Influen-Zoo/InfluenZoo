import { useState, useCallback } from 'react';
import influencerService from '../../services/influencer.service';
import { toDateInput } from '../../utils/helpers';
import { SOCIAL_PLATFORMS } from '../../constants/common';

const createEmptyUserBio = () => ({
  about: '', dateOfBirth: '', gender: '', relationshipStatus: 'not-specified',
  phone: '', website: '', address: '', city: '', state: '', country: '',
  zipCode: '', hometown: '', currentCity: '', pronouns: '',
  hobbiesText: '', interestsText: '', languagesText: '',
});

const createEmptyEducation = () => ({
  schoolName: '', degree: '', fieldOfStudy: '', startDate: '', endDate: '',
  currentlyStudying: false, description: '', grade: '', activitiesText: '',
});

const createEmptyWork = () => ({
  companyName: '', jobTitle: '', employmentType: '', location: '',
  startDate: '', endDate: '', currentlyWorking: false, description: '', skillsText: '',
});

const splitCsv = (str) => {
  if (!str) return [];
  return str.split(',').map((s) => s.trim()).filter(Boolean);
};

export const useInfluencerProfile = (user, showToast) => {
  const [profileData, setProfileData] = useState({
    name: '', bio: '', location: '', banner: '', category: '', nicheText: '',
    socialLinks: {}, userBio: createEmptyUserBio(), education: [], work: [],
  });
  const [removedEducationIds, setRemovedEducationIds] = useState([]);
  const [removedWorkIds, setRemovedWorkIds] = useState([]);
  const [savingProfile, setSavingProfile] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [editProfileModal, setEditProfileModal] = useState(false);

  const openEditProfileModal = useCallback(async () => {
    try {
      const data = await influencerService.getFullProfile(user._id);
      setRemovedEducationIds([]);
      setRemovedWorkIds([]);
      setProfileData({
        name: data.name || '',
        bio: data.bio || '',
        location: data.location || '',
        banner: data.banner || '',
        category: data.category || '',
        nicheText: Array.isArray(data.niche) ? data.niche.join(', ') : '',
        socialLinks: SOCIAL_PLATFORMS.reduce((acc, platform) => {
          acc[platform] = data.socialLinks?.[platform] || '';
          return acc;
        }, {}),
        userBio: {
          ...createEmptyUserBio(),
          ...data.userBio,
          dateOfBirth: toDateInput(data.userBio?.dateOfBirth),
          hobbiesText: Array.isArray(data.userBio?.hobbies) ? data.userBio.hobbies.join(', ') : '',
          interestsText: Array.isArray(data.userBio?.interests) ? data.userBio.interests.join(', ') : '',
          languagesText: Array.isArray(data.userBio?.languages) ? data.userBio.languages.join(', ') : '',
        },
        education: Array.isArray(data.education)
          ? data.education.map((item) => ({
              ...createEmptyEducation(),
              ...item,
              startDate: toDateInput(item.startDate),
              endDate: toDateInput(item.endDate),
              activitiesText: Array.isArray(item.activities) ? item.activities.join(', ') : '',
            }))
          : [],
        work: Array.isArray(data.work)
          ? data.work.map((item) => ({
              ...createEmptyWork(),
              ...item,
              startDate: toDateInput(item.startDate),
              endDate: toDateInput(item.endDate),
              skillsText: Array.isArray(item.skills) ? item.skills.join(', ') : '',
            }))
          : [],
      });
      setEditProfileModal(true);
    } catch (e) {
      showToast('Failed to load profile details', 'danger');
    }
  }, [user?._id, showToast]);

  const handleFullProfileSave = async () => {
    try {
      setSavingProfile(true);
      const socialLinks = Object.entries(profileData.socialLinks || {}).reduce((acc, [platform, value]) => {
        if (value?.trim()) acc[platform] = value.trim();
        return acc;
      }, {});

      await influencerService.updateProfile({
        name: profileData.name, bio: profileData.bio, location: profileData.location,
        banner: profileData.banner, category: profileData.category,
        niche: splitCsv(profileData.nicheText), socialLinks,
      });

      await influencerService.saveUserBio({
        ...profileData.userBio,
        hobbies: splitCsv(profileData.userBio.hobbiesText),
        interests: splitCsv(profileData.userBio.interestsText),
        languages: splitCsv(profileData.userBio.languagesText),
      });

      await Promise.all(removedEducationIds.map(id => influencerService.deleteEducation(id)));
      await Promise.all(profileData.education.filter(item => item.schoolName?.trim()).map(item => {
        const payload = { ...item, activities: splitCsv(item.activitiesText) };
        return item._id ? influencerService.updateEducation(item._id, payload) : influencerService.addEducation(payload);
      }));

      await Promise.all(removedWorkIds.map(id => influencerService.deleteWork(id)));
      await Promise.all(profileData.work.filter(item => item.companyName?.trim()).map(item => {
        const payload = { ...item, skills: splitCsv(item.skillsText) };
        return item._id ? influencerService.updateWork(item._id, payload) : influencerService.addWork(payload);
      }));

      showToast('Profile updated successfully! ✨');
      setEditProfileModal(false);
      setTimeout(() => window.location.reload(), 1000);
    } catch (e) {
      showToast(e.message, 'danger');
    } finally {
      setSavingProfile(false);
    }
  };

  return {
    profileData, setProfileData,
    savingProfile, uploading, setUploading,
    editProfileModal, setEditProfileModal,
    openEditProfileModal, handleFullProfileSave,
    addEducationEntry: () => setProfileData(prev => ({ ...prev, education: [...prev.education, createEmptyEducation()] })),
    removeEducationEntry: (index) => setProfileData(prev => {
      const removed = prev.education[index];
      if (removed._id) setRemovedEducationIds(r => [...r, removed._id]);
      return { ...prev, education: prev.education.filter((_, i) => i !== index) };
    }),
    addWorkEntry: () => setProfileData(prev => ({ ...prev, work: [...prev.work, createEmptyWork()] })),
    removeWorkEntry: (index) => setProfileData(prev => {
      const removed = prev.work[index];
      if (removed._id) setRemovedWorkIds(r => [...r, removed._id]);
      return { ...prev, work: prev.work.filter((_, i) => i !== index) };
    }),
  };
};

export default useInfluencerProfile;
