const User = require('../../models/User');
const { generateAccessToken, generateRefreshToken, verifyRefreshToken } = require('../../utils/tokenUtils');

const authService = {
  registerUser: async ({ name, email, password, role }) => {
    // Validation
    if (!name || !email || !password || !role) {
      throw new Error('All fields are required');
    }

    if (!['influencer', 'brand', 'admin'].includes(role)) {
      throw new Error('Invalid role');
    }

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new Error('Email already registered');
    }

    // Create new user
    const user = new User({
      name,
      email,
      password,
      role,
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
