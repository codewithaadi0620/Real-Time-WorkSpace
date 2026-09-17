const { verifyToken } = require('../utils/jwt');
const { sendError } = require('../utils/responseHandler');
const redis = require('../config/redis');

const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return sendError(res, 'Authentication token missing or invalid format', 401);
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);
    if (!decoded) {
      return sendError(res, 'Invalid or expired authentication token', 401);
    }

    // Verify Redis session state for server-side logout enforcement
    const sessionData = await redis.get(`session:${token}`);
    if (!sessionData) {
      return sendError(res, 'Session expired or logged out. Please log in again.', 401);
    }

    req.user = JSON.parse(sessionData);
    req.token = token;
    next();
  } catch (error) {
    console.error('Auth Middleware Error:', error);
    return sendError(res, 'Authentication error', 401);
  }
};

module.exports = authenticate;
