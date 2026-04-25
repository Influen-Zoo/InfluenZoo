// In-memory data store (replaces database for demo)
const bcrypt = require('bcryptjs');

const hashedPassword = bcrypt.hashSync('password123', 10);

const users = [
  {
    id: 'u1',
    name: 'Priya Sharma',
    email: 'priya@example.com',
    password: hashedPassword,
    role: 'influencer',
    avatar: null,
    bio: 'Lifestyle & Travel content creator with 5+ years of experience creating engaging content.',
    followers: 125000,
    engagementRate: 4.8,
    platforms: ['Instagram', 'YouTube'],
    niche: ['Lifestyle', 'Travel'],
    location: 'Mumbai, India',
    portfolio: [],
    verified: true,
    status: 'active',
    coins: 500,
    banner: 'https://picsum.photos/1200/400',
    createdAt: '2024-01-15T10:00:00Z'
  },
  {
    id: 'u2',
    name: 'Arjun Mehta',
    email: 'arjun@example.com',
    password: hashedPassword,
    role: 'influencer',
    avatar: null,
    bio: 'Tech reviewer and gadget enthusiast. Passionate about making tech accessible.',
    followers: 89000,
    engagementRate: 5.2,
    platforms: ['YouTube', 'Twitter'],
    niche: ['Tech', 'Gadgets'],
    location: 'Bangalore, India',
    portfolio: [],
    verified: true,
    status: 'active',
    coins: 200,
    banner: null,
    createdAt: '2024-02-20T10:00:00Z'
  },
  {
    id: 'u3',
    name: 'Sneha Patel',
    email: 'sneha@example.com',
    password: hashedPassword,
    role: 'influencer',
    avatar: null,
    bio: 'Fitness coach and nutrition expert helping people transform their lives.',
    followers: 210000,
    engagementRate: 6.1,
    platforms: ['Instagram', 'YouTube', 'TikTok'],
    niche: ['Fitness', 'Health'],
    location: 'Delhi, India',
    portfolio: [],
    verified: true,
    status: 'active',
    coins: 1500,
    banner: null,
    createdAt: '2024-01-05T10:00:00Z'
  },
  {
    id: 'u4',
    name: 'Rahul Kumar',
    email: 'rahul@example.com',
    password: hashedPassword,
    role: 'influencer',
    avatar: null,
    bio: 'Food blogger exploring India one bite at a time. Featured in Zomato & Swiggy.',
    followers: 56000,
    engagementRate: 7.3,
    platforms: ['Instagram'],
    niche: ['Food', 'Travel'],
    location: 'Chennai, India',
    portfolio: [],
    verified: false,
    status: 'active',
    coins: 50,
    banner: null,
    createdAt: '2024-03-10T10:00:00Z'
  },
  {
    id: 'u5',
    name: 'Ananya Das',
    email: 'ananya@example.com',
    password: hashedPassword,
    role: 'influencer',
    avatar: null,
    bio: 'Fashion & beauty content creator. Collaborating with top D2C brands.',
    followers: 175000,
    engagementRate: 5.5,
    platforms: ['Instagram', 'YouTube'],
    niche: ['Fashion', 'Beauty'],
    location: 'Kolkata, India',
    portfolio: [],
    verified: true,
    status: 'active',
    coins: 800,
    banner: null,
    createdAt: '2024-02-01T10:00:00Z'
  },
  // Brands
  {
    id: 'b1',
    name: 'NovaSkin Cosmetics',
    email: 'brand@novaskin.com',
    password: hashedPassword,
    role: 'brand',
    avatar: null,
    company: 'NovaSkin Cosmetics Pvt Ltd',
    industry: 'Beauty & Skincare',
    website: 'https://novaskin.com',
    description: 'Premium skincare brand bringing science-backed beauty solutions to India.',
    status: 'active',
    verified: true,
    createdAt: '2024-01-10T10:00:00Z'
  },
  {
    id: 'b2',
    name: 'FitFuel Nutrition',
    email: 'brand@fitfuel.com',
    password: hashedPassword,
    role: 'brand',
    avatar: null,
    company: 'FitFuel India',
    industry: 'Health & Nutrition',
    website: 'https://fitfuel.in',
    description: 'India\'s fastest growing plant-based nutrition brand for fitness enthusiasts.',
    status: 'active',
    verified: true,
    createdAt: '2024-01-20T10:00:00Z'
  },
  {
    id: 'b3',
    name: 'WanderGear',
    email: 'brand@wandergear.com',
    password: hashedPassword,
    role: 'brand',
    avatar: null,
    company: 'WanderGear Adventures',
    industry: 'Travel & Outdoor',
    website: 'https://wandergear.co',
    description: 'Adventure travel gear designed for the modern Indian explorer.',
    status: 'active',
    verified: true,
    createdAt: '2024-02-15T10:00:00Z'
  },
  {
    id: 'b4',
    name: 'PixelCraft Studios',
    email: 'brand@pixelcraft.com',
    password: hashedPassword,
    role: 'brand',
    avatar: null,
    company: 'PixelCraft Studios',
    industry: 'Tech & Gaming',
    website: 'https://pixelcraft.io',
    description: 'Indie game studio creating immersive mobile experiences.',
    status: 'pending',
    verified: false,
    createdAt: '2024-03-25T10:00:00Z'
  },
  {
    id: 'b5',
    name: 'Urban Lifestyle',
    email: 'brand@urbanlifestyle.com',
    password: hashedPassword,
    role: 'brand',
    avatar: null,
    company: 'Urban Lifestyle Pvt Ltd',
    industry: 'Fashion & Apparel',
    website: 'https://urbanlifestyle.in',
    description: 'Modern, sustainable streetwear brand for millennials.',
    status: 'active',
    verified: true,
    createdAt: '2024-04-05T10:00:00Z'
  },
  // Admin
  {
    id: 'a1',
    name: 'Admin User',
    email: 'admin@influenZoo.com',
    password: hashedPassword,
    role: 'admin',
    avatar: null,
    status: 'active',
    verified: true,
    createdAt: '2024-01-01T10:00:00Z'
  },
  {
    id: 'a2',
    name: 'Super Admin',
    email: 'superadmin@influenZoo.com',
    password: hashedPassword,
    role: 'admin',
    avatar: null,
    status: 'active',
    verified: true,
    createdAt: '2024-02-01T10:00:00Z'
  }
];

