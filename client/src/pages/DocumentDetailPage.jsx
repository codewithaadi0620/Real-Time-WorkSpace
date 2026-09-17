import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { documentService } from '../services/documentService';
import { commentService } from '../services/commentService';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { Navbar } from '../components/common/Navbar';
import { Toast } from '../components/common/Toast';
import {
  FileText,
  Save,
  Clock,
  History,
  MessageSquare,
  Send,
  Trash2,
  Users,
  ArrowLeft,
  Loader2,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { formatDistanceToNow, getInitials, getAvatarColor } from '../utils/formatters';

export function DocumentDetailPage() {
  const { documentId } = useParams();
  const { user } = useAuth();
  const { socket, joinDocument, leaveDocument } = useSocket();

  const [document, setDocument] = useState(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);

  // Auto Save state
  const [saveState, setSaveState] = useState('Saved just now'); // 'Saving...', 'Saved just now', 'Unsaved changes'
  const autoSaveTimerRef = useRef(null);
  const typingTimerRef = useRef(null);

  // Real-Time Typing indicators state
  const [activeTypingUsers, setActiveTypingUsers] = useState([]);

  // Version history state
  const [showVersions, setShowVersions] = useState(false);
  const [versions, setVersions] = useState([]);
  const [loadingVersions, setLoadingVersions] = useState(false);

  // Comments state
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);

  useEffect(() => {
    fetchDocumentDetails();
    fetchComments();
    joinDocument(documentId);

    return () => {
      leaveDocument(documentId);
    };
  }, [documentId]);

  // Socket listener registrations
  useEffect(() => {
    if (!socket) return;

    // Listen to real-time document content updates from peer users
    const handleDocumentUpdated = (data) => {
      if (data.documentId === documentId && data.updatedBy.id !== user.id) {
        if (data.title !== undefined) setTitle(data.title);
        if (data.content !== undefined) setContent(data.content);
        setSaveState(`Updated by ${data.updatedBy.name}`);
      }
    };

    // Listen to typing indicators
    const handleTypingStart = ({ documentId: docId, user: typingUser }) => {
      if (docId === documentId && typingUser.id !== user.id) {
        setActiveTypingUsers((prev) => {
          if (!prev.some((u) => u.id === typingUser.id)) {
            return [...prev, typingUser];
          }
          return prev;
        });
      }
    };

    const handleTypingStop = ({ documentId: docId, userId }) => {
      if (docId === documentId) {
        setActiveTypingUsers((prev) => prev.filter((u) => u.id !== userId));
      }
    };

    // Listen to live comments added by other users
    const handleCommentAdded = ({ documentId: docId, comment }) => {
      if (docId === documentId) {
        setComments((prev) => {
          if (prev.some((c) => c.id === comment.id)) return prev;
          return [...prev, comment];
        });
      }
    };

    socket.on('document_updated', handleDocumentUpdated);
    socket.on('typing_start', handleTypingStart);
    socket.on('typing_stop', handleTypingStop);
    socket.on('comment_added', handleCommentAdded);

    return () => {
      socket.off('document_updated', handleDocumentUpdated);
      socket.off('typing_start', handleTypingStart);
      socket.off('typing_stop', handleTypingStop);
      socket.off('comment_added', handleCommentAdded);
    };
  }, [socket, documentId, user.id]);

  const fetchDocumentDetails = async () => {
    try {
      setLoading(true);
      const res = await documentService.getDocumentById(documentId);
      const doc = res.data.document;
      setDocument(doc);
      setTitle(doc.title);
      setContent(doc.content || '');
    } catch (err) {
      console.error('Failed to load document details:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchComments = async () => {
    try {
      const res = await commentService.getComments(documentId);
      setComments(res.data.comments || []);
    } catch (err) {
      console.error('Failed to load comments:', err);
    }
  };

  const fetchVersionHistory = async () => {
    setLoadingVersions(true);
    try {
      const res = await documentService.getVersions(documentId);
      setVersions(res.data.versions || []);
      setShowVersions(true);
    } catch (err) {
      console.error('Failed to fetch versions:', err);
    } finally {
      setLoadingVersions(false);
    }
  };

  // Handle Text Editing & Auto-Save
  const handleContentChange = (newText) => {
    setContent(newText);
    setSaveState('Saving...');

    // Emit typing_start event to WebSockets
    if (socket) {
      socket.emit('typing_start', { documentId });

      if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
      typingTimerRef.current = setTimeout(() => {
        socket.emit('typing_stop', { documentId });
      }, 1500);

      // Broadcast instant change over WebSockets
      socket.emit('document_update', {
        documentId,
        title,
        content: newText,
        workspaceId: document?.workspace_id,
      });
    }

    // Debounced Auto-Save to PostgreSQL database (750ms)
    if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
    autoSaveTimerRef.current = setTimeout(async () => {
      try {
        await documentService.updateDocument(documentId, { title, content: newText });
        setSaveState('Saved just now');
      } catch (err) {
        console.error('Auto-save failed:', err);
        setSaveState('Save failed');
      }
    }, 750);
  };

  const handleTitleChange = (newTitle) => {
    setTitle(newTitle);
    setSaveState('Saving...');

    if (socket) {
      socket.emit('document_update', {
        documentId,
        title: newTitle,
        content,
        workspaceId: document?.workspace_id,
      });
    }

    if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
    autoSaveTimerRef.current = setTimeout(async () => {
      try {
        await documentService.updateDocument(documentId, { title: newTitle, content });
        setSaveState('Saved just now');
      } catch (err) {
        console.error('Title save failed:', err);
      }
    }, 750);
  };

  // Add Comment
  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setSubmittingComment(true);
    try {
      const res = await commentService.addComment(documentId, newComment);
      const addedComment = res.data.comment;
      setComments((prev) => [...prev, addedComment]);
      setNewComment('');

      // Emit comment_added over WebSocket
      if (socket) {
        socket.emit('comment_added', { documentId, comment: addedComment });
      }
    } catch (err) {
      console.error('Failed to post comment:', err);
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      await commentService.deleteComment(commentId);
      setComments((prev) => prev.filter((c) => c.id !== commentId));
    } catch (err) {
      console.error('Failed to delete comment:', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400 space-x-3">
        <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
        <span>Loading document...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Navbar workspaceName="Collaborative Document" />

      {/* Editor Sub-Header Toolbar */}
      <div className="bg-slate-900 border-b border-slate-800 px-6 py-3 flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center space-x-4">
          <Link
            to={`/workspaces/${document?.workspace_id}/documents`}
            className="flex items-center space-x-1 text-xs text-slate-400 hover:text-slate-200 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Documents</span>
          </Link>

          <span className="text-slate-700">|</span>

          {/* Auto Save Status Indicator */}
          <div className="flex items-center space-x-1.5 text-xs">
            {saveState === 'Saving...' ? (
              <Loader2 className="w-3.5 h-3.5 text-blue-400 animate-spin" />
            ) : (
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            )}
            <span className="text-slate-300 font-medium">{saveState}</span>
          </div>

          {/* Active Typing Indicator Banner */}
          {activeTypingUsers.length > 0 && (
            <div className="flex items-center space-x-2 bg-blue-950/60 border border-blue-800/60 text-blue-300 text-xs px-3 py-1 rounded-full animate-pulse">
              <span className="font-semibold">
                {activeTypingUsers.map((u) => u.name).join(', ')}{' '}
                {activeTypingUsers.length === 1 ? 'is typing...' : 'are editing...'}
              </span>
            </div>
          )}
        </div>

        {/* Toolbar Actions */}
        <div className="flex items-center space-x-3">
          <button
            onClick={fetchVersionHistory}
            className="flex items-center space-x-2 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg border border-slate-700 transition-all"
          >
            <History className="w-4 h-4 text-blue-400" />
            <span>Version History</span>
          </button>
        </div>
      </div>

      {/* Main Document Body + Comments Sidebar */}
      <div className="flex-1 flex overflow-hidden">
        {/* Document Editor Area */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-10 space-y-6 max-w-4xl mx-auto w-full">
          {/* Document Title Input */}
          <input
            type="text"
            value={title}
            onChange={(e) => handleTitleChange(e.target.value)}
            placeholder="Untitled Document..."
            className="w-full bg-transparent text-3xl font-extrabold text-slate-100 focus:outline-none placeholder-slate-600 border-b border-transparent focus:border-slate-700 pb-2 transition-all"
          />

          <div className="text-xs text-slate-500 flex items-center space-x-2">
            <span>Edited by {document?.updater_name || user.name}</span>
            <span>·</span>
            <span>{formatDistanceToNow(document?.updated_at)}</span>
          </div>

          {/* Text Editor TextArea */}
          <textarea
            value={content}
            onChange={(e) => handleContentChange(e.target.value)}
            placeholder="Write your document content here in Markdown..."
            rows={20}
            className="w-full bg-slate-900/60 border border-slate-800 rounded-2xl p-6 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-blue-500/50 font-mono text-sm leading-relaxed resize-y shadow-inner transition-all"
          />
        </div>

        {/* Comments Sidebar */}
        <aside className="w-80 bg-slate-900 border-l border-slate-800 flex flex-col justify-between shrink-0 hidden lg:flex">
          <div className="p-4 border-b border-slate-800 flex items-center space-x-2">
            <MessageSquare className="w-4 h-4 text-blue-400" />
            <h3 className="text-sm font-bold text-slate-200">Document Comments ({comments.length})</h3>
          </div>

          {/* Comments List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {comments.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-10">No comments yet. Start a discussion!</p>
            ) : (
              comments.map((c) => (
                <div key={c.id} className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-200">{c.user_name}</span>
                    <span className="text-slate-500">{formatDistanceToNow(c.created_at)}</span>
                  </div>
                  <p className="text-slate-300 whitespace-pre-wrap">{c.content}</p>
                  {c.user_id === user.id && (
                    <div className="flex justify-end pt-1">
                      <button
                        onClick={() => handleDeleteComment(c.id)}
                        className="text-slate-500 hover:text-rose-400 text-[10px] flex items-center space-x-1"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>Delete</span>
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Comment Form */}
          <form onSubmit={handleAddComment} className="p-4 border-t border-slate-800 bg-slate-900">
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Write a comment..."
                className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-blue-500"
              />
              <button
                type="submit"
                disabled={submittingComment}
                className="p-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl disabled:opacity-50 transition-colors"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </form>
        </aside>
      </div>

      {/* Version History Modal */}
      {showVersions && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <h3 className="text-lg font-bold text-slate-100 flex items-center space-x-2">
                <History className="w-5 h-5 text-blue-400" />
                <span>Version History Log</span>
              </h3>
              <button
                onClick={() => setShowVersions(false)}
                className="text-slate-400 hover:text-slate-200 text-sm font-semibold"
              >
                Close
              </button>
            </div>

            <div className="max-h-96 overflow-y-auto divide-y divide-slate-800">
              {versions.length === 0 ? (
                <p className="text-center text-slate-500 py-8">No previous version snapshots stored.</p>
              ) : (
                versions.map((ver, idx) => (
                  <div key={ver.id} className="py-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-blue-400">
                        Version {versions.length - idx}
                      </span>
                      <span className="text-xs text-slate-400">
                        {ver.editor_name} · {formatDistanceToNow(ver.created_at)}
                      </span>
                    </div>
                    <pre className="bg-slate-950 p-3 rounded-xl text-xs font-mono text-slate-300 max-h-32 overflow-y-auto whitespace-pre-wrap">
                      {ver.content}
                    </pre>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      <Toast />
    </div>
  );
}
