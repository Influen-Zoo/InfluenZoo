# Database Seeding Guide

## Overview

The seeding system automatically populates your MongoDB database with realistic test data. It includes:

- **7 users**: 3 influencers, 3 brands, 1 admin
- **5 campaigns**: Various product campaigns with different budgets and statuses
- **10-15 applications**: Influencer applications to campaigns
- **100+ analytics events**: Campaign engagement data

## Prerequisites

1. **MongoDB Running**
   ```bash
   # Windows (if using MongoDB locally)
   mongod
   
   # Or use MongoDB Atlas cloud connection
   ```

2. **Environment Variables**
   The `.env` file should contain:
   ```
   MONGODB_URI=mongodb://localhost:27017/influenZoo
   PORT=5000
   JWT_SECRET=your_secret_key
   ```

3. **Dependencies Installed**
   ```bash
   npm install
   ```

## Running the Seeder

### Quick Start

```bash
# In the backend directory
npm run seed
```

### What Happens

1. ✅ Connects to MongoDB
2. ✅ Drops all existing collections (clears old data)
3. ✅ Seeds users (with password: `password123`)
4. ✅ Seeds campaigns (linked to brand users)
5. ✅ Seeds applications (influencers → campaigns)
6. ✅ Seeds analytics events
7. ✅ Displays summary with statistics

## Demo Accounts

After running the seeder, you can log in with these test accounts:

### Influencers
- **Email**: priya@example.com | **Password**: password123
- **Email**: alex@example.com | **Password**: password123
- **Email**: sophie@example.com | **Password**: password123

### Brands
- **Email**: brand@novaskin.com | **Password**: password123
- **Email**: brand@techgear.com | **Password**: password123
- **Email**: brand@fitlife.com | **Password**: password123

### Admin
- **Email**: admin@influenZoo.com | **Password**: password123

## Seeder Architecture

### File Structure
```
backend/seeders/
├── index.js                 # Master seeder orchestrator
├── userSeeder.js            # User data (influencers, brands, admin)
├── campaignSeeder.js        # Campaign templates with relationships
├── applicationSeeder.js     # Application workflow data
└── analyticsSeeder.js       # Analytics events and metrics
```

### How It Works

1. **Master Seeder (index.js)**
   - Connects to MongoDB
   - Clears all collections
   - Runs seeders sequentially
   - Passes document references between seeders for relationships
   - Displays final statistics

2. **Individual Seeders**
   - Each seeder exports an async function
   - Returns created documents for relationship mapping
   - Handles errors gracefully
   - Provides console logging with progress indicators

3. **Data Relationships**
   ```
   Users (7)
   ├── Campaigns (5)
   │   ├── assigned to Brands (3)
   │   └── Applications (10-15)
   │       ├── from Influencers (3)
   │       └── Analytics (100+)
   │           └── by Influencers
   └── ChatbotMessages (future)
   ```

## Troubleshooting

### MongoDB Connection Failed
```
❌ Connection failed: connect ECONNREFUSED 127.0.0.1:27017
```
**Solution**: Make sure MongoDB is running
```bash
# Start MongoDB
mongod
```

### Directory/File Not Found
```
Error: Cannot find module ../models/User
```
**Solution**: Make sure you're running from the backend directory
```bash
cd backend
npm run seed
```

### ENOENT: no such file or directory
```
Error: ENOENT: no such file or directory, open '../models/Campaign'
```
**Solution**: Ensure all model files exist in `/backend/models/`

## Data Cleanup

To clean up and reseed with fresh data:

```bash
# Just run the seeder again - it automatically clears collections
npm run seed
```

To connect and query MongoDB directly:
```bash
# Using MongoDB CLI
mongo
use influenZoo
db.users.find()
db.campaigns.find()
```

## Customization

To modify seeded data:

1. Edit individual seeder files in `/backend/seeders/`
2. Modify the data arrays or generation logic
3. Run `npm run seed` to apply changes
4. Previous data will be automatically cleared

### Example: Add More Users

Edit `userSeeder.js`:
```javascript
const users = [
  // ... existing users
  {
    name: 'Your Name',
    email: 'your@example.com',
    password: 'password123',
    role: 'influencer', // or 'brand'
    // ... other fields
  },
];
```

Run seeder:
```bash
npm run seed
```

## Advanced Usage

### Run Seeder Programmatically

In your Node.js code:
```javascript
const { seed, clearCollections } = require('./seeders/index.js');

// Run seeding
await seed();

// Or just clear collections
await clearCollections();
```

### Check Seeded Data Statistics

After running the seeder, check MongoDB:
```bash
mongo
use influenZoo

# Count documents
db.users.countDocuments()
db.campaigns.countDocuments()
db.applications.countDocuments()
db.analytics.countDocuments()

# List users
db.users.find().pretty()

# Find campaigns by brand
db.campaigns.find({ brandId: ObjectId("...") })
```

## Performance Notes

- First run: 5-10 seconds (includes MongoDB connection)
- Subsequent runs: 2-5 seconds (connection reuse)
- Analytics seeding is the slowest part (~100 documents per campaign)
- All operations use `insertMany()` for bulk efficiency

## FAQ

**Q: Can I seed while the server is running?**
A: Yes, but the server may need to restart to see updated data in memory

**Q: How do I seed with custom data?**
A: Edit the seeder files or modify the algorithms to generate data from your sources

**Q: Can I seed to a remote MongoDB?**
A: Yes, update `MONGODB_URI` in `.env` to point to your remote database

**Q: What if I only need to seed campaigns?**
A: Edit `index.js` to comment out other seeders, or run seeders individually

---

**Now you're ready to test your application with realistic data!** 🎉
