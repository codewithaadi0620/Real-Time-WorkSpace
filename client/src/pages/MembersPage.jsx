import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { workspaceService } from '../services/workspaceService';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { Navbar } from '../components/common/Navbar';
import { Sidebar } from '../components/common/Sidebar';
import { WorkspaceSearch } from '../components/workspace/WorkspaceSearch';
import { Toast } from '../components/common/Toast';
import { Users, UserPlus, Shield, Trash2, Mail, Loader2, Check } from 'lucide-react';
import { formatDistanceToNow, getInitials, getAvatarColor } from '../utils/formatters';

export function MembersPage() {
  const { workspaceId } = useParams();
  const { user } = useAuth();
  const { onlineUsers } = useSocket();

  const [workspace, setWorkspace] = useState(null);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showAddModal, setShowAddModal] = useState(false);
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('MEMBER');
  const [adding, setAdding] = useState(false);
  const [addError, setAddError] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    fetchMembersData();
  }, [workspaceId]);

  const fetchMembersData = async () => {
    try {
      setLoading(true);
      const [wsRes, memRes] = await Promise.all([
        workspaceService.getWorkspaceById(workspaceId),
        workspaceService.getMembers(workspaceId),
      ]);
      setWorkspace(wsRes.data.workspace);
      setMembers(memRes.data.members || []);
    } catch (err) {
      console.error('Failed to fetch workspace members:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;

    setAdding(true);
    setAddError('');
    try {
      await workspaceService.addMember(workspaceId, { email, role });
      setShowAddModal(false);
      setEmail('');
      setRole('MEMBER');
      fetchMembersData();
    } catch (err) {
      setAddError(err.message || 'Failed to add member');
    } finally {
      setAdding(false);
    }
  };

  const handleRemoveMember = async (targetUserId, memberName) => {
    if (!window.confirm(`Are you sure you want to remove ${memberName} from this workspace?`)) return;

    try {
      await workspaceService.removeMember(workspaceId, targetUserId);
      setMembers((prev) => prev.filter((m) => m.user_id !== targetUserId));
    } catch (err) {
      console.error('Failed to remove member:', err);
    }
  };

  const isOnline = (userId) => onlineUsers.some((u) => u.id === userId);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Navbar workspaceName={workspace?.name} onOpenSearch={() => setSearchOpen(true)} />

      <div className="flex-1 flex overflow-hidden">
        <Sidebar workspaceName={workspace?.name} />

        <main className="flex-1 overflow-y-auto p-6 space-y-6 max-w-7xl mx-auto w-full">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-100 flex items-center space-x-2">
                <Users className="w-6 h-6 text-purple-400" />
                <span>Workspace Members ({members.length})</span>
              </h1>
              <p className="text-xs text-slate-400 mt-1">
                Manage members, grant workspace roles, and view online status.
              </p>
            </div>

            {(workspace?.current_user_role === 'OWNER' || workspace?.current_user_role === 'ADMIN') && (
              <button
                onClick={() => setShowAddModal(true)}
                className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold rounded-xl shadow-lg shadow-blue-600/20 flex items-center space-x-2 transition-all shrink-0"
              >
                <UserPlus className="w-4 h-4" />
                <span>Add Member</span>
              </button>
            )}
          </div>

          {/* Members Table */}
          {loading ? (
            <div className="flex items-center justify-center py-16 text-slate-500 space-x-3">
              <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
              <span>Loading workspace members...</span>
            </div>
          ) : (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
              <div className="divide-y divide-slate-800">
                {members.map((m) => {
                  const online = isOnline(m.user_id);
                  return (
                    <div
                      key={m.id}
                      className="p-4 sm:p-5 flex items-center justify-between hover:bg-slate-800/40 transition-colors"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="relative">
                          <div className={`w-10 h-10 rounded-full ${getAvatarColor(m.name)} flex items-center justify-center font-bold text-sm`}>
                            {getInitials(m.name)}
                          </div>
                          <span
                            className={`absolute bottom-0 right-0 w-3 h-3 rounded-full ring-2 ring-slate-900 ${
                              online ? 'bg-emerald-500' : 'bg-slate-600'
                            }`}
                            title={online ? 'Online now' : 'Offline'}
                          />
                        </div>

                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="font-semibold text-slate-200 text-sm">{m.name}</span>
                            {online && (
                              <span className="text-[10px] bg-emerald-950 text-emerald-400 border border-emerald-800/60 px-1.5 py-0.5 rounded font-medium">
                                Online
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-400 mt-0.5">{m.email}</p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-4">
                        <span className={`text-xs px-2.5 py-1 rounded-full font-semibold border ${
                          m.role === 'OWNER' ? 'bg-amber-950/60 text-amber-400 border-amber-800/60' :
                          m.role === 'ADMIN' ? 'bg-purple-950/60 text-purple-400 border-purple-800/60' : 'bg-slate-800 text-slate-300 border-slate-700'
                        }`}>
                          {m.role}
                        </span>

                        {(workspace?.current_user_role === 'OWNER' || workspace?.current_user_role === 'ADMIN') && m.role !== 'OWNER' && m.user_id !== user.id && (
                          <button
                            onClick={() => handleRemoveMember(m.user_id, m.name)}
                            className="text-slate-500 hover:text-rose-400 p-2 rounded-lg hover:bg-slate-800 transition-colors"
                            title="Remove member"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Add Member Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-6">
            <h3 className="text-lg font-bold text-slate-100">Add Workspace Member</h3>
            {addError && (
              <div className="p-3 bg-rose-950/50 border border-rose-800/60 rounded-xl text-rose-300 text-xs">
                {addError}
              </div>
            )}
            <form onSubmit={handleAddMember} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Member Email
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="rahul@example.com"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-blue-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Role
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-blue-500 text-xs"
                >
                  <option value="MEMBER">Member (Read & Edit)</option>
                  <option value="ADMIN">Admin (Manage Members & Settings)</option>
                </select>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-semibold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={adding}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold rounded-xl disabled:opacity-50"
                >
                  {adding ? 'Adding...' : 'Add Member'}
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
