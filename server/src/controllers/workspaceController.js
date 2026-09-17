const workspaceService = require('../services/workspaceService');
const { sendSuccess, sendError } = require('../utils/responseHandler');

class WorkspaceController {
  async getWorkspaces(req, res, next) {
    try {
      const workspaces = await workspaceService.getWorkspacesForUser(req.user.id);
      return sendSuccess(res, { workspaces }, 'Workspaces retrieved');
    } catch (error) {
      next(error);
    }
  }

  async getWorkspaceById(req, res, next) {
    try {
      const workspace = await workspaceService.getWorkspaceById(req.params.id, req.user.id);
      return sendSuccess(res, { workspace }, 'Workspace details retrieved');
    } catch (error) {
      next(error);
    }
  }

  async createWorkspace(req, res, next) {
    try {
      const { name, description } = req.body;
      if (!name || name.trim() === '') {
        return sendError(res, 'Workspace name is required', 400);
      }

      const workspace = await workspaceService.createWorkspace({
        name,
        description,
        ownerId: req.user.id,
      });

      return sendSuccess(res, { workspace }, 'Workspace created successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  async updateWorkspace(req, res, next) {
    try {
      const { name, description } = req.body;
      const workspace = await workspaceService.updateWorkspace(
        req.params.id,
        { name, description },
        req.user.id
      );

      return sendSuccess(res, { workspace }, 'Workspace updated successfully');
    } catch (error) {
      next(error);
    }
  }

  async deleteWorkspace(req, res, next) {
    try {
      await workspaceService.deleteWorkspace(req.params.id, req.user.id);
      return sendSuccess(res, null, 'Workspace deleted successfully');
    } catch (error) {
      next(error);
    }
  }

  async getMembers(req, res, next) {
    try {
      const members = await workspaceService.getWorkspaceMembers(req.params.id, req.user.id);
      return sendSuccess(res, { members }, 'Workspace members retrieved');
    } catch (error) {
      next(error);
    }
  }

  async addMember(req, res, next) {
    try {
      const { email, role } = req.body;
      if (!email) {
        return sendError(res, 'User email is required to add member', 400);
      }

      const member = await workspaceService.addWorkspaceMember(
        req.params.id,
        email,
        role || 'MEMBER',
        req.user.id
      );

      return sendSuccess(res, { member }, 'Member added to workspace', 201);
    } catch (error) {
      next(error);
    }
  }

  async removeMember(req, res, next) {
    try {
      await workspaceService.removeWorkspaceMember(
        req.params.id,
        req.params.userId,
        req.user.id
      );

      return sendSuccess(res, null, 'Member removed from workspace');
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new WorkspaceController();
