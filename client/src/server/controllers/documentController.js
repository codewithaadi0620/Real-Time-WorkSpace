const documentService = require('../services/documentService');
const { sendSuccess, sendError } = require('../utils/responseHandler');

class DocumentController {
  async getDocuments(req, res, next) {
    try {
      const documents = await documentService.getDocumentsByWorkspace(
        req.params.workspaceId,
        req.user.id
      );
      return sendSuccess(res, { documents }, 'Documents retrieved');
    } catch (error) {
      next(error);
    }
  }

  async getDocumentById(req, res, next) {
    try {
      const document = await documentService.getDocumentById(req.params.id, req.user.id);
      return sendSuccess(res, { document }, 'Document details retrieved');
    } catch (error) {
      next(error);
    }
  }

  async createDocument(req, res, next) {
    try {
      const { title, content } = req.body;
      if (!title || title.trim() === '') {
        return sendError(res, 'Document title is required', 400);
      }

      const document = await documentService.createDocument(
        req.params.workspaceId,
        { title, content },
        req.user.id
      );

      return sendSuccess(res, { document }, 'Document created successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  async updateDocument(req, res, next) {
    try {
      const { title, content } = req.body;
      const document = await documentService.updateDocument(
        req.params.id,
        { title, content },
        req.user.id
      );

      return sendSuccess(res, { document }, 'Document updated successfully');
    } catch (error) {
      next(error);
    }
  }

  async deleteDocument(req, res, next) {
    try {
      await documentService.deleteDocument(req.params.id, req.user.id);
      return sendSuccess(res, null, 'Document deleted successfully');
    } catch (error) {
      next(error);
    }
  }

  async getVersions(req, res, next) {
    try {
      const versions = await documentService.getDocumentVersions(req.params.id, req.user.id);
      return sendSuccess(res, { versions }, 'Document versions retrieved');
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new DocumentController();
