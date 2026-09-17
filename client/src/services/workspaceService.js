import api from './api';

export const workspaceService = {
  getWorkspaces: () => api.get('/workspaces'),
  getWorkspaceById: (id) => api.get(`/workspaces/${id}`),
  createWorkspace: (data) => api.post('/workspaces', data),
  updateWorkspace: (id, data) => api.put(`/workspaces/${id}`, data),
  deleteWorkspace: (id) => api.delete(`/workspaces/${id}`),

  getMembers: (id) => api.get(`/workspaces/${id}/members`),
  addMember: (id, data) => api.post(`/workspaces/${id}/members`, data),
  removeMember: (id, userId) => api.delete(`/workspaces/${id}/members/${userId}`),

  searchWorkspace: (id, query) => api.get(`/workspaces/${id}/search?q=${encodeURIComponent(query)}`),
};
