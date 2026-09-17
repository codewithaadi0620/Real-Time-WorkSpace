import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      if (token) {
        try {
          const res = await authService.getCurrentUser();
          setUser(res.data.user);
          localStorage.setItem('user', JSON.stringify(res.data.user));
        } catch (err) {
          console.error('Failed to restore auth session:', err);
          logout();
        }
      }
      setLoading(false);
    };

    initAuth();
  }, [token]);

  const login = async (email, password) => {
    const res = await authService.login({ email, password });
    const { user: userData, token: tokenData } = res.data;

    setToken(tokenData);
    setUser(userData);
    localStorage.setItem('token', tokenData);
    localStorage.setItem('user', JSON.stringify(userData));
    return userData;
  };

  const register = async (name, email, password) => {
    const res = await authService.register({ name, email, password });
    const { user: userData, token: tokenData } = res.data;

    setToken(tokenData);
    setUser(userData);
    localStorage.setItem('token', tokenData);
    localStorage.setItem('user', JSON.stringify(userData));
    return userData;
  };

  const logout = async () => {
    try {
      if (token) {
        await authService.logout();
      }
    } catch (e) {
      // Ignore logout backend errors
    } finally {
      setToken(null);
      setUser(null);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
