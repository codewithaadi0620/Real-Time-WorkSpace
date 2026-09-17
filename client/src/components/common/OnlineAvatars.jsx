import React from 'react';
import { useSocket } from '../../context/SocketContext';
import { getInitials, getAvatarColor } from '../../utils/formatters';

export function OnlineAvatars({ workspaceId }) {
  const { onlineUsers, connectionStatus } = useSocket();

  return (
    <div className="flex items-center space-x-2 bg-slate-800/80 border border-slate-700/60 rounded-full px-3 py-1.5 backdrop-blur-sm">
      <div className="flex items-center space-x-1">
        <span className={`w-2.5 h-2.5 rounded-full ${connectionStatus === 'Connected' ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
        <span className="text-xs font-medium text-slate-300 mr-2">
          {onlineUsers.length} {onlineUsers.length === 1 ? 'user' : 'users'} online
        </span>
      </div>

      <div className="flex -space-x-2 overflow-hidden">
        {onlineUsers.slice(0, 5).map((u) => (
          <div
            key={u.id}
            title={`${u.name} (${u.email}) - Online`}
            className={`inline-block h-7 w-7 rounded-full ring-2 ring-slate-900 ${getAvatarColor(u.name)} flex items-center justify-center text-xs font-semibold uppercase transition-transform hover:scale-110`}
          >
            {getInitials(u.name)}
          </div>
        ))}
        {onlineUsers.length > 5 && (
          <div className="inline-block h-7 w-7 rounded-full ring-2 ring-slate-900 bg-slate-700 text-slate-300 flex items-center justify-center text-xs font-semibold">
            +{onlineUsers.length - 5}
          </div>
        )}
      </div>
    </div>
  );
}
