/**
 * PayRoll Pro – Auth Context
 * Global authentication state management using React Context.
 * Provides login, logout, and user state to all components.
 */

import { createContext, useState, useEffect, useCallback } from 'react';
import api from '../api/axios';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  /**
   * Load user data from localStorage on app mount.
   * Verifies the stored token is still valid by calling /auth/me.
   */
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');

      if (storedToken && storedUser) {
        try {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));

          // Verify token is still valid
          const response = await api.get('/auth/me');
          if (response.data.success) {
            setUser(response.data.data);
            localStorage.setItem('user', JSON.stringify(response.data.data));
          }
        } catch (error) {
          // Token is invalid/expired – clean up
          console.warn('Session expired, logging out');
          logout();
        }
      }

      setLoading(false);
    };

    initAuth();
  }, []);

  /**
   * Login with email and password.
   * Stores token and user data in localStorage.
   * @param {string} email
   * @param {string} password
   * @returns {Promise<Object>} User data
   */
  const login = useCallback(async (email, password) => {
    const response = await api.post('/auth/login', { email, password });

    if (response.data.success) {
      const { token: newToken, user: userData } = response.data.data;

      localStorage.setItem('token', newToken);
      localStorage.setItem('user', JSON.stringify(userData));

      setToken(newToken);
      setUser(userData);

      return userData;
    }

    throw new Error(response.data.message || 'Login failed');
  }, []);

  /**
   * Logout – Clear all auth state and localStorage.
   */
  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  }, []);

  /**
   * Check if the user has a specific role.
   * @param  {...string} roles - Roles to check
   * @returns {boolean}
   */
  const hasRole = useCallback((...roles) => {
    return user ? roles.includes(user.role) : false;
  }, [user]);

  const value = {
    user,
    setUser,
    token,
    loading,
    isAuthenticated: !!token && !!user,
    login,
    logout,
    hasRole,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
