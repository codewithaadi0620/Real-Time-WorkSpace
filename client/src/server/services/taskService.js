const db = require('../config/db');
const workspaceService = require('./workspaceService');

class TaskService {
  async getTasksByWorkspace(workspaceId, userId) {
    await workspaceService.checkWorkspaceRole(workspaceId, userId);

    const res = await db.query(
      `SELECT t.id, t.workspace_id, t.title, t.description, t.status, t.priority,
              t.assigned_to, t.created_by, t.created_at, t.updated_at,
              u1.name AS assignee_name, u1.email AS assignee_email,
              u2.name AS creator_name
       FROM tasks t
       LEFT JOIN users u1 ON t.assigned_to = u1.id
       LEFT JOIN users u2 ON t.created_by = u2.id
       WHERE t.workspace_id = $1
       ORDER BY t.created_at DESC`,
      [workspaceId]
    );

    return res.rows;
  }

  async getTaskById(taskId, userId) {
    const res = await db.query(
      `SELECT t.*, u1.name AS assignee_name, u2.name AS creator_name
       FROM tasks t
       LEFT JOIN users u1 ON t.assigned_to = u1.id
       LEFT JOIN users u2 ON t.created_by = u2.id
       WHERE t.id = $1`,
      [taskId]
    );

    if (res.rows.length === 0) {
      const error = new Error('Task not found');
      error.statusCode = 404;
      throw error;
    }

    const task = res.rows[0];
    await workspaceService.checkWorkspaceRole(task.workspace_id, userId);
    return task;
  }

  async createTask(workspaceId, { title, description = '', priority = 'MEDIUM', assigned_to = null, status = 'TODO' }, userId) {
    await workspaceService.checkWorkspaceRole(workspaceId, userId);

    const res = await db.query(
      `INSERT INTO tasks (workspace_id, title, description, status, priority, assigned_to, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id, workspace_id, title, description, status, priority, assigned_to, created_by, created_at, updated_at`,
      [workspaceId, title.trim(), description, status, priority, assigned_to || null, userId]
    );

    return await this.getTaskById(res.rows[0].id, userId);
  }

  async updateTask(taskId, updates, userId) {
    const task = await this.getTaskById(taskId, userId);

    const title = updates.title !== undefined ? updates.title.trim() : task.title;
    const description = updates.description !== undefined ? updates.description : task.description;
    const status = updates.status !== undefined ? updates.status : task.status;
    const priority = updates.priority !== undefined ? updates.priority : task.priority;
    const assigned_to = updates.assigned_to !== undefined ? (updates.assigned_to || null) : task.assigned_to;

    await db.query(
      `UPDATE tasks
       SET title = $1,
           description = $2,
           status = $3,
           priority = $4,
           assigned_to = $5,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $6`,
      [title, description, status, priority, assigned_to, taskId]
    );

    return await this.getTaskById(taskId, userId);
  }

  async deleteTask(taskId, userId) {
    const task = await this.getTaskById(taskId, userId);
    await db.query('DELETE FROM tasks WHERE id = $1', [taskId]);
    return task;
  }
}

module.exports = new TaskService();
