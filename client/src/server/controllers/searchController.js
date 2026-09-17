const searchService = require('../services/searchService');
const { sendSuccess } = require('../utils/responseHandler');

class SearchController {
  async search(req, res, next) {
    try {
      const { q } = req.query;
      const workspaceId = req.params.id;
      const results = await searchService.searchWorkspace(workspaceId, q, req.user.id);
      return sendSuccess(res, { results }, 'Search results retrieved');
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new SearchController();
