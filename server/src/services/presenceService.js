const redis = require('../config/redis');

class PresenceService {
  /**
   * Add a user connection to a workspace room presence set
   */
  async addUserToWorkspace(workspaceId, user) {
    try {
      const key = `workspace:${workspaceId}:online-users`;
      const userKey = `user:${user.id}:info`;
      
      // Store user details stringified in hash/set
      await redis.hset(key, user.id, JSON.stringify({
        id: user.id,
        name: user.name,
        email: user.email,
        connectedAt: new Date().toISOString(),
      }));

      return await this.getOnlineWorkspaceUsers(workspaceId);
    } catch (error) {
      console.error('PresenceService addUserToWorkspace Error:', error);
      return [];
    }
  }

  /**
   * Remove a user connection from workspace presence
   */
  async removeUserFromWorkspace(workspaceId, userId) {
    try {
      const key = `workspace:${workspaceId}:online-users`;
      await redis.hdel(key, userId);
      return await this.getOnlineWorkspaceUsers(workspaceId);
    } catch (error) {
      console.error('PresenceService removeUserFromWorkspace Error:', error);
      return [];
    }
  }

  /**
   * Get list of all currently online users in a workspace
   */
  async getOnlineWorkspaceUsers(workspaceId) {
    try {
      const key = `workspace:${workspaceId}:online-users`;
      const usersHash = await redis.hgetall(key);
      if (!usersHash) return [];

      return Object.values(usersHash).map((item) => JSON.parse(item));
    } catch (error) {
      console.error('PresenceService getOnlineWorkspaceUsers Error:', error);
      return [];
    }
  }
}

module.exports = new PresenceService();