const campaigns = [
  {
    id: 'c1',
    brandId: 'b1',
    brandName: 'NovaSkin Cosmetics',
    title: 'Summer Glow Launch Campaign',
    description: 'We\'re launching our new Summer Glow skincare line and looking for beauty influencers to create authentic content showcasing the products. We need Instagram reels and stories that highlight the products\' benefits.',
    budget: 25000,
    type: 'paid',
    coinCost: 50,
    platform: ['Instagram'],
    category: 'Beauty',
    requirements: {
      minFollowers: 50000,
      niche: ['Beauty', 'Skincare', 'Lifestyle'],
      location: 'India',
      deliverables: '3 Instagram Reels + 5 Stories'
    },
    status: 'active',
    featured: true,
    applicants: ['u1', 'u5'],
    acceptedInfluencers: ['u5'],
    startDate: '2024-04-01',
    endDate: '2024-04-30',
    createdAt: '2024-03-15T10:00:00Z'
  },
  {
    id: 'c2',
    brandId: 'b2',
    brandName: 'FitFuel Nutrition',
    title: 'Protein Bar Product Review',
    description: 'Looking for fitness influencers to review our new range of protein bars. Honest reviews with workout integration content preferred. We want genuine feedback and creative content.',
    budget: 15000,
    type: 'paid',
    coinCost: 30,
    platform: ['YouTube', 'Instagram'],
    category: 'Fitness',
    requirements: {
      minFollowers: 30000,
      niche: ['Fitness', 'Health', 'Nutrition'],
      location: 'India',
      deliverables: '1 YouTube Video + 2 Instagram Posts'
    },
    status: 'active',
    featured: false,
    applicants: ['u3', 'u1'],
    acceptedInfluencers: ['u3'],
    startDate: '2024-04-05',
    endDate: '2024-05-05',
    createdAt: '2024-03-20T10:00:00Z'
  },
  {
    id: 'c3',
    brandId: 'b3',
    brandName: 'WanderGear',
    title: 'Himalayan Trek Content Collaboration',
    description: 'Join us on a sponsored trek to the Himalayas! We need adventure content creators to document the journey using our gear. All travel expenses covered plus content fee.',
    budget: 50000,
    type: 'paid',
    coinCost: 100,
    platform: ['YouTube', 'Instagram'],
    category: 'Travel',
    requirements: {
      minFollowers: 80000,
      niche: ['Travel', 'Adventure', 'Outdoor'],
      location: 'India',
      deliverables: '2 YouTube Vlogs + 10 Instagram Posts/Stories'
    },
    status: 'active',
    featured: true,
    applicants: ['u1'],
    acceptedInfluencers: [],
    startDate: '2024-05-01',
    endDate: '2024-05-15',
    createdAt: '2024-03-25T10:00:00Z'
  },
  {
    id: 'c4',
    brandId: 'b4',
    brandName: 'PixelCraft Studios',
    title: 'Mobile Game Beta Launch',
    description: 'We\'re looking for gaming content creators to showcase our new mobile game. Free products and early access provided. Great opportunity for growing channels!',
    budget: 0,
    type: 'free',
    coinCost: 10,
    platform: ['YouTube', 'Twitter'],
    category: 'Gaming',
    requirements: {
      minFollowers: 10000,
      niche: ['Gaming', 'Tech'],
      location: 'Any',
      deliverables: '1 Gameplay Video + Social Posts'
    },
    status: 'pending',
    featured: false,
    applicants: ['u2'],
    acceptedInfluencers: [],
    startDate: '2024-04-15',
    endDate: '2024-05-15',
    createdAt: '2024-03-28T10:00:00Z'
  },
  {
    id: 'c5',
    brandId: 'b1',
    brandName: 'NovaSkin Cosmetics',
    title: 'Monsoon Skincare Routine Videos',
    description: 'Create monsoon-specific skincare routine content featuring our hydrating range. Looking for influencers who can make educational yet entertaining content.',
    budget: 18000,
    type: 'paid',
    coinCost: 40,
    platform: ['Instagram', 'YouTube'],
    category: 'Beauty',
    requirements: {
      minFollowers: 40000,
      niche: ['Beauty', 'Skincare'],
      location: 'India',
      deliverables: '2 Reels + 1 YouTube Short'
    },
    status: 'active',
    featured: false,
    applicants: ['u5', 'u1'],
    acceptedInfluencers: [],
    startDate: '2024-06-01',
    endDate: '2024-07-31',
    createdAt: '2024-04-01T10:00:00Z'
  },
  {
    id: 'c6',
    brandId: 'b2',
    brandName: 'FitFuel Nutrition',
    title: 'Vegan Supplement Ambassador Program',
    description: 'Long-term ambassador program for fitness influencers passionate about plant-based nutrition. Monthly product supply + commission on sales.',
    budget: 35000,
    type: 'paid',
    coinCost: 75,
    platform: ['Instagram', 'YouTube', 'TikTok'],
    category: 'Fitness',
    requirements: {
      minFollowers: 100000,
      niche: ['Fitness', 'Health', 'Vegan'],
      location: 'India',
      deliverables: '4 Posts/Month + Stories'
    },
    status: 'active',
    featured: true,
    applicants: ['u3'],
    acceptedInfluencers: [],
    startDate: '2024-04-01',
    endDate: '2024-12-31',
    createdAt: '2024-03-30T10:00:00Z'
  }
];

