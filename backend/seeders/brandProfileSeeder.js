const BrandProfile = require('../models/BrandProfile');

const seedBrandProfiles = async (userList) => {
    try {
        console.log('🌱 Seeding brand profiles...');

        const brands = userList.filter(u => u.role === 'brand');
        const profiles = [];

        for (const brand of brands) {
            const industry = ['Beauty & Skincare', 'Tech & Gaming', 'Health & Fitness', 'Fashion & Apparel', 'Travel & Tourism'][brand.name.length % 5];
            
            const profileData = {
                userId: brand._id,
                brandName: brand.name,
                industry,
                website: `https://${brand.name.toLowerCase()}.com`,
                companySize: ['1-10', '11-50', '51-200', '201-500', '500+'][brand.name.length % 5],
                foundedYear: 2010 + (brand.name.length % 15),
                headquarters: 'Mumbai, India',
                about: `Official brand profile for ${brand.name}. We specialize in ${industry} and are looking to scale our influencer marketing efforts.`,
                socialLinks: {
                    instagram: `https://instagram.com/${brand.name.toLowerCase()}`,
                    linkedin: `https://linkedin.com/company/${brand.name.toLowerCase()}`,
                },
                contactEmail: `contact@${brand.name.toLowerCase()}.com`,
                campaignPreferences: {
                    budgetRange: '₹50,000 - ₹5,00,000',
                    categories: [industry.split(' ')[0]],
                }
            };

            const profile = new BrandProfile(profileData);
            await profile.save();
            profiles.push(profile);
        }

        console.log(`✅ ${profiles.length} brand profiles seeded successfully`);
        return profiles;
    } catch (error) {
        console.error('❌ Error seeding brand profiles:', error.message);
        throw error;
    }
};

module.exports = { seedBrandProfiles };
