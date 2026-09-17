const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../../.env') });
require('dotenv').config(); // Fallback to local server .env

module.exports = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: process.env.PORT || 5000,
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:5173',
  DB: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    database: process.env.DB_NAME || 'collaborative_workspace',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres_password',
  },
  REDIS: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
    password: process.env.REDIS_PASSWORD || undefined,
  },
  JWT: {
    secret: process.env.JWT_SECRET || 'super_secret_jwt_key_collaborative_workspace_2026',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  }
};
