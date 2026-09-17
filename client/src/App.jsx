import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import { NotificationProvider } from './context/NotificationContext';

import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Dashboard } from './pages/Dashboard';
import { WorkspaceOverview } from './pages/WorkspaceOverview';
import { DocumentsPage } from './pages/DocumentsPage';
import { DocumentDetailPage } from './pages/DocumentDetailPage';
import { TasksPage } from './pages/TasksPage';
import { MembersPage } from './pages/MembersPage';

function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400">
        Loading session...
      </div>
    );
  }
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <SocketProvider>
          <NotificationProvider>
            <Routes>
              {/* Public Auth Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* Protected App Routes */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/workspaces/:workspaceId"
                element={
                  <ProtectedRoute>
                    <WorkspaceOverview />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/workspaces/:workspaceId/documents"
                element={
                  <ProtectedRoute>
                    <DocumentsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/documents/:documentId"
                element={
                  <ProtectedRoute>
                    <DocumentDetailPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/workspaces/:workspaceId/tasks"
                element={
                  <ProtectedRoute>
                    <TasksPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/workspaces/:workspaceId/members"
                element={
                  <ProtectedRoute>
                    <MembersPage />
                  </ProtectedRoute>
                }
              />

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </NotificationProvider>
        </SocketProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
