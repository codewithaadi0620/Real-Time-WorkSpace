const db = require('../config/db');
const workspaceService = require('./workspaceService');

class SearchService {
  async searchWorkspace(workspaceId, query, userId) {
    await workspaceService.checkWorkspaceRole(workspaceId, userId);

    if (!query || query.trim() === '') {
      return { documents: [], tasks: [], members: [] };
    }

    const searchTerm = `%${query.trim()}%`;

    // 1. Search Documents
    const docsRes = await db.query(
      `SELECT id, workspace_id, title, content, updated_at
       FROM documents
       WHERE workspace_id = $1 AND (title ILIKE $2 OR content ILIKE $2)
       ORDER BY updated_at DESC
       LIMIT 10`,
      [workspaceId, searchTerm]
    );

    // 2. Search Tasks
    const tasksRes = await db.query(
      `SELECT t.id, t.workspace_id, t.title, t.description, t.status, t.priority, t.updated_at,
              u.name AS assignee_name
       FROM tasks t
       LEFT JOIN users u ON t.assigned_to = u.id
       WHERE t.workspace_id = $1 AND (t.title ILIKE $2 OR t.description ILIKE $2)
       ORDER BY t.updated_at DESC
       LIMIT 10`,
      [workspaceId, searchTerm]
    );

    // 3. Search Members
    const membersRes = await db.query(
      `SELECT wm.id, wm.role, u.id AS user_id, u.name, u.email
       FROM workspace_members wm
       JOIN users u ON wm.user_id = u.id
       WHERE wm.workspace_id = $1 AND (u.name ILIKE $2 OR u.email ILIKE $2)
       LIMIT 10`,
      [workspaceId, searchTerm]
    );

    return {
      documents: docsRes.rows,
      tasks: tasksRes.rows,
      members: membersRes.rows,
    };
  }
}

module.exports = new SearchService();
