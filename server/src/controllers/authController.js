const authService = require('../services/authService');
const { sendSuccess, sendError } = require('../utils/responseHandler');

class AuthController {
  async register(req, res, next) {
    try {
      const { name, email, password } = req.body;

      if (!name || !email || !password) {
        return sendError(res, 'Name, email, and password are required', 400);
      }
      if (password.length < 6) {
        return sendError(res, 'Password must be at least 6 characters long', 400);
      }

      const result = await authService.register({ name, email, password });
      return sendSuccess(res, result, 'User registered successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  async login(req, res, next) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return sendError(res, 'Email and password are required', 400);
      }

      const result = await authService.login({ email, password });
      return sendSuccess(res, result, 'Login successful', 200);
    } catch (error) {
      next(error);
    }
  }

  async logout(req, res, next) {
    try {
      await authService.logout(req.token);
      return sendSuccess(res, null, 'Logged out successfully', 200);
    } catch (error) {
      next(error);
    }
  }

  async me(req, res, next) {
    try {
      const user = await authService.getCurrentUser(req.user.id);
      return sendSuccess(res, { user }, 'User profile retrieved', 200);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AuthController();
