const Notification = require('../models/Notification');

const seedNotifications = async (userList, campaignList, applicationList) => {
    try {
        console.log('🌱 Seeding notifications (40+ records)...');

        const notifications = [];
        const types = ['message', 'application', 'system', 'campaign'];

        for (let i = 0; i < 50; i++) {
            const recipient = userList[i % userList.length];
            const type = types[i % types.length];
            
            let title = 'System Notification';
            let message = 'This is a test notification from the system.';
            let relatedId = null;

            if (type === 'application') {
                title = 'New Application Received';
                message = 'An influencer has applied to your campaign.';
                relatedId = applicationList[i % applicationList.length]._id;
            } else if (type === 'campaign') {
                title = 'New Campaign Match';
                message = 'A new campaign matching your profile is live!';
                relatedId = campaignList[i % campaignList.length]._id;
            } else if (type === 'message') {
                title = 'New Message';
                message = 'You have a new unread message.';
            }

            notifications.push({
                recipient: recipient._id,
                type: type,
                title: title,
                message: `${message} (#${i + 1})`,
                read: i % 3 === 0,
                relatedId: relatedId,
            });
        }

        const createdNotifications = await Notification.insertMany(notifications);
        console.log(`✅ ${createdNotifications.length} notifications seeded successfully`);
        return createdNotifications;
    } catch (error) {
        console.error('❌ Error seeding notifications:', error.message);
        throw error;
    }
};

module.exports = { seedNotifications };
