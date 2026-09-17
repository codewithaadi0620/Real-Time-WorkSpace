import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { taskService } from '../services/taskService';
import { workspaceService } from '../services/workspaceService';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { Navbar } from '../components/common/Navbar';
import { Sidebar } from '../components/common/Sidebar';
import { WorkspaceSearch } from '../components/workspace/WorkspaceSearch';
import { Toast } from '../components/common/Toast';
import {
  CheckSquare,
  Plus,
  ArrowRight,
  ArrowLeft,
  Trash2,
  User,
  Loader2,
  AlertCircle,
  Tag,
} from 'lucide-react';
import { formatDistanceToNow, getInitials, getAvatarColor } from '../utils/formatters';

const COLUMNS = [
  { key: 'TODO', label: 'To Do', color: 'border-slate-700 bg-slate-900/60' },
  { key: 'IN_PROGRESS', label: 'In Progress', color: 'border-blue-500/40 bg-blue-950/20' },
  { key: 'DONE', label: 'Completed', color: 'border-emerald-500/40 bg-emerald-950/20' },
];

export function TasksPage() {
  const { workspaceId } = useParams();
  const { user } = useAuth();
  const { socket, joinWorkspace, leaveWorkspace } = useSocket();

  const [workspace, setWorkspace] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('MEDIUM');
  const [assignedTo, setAssignedTo] = useState('');
  const [creating, setCreating] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    fetchTasksAndMembers();
    joinWorkspace(workspaceId);

    return () => {
      leaveWorkspace(workspaceId);
    };
  }, [workspaceId]);

  // Real-time task events from Socket.IO
  useEffect(() => {
    if (!socket) return;

    const handleTaskCreated = ({ workspaceId: wsId, task }) => {
      if (wsId === workspaceId) {
        setTasks((prev) => [task, ...prev.filter((t) => t.id !== task.id)]);
      }
    };

    const handleTaskUpdated = ({ workspaceId: wsId, task }) => {
      if (wsId === workspaceId) {
        setTasks((prev) => prev.map((t) => (t.id === task.id ? task : t)));
      }
    };

    const handleTaskDeleted = ({ workspaceId: wsId, taskId }) => {
      if (wsId === workspaceId) {
        setTasks((prev) => prev.filter((t) => t.id !== taskId));
      }
    };

    socket.on('task_created', handleTaskCreated);
    socket.on('task_updated', handleTaskUpdated);
    socket.on('task_deleted', handleTaskDeleted);

    return () => {
      socket.off('task_created', handleTaskCreated);
      socket.off('task_updated', handleTaskUpdated);
      socket.off('task_deleted', handleTaskDeleted);
    };
  }, [socket, workspaceId]);

  const fetchTasksAndMembers = async () => {
    try {
      setLoading(true);
      const [wsRes, taskRes, memberRes] = await Promise.all([
        workspaceService.getWorkspaceById(workspaceId),
        taskService.getTasks(workspaceId),
        workspaceService.getMembers(workspaceId),
      ]);
      setWorkspace(wsRes.data.workspace);
      setTasks(taskRes.data.tasks || []);
      setMembers(memberRes.data.members || []);
    } catch (err) {
      console.error('Failed to load tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    setCreating(true);
    try {
      const res = await taskService.createTask(workspaceId, {
        title,
        description,
        priority,
        assigned_to: assignedTo || null,
        status: 'TODO',
      });

      const newTask = res.data.task;
      setTasks((prev) => [newTask, ...prev]);
      setShowCreateModal(false);
      setTitle('');
      setDescription('');
      setPriority('MEDIUM');
      setAssignedTo('');

      if (socket) {
        socket.emit('task_created', { workspaceId, task: newTask });
      }
    } catch (err) {
      console.error('Failed to create task:', err);
    } finally {
      setCreating(false);
    }
  };

  const handleUpdateStatus = async (taskId, newStatus) => {
    try {
      const res = await taskService.updateTask(taskId, { status: newStatus });
      const updatedTask = res.data.task;

      setTasks((prev) => prev.map((t) => (t.id === taskId ? updatedTask : t)));

      if (socket) {
        socket.emit('task_updated', { workspaceId, task: updatedTask });
      }
    } catch (err) {
      console.error('Failed to update task status:', err);
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;

    try {
      await taskService.deleteTask(taskId);
      setTasks((prev) => prev.filter((t) => t.id !== taskId));

      if (socket) {
        socket.emit('task_deleted', { workspaceId, taskId });
      }
    } catch (err) {
      console.error('Failed to delete task:', err);
    }
  };

  const getPriorityBadgeClass = (p) => {
    switch (p) {
      case 'URGENT': return 'bg-rose-950 text-rose-400 border-rose-800/60';
      case 'HIGH': return 'bg-amber-950 text-amber-400 border-amber-800/60';
      case 'MEDIUM': return 'bg-blue-950 text-blue-400 border-blue-800/60';
      default: return 'bg-slate-800 text-slate-400 border-slate-700';
    }
  };

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
                <CheckSquare className="w-6 h-6 text-emerald-400" />
                <span>Task Board ({tasks.length})</span>
              </h1>
              <p className="text-xs text-slate-400 mt-1">
                Real-time Kanban task management. Status changes broadcast instantly.
              </p>
            </div>

            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold rounded-xl shadow-lg shadow-blue-600/20 flex items-center space-x-2 transition-all shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Create Task</span>
            </button>
          </div>

          {/* Kanban Columns */}
          {loading ? (
            <div className="flex items-center justify-center py-16 text-slate-500 space-x-3">
              <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
              <span>Loading task board...</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {COLUMNS.map((col) => {
                const columnTasks = tasks.filter((t) => t.status === col.key);
                return (
                  <div
                    key={col.key}
                    className={`border rounded-2xl p-4 space-y-4 flex flex-col ${col.color}`}
                  >
                    <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                      <h3 className="text-sm font-bold text-slate-200">{col.label}</h3>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-semibold">
                        {columnTasks.length}
                      </span>
                    </div>

                    <div className="space-y-3 flex-1">
                      {columnTasks.length === 0 ? (
                        <div className="text-xs text-slate-600 text-center py-10 border border-dashed border-slate-800/80 rounded-xl">
                          No tasks in {col.label.toLowerCase()}
                        </div>
                      ) : (
                        columnTasks.map((task) => (
                          <div
                            key={task.id}
                            className="p-4 bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl space-y-3 shadow-md transition-all group"
                          >
                            <div className="flex items-start justify-between">
                              <h4 className="text-sm font-semibold text-slate-100">{task.title}</h4>
                              <button
                                onClick={() => handleDeleteTask(task.id)}
                                className="text-slate-600 hover:text-rose-400 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                title="Delete task"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>

                            {task.description && (
                              <p className="text-xs text-slate-400 line-clamp-2">{task.description}</p>
                            )}

                            <div className="flex items-center justify-between pt-2 border-t border-slate-800/60 text-xs">
                              <span className={`px-2 py-0.5 rounded border text-[10px] font-semibold ${getPriorityBadgeClass(task.priority)}`}>
                                {task.priority}
                              </span>

                              {task.assignee_name ? (
                                <div className="flex items-center space-x-1.5" title={`Assigned to ${task.assignee_name}`}>
                                  <div className={`w-5 h-5 rounded-full ${getAvatarColor(task.assignee_name)} flex items-center justify-center text-[10px] font-bold`}>
                                    {getInitials(task.assignee_name)}
                                  </div>
                                  <span className="text-[11px] text-slate-400 truncate max-w-[80px]">{task.assignee_name}</span>
                                </div>
                              ) : (
                                <span className="text-slate-600 text-[10px]">Unassigned</span>
                              )}
                            </div>

                            {/* Status Shift Buttons */}
                            <div className="flex items-center justify-between pt-1 text-[11px]">
                              {col.key !== 'TODO' && (
                                <button
                                  onClick={() => handleUpdateStatus(task.id, col.key === 'DONE' ? 'IN_PROGRESS' : 'TODO')}
                                  className="text-slate-400 hover:text-slate-200 flex items-center space-x-1"
                                >
                                  <ArrowLeft className="w-3 h-3" />
                                  <span>Move back</span>
                                </button>
                              )}
                              {col.key !== 'DONE' && (
                                <button
                                  onClick={() => handleUpdateStatus(task.id, col.key === 'TODO' ? 'IN_PROGRESS' : 'DONE')}
                                  className="text-blue-400 hover:text-blue-300 flex items-center space-x-1 ml-auto"
                                >
                                  <span>Move forward</span>
                                  <ArrowRight className="w-3 h-3" />
                                </button>
                              )}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>

      {/* Create Task Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-6">
            <h3 className="text-lg font-bold text-slate-100">Create New Task</h3>
            <form onSubmit={handleCreateTask} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Task Title
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Implement Redis Session Store"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-blue-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe task requirements..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-blue-500 text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                    Priority
                  </label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-blue-500 text-xs"
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="URGENT">Urgent</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                    Assign To Member
                  </label>
                  <select
                    value={assignedTo}
                    onChange={(e) => setAssignedTo(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-blue-500 text-xs"
                  >
                    <option value="">Unassigned</option>
                    {members.map((m) => (
                      <option key={m.user_id} value={m.user_id}>
                        {m.name}
                      </option>
                    ))}
                  </select>
                </div>
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
                  {creating ? 'Creating...' : 'Create Task'}
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
