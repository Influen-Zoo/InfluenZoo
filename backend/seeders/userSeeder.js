const User = require('../models/User');
const UserBio = require('../models/UserBio');
const UserEducation = require('../models/UserEducation');
const UserWork = require('../models/UserWork');

const categories = ['Fashion', 'Tech', 'Fitness', 'Beauty', 'Travel', 'Food', 'Gaming', 'Lifestyle'];
const cities = ['Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Hyderabad'];
const states = ['Maharashtra', 'Delhi', 'Karnataka', 'Tamil Nadu', 'Telangana'];

const seedUsers = async () => {
    try {
        console.log('🌱 Seeding users (26+ records)...');
        const createdUsers = [];

        // 1. Create Influencers (20 records)
        for (let i = 1; i <= 20; i++) {
            const category = categories[i % categories.length];
            const userData = {
                name: `Influencer ${i}`,
                email: `influencer${i}@example.com`,
                password: 'password123', // Will be hashed by pre-save hook
                role: 'influencer',
                bio: `Passionate ${category} creator sharing daily inspiration and tips. #Influencer${i}`,
                isVerified: i <= 8,
                engagement: parseFloat((Math.random() * 5 + 3).toFixed(1)),
                category,
                coins: Math.floor(Math.random() * 2000) + 100,
                walletBalance: Math.floor(Math.random() * 50000),
                totalEarnings: Math.floor(Math.random() * 100000),
                socialLinks: {
                    instagram: `https://instagram.com/influencer${i}`,
                    youtube: i % 2 === 0 ? `https://youtube.com/@influencer${i}` : undefined,
                    tiktok: i % 3 === 0 ? `https://tiktok.com/@influencer${i}` : undefined,
                },
                niche: [category, 'Lifestyle', 'Content'],
            };

            const user = new User(userData);
            await user.save();
            createdUsers.push(user);

            // Generate Bio
            const bioData = {
                userId: user._id,
                dateOfBirth: new Date(1990 + Math.floor(Math.random() * 20), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1),
                city: cities[i % cities.length],
                state: states[i % states.length],
                country: 'India',
                phone: `+91${9000000000 + i}`,
                about: `Dedicated ${category} professional with a passion for high-quality content creation and community building.`,
                gender: i % 2 === 0 ? 'male' : 'female',
                blueVerified: i <= 5
            };
            const userBio = new UserBio(bioData);
            await userBio.save();
            user.userBio = userBio._id;

            // Add Education
            const edu = new UserEducation({
                userId: user._id,
                schoolName: `${cities[i % cities.length]} University`,
                degree: 'Bachelor',
                fieldOfStudy: i % 2 === 0 ? 'Marketing' : 'Digital Media',
                startDate: new Date(2015, 0),
                endDate: new Date(2019, 5),
            });
            await edu.save();
            user.education.push(edu._id);

            // Add Work
            const work = new UserWork({
                userId: user._id,
                companyName: 'Self-Employed',
                jobTitle: i % 2 === 0 ? 'Full-time Influencer' : 'Content Creator',
                employmentType: 'self-employed',
                startDate: new Date(2019, 6),
                currentlyWorking: true
            });
            await work.save();
            user.work.push(work._id);

            await user.save();
        }

        // 2. Create Brands (5 records)
        const brandNames = ['NovaSkin', 'TechGear', 'FitLife', 'AuraFashion', 'GlobalTravel'];
        const brandIndustries = ['Beauty & Skincare', 'Tech & Consumer Electronics', 'Health & Fitness', 'Fashion & Apparel', 'Travel & Tourism'];
        
        for (let i = 0; i < brandNames.length; i++) {
            const user = new User({
                name: brandNames[i],
                email: `brand${i + 1}@example.com`,
                password: 'password123',
                role: 'brand',
                bio: `Official account for ${brandNames[i]}, a leader in ${brandIndustries[i]}.`,
                isVerified: true,
                coins: Math.floor(Math.random() * 10000) + 5000,
            });
            await user.save();
            createdUsers.push(user);
        }

        // 3. Create Admin
        const admin = new User({
            name: 'Admin User',
            email: 'admin@influenZoo.com',
            password: 'password123',
            role: 'admin',
            isVerified: true
        });
        await admin.save();
        createdUsers.push(admin);

        console.log(`  ✓ Initial ${createdUsers.length} users created`);

        // 4. Poplate followers/following for influencers to ensure non-zero counts
        console.log('  ✓ Populating follower networks...');
        const influencers = createdUsers.filter(u => u.role === 'influencer');
        const allUserIds = createdUsers.map(u => u._id);

        for (const influencer of influencers) {
            // Each influencer followed by 5-15 random users
            const numFollowers = Math.floor(Math.random() * 10) + 5;
            const randomFollowers = [...allUserIds]
                .sort(() => 0.5 - Math.random())
                .slice(0, numFollowers)
                .filter(id => id.toString() !== influencer._id.toString());
            
            influencer.followers = randomFollowers;
            await influencer.save();
        }

        console.log(`✅ ${createdUsers.length} users (20 influencers, 5 brands, 1 admin) seeded and networked successfully`);
        return createdUsers;
    } catch (error) {
        console.error('❌ Error seeding users:', error.message);
        throw error;
    }
};

module.exports = { seedUsers };

