import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      if (token) {
        try {
          console.log('AuthContext: Checking existing token...'); // Debug
          const response = await authAPI.getProfile();
          console.log('AuthContext: Profile loaded:', response.data); // Debug
          setUser(response.data);
        } catch (error) {
          console.error('Failed to get user profile:', error);
          localStorage.removeItem('token');
          setToken(null);
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, [token]);

  const login = async (credentials) => {
    try {
      console.log('AuthContext: Attempting login...');
      const response = await authAPI.login(credentials);
      console.log('AuthContext: Full login response:', response); // Debug

      // Your Django returns exactly this format
      const { token, user } = response.data;

      if (!token) {
        throw new Error('No token received from server');
      }

      console.log('AuthContext: Storing token:', token); // Debug
      console.log('AuthContext: Setting user:', user); // Debug

      localStorage.setItem('token', token); // Store as 'token'
      setToken(token);
      setUser(user);

      return response;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const register = async (userData) => {
    try {
      console.log('AuthContext: Registering user with data:', userData);
      const response = await authAPI.register(userData);
      console.log('AuthContext: Registration response:', response);
      return response;
    } catch (error) {
      console.error('AuthContext: Registration error:', error);
      console.error('Error response:', error.response?.data);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  const updateUser = (updatedUserData) => {
    setUser(prev => ({ ...prev, ...updatedUserData }));
  };

  // Single value declaration with all properties
  const value = {
    user,
    token,
    loading,
    login,
    register,
    logout,
    updateUser,
    isAuthenticated: !!user && !!token
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
