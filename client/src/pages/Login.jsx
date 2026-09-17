import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Layers, LogIn, AlertCircle, Sparkles } from 'lucide-react';

export function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDemoLogin = async (demoEmail) => {
    setEmail(demoEmail);
    setPassword('password123');
    setError('');
    setSubmitting(true);
    try {
      await login(demoEmail, 'password123');
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Demo login failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center px-4 py-12">
      <div className="w-full max-w-md space-y-8">
        {/* Header Logo */}
        <div className="text-center">
          <div className="inline-flex p-3 bg-blue-600/10 border border-blue-500/20 rounded-2xl mb-4">
            <Layers className="w-10 h-10 text-blue-500" />
          </div>
          <h2 className="text-3xl font-extrabold text-slate-100 tracking-tight">
            Real-Time Workspace
          </h2>
          <p className="mt-2 text-sm text-slate-400">
            Sign in to collaborate on documents, tasks, and code in real time.
          </p>
        </div>

        {/* Demo Fast Login Bar for Interviews */}
        <div className="bg-slate-900/80 border border-blue-500/30 rounded-2xl p-4 shadow-xl backdrop-blur-md">
          <div className="flex items-center space-x-2 text-xs font-semibold text-blue-400 mb-2 uppercase tracking-wider">
            <Sparkles className="w-4 h-4" />
            <span>Interview Demo Preset Logins</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => handleDemoLogin('aditya@example.com')}
              className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs rounded-lg border border-slate-700 transition-colors font-medium truncate"
            >
              User A (Aditya)
            </button>
            <button
              onClick={() => handleDemoLogin('rahul@example.com')}
              className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs rounded-lg border border-slate-700 transition-colors font-medium truncate"
            >
              User B (Rahul)
            </button>
            <button
              onClick={() => handleDemoLogin('priya@example.com')}
              className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs rounded-lg border border-slate-700 transition-colors font-medium truncate"
            >
              User C (Priya)
            </button>
          </div>
        </div>

        {/* Login Card Form */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl">
          {error && (
            <div className="mb-6 p-3 bg-rose-950/50 border border-rose-800/60 rounded-xl text-rose-300 text-sm flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="aditya@example.com"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-sm"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-semibold py-3 px-4 rounded-xl shadow-lg shadow-blue-600/20 flex items-center justify-center space-x-2 transition-all text-sm"
            >
              <LogIn className="w-4 h-4" />
              <span>{submitting ? 'Authenticating...' : 'Sign In'}</span>
            </button>
          </form>

          <div className="mt-6 text-center text-xs text-slate-500">
            Don't have an account?{' '}
            <Link to="/register" className="text-blue-400 hover:text-blue-300 font-semibold ml-1">
              Create Account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
