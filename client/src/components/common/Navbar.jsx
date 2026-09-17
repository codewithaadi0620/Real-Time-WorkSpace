import React, { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { useNotifications } from '../../context/NotificationContext';
import { OnlineAvatars } from './OnlineAvatars';
import {
  Layers,
  Search,
  Bell,
  LogOut,
  User,
  CheckCheck,
  Wifi,
  WifiOff,
} from 'lucide-react';
import { getInitials, getAvatarColor, formatDistanceToNow } from '../../utils/formatters';

export function Navbar({ workspaceName, onOpenSearch }) {
  const { user, logout } = useAuth();
  const { connectionStatus } = useSocket();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const navigate = useNavigate();
  const { workspaceId } = useParams();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-40 bg-slate-900/90 border-b border-slate-800 backdrop-blur-md px-4 py-3 flex items-center justify-between">
      {/* Left section: Logo & Workspace Title */}
      <div className="flex items-center space-x-4">
        <Link to="/dashboard" className="flex items-center space-x-2 text-blue-500 font-bold text-lg hover:opacity-90 transition-opacity">
          <div className="p-1.5 bg-blue-600/20 rounded-lg border border-blue-500/30">
            <Layers className="w-5 h-5 text-blue-400" />
          </div>
          <span className="hidden sm:inline bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
            CollabSpace
          </span>
        </Link>

        {workspaceName && (
          <div className="flex items-center space-x-2 text-sm text-slate-400">
            <span>/</span>
            <span className="font-semibold text-slate-200">{workspaceName}</span>
          </div>
        )}
      </div>

      {/* Middle section: Search & Presence */}
      <div className="flex items-center space-x-3">
        {workspaceId && onOpenSearch && (
          <button
            onClick={onOpenSearch}
            className="flex items-center space-x-2 bg-slate-800 hover:bg-slate-700/80 text-slate-400 hover:text-slate-200 text-sm px-3 py-1.5 rounded-lg border border-slate-700/60 transition-all w-48 sm:w-64"
          >
            <Search className="w-4 h-4" />
            <span className="truncate">Search workspace...</span>
            <kbd className="hidden sm:inline ml-auto text-xs bg-slate-900 px-1.5 py-0.5 rounded text-slate-500">⌘K</kbd>
          </button>
        )}

        {workspaceId && <OnlineAvatars workspaceId={workspaceId} />}
      </div>

      {/* Right section: Connection indicator, Notifications, Profile */}
      <div className="flex items-center space-x-3">
        {/* Socket Status Pill */}
        <div
          title={`WebSocket Status: ${connectionStatus}`}
          className={`hidden md:flex items-center space-x-1.5 text-xs px-2.5 py-1 rounded-full border ${
            connectionStatus === 'Connected'
              ? 'bg-emerald-950/40 text-emerald-400 border-emerald-800/60'
              : 'bg-amber-950/40 text-amber-400 border-amber-800/60'
          }`}
        >
          {connectionStatus === 'Connected' ? <Wifi className="w-3.5 h-3.5" /> : <WifiOff className="w-3.5 h-3.5 animate-bounce" />}
          <span>{connectionStatus}</span>
        </div>

        {/* Notifications Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors border border-slate-700/50"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl z-50 overflow-hidden">
              <div className="p-3 bg-slate-900 border-b border-slate-700 flex items-center justify-between">
                <span className="font-semibold text-sm text-slate-200">Notifications</span>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-xs text-blue-400 hover:text-blue-300 flex items-center space-x-1"
                  >
                    <CheckCheck className="w-3.5 h-3.5" />
                    <span>Mark all read</span>
                  </button>
                )}
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-slate-700/60">
                {notifications.length === 0 ? (
                  <div className="p-6 text-center text-slate-500 text-sm">No notifications yet</div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => markAsRead(n.id)}
                      className={`p-3 text-xs transition-colors cursor-pointer hover:bg-slate-700/50 ${
                        !n.read ? 'bg-blue-950/30 border-l-2 border-blue-500' : ''
                      }`}
                    >
                      <p className="text-slate-200 font-medium">{n.message}</p>
                      <span className="text-slate-400 mt-1 block">{formatDistanceToNow(n.created_at)}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Profile Menu Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center space-x-2 p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700/50 transition-all"
          >
            <div className={`w-7 h-7 rounded-full ${getAvatarColor(user?.name)} flex items-center justify-center text-xs font-bold`}>
              {getInitials(user?.name)}
            </div>
            <span className="hidden sm:inline text-xs font-medium max-w-[100px] truncate">{user?.name}</span>
          </button>

          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl py-1.5 z-50">
              <div className="px-4 py-2 border-b border-slate-700">
                <p className="text-xs font-semibold text-slate-200 truncate">{user?.name}</p>
                <p className="text-xs text-slate-400 truncate">{user?.email}</p>
              </div>

              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-2 text-xs text-rose-400 hover:bg-slate-700/60 flex items-center space-x-2 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Log out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
