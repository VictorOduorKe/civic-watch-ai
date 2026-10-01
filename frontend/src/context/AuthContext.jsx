import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('civicwatch_token'));
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  // Restore authenticated session on application mount
  useEffect(() => {
    async function initAuth() {
      const storedToken = localStorage.getItem('civicwatch_token');
      if (!storedToken) {
        setLoading(false);
        return;
      }

      try {
        const response = await authApi.getMe();
        if (response.success && response.user) {
          setUser(response.user);
        } else {
          // Token invalid or user deactivated
          localStorage.removeItem('civicwatch_token');
          setToken(null);
          setUser(null);
        }
      } catch (err) {
        console.warn('[Auth] Session restoration failed:', err.message);
        localStorage.removeItem('civicwatch_token');
        setToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    }

    initAuth();
  }, []);

  /**
   * User login handler.
   */
  async function login(credentials) {
    setAuthError(null);
    try {
      const result = await authApi.login(credentials);
      if (result.success && result.data) {
        const { user: loggedInUser, token: authToken } = result.data;
        localStorage.setItem('civicwatch_token', authToken);
        setToken(authToken);
        setUser(loggedInUser);
        return { success: true, user: loggedInUser };
      }
      throw new Error(result.message || 'Login failed.');
    } catch (err) {
      setAuthError(err.message);
      throw err;
    }
  }

  /**
   * User registration handler.
   */
  async function register(userData) {
    setAuthError(null);
    try {
      const result = await authApi.register(userData);
      if (result.success && result.data) {
        const { user: registeredUser, token: authToken } = result.data;
        localStorage.setItem('civicwatch_token', authToken);
        setToken(authToken);
        setUser(registeredUser);
        return { success: true, user: registeredUser };
      }
      throw new Error(result.message || 'Registration failed.');
    } catch (err) {
      setAuthError(err.message);
      throw err;
    }
  }

  /**
   * User logout handler.
   */
  async function logout() {
    try {
      await authApi.logout();
    } catch (err) {
      console.warn('[Auth] Logout API notification failed:', err.message);
    } finally {
      localStorage.removeItem('civicwatch_token');
      setToken(null);
      setUser(null);
      setAuthError(null);
    }
  }

  const value = {
    user,
    token,
    loading,
    isAuthenticated: Boolean(user),
    authError,
    login,
    register,
    logout
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * Custom hook for accessing authentication state and actions.
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;
