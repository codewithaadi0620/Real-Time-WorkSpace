const taskService = require('../services/taskService');
const { sendSuccess, sendError } = require('../utils/responseHandler');

class TaskController {
  async getTasks(req, res, next) {
    try {
      const tasks = await taskService.getTasksByWorkspace(req.params.workspaceId, req.user.id);
      return sendSuccess(res, { tasks }, 'Tasks retrieved');
    } catch (error) {
      next(error);
    }
  }

  async createTask(req, res, next) {
    try {
      const { title, description, priority, assigned_to, status } = req.body;
      if (!title || title.trim() === '') {
        return sendError(res, 'Task title is required', 400);
      }

      const task = await taskService.createTask(
        req.params.workspaceId,
        { title, description, priority, assigned_to, status },
        req.user.id
      );

      return sendSuccess(res, { task }, 'Task created successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  async updateTask(req, res, next) {
    try {
      const task = await taskService.updateTask(req.params.id, req.body, req.user.id);
      return sendSuccess(res, { task }, 'Task updated successfully');
    } catch (error) {
      next(error);
    }
  }

  async deleteTask(req, res, next) {
    try {
      const task = await taskService.deleteTask(req.params.id, req.user.id);
      return sendSuccess(res, { task }, 'Task deleted successfully');
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new TaskController();
