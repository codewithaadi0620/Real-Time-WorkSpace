import api from './api';

export const commentService = {
  getComments: (documentId) => api.get(`/documents/${documentId}/comments`),
  addComment: (documentId, content) => api.post(`/documents/${documentId}/comments`, { content }),
  deleteComment: (id) => api.delete(`/comments/${id}`),
};
