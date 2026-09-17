const db = require('../config/db');
const cacheService = require('./cacheService');

class WorkspaceService {
  async getWorkspacesForUser(userId) {
    const query = `
      SELECT w.id, w.name, w.description, w.owner_id, w.created_at, w.updated_at, wm.role,
             (SELECT COUNT(*) FROM workspace_members WHERE workspace_id = w.id)::int AS member_count,
             (SELECT COUNT(*) FROM documents WHERE workspace_id = w.id)::int AS document_count,
             (SELECT COUNT(*) FROM tasks WHERE workspace_id = w.id AND status != 'DONE')::int AS active_task_count
      FROM workspaces w
      INNER JOIN workspace_members wm ON w.id = wm.workspace_id
      WHERE wm.user_id = $1
      ORDER BY w.updated_at DESC
    `;
    const res = await db.query(query, [userId]);
    return res.rows;
  }

  async getWorkspaceById(workspaceId, userId) {
    // 1. Verify user membership first
    const memberRes = await db.query(
      'SELECT role FROM workspace_members WHERE workspace_id = $1 AND user_id = $2',
      [workspaceId, userId]
    );

    if (memberRes.rows.length === 0) {
      const error = new Error('Access denied. You are not a member of this workspace.');
      error.statusCode = 403;
      throw error;
    }

    const userRole = memberRes.rows[0].role;

    // 2. Check Redis Cache
    const cachedWorkspace = await cacheService.getWorkspace(workspaceId);
    if (cachedWorkspace) {
      return { ...cachedWorkspace, current_user_role: userRole, _fromCache: true };
    }

    // 3. Cache Miss -> Query PostgreSQL
    const wsRes = await db.query(
      `SELECT w.id, w.name, w.description, w.owner_id, w.created_at, w.updated_at, u.name AS owner_name
       FROM workspaces w
       LEFT JOIN users u ON w.owner_id = u.id
       WHERE w.id = $1`,
      [workspaceId]
    );

    if (wsRes.rows.length === 0) {
      const error = new Error('Workspace not found');
      error.statusCode = 404;
      throw error;
    }

    const workspace = wsRes.rows[0];

    // 4. Store in Redis Cache
    await cacheService.setWorkspace(workspaceId, workspace);

    return { ...workspace, current_user_role: userRole, _fromCache: false };
  }

  async createWorkspace({ name, description, ownerId }) {
    const client = await db.pool.connect();
    try {
      await client.query('BEGIN');

      // Create workspace
      const wsRes = await client.query(
        `INSERT INTO workspaces (name, description, owner_id)
         VALUES ($1, $2, $3)
         RETURNING id, name, description, owner_id, created_at, updated_at`,
        [name.trim(), description || '', ownerId]
      );

      const newWorkspace = wsRes.rows[0];

      // Add owner as workspace_member with role 'OWNER'
      await client.query(
        `INSERT INTO workspace_members (workspace_id, user_id, role)
         VALUES ($1, $2, 'OWNER')`,
        [newWorkspace.id, ownerId]
      );

      await client.query('COMMIT');
      return newWorkspace;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async updateWorkspace(workspaceId, { name, description }, userId) {
    await this.checkWorkspaceRole(workspaceId, userId, ['OWNER', 'ADMIN']);

    const res = await db.query(
      `UPDATE workspaces
       SET name = COALESCE($1, name),
           description = COALESCE($2, description),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $3
       RETURNING id, name, description, owner_id, created_at, updated_at`,
      [name, description, workspaceId]
    );

    if (res.rows.length === 0) {
      const error = new Error('Workspace not found');
      error.statusCode = 404;
      throw error;
    }

    // Invalidate Redis cache
    await cacheService.invalidateWorkspace(workspaceId);

    return res.rows[0];
  }

  async deleteWorkspace(workspaceId, userId) {
    await this.checkWorkspaceRole(workspaceId, userId, ['OWNER']);

    await db.query('DELETE FROM workspaces WHERE id = $1', [workspaceId]);
    await cacheService.invalidateWorkspace(workspaceId);
    return true;
  }

  async getWorkspaceMembers(workspaceId, requestingUserId) {
    await this.checkWorkspaceRole(workspaceId, requestingUserId, ['OWNER', 'ADMIN', 'MEMBER']);

    const res = await db.query(
      `SELECT wm.id, wm.role, wm.joined_at, u.id AS user_id, u.name, u.email
       FROM workspace_members wm
       JOIN users u ON wm.user_id = u.id
       WHERE wm.workspace_id = $1
       ORDER BY wm.joined_at ASC`,
      [workspaceId]
    );
    return res.rows;
  }

  async addWorkspaceMember(workspaceId, email, role = 'MEMBER', addedByUserId) {
    await this.checkWorkspaceRole(workspaceId, addedByUserId, ['OWNER', 'ADMIN']);

    // Find user by email
    const userRes = await db.query('SELECT id, name, email FROM users WHERE email = $1', [email.toLowerCase().trim()]);
    if (userRes.rows.length === 0) {
      const error = new Error('User with specified email not found');
      error.statusCode = 444;
      throw error;
    }

    const targetUser = userRes.rows[0];

    const insertRes = await db.query(
      `INSERT INTO workspace_members (workspace_id, user_id, role)
       VALUES ($1, $2, $3)
       ON CONFLICT (workspace_id, user_id) DO UPDATE SET role = EXCLUDED.role
       RETURNING id, workspace_id, user_id, role, joined_at`,
      [workspaceId, targetUser.id, role]
    );

    return { ...insertRes.rows[0], user: targetUser };
  }

  async removeWorkspaceMember(workspaceId, targetUserId, requestingUserId) {
    await this.checkWorkspaceRole(workspaceId, requestingUserId, ['OWNER', 'ADMIN']);

    // Prevent removing owner
    const wsRes = await db.query('SELECT owner_id FROM workspaces WHERE id = $1', [workspaceId]);
    if (wsRes.rows.length > 0 && wsRes.rows[0].owner_id === targetUserId) {
      const error = new Error('Cannot remove the owner of the workspace');
      error.statusCode = 400;
      throw error;
    }

    await db.query('DELETE FROM workspace_members WHERE workspace_id = $1 AND user_id = $2', [workspaceId, targetUserId]);
    return true;
  }

  async checkWorkspaceRole(workspaceId, userId, allowedRoles = []) {
    const res = await db.query(
      'SELECT role FROM workspace_members WHERE workspace_id = $1 AND user_id = $2',
      [workspaceId, userId]
    );

    if (res.rows.length === 0) {
      const error = new Error('Access denied. Not a workspace member.');
      error.statusCode = 403;
      throw error;
    }

    const role = res.rows[0].role;
    if (allowedRoles.length > 0 && !allowedRoles.includes(role)) {
      const error = new Error('Permission denied for this workspace action.');
      error.statusCode = 403;
      throw error;
    }

    return role;
  }
}

module.exports = new WorkspaceService();
