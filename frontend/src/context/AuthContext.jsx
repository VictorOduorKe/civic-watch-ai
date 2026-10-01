import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  // Restore authenticated session on application mount via HttpOnly cookie
  useEffect(() => {
    async function initAuth() {
      try {
        // Establish initial CSRF token cookie
        await authApi.getCsrfToken().catch(() => {});

        // Verify active authentication session via HttpOnly cookie
        const response = await authApi.getMe();
        if (response.success && response.user) {
          setUser(response.user);
        } else {
          setUser(null);
        }
      } catch {
        // Unauthenticated or expired session - state safely remains null
        setUser(null);
      } finally {
        setLoading(false);
      }
    }

    initAuth();
  }, []);

  /**
   * User login handler.
   * Authentication credential is set securely via HttpOnly cookie by Express.
   * Zero sensitive credentials stored in browser localStorage or sessionStorage.
   */
  async function login(credentials) {
    setAuthError(null);
    try {
      const result = await authApi.login(credentials);
      if (result.success && result.user) {
        setUser(result.user);
        return { success: true, user: result.user };
      }
      throw new Error(result.message || 'Login failed.');
    } catch (err) {
      setAuthError(err.message);
      throw err;
    }
  }

  /**
   * User registration handler.
   * Sets HttpOnly session cookie on successful creation.
   */
  async function register(userData) {
    setAuthError(null);
    try {
      const result = await authApi.register(userData);
      if (result.success && result.user) {
        setUser(result.user);
        return { success: true, user: result.user };
      }
      throw new Error(result.message || 'Registration failed.');
    } catch (err) {
      setAuthError(err.message);
      throw err;
    }
  }

  /**
   * User logout handler.
   * Calls server to clear the HttpOnly auth cookie and CSRF cookie, then resets user state.
   */
  async function logout() {
    try {
      await authApi.logout();
    } catch (err) {
      console.warn('[Auth] Logout API call failed:', err.message);
    } finally {
      setUser(null);
      setAuthError(null);
    }
  }

  /**
   * Refresh current user profile from server.
   */
  async function refreshUser() {
    try {
      const response = await authApi.getMe();
      if (response.success && response.user) {
        setUser(response.user);
        return response.user;
      }
      setUser(null);
      return null;
    } catch {
      setUser(null);
      return null;
    }
  }

  const value = {
    user,
    loading,
    isAuthenticated: Boolean(user),
    authError,
    login,
    register,
    logout,
    refreshUser
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
