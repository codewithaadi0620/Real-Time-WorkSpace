const db = require('../config/db');
const documentService = require('./documentService');

class CommentService {
  async getCommentsByDocument(documentId, userId) {
    await documentService.getDocumentById(documentId, userId); // Permission check

    const res = await db.query(
      `SELECT c.id, c.document_id, c.user_id, c.content, c.created_at, c.updated_at,
              u.name AS user_name, u.email AS user_email
       FROM comments c
       JOIN users u ON c.user_id = u.id
       WHERE c.document_id = $1
       ORDER BY c.created_at ASC`,
      [documentId]
    );

    return res.rows;
  }

  async addComment(documentId, content, userId) {
    const document = await documentService.getDocumentById(documentId, userId);

    const res = await db.query(
      `INSERT INTO comments (document_id, user_id, content)
       VALUES ($1, $2, $3)
       RETURNING id, document_id, user_id, content, created_at, updated_at`,
      [documentId, userId, content.trim()]
    );

    const comment = res.rows[0];

    // Fetch user details for instant broadcast payload
    const userRes = await db.query('SELECT name, email FROM users WHERE id = $1', [userId]);
    const user = userRes.rows[0];

    return {
      ...comment,
      user_name: user.name,
      user_email: user.email,
      workspace_id: document.workspace_id,
      document_title: document.title,
    };
  }

  async deleteComment(commentId, userId) {
    const res = await db.query('SELECT id, user_id, document_id FROM comments WHERE id = $1', [commentId]);
    if (res.rows.length === 0) {
      const error = new Error('Comment not found');
      error.statusCode = 404;
      throw error;
    }

    const comment = res.rows[0];
    if (comment.user_id !== userId) {
      const error = new Error('You can only delete your own comments.');
      error.statusCode = 403;
      throw error;
    }

    await db.query('DELETE FROM comments WHERE id = $1', [commentId]);
    return comment;
  }
}

module.exports = new CommentService();
