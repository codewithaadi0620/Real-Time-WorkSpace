const db = require('../config/db');

class NotificationService {
  async getUserNotifications(userId) {
    const res = await db.query(
      `SELECT n.id, n.user_id, n.workspace_id, n.type, n.message, n.read, n.created_at,
              w.name AS workspace_name
       FROM notifications n
       LEFT JOIN workspaces w ON n.workspace_id = w.id
       WHERE n.user_id = $1
       ORDER BY n.created_at DESC
       LIMIT 50`,
      [userId]
    );

    return res.rows;
  }

  async createNotification({ userId, workspaceId = null, type, message }) {
    const res = await db.query(
      `INSERT INTO notifications (user_id, workspace_id, type, message)
       VALUES ($1, $2, $3, $4)
       RETURNING id, user_id, workspace_id, type, message, read, created_at`,
      [userId, workspaceId, type, message]
    );

    return res.rows[0];
  }

  async markAsRead(notificationId, userId) {
    const res = await db.query(
      `UPDATE notifications
       SET read = TRUE
       WHERE id = $1 AND user_id = $2
       RETURNING id, user_id, read`,
      [notificationId, userId]
    );

    if (res.rows.length === 0) {
      const error = new Error('Notification not found');
      error.statusCode = 404;
      throw error;
    }

    return res.rows[0];
  }

  async markAllAsRead(userId) {
    await db.query(
      `UPDATE notifications
       SET read = TRUE
       WHERE user_id = $1 AND read = FALSE`,
      [userId]
    );

    return true;
  }
}

module.exports = new NotificationService();
