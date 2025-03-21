import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { authAPI } from '../services/api';

interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: 'admin' | 'manager' | 'sales_rep';
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (userData: any) => Promise<void>;
  isAuthenticated: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check if user is already logged in
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Check if there's a token in localStorage
        const token = localStorage.getItem('token');
        if (token) {
          // Try to get user profile
          const userJson = localStorage.getItem('user');
          if (userJson) {
            setUser(JSON.parse(userJson));
          } else {
            const { user } = await authAPI.getProfile();
            setUser(user);
          }
        }
      } catch (err) {
        // Clear any invalid tokens
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Login handler
  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);
      const { user } = await authAPI.login({ email, password });
      setUser(user);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Login failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Logout handler
  const logout = async () => {
    try {
      setLoading(true);
      await authAPI.logout();
      setUser(null);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Logout failed');
    } finally {
      setLoading(false);
    }
  };

  // Register handler
  const register = async (userData: any) => {
    try {
      setLoading(true);
      setError(null);
      await authAPI.register(userData);
      // After registration, login the user
      await login(userData.email, userData.password);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Registration failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Compute derived state
  const isAuthenticated = !!user;
  const isAdmin = user?.role === 'admin';

  const value = {
    user,
    loading,
    error,
    login,
    logout,
    register,
    isAuthenticated,
    isAdmin,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext; 