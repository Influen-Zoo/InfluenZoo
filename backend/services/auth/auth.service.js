const User = require('../../models/User');
const { generateAccessToken, generateRefreshToken, verifyRefreshToken } = require('../../utils/tokenUtils');

const generateReferralCode = (name = '') => {
  const prefix = String(name)
    .replace(/[^a-zA-Z0-9]/g, '')
    .slice(0, 4)
    .toUpperCase() || 'USER';
  return `${prefix}${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
};

const createUniqueReferralCode = async (name) => {
  for (let attempt = 0; attempt < 8; attempt += 1) {
    const code = generateReferralCode(name);
    const existing = await User.exists({ referralCode: code });
    if (!existing) return code;
  }
  return `${Date.now().toString(36).toUpperCase()}${Math.random().toString(36).slice(2, 5).toUpperCase()}`;
};

const authService = {
  registerUser: async (payload = {}) => {
    const { name, email, password, role } = payload;
    const phone = String(payload.phone || payload.phoneNumber || payload.mobile || '')
      .replace(/\D/g, '')
      .trim();
    const referralInput = String(payload.referralCode || payload.referral || '').trim().toUpperCase();

    // Validation
    if (!name || !email || !phone || !password || !role) {
      throw new Error('All fields are required');
    }

    if (!/^\d{10}$/.test(phone)) {
      throw new Error('Phone number must be exactly 10 digits');
    }

    if (!['influencer', 'brand', 'admin'].includes(role)) {
      throw new Error('Invalid role');
    }

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new Error('Email already registered');
    }

    let referrer = null;
    if (referralInput) {
      referrer = await User.findOne({ referralCode: referralInput }).select('_id');
      if (!referrer) {
        throw new Error('Invalid referral code');
      }
    }

    // Create new user
    const user = new User({
      name,
      email,
      phone,
      password,
      role,
      referralCode: await createUniqueReferralCode(name),
      referredBy: referrer?._id,
    });

    await user.save();

    // Generate tokens
    const accessToken = generateAccessToken(user._id, user.role);
    const refreshToken = generateRefreshToken(user._id);

    // Persist session token without re-validating unrelated document fields.
    await User.updateOne(
      { _id: user._id },
      { $set: { refreshToken } },
      { runValidators: false }
    );

    user.refreshToken = refreshToken;

    return {
      accessToken,
      refreshToken,
      user: user.toJSON(),
    };
  },

  loginUser: async ({ email, password }) => {
    // Validation
    if (!email || !password) {
      throw new Error('Email and password are required');
    }

    // Find user
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      throw new Error('Invalid email or password');
    }

    if (user.status === 'banned') {
      throw new Error('User is blocked');
    }

    // Check password
    const isPasswordCorrect = await user.comparePassword(password);
    if (!isPasswordCorrect) {
      throw new Error('Invalid email or password');
    }

    const lastLogin = new Date();

    // Generate tokens
    const accessToken = generateAccessToken(user._id, user.role);
    const refreshToken = generateRefreshToken(user._id);

    // Avoid document-wide validation here so legacy seeded users can still log in.
    await User.updateOne(
      { _id: user._id },
      { $set: { refreshToken, lastLogin } },
      { runValidators: false }
    );

    user.refreshToken = refreshToken;
    user.lastLogin = lastLogin;

    return {
      accessToken,
      refreshToken,
      user: user.toJSON(),
    };
  },

  refreshToken: async (refreshToken) => {
    if (!refreshToken) {
      throw new Error('Refresh token required');
    }

    // Verify refresh token
    const decoded = verifyRefreshToken(refreshToken);
    const user = await User.findById(decoded.userId);

    if (!user || user.refreshToken !== refreshToken) {
      throw new Error('Invalid refresh token');
    }
    if (user.status === 'banned') {
      throw new Error('User is blocked');
    }

    // Generate new tokens
    const newAccessToken = generateAccessToken(user._id, user.role);
    const newRefreshToken = generateRefreshToken(user._id);

    await User.updateOne(
      { _id: user._id },
      { $set: { refreshToken: newRefreshToken } },
      { runValidators: false }
    );

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    };
  },

  logoutUser: async (userId) => {
    await User.updateOne(
      { _id: userId },
      { $set: { refreshToken: null } },
      { runValidators: false }
    );
    return { success: true };
  },

  getMe: async (userId) => {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }
    return user.toJSON();
  }
};

module.exports = authService;
