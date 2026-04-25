const Post = require('../models/Post');

const postContents = [
    'Just finished an amazing photo shoot for my new skincare line! 📸✨ #beauty #skincare #influencerlife',
    'Can\'t believe how excited I am about this new tech gadget! 🚀 #tech #innovation #unboxing',
    'Morning gym session done! 💪 Stay consistent, stay strong! #fitness #gym #motivation',
    'Summer vibes at the beach! 🌊☀️ Nothing beats sand and sun! #travel #beach #vacation',
    'New fashion haul is live on my channel! 👗👠 Check it out and let me know what you think! #fashion #haul #styling',
    'Trying this viral skincare routine for the first time - WOW! The results are insane! #skincare #viral #beauty',
    'Just launched my new product line today! So grateful for all the support! 🙏💕 #entrepreneur #newlaunch #blessed',
    'Weekend plans: editing videos and planning next month\'s content 📹✍️ #content #creator #grind',
    'This coffee is exactly what I needed this morning ☕️ #coffee #morningmotivation #lifestyle',
    'Throwback to that amazing trip to Bali 🌴 Thinking about going back already! #travel #throwback #bali',
    'Just reached a new follower milestone! Thank you all for the love and support! 💖📈 #grateful #milestone #community',
    'Trying out a new gym routine and I\'m loving the results already! #fitnessgains #gymmotivation #healthy',
    'New blog post is up! Check it out on the link in bio 🔗 #blogging #contentcreator #newpost',
    'This new camera gives such amazing quality! So worth the investment 📷 #photography #gear #quality',
    'Meal prep Sunday is my favorite day! 🍱 Staying consistent with nutrition #mealprep #healthy #fitness',
    'Walking through the beautiful streets of Paris. The architecture is stunning! 🇫🇷 #travel #adventure #exploration',
    'My night routine for clear skin. Consistency is key! 🌙✨ #skincare #nightroutine #beautyhacks',
    'Unboxing the latest gaming laptop. The performance is out of this world! ⌨️🖱️ #gaming #tech #setup',
];

const getSampleMediaByCategory = (category) => {
    const mediaOptions = {
        image: [
            { url: 'https://images.unsplash.com/photo-1611339555312-e607c04352fa?w=500', type: 'image' },
            { url: 'https://images.unsplash.com/photo-1606399261213-1581c1bb62b1?w=500', type: 'image' },
            { url: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=500', type: 'image' },
            { url: 'https://images.unsplash.com/photo-1502602898657-3e91724ae33e?w=500', type: 'image' },
            { url: 'https://images.unsplash.com/photo-1492633423870-43d1cd2775eb?w=500', type: 'image' },
        ],
        video: [
            { url: 'https://storage.googleapis.com/demo-videos/sample.mp4', type: 'video' },
        ],
        gif: [
            { url: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=500', type: 'image' },
        ],
    };

    const type = category || 'image';
    const options = mediaOptions[type] || mediaOptions.image;
    return options[Math.floor(Math.random() * options.length)];
};

const seedPosts = async (users) => {
    try {
        console.log('🌱 Seeding posts (80+ records)...');

        if (!users || users.length === 0) {
            console.log('  ⚠️  No users available for posts');
            return [];
        }

        const influencers = users.filter(u => u.role === 'influencer');
        const allUserIds = users.map(u => u._id);
        const posts = [];
        const mediaTypes = ['image', 'image', 'image', 'video', 'gif']; // Bias towards images
        const tags = ['influencer', 'content', 'creator', 'viral', 'trending', 'instagood', 'photography', 'lifestyle', 'collab', 'success'];

        for (const influencer of influencers) {
            const numPosts = Math.floor(Math.random() * 4) + 4; // 4-7 posts per influencer

            for (let i = 0; i < numPosts; i++) {
                const randomMediaType = mediaTypes[Math.floor(Math.random() * mediaTypes.length)];
                const selectedMedia = getSampleMediaByCategory(randomMediaType);

                // Generate random likes (subset of users)
                const numLikes = Math.floor(Math.random() * (allUserIds.length / 2));
                const randomLikes = [...allUserIds].sort(() => 0.5 - Math.random()).slice(0, numLikes);

                const post = new Post({
                    author: influencer._id,
                    content: postContents[Math.floor(Math.random() * postContents.length)],
                    category: ['Fashion', 'Tech', 'Fitness', 'Beauty', 'Food', 'Travel', 'Lifestyle'][Math.floor(Math.random() * 7)],
                    media: [selectedMedia],
                    tags: tags.sort(() => 0.5 - Math.random()).slice(0, Math.floor(Math.random() * 4) + 2),
                    likes: randomLikes,
                    comments: [
                        { user: allUserIds[Math.floor(Math.random() * allUserIds.length)], text: 'Amazing content! 🔥' },
                        { user: allUserIds[Math.floor(Math.random() * allUserIds.length)], text: 'Love this vibe. ✨' },
                    ],
                    createdAt: new Date(Date.now() - Math.random() * 45 * 24 * 60 * 60 * 1000),
                });

                await post.save();
                posts.push(post);
            }
        }

        console.log(`  ✅ Created ${posts.length} posts seeded successfully`);
        return posts;
    } catch (error) {
        console.error('  ❌ Error seeding posts:', error.message);
        throw error;
    }
};

module.exports = { seedPosts };

