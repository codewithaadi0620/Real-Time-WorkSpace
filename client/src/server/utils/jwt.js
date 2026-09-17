const jwt = require('jsonwebtoken');
const config = require('../config/env');

const generateToken = (payload) => {
  return jwt.sign(payload, config.JWT.secret, {
    expiresIn: config.JWT.expiresIn,
  });
};

const verifyToken = (token) => {
  try {
    return jwt.verify(token, config.JWT.secret);
  } catch (error) {
    return null;
  }
};

module.exports = {
  generateToken,
  verifyToken,
};