const applications = [
  {
    id: 'app1',
    campaignId: 'c1',
    influencerId: 'u1',
    message: 'I\'d love to collaborate! My audience loves skincare content and I have great engagement on beauty posts.',
    status: 'pending',
    createdAt: '2024-03-16T10:00:00Z'
  },
  {
    id: 'app2',
    campaignId: 'c1',
    influencerId: 'u5',
    message: 'Beauty is my forte! Check my portfolio for recent brand collaborations.',
    status: 'accepted',
    createdAt: '2024-03-16T12:00:00Z'
  },
  {
    id: 'app3',
    campaignId: 'c2',
    influencerId: 'u3',
    message: 'As a certified fitness trainer, I can create genuine review content with workout integration.',
    status: 'accepted',
    createdAt: '2024-03-21T10:00:00Z'
  },
  {
    id: 'app4',
    campaignId: 'c2',
    influencerId: 'u1',
    message: 'Fitness is part of my lifestyle content. Would love to integrate this naturally!',
    status: 'pending',
    createdAt: '2024-03-22T10:00:00Z'
  },
  {
    id: 'app5',
    campaignId: 'c3',
    influencerId: 'u1',
    message: 'Trekking is my passion! I\'ve done 12 Himalayan treks and my audience loves adventure content.',
    status: 'pending',
    createdAt: '2024-03-26T10:00:00Z'
  },
  {
    id: 'app6',
    campaignId: 'c4',
    influencerId: 'u2',
    message: 'I run a dedicated mobile gaming channel with 89K subscribers. Perfect fit!',
    status: 'pending',
    createdAt: '2024-03-29T10:00:00Z'
  },
  {
    id: 'app7',
    campaignId: 'c5',
    influencerId: 'u5',
    message: 'Skincare routines are my most viewed content type. Would create amazing monsoon content.',
    status: 'pending',
    createdAt: '2024-04-02T10:00:00Z'
  },
  {
    id: 'app8',
    campaignId: 'c6',
    influencerId: 'u3',
    message: 'I\'m already vegan and use similar supplements. This would be a perfect long-term partnership!',
    status: 'pending',
    createdAt: '2024-04-01T10:00:00Z'
  }
];

