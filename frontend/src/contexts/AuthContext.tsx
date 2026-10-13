// Authentication Context
import React, { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { authApi, setAuthToken, getAuthToken } from '../api';
import type { User, LoginCredentials } from '../types/api';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<{ redirect_url: string }>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Refresh user from API
  const refreshUser = useCallback(async () => {
    const token = getAuthToken();
    if (!token) {
      setUser(null);
      setIsLoading(false);
      return;
    }

    try {
      console.log('Refreshing user with token:', token.substring(0, 20) + '...');
      const response = await authApi.me();
      console.log('User refreshed:', response.data);
      setUser(response.data);
    } catch (error) {
      console.error('Failed to refresh user:', error);
      // Token might be invalid, clear it
      setAuthToken(null);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initialize auth on mount
  useEffect(() => {
    refreshUser();

    // Listen for unauthorized events
    const handleUnauthorized = () => {
      setAuthToken(null);
      setUser(null);
    };

    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => {
      window.removeEventListener('auth:unauthorized', handleUnauthorized);
    };
  }, [refreshUser]);

  const login = async (credentials: LoginCredentials) => {
    setIsLoading(true);
    try {
      console.log('Attempting login with:', credentials.email);
      const response = await authApi.login(credentials);
      console.log('Login successful:', response.data);
      const { user: userData, token, redirect_url } = response.data;
      setAuthToken(token);
      setUser(userData);
      setIsLoading(false);
      return { redirect_url };
    } catch (error) {
      console.error('Login failed:', error);
      setIsLoading(false);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch (error) {
      // Ignore logout errors
      console.warn('Logout error:', error);
    } finally {
      setAuthToken(null);
      setUser(null);
    }
  };

  // Always provide a valid context value - never undefined
  const contextValue = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    logout,
    refreshUser,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};