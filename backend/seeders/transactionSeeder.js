const Transaction = require('../models/Transaction');

const seedTransactions = async (userList, campaignList) => {
    try {
        console.log('🌱 Seeding transactions (40+ records)...');

        const transactions = [];
        const types = ['topup', 'withdraw', 'earning', 'deduction'];
        const assets = ['coins', 'money'];

        for (let i = 0; i < 60; i++) {
            const user = userList[i % userList.length];
            const type = types[i % types.length];
            // Stagger mapping to ensure all combinations (e.g. earning + money) exist
            const asset = assets[(i + Math.floor(i / types.length)) % assets.length];
            const amount = Math.floor(Math.random() * 5000) + 100;
            
            let description = 'Test transaction';
            if (type === 'earning') description = 'Campaign payout for completion.';
            else if (type === 'topup') description = 'Wallet topup via card.';
            else if (type === 'withdraw') description = 'Withdrawal to bank account.';
            else if (type === 'deduction') description = 'Platform subscription fee.';

            transactions.push({
                user: user._id,
                type: type,
                amount: amount,
                asset: asset,
                status: 'completed',
                description: `${description} (#${i + 1})`,
                referenceId: campaignList[i % campaignList.length]._id,
                referenceModel: 'Campaign',
                createdAt: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000),
            });
        }

        const createdTransactions = await Transaction.insertMany(transactions);
        console.log(`✅ ${createdTransactions.length} transactions seeded successfully`);
        return createdTransactions;
    } catch (error) {
        console.error('❌ Error seeding transactions:', error.message);
        throw error;
    }
};

module.exports = { seedTransactions };
