import api from './api';

export const taskService = {
  getTasks: (workspaceId) => api.get(`/workspaces/${workspaceId}/tasks`),
  createTask: (workspaceId, data) => api.post(`/workspaces/${workspaceId}/tasks`, data),
  updateTask: (id, data) => api.put(`/tasks/${id}`, data),
  deleteTask: (id) => api.delete(`/tasks/${id}`),
};
