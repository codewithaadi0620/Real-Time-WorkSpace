import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { workspaceService } from '../services/workspaceService';
import { documentService } from '../services/documentService';
import { taskService } from '../services/taskService';
import { useSocket } from '../context/SocketContext';
import { Navbar } from '../components/common/Navbar';
import { Sidebar } from '../components/common/Sidebar';
import { WorkspaceSearch } from '../components/workspace/WorkspaceSearch';
import { Toast } from '../components/common/Toast';
import {
  FileText,
  CheckSquare,
  Users,
  Clock,
  Plus,
  Loader2,
  ChevronRight,
  ShieldCheck,
  Server,
  Zap,
} from 'lucide-react';
import { formatDistanceToNow } from '../utils/formatters';

export function WorkspaceOverview() {
  const { workspaceId } = useParams();
  const { joinWorkspace, leaveWorkspace } = useSocket();
  const [workspace, setWorkspace] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    fetchWorkspaceData();
    joinWorkspace(workspaceId);

    return () => {
      leaveWorkspace(workspaceId);
    };
  }, [workspaceId]);

  const fetchWorkspaceData = async () => {
    try {
      setLoading(true);
      const [wsRes, docRes, taskRes] = await Promise.all([
        workspaceService.getWorkspaceById(workspaceId),
        documentService.getDocuments(workspaceId),
        taskService.getTasks(workspaceId),
      ]);

      setWorkspace(wsRes.data.workspace);
      setDocuments(docRes.data.documents || []);
      setTasks(taskRes.data.tasks || []);
    } catch (err) {
      console.error('Failed to load workspace data:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400 space-x-3">
        <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
        <span>Loading workspace overview...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Navbar workspaceName={workspace?.name} onOpenSearch={() => setSearchOpen(true)} />

      <div className="flex-1 flex overflow-hidden">
        <Sidebar workspaceName={workspace?.name} />

        <main className="flex-1 overflow-y-auto p-6 space-y-8 max-w-7xl mx-auto w-full">
          {/* Header Banner */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-4 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center space-x-3">
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100">{workspace?.name}</h1>
                  <span className="text-xs px-2.5 py-1 rounded-full bg-blue-950 text-blue-400 border border-blue-800/60 font-semibold uppercase tracking-wider">
                    Role: {workspace?.current_user_role}
                  </span>
                  {workspace?._fromCache && (
                    <span className="text-xs px-2 py-0.5 rounded bg-emerald-950/60 text-emerald-400 border border-emerald-800/50 flex items-center space-x-1" title="Served instantly from Redis cache">
                      <Zap className="w-3 h-3" />
                      <span>Redis Cache HIT</span>
                    </span>
                  )}
                </div>
                <p className="text-sm text-slate-400 mt-2 max-w-3xl">
                  {workspace?.description || 'No description provided.'}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-slate-800/80">
              <Link to={`/workspaces/${workspaceId}/documents`} className="bg-slate-950/60 hover:bg-slate-800/60 border border-slate-800 p-4 rounded-2xl flex items-center space-x-4 transition-all group">
                <div className="p-3 bg-blue-600/10 text-blue-400 rounded-xl group-hover:scale-110 transition-transform">
                  <FileText className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-100">{documents.length}</p>
                  <p className="text-xs text-slate-400 font-medium">Documents</p>
                </div>
              </Link>

              <Link to={`/workspaces/${workspaceId}/tasks`} className="bg-slate-950/60 hover:bg-slate-800/60 border border-slate-800 p-4 rounded-2xl flex items-center space-x-4 transition-all group">
                <div className="p-3 bg-emerald-600/10 text-emerald-400 rounded-xl group-hover:scale-110 transition-transform">
                  <CheckSquare className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-100">{tasks.filter(t => t.status !== 'DONE').length}</p>
                  <p className="text-xs text-slate-400 font-medium">Active Tasks</p>
                </div>
              </Link>

              <Link to={`/workspaces/${workspaceId}/members`} className="bg-slate-950/60 hover:bg-slate-800/60 border border-slate-800 p-4 rounded-2xl flex items-center space-x-4 transition-all group">
                <div className="p-3 bg-purple-600/10 text-purple-400 rounded-xl group-hover:scale-110 transition-transform">
                  <Users className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-100">Team</p>
                  <p className="text-xs text-slate-400 font-medium">Manage Members</p>
                </div>
              </Link>
            </div>
          </div>

          {/* Documents & Tasks Summary Columns */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Recent Documents */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-slate-200 flex items-center space-x-2">
                  <FileText className="w-5 h-5 text-blue-400" />
                  <span>Recent Documents</span>
                </h3>
                <Link to={`/workspaces/${workspaceId}/documents`} className="text-xs text-blue-400 hover:text-blue-300 flex items-center space-x-1 font-semibold">
                  <span>View All</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="space-y-3">
                {documents.length === 0 ? (
                  <p className="text-xs text-slate-500 py-6 text-center">No documents in this workspace yet.</p>
                ) : (
                  documents.slice(0, 4).map((doc) => (
                    <Link
                      key={doc.id}
                      to={`/documents/${doc.id}`}
                      className="block p-4 bg-slate-950/60 hover:bg-slate-800 border border-slate-800 rounded-2xl transition-all group"
                    >
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-semibold text-slate-200 group-hover:text-blue-400 transition-colors">
                          {doc.title}
                        </h4>
                        <span className="text-xs text-slate-500">{formatDistanceToNow(doc.updated_at)}</span>
                      </div>
                      <p className="text-xs text-slate-400 line-clamp-1 mt-1">
                        {doc.content || 'Empty document content'}
                      </p>
                    </Link>
                  ))
                )}
              </div>
            </div>

            {/* Task Board Summary */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-slate-200 flex items-center space-x-2">
                  <CheckSquare className="w-5 h-5 text-emerald-400" />
                  <span>Recent Tasks</span>
                </h3>
                <Link to={`/workspaces/${workspaceId}/tasks`} className="text-xs text-blue-400 hover:text-blue-300 flex items-center space-x-1 font-semibold">
                  <span>Open Task Board</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="space-y-3">
                {tasks.length === 0 ? (
                  <p className="text-xs text-slate-500 py-6 text-center">No tasks on the board.</p>
                ) : (
                  tasks.slice(0, 4).map((task) => (
                    <div
                      key={task.id}
                      className="p-4 bg-slate-950/60 border border-slate-800 rounded-2xl flex items-center justify-between"
                    >
                      <div>
                        <p className="text-sm font-semibold text-slate-200">{task.title}</p>
                        <span className={`inline-block text-xs px-2 py-0.5 rounded mt-1 font-medium ${
                          task.status === 'DONE' ? 'bg-emerald-950 text-emerald-400' :
                          task.status === 'IN_PROGRESS' ? 'bg-blue-950 text-blue-400' : 'bg-slate-800 text-slate-400'
                        }`}>
                          {task.status.replace('_', ' ')}
                        </span>
                      </div>
                      {task.assignee_name && (
                        <span className="text-xs text-slate-400 bg-slate-900 px-2 py-1 rounded-lg border border-slate-800">
                          {task.assignee_name}
                        </span>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </main>
      </div>

      <WorkspaceSearch isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
      <Toast />
    </div>
  );
}
