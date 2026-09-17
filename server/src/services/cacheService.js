const redis = require('../config/redis');

const DEFAULT_TTL = 3600; // 1 hour TTL for cached workspaces

class CacheService {
  async getWorkspace(workspaceId) {
    try {
      const data = await redis.get(`cache:workspace:${workspaceId}`);
      if (data) {
        return JSON.parse(data);
      }
      return null;
    } catch (error) {
      console.error('Redis Cache GET error:', error);
      return null;
    }
  }

  async setWorkspace(workspaceId, workspaceData, ttl = DEFAULT_TTL) {
    try {
      await redis.set(`cache:workspace:${workspaceId}`, JSON.stringify(workspaceData), 'EX', ttl);
    } catch (error) {
      console.error('Redis Cache SET error:', error);
    }
  }

  async invalidateWorkspace(workspaceId) {
    try {
      await redis.del(`cache:workspace:${workspaceId}`);
    } catch (error) {
      console.error('Redis Cache DEL error:', error);
    }
  }
}

module.exports = new CacheService();
