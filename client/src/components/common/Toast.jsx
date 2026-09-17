import React from 'react';
import { useNotifications } from '../../context/NotificationContext';
import { Bell, X } from 'lucide-react';

export function Toast() {
  const { toast, clearToast } = useNotifications();

  if (!toast) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex items-center space-x-3 bg-slate-800 border border-blue-500/40 text-slate-100 px-4 py-3 rounded-xl shadow-2xl animate-bounce backdrop-blur-lg">
      <div className="p-2 bg-blue-500/20 text-blue-400 rounded-lg">
        <Bell className="w-5 h-5" />
      </div>
      <div className="pr-4 text-sm font-medium">
        {toast.message}
      </div>
      <button
        onClick={clearToast}
        className="text-slate-400 hover:text-slate-200 transition-colors p-1"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
