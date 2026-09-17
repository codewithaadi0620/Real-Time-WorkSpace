import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { documentService } from '../services/documentService';
import { workspaceService } from '../services/workspaceService';
import { Navbar } from '../components/common/Navbar';
import { Sidebar } from '../components/common/Sidebar';
import { WorkspaceSearch } from '../components/workspace/WorkspaceSearch';
import { Toast } from '../components/common/Toast';
import {
  FileText,
  Plus,
  MessageSquare,
  History,
  Clock,
  Search,
  Loader2,
  Trash2,
  ExternalLink,
} from 'lucide-react';
import { formatDistanceToNow } from '../utils/formatters';

export function DocumentsPage() {
  const { workspaceId } = useParams();
  const navigate = useNavigate();
  const [documents, setDocuments] = useState([]);
  const [workspace, setWorkspace] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filterQuery, setFilterQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [creating, setCreating] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    fetchDocumentsData();
  }, [workspaceId]);

  const fetchDocumentsData = async () => {
    try {
      setLoading(true);
      const [wsRes, docRes] = await Promise.all([
        workspaceService.getWorkspaceById(workspaceId),
        documentService.getDocuments(workspaceId),
      ]);
      setWorkspace(wsRes.data.workspace);
      setDocuments(docRes.data.documents || []);
    } catch (err) {
      console.error('Failed to fetch documents:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateDocument = async (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    setCreating(true);
    try {
      const res = await documentService.createDocument(workspaceId, {
        title: newTitle,
        content: newContent,
      });
      setShowCreateModal(false);
      setNewTitle('');
      setNewContent('');
      navigate(`/documents/${res.data.document.id}`);
    } catch (err) {
      console.error('Failed to create document:', err);
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteDocument = async (e, docId) => {
    e.stopPropagation();
    e.preventDefault();
    if (!window.confirm('Are you sure you want to delete this document?')) return;

    try {
      await documentService.deleteDocument(docId);
      setDocuments((prev) => prev.filter((d) => d.id !== docId));
    } catch (err) {
      console.error('Failed to delete document:', err);
    }
  };

  const filteredDocs = documents.filter((doc) =>
    doc.title.toLowerCase().includes(filterQuery.toLowerCase()) ||
    doc.content.toLowerCase().includes(filterQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Navbar workspaceName={workspace?.name} onOpenSearch={() => setSearchOpen(true)} />

      <div className="flex-1 flex overflow-hidden">
        <Sidebar workspaceName={workspace?.name} />

        <main className="flex-1 overflow-y-auto p-6 space-y-6 max-w-7xl mx-auto w-full">
          {/* Header Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-100 flex items-center space-x-2">
                <FileText className="w-6 h-6 text-blue-400" />
                <span>Workspace Documents ({documents.length})</span>
              </h1>
              <p className="text-xs text-slate-400 mt-1">
                Collaborative documents with real-time sync, version snapshots, and comments.
              </p>
            </div>

            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold rounded-xl shadow-lg shadow-blue-600/20 flex items-center space-x-2 transition-all shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>New Document</span>
            </button>
          </div>

          {/* Local Filter Bar */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
            <input
              type="text"
              value={filterQuery}
              onChange={(e) => setFilterQuery(e.target.value)}
              placeholder="Filter document titles or content..."
              className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Documents Grid */}
          {loading ? (
            <div className="flex items-center justify-center py-16 text-slate-500 space-x-3">
              <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
              <span>Loading documents...</span>
            </div>
          ) : filteredDocs.length === 0 ? (
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-12 text-center text-slate-500">
              No documents found matching your filter.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredDocs.map((doc) => (
                <div
                  key={doc.id}
                  onClick={() => navigate(`/documents/${doc.id}`)}
                  className="bg-slate-900/90 hover:bg-slate-900 border border-slate-800 hover:border-blue-500/40 rounded-2xl p-6 shadow-lg transition-all cursor-pointer group flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <h3 className="text-base font-bold text-slate-100 group-hover:text-blue-400 transition-colors line-clamp-1">
                        {doc.title}
                      </h3>
                      <button
                        onClick={(e) => handleDeleteDocument(e, doc.id)}
                        className="text-slate-600 hover:text-rose-400 p-1 rounded hover:bg-slate-800 transition-colors"
                        title="Delete Document"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <p className="text-xs text-slate-400 line-clamp-3 min-h-[48px]">
                      {doc.content || 'Empty document content.'}
                    </p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-500">
                    <div className="flex items-center space-x-3">
                      <span className="flex items-center space-x-1" title="Comments">
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>{doc.comment_count || 0}</span>
                      </span>
                      <span className="flex items-center space-x-1" title="Version Snapshots">
                        <History className="w-3.5 h-3.5" />
                        <span>v{doc.version_count || 1}</span>
                      </span>
                    </div>

                    <span className="flex items-center space-x-1">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{formatDistanceToNow(doc.updated_at)}</span>
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>

      {/* Create Document Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-6">
            <h3 className="text-lg font-bold text-slate-100">Create New Document</h3>
            <form onSubmit={handleCreateDocument} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Document Title
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. System Architecture Design"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-blue-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Initial Markdown Content
                </label>
                <textarea
                  rows={6}
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  placeholder="Start writing document content here..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-blue-500 text-sm font-mono"
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-semibold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold rounded-xl disabled:opacity-50"
                >
                  {creating ? 'Creating...' : 'Create Document'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <WorkspaceSearch isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
      <Toast />
    </div>
  );
}
