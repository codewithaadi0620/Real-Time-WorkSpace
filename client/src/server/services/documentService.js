const db = require('../config/db');
const workspaceService = require('./workspaceService');

class DocumentService {
  async getDocumentsByWorkspace(workspaceId, userId) {
    await workspaceService.checkWorkspaceRole(workspaceId, userId);

    const res = await db.query(
      `SELECT d.id, d.workspace_id, d.title, d.created_by, d.updated_by, d.created_at, d.updated_at,
              u1.name AS creator_name, u2.name AS updater_name,
              (SELECT COUNT(*) FROM comments WHERE document_id = d.id)::int AS comment_count,
              (SELECT COUNT(*) FROM document_versions WHERE document_id = d.id)::int AS version_count
       FROM documents d
       LEFT JOIN users u1 ON d.created_by = u1.id
       LEFT JOIN users u2 ON d.updated_by = u2.id
       WHERE d.workspace_id = $1
       ORDER BY d.updated_at DESC`,
      [workspaceId]
    );

    return res.rows;
  }

  async getDocumentById(documentId, userId) {
    const docRes = await db.query(
      `SELECT d.id, d.workspace_id, d.title, d.content, d.created_by, d.updated_by, d.created_at, d.updated_at,
              u1.name AS creator_name, u2.name AS updater_name
       FROM documents d
       LEFT JOIN users u1 ON d.created_by = u1.id
       LEFT JOIN users u2 ON d.updated_by = u2.id
       WHERE d.id = $1`,
      [documentId]
    );

    if (docRes.rows.length === 0) {
      const error = new Error('Document not found');
      error.statusCode = 404;
      throw error;
    }

    const document = docRes.rows[0];
    await workspaceService.checkWorkspaceRole(document.workspace_id, userId);

    return document;
  }

  async createDocument(workspaceId, { title, content = '' }, userId) {
    await workspaceService.checkWorkspaceRole(workspaceId, userId);

    const client = await db.pool.connect();
    try {
      await client.query('BEGIN');

      const docRes = await client.query(
        `INSERT INTO documents (workspace_id, title, content, created_by, updated_by)
         VALUES ($1, $2, $3, $4, $4)
         RETURNING id, workspace_id, title, content, created_by, updated_by, created_at, updated_at`,
        [workspaceId, title.trim(), content, userId]
      );

      const document = docRes.rows[0];

      // Save initial version snapshot
      await client.query(
        `INSERT INTO document_versions (document_id, content, edited_by)
         VALUES ($1, $2, $3)`,
        [document.id, content, userId]
      );

      await client.query('COMMIT');
      return document;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async updateDocument(documentId, { title, content }, userId) {
    const document = await this.getDocumentById(documentId, userId);

    const client = await db.pool.connect();
    try {
      await client.query('BEGIN');

      const updatedTitle = title !== undefined ? title.trim() : document.title;
      const updatedContent = content !== undefined ? content : document.content;

      const res = await client.query(
        `UPDATE documents
         SET title = $1,
             content = $2,
             updated_by = $3,
             updated_at = CURRENT_TIMESTAMP
         WHERE id = $4
         RETURNING id, workspace_id, title, content, created_by, updated_by, created_at, updated_at`,
        [updatedTitle, updatedContent, userId, documentId]
      );

      const updatedDoc = res.rows[0];

      // Insert version snapshot if content changed
      if (content !== undefined && content !== document.content) {
        await client.query(
          `INSERT INTO document_versions (document_id, content, edited_by)
           VALUES ($1, $2, $3)`,
          [documentId, updatedContent, userId]
        );
      }

      await client.query('COMMIT');
      return updatedDoc;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async deleteDocument(documentId, userId) {
    const document = await this.getDocumentById(documentId, userId);
    await db.query('DELETE FROM documents WHERE id = $1', [documentId]);
    return true;
  }

  async getDocumentVersions(documentId, userId) {
    await this.getDocumentById(documentId, userId); // Role check

    const res = await db.query(
      `SELECT dv.id, dv.document_id, dv.content, dv.edited_by, dv.created_at,
              u.name AS editor_name, u.email AS editor_email
       FROM document_versions dv
       LEFT JOIN users u ON dv.edited_by = u.id
       WHERE dv.document_id = $1
       ORDER BY dv.created_at DESC`,
      [documentId]
    );

    return res.rows;
  }
}

module.exports = new DocumentService();
