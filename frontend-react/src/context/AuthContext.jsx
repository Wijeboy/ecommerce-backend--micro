import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { request } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem('user');
    return raw ? JSON.parse(raw) : null;
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
  }, [token]);

  useEffect(() => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      localStorage.removeItem('user');
    }
  }, [user]);

  const register = useCallback(async (payload) => {
    setLoading(true);
    try {
      return await request('/api/users/register', {
        method: 'POST',
        body: payload,
      });
    } finally {
      setLoading(false);
    }
  }, []);

  const registerAdmin = useCallback(async (payload, adminSecret) => {
    setLoading(true);
    try {
      return await request('/api/users/register-admin', {
        method: 'POST',
        headers: {
          'x-admin-secret': adminSecret,
        },
        body: payload,
      });
    } finally {
      setLoading(false);
    }
  }, []);

  const login = useCallback(async (payload) => {
    setLoading(true);
    try {
      const data = await request('/api/users/login', {
        method: 'POST',
        body: payload,
      });
      setToken(data.token || '');
      setUser(data.user || null);
      return data;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchProfile = useCallback(async () => {
    if (!token) return null;
    const profile = await request('/api/users/profile', { token });
    setUser((prev) => ({ ...prev, ...profile }));
    return profile;
  }, [token]);

  const updateProfile = useCallback(async (payload) => {
    const data = await request('/api/users/profile', {
      method: 'PUT',
      token,
      body: payload,
    });

    if (data.user) {
      setUser((prev) => ({ ...prev, ...data.user }));
    }

    return data;
  }, [token]);

  const logout = useCallback(() => {
    setToken('');
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({
      token,
      user,
      loading,
      isAuthenticated: Boolean(token),
      register,
      registerAdmin,
      login,
      fetchProfile,
      updateProfile,
      logout,
    }),
    [token, user, loading, register, registerAdmin, login, fetchProfile, updateProfile, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }
  return context;
}
