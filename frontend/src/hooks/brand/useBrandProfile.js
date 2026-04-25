import { useState, useCallback } from 'react';
import brandService from '../../services/brand.service';

export const useBrandProfile = (user, showToast) => {
  const [brandProfileData, setBrandProfileData] = useState({
    brandName: '', industrial: '', website: '', companySize: '',
    foundedYear: '', headquarters: '', location: '', address: '',
    city: '', state: '', country: '', zipCode: '', hometown: '',
    about: '', contactEmail: '', phone: '',
    socialLinks: { instagram: '', linkedin: '', twitter: '' },
    campaignPreferences: { budgetRange: '', categories: [] }
  });
  const [editBrandProfileModal, setEditBrandProfileModal] = useState(false);
  const [savingBrandProfile, setSavingBrandProfile] = useState(false);
  const [uploading, setUploading] = useState(false);

  const openEditProfile = useCallback(async () => {
    try {
      const data = await brandService.getBrandProfile();
      setBrandProfileData({
        brandName: data.brandName || '',
        industry: data.industry || '',
        website: data.website || '',
        companySize: data.companySize || '',
        foundedYear: data.foundedYear || '',
        headquarters: data.headquarters || '',
        location: data.location || '',
        address: data.address || '',
        city: data.city || '',
        state: data.state || '',
        country: data.country || '',
        zipCode: data.zipCode || '',
        hometown: data.hometown || '',
        about: data.about || '',
        contactEmail: data.contactEmail || '',
        phone: data.phone || '',
        socialLinks: data.socialLinks || { instagram: '', linkedin: '', twitter: '' },
        campaignPreferences: data.campaignPreferences || { budgetRange: '', categories: [] }
      });
      setEditBrandProfileModal(true);
    } catch (e) {
      showToast('Failed to load profile', 'danger');
    }
  }, [showToast]);

  const saveBrandProfile = async () => {
    try {
      setSavingBrandProfile(true);
      await brandService.updateBrandProfile(brandProfileData);
      showToast('Profile updated! ✨');
      setEditBrandProfileModal(false);
      setTimeout(() => window.location.reload(), 1000);
    } catch (e) {
      showToast(e.message, 'danger');
    } finally {
      setSavingBrandProfile(false);
    }
  };

  return {
    brandProfileData,
    setBrandProfileData,
    editBrandProfileModal,
    setEditBrandProfileModal,
    savingBrandProfile,
    uploading,
    setUploading,
    openEditProfile,
    saveBrandProfile
  };
};

export default useBrandProfile;
