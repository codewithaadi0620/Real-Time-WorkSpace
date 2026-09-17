const commentService = require('../services/commentService');
const { sendSuccess, sendError } = require('../utils/responseHandler');

class CommentController {
  async getComments(req, res, next) {
    try {
      const comments = await commentService.getCommentsByDocument(req.params.id, req.user.id);
      return sendSuccess(res, { comments }, 'Comments retrieved');
    } catch (error) {
      next(error);
    }
  }

  async addComment(req, res, next) {
    try {
      const { content } = req.body;
      if (!content || content.trim() === '') {
        return sendError(res, 'Comment content is required', 400);
      }

      const comment = await commentService.addComment(req.params.id, content, req.user.id);
      return sendSuccess(res, { comment }, 'Comment added successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  async deleteComment(req, res, next) {
    try {
      await commentService.deleteComment(req.params.id, req.user.id);
      return sendSuccess(res, null, 'Comment deleted successfully');
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new CommentController();
