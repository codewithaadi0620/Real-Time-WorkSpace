import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { workspaceService } from '../../services/workspaceService';
import { useDebounce } from '../../hooks/useDebounce';
import { Search, FileText, CheckSquare, User, X, Loader2 } from 'lucide-react';
import { formatDistanceToNow } from '../../utils/formatters';

export function WorkspaceSearch({ isOpen, onClose }) {
  const { workspaceId } = useParams();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, 300);
  const [results, setResults] = useState({ documents: [], tasks: [], members: [] });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setQuery('');
      setResults({ documents: [], tasks: [], members: [] });
      return;
    }
  }, [isOpen]);

  useEffect(() => {
    const fetchSearch = async () => {
      if (!debouncedQuery.trim()) {
        setResults({ documents: [], tasks: [], members: [] });
        return;
      }

      setLoading(true);
      try {
        const res = await workspaceService.searchWorkspace(workspaceId, debouncedQuery);
        setResults(res.data.results || { documents: [], tasks: [], members: [] });
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setLoading(false);
      }
    };

    if (workspaceId && isOpen) {
      fetchSearch();
    }
  }, [debouncedQuery, workspaceId, isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-start justify-center pt-20 px-4">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* Search Header Input */}
        <div className="p-4 border-b border-slate-800 flex items-center space-x-3 bg-slate-900/90">
          <Search className="w-5 h-5 text-slate-400" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search documents, tasks, or team members..."
            className="w-full bg-transparent text-slate-100 placeholder-slate-500 focus:outline-none text-base"
          />
          {loading && <Loader2 className="w-5 h-5 text-blue-400 animate-spin" />}
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-200">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Results List */}
        <div className="max-h-[60vh] overflow-y-auto p-4 space-y-6">
          {query.trim() !== '' && !loading &&
           results.documents.length === 0 &&
           results.tasks.length === 0 &&
           results.members.length === 0 && (
            <div className="text-center py-12 text-slate-500">
              No matching documents, tasks, or members found for "{query}".
            </div>
          )}

          {/* Documents Results */}
          {results.documents.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center space-x-1.5">
                <FileText className="w-3.5 h-3.5 text-blue-400" />
                <span>Documents ({results.documents.length})</span>
              </h4>
              <div className="space-y-1">
                {results.documents.map((doc) => (
                  <div
                    key={doc.id}
                    onClick={() => {
                      onClose();
                      navigate(`/documents/${doc.id}`);
                    }}
                    className="p-3 bg-slate-800/40 hover:bg-slate-800 border border-slate-700/40 hover:border-slate-600 rounded-xl cursor-pointer transition-all flex items-center justify-between"
                  >
                    <div>
                      <p className="text-sm font-medium text-slate-200">{doc.title}</p>
                      <p className="text-xs text-slate-400 line-clamp-1 mt-0.5">{doc.content}</p>
                    </div>
                    <span className="text-xs text-slate-500 shrink-0 ml-3">{formatDistanceToNow(doc.updated_at)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tasks Results */}
          {results.tasks.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center space-x-1.5">
                <CheckSquare className="w-3.5 h-3.5 text-emerald-400" />
                <span>Tasks ({results.tasks.length})</span>
              </h4>
              <div className="space-y-1">
                {results.tasks.map((task) => (
                  <div
                    key={task.id}
                    onClick={() => {
                      onClose();
                      navigate(`/workspaces/${workspaceId}/tasks`);
                    }}
                    className="p-3 bg-slate-800/40 hover:bg-slate-800 border border-slate-700/40 hover:border-slate-600 rounded-xl cursor-pointer transition-all flex items-center justify-between"
                  >
                    <div>
                      <span className="text-sm font-medium text-slate-200">{task.title}</span>
                      <span className="ml-2 text-xs px-2 py-0.5 rounded bg-slate-700 text-slate-300">{task.status}</span>
                    </div>
                    {task.assignee_name && (
                      <span className="text-xs text-slate-400 shrink-0">Assigned: {task.assignee_name}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Members Results */}
          {results.members.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center space-x-1.5">
                <User className="w-3.5 h-3.5 text-indigo-400" />
                <span>Members ({results.members.length})</span>
              </h4>
              <div className="space-y-1">
                {results.members.map((m) => (
                  <div
                    key={m.id}
                    className="p-3 bg-slate-800/40 border border-slate-700/40 rounded-xl flex items-center justify-between"
                  >
                    <div>
                      <p className="text-sm font-medium text-slate-200">{m.name}</p>
                      <p className="text-xs text-slate-400">{m.email}</p>
                    </div>
                    <span className="text-xs px-2 py-0.5 rounded bg-blue-950 text-blue-400 border border-blue-800/50">{m.role}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
