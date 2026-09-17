import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { workspaceService } from '../services/workspaceService';
import { Navbar } from '../components/common/Navbar';
import { Toast } from '../components/common/Toast';
import {
  Plus,
  Users,
  FileText,
  CheckSquare,
  ArrowRight,
  Loader2,
  FolderKanban,
  Clock,
  Sparkles,
} from 'lucide-react';
import { formatDistanceToNow } from '../utils/formatters';

export function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [workspaces, setWorkspaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newWsName, setNewWsName] = useState('');
  const [newWsDesc, setNewWsDesc] = useState('');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetchWorkspaces();
  }, []);

  const fetchWorkspaces = async () => {
    try {
      const res = await workspaceService.getWorkspaces();
      setWorkspaces(res.data.workspaces || []);
    } catch (err) {
      console.error('Failed to fetch workspaces:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateWorkspace = async (e) => {
    e.preventDefault();
    if (!newWsName.trim()) return;
    setCreating(true);
    try {
      const res = await workspaceService.createWorkspace({
        name: newWsName,
        description: newWsDesc,
      });
      setShowCreateModal(false);
      setNewWsName('');
      setNewWsDesc('');
      navigate(`/workspaces/${res.data.workspace.id}`);
    } catch (err) {
      console.error('Create workspace error:', err);
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* Welcome Header */}
        <div className="bg-gradient-to-r from-slate-900 via-blue-950/40 to-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl">
          <div>
            <div className="flex items-center space-x-2 text-xs font-semibold text-blue-400 uppercase tracking-wider mb-2">
              <Sparkles className="w-4 h-4" />
              <span>Personalized Workspace Hub</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-100">
              Welcome back, {user?.name}!
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Select a workspace below to enter real-time collaboration sessions.
            </p>
          </div>

          <button
            onClick={() => setShowCreateModal(true)}
            className="px-5 py-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm rounded-xl shadow-lg shadow-blue-600/25 flex items-center space-x-2 transition-all shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Create Workspace</span>
          </button>
        </div>

        {/* Workspaces Grid */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-200 flex items-center space-x-2">
              <FolderKanban className="w-5 h-5 text-blue-400" />
              <span>Your Workspaces ({workspaces.length})</span>
            </h2>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-16 text-slate-500 space-x-3">
              <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
              <span>Loading workspaces...</span>
            </div>
          ) : workspaces.length === 0 ? (
            <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-12 text-center space-y-4">
              <p className="text-slate-400">You don't belong to any workspace yet.</p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold rounded-xl"
              >
                Create your first workspace
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {workspaces.map((ws) => (
                <div
                  key={ws.id}
                  onClick={() => navigate(`/workspaces/${ws.id}`)}
                  className="bg-slate-900/90 hover:bg-slate-900 border border-slate-800 hover:border-blue-500/50 rounded-2xl p-6 shadow-lg transition-all cursor-pointer group flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <h3 className="text-lg font-semibold text-slate-100 group-hover:text-blue-400 transition-colors">
                        {ws.name}
                      </h3>
                      <span className="text-xs px-2 py-0.5 rounded bg-blue-950 text-blue-400 border border-blue-800/60 font-medium">
                        {ws.role}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 line-clamp-2 min-h-[32px]">
                      {ws.description || 'No description provided.'}
                    </p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                    <div className="flex items-center space-x-4">
                      <span className="flex items-center space-x-1" title="Members">
                        <Users className="w-3.5 h-3.5 text-slate-500" />
                        <span>{ws.member_count}</span>
                      </span>
                      <span className="flex items-center space-x-1" title="Documents">
                        <FileText className="w-3.5 h-3.5 text-slate-500" />
                        <span>{ws.document_count}</span>
                      </span>
                      <span className="flex items-center space-x-1" title="Active Tasks">
                        <CheckSquare className="w-3.5 h-3.5 text-slate-500" />
                        <span>{ws.active_task_count}</span>
                      </span>
                    </div>

                    <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-blue-400 group-hover:translate-x-1 transition-all" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      {/* Create Workspace Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-6">
            <h3 className="text-lg font-bold text-slate-100">Create New Workspace</h3>
            <form onSubmit={handleCreateWorkspace} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Workspace Name
                </label>
                <input
                  type="text"
                  required
                  value={newWsName}
                  onChange={(e) => setNewWsName(e.target.value)}
                  placeholder="e.g. Engineering Team"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-blue-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={newWsDesc}
                  onChange={(e) => setNewWsDesc(e.target.value)}
                  placeholder="Describe your workspace team or goal..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-blue-500 text-sm"
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
                  {creating ? 'Creating...' : 'Create Workspace'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Toast />
    </div>
  );
}
