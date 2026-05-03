const authService = require('../../services/auth/auth.service');

const authController = {
  register: async (req, res) => {
    try {
      const data = await authService.registerUser(req.body);
      res.status(201).json({ success: true, ...data });
    } catch (error) {
      console.error('Registration error:', error);
      const isClientError = error.message.includes('required') || error.message.includes('Invalid') || error.message.includes('registered');
      res.status(isClientError ? 400 : 500).json({ error: isClientError ? error.message : 'Server error. Please try again.' });
    }
  },

  login: async (req, res) => {
    try {
      const data = await authService.loginUser(req.body);
      res.status(200).json({ success: true, ...data });
    } catch (error) {
      console.error('Login error:', error);
      const isClientError = error.message.includes('required') || error.message.includes('Invalid') || error.message.includes('blocked');
      res.status(isClientError ? 401 : 500).json({ error: isClientError ? error.message : 'Server error. Please try again.' });
    }
  },

  refreshToken: async (req, res) => {
    try {
      const data = await authService.refreshToken(req.body.refreshToken);
      res.status(200).json({ success: true, ...data });
    } catch (error) {
      console.error('Refresh token error:', error);
      res.status(401).json({ error: 'Invalid refresh token' });
    }
  },

  logout: async (req, res) => {
    try {
      await authService.logoutUser(req.userId);
      res.status(200).json({ success: true, message: 'Logged out successfully' });
    } catch (error) {
      res.status(500).json({ error: 'Server error' });
    }
  },

  getMe: async (req, res) => {
    try {
      const user = await authService.getMe(req.userId);
      res.status(200).json({ success: true, user });
    } catch (error) {
      res.status(error.message === 'User not found' ? 404 : 500).json({ error: error.message === 'User not found' ? error.message : 'Server error' });
    }
  }
};

module.exports = authController;
