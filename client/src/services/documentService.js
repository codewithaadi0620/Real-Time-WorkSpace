import api from './api';

export const documentService = {
  getDocuments: (workspaceId) => api.get(`/workspaces/${workspaceId}/documents`),
  getDocumentById: (id) => api.get(`/documents/${id}`),
  createDocument: (workspaceId, data) => api.post(`/workspaces/${workspaceId}/documents`, data),
  updateDocument: (id, data) => api.put(`/documents/${id}`, data),
  deleteDocument: (id) => api.delete(`/documents/${id}`),
  getVersions: (id) => api.get(`/documents/${id}/versions`),
};
