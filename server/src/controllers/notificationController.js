const notificationService = require('../services/notificationService');
const { sendSuccess } = require('../utils/responseHandler');

class NotificationController {
  async getNotifications(req, res, next) {
    try {
      const notifications = await notificationService.getUserNotifications(req.user.id);
      return sendSuccess(res, { notifications }, 'Notifications retrieved');
    } catch (error) {
      next(error);
    }
  }

  async markRead(req, res, next) {
    try {
      const notification = await notificationService.markAsRead(req.params.id, req.user.id);
      return sendSuccess(res, { notification }, 'Notification marked as read');
    } catch (error) {
      next(error);
    }
  }

  async markAllRead(req, res, next) {
    try {
      await notificationService.markAllAsRead(req.user.id);
      return sendSuccess(res, null, 'All notifications marked as read');
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new NotificationController();