const notifications = [
  {
    id: 'n1',
    userId: 'u1',
    title: 'New Campaign Match',
    message: 'NovaSkin Cosmetics posted a campaign matching your niche!',
    type: 'campaign',
    read: false,
    createdAt: '2024-04-01T10:00:00Z'
  },
  {
    id: 'n2',
    userId: 'u5',
    title: 'Application Accepted!',
    message: 'Your application for "Summer Glow Launch Campaign" has been accepted.',
    type: 'accepted',
    read: false,
    createdAt: '2024-03-28T10:00:00Z'
  },
  {
    id: 'n3',
    userId: 'u3',
    title: 'Application Accepted!',
    message: 'FitFuel Nutrition accepted you for "Protein Bar Product Review".',
    type: 'accepted',
    read: true,
    createdAt: '2024-03-25T10:00:00Z'
  },
  {
    id: 'n4',
    userId: 'b1',
    title: 'New Application',
    message: 'Priya Sharma applied to your "Summer Glow Launch Campaign".',
    type: 'application',
    read: false,
    createdAt: '2024-03-16T10:00:00Z'
  },
  {
    id: 'n5',
    userId: 'b2',
    title: 'Campaign Going Viral',
    message: 'Your "Protein Bar Product Review" has received 5 applications!',
    type: 'milestone',
    read: true,
    createdAt: '2024-03-24T10:00:00Z'
  }
];

const disputes = [
  {
    id: 'd1',
    reporterId: 'u1',
    reportedId: 'b4',
    campaignId: 'c4',
    reason: 'Delayed payment for completed deliverables',
    description: 'I completed all deliverables on time but haven\'t received payment after 30 days.',
    status: 'open',
    createdAt: '2024-03-20T10:00:00Z'
  },
  {
    id: 'd2',
    reporterId: 'b1',
    reportedId: 'u4',
    campaignId: 'c1',
    reason: 'Content quality below agreed standards',
    description: 'The delivered content did not match the brief quality requirements.',
    status: 'resolved',
    resolution: 'Partial refund issued. Influencer agreed to re-shoot content.',
    createdAt: '2024-03-10T10:00:00Z'
  }
];

const transactions = [];

// Helper to generate IDs
let idCounter = 100;
const generateId = (prefix) => `${prefix}${++idCounter}`;

module.exports = { users, campaigns, applications, notifications, disputes, transactions, generateId };
