import React from 'react';
import { NavLink, useParams } from 'react-router-dom';
import { LayoutDashboard, FileText, CheckSquare, Users, ArrowLeft } from 'lucide-react';

export function Sidebar({ workspaceName }) {
  const { workspaceId } = useParams();

  const navItems = [
    {
      name: 'Overview',
      path: `/workspaces/${workspaceId}`,
      icon: LayoutDashboard,
    },
    {
      name: 'Documents',
      path: `/workspaces/${workspaceId}/documents`,
      icon: FileText,
    },
    {
      name: 'Task Board',
      path: `/workspaces/${workspaceId}/tasks`,
      icon: CheckSquare,
    },
    {
      name: 'Members',
      path: `/workspaces/${workspaceId}/members`,
      icon: Users,
    },
  ];

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col justify-between shrink-0 hidden md:flex">
      <div className="p-4 space-y-6">
        <NavLink
          to="/dashboard"
          className="flex items-center space-x-2 text-slate-400 hover:text-slate-200 text-xs font-medium transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>All Workspaces</span>
        </NavLink>

        <div className="space-y-1">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-3 mb-2">
            Workspace Nav
          </p>

          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              end={item.path === `/workspaces/${workspaceId}`}
              className={({ isActive }) =>
                `flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-blue-600/10 text-blue-400 border border-blue-500/20 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`
              }
            >
              <item.icon className="w-4 h-4" />
              <span>{item.name}</span>
            </NavLink>
          ))}
        </div>
      </div>

      <div className="p-4 border-t border-slate-800/80 bg-slate-900/40">
        <div className="text-xs text-slate-500 font-mono">
          <p>Real-Time Engine</p>
          <p className="text-emerald-400 mt-0.5">Socket.IO + Redis active</p>
        </div>
      </div>
    </aside>
  );
}
