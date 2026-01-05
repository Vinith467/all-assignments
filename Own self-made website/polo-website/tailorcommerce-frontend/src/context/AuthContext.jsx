// src/context/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from 'react';
import axiosInstance from '../api/axios';
import { message } from 'antd';

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
  const [loading, setLoading] = useState(true);
  const [tokens, setTokens] = useState(() => {
    const storedTokens = localStorage.getItem('tokens');
    return storedTokens ? JSON.parse(storedTokens) : null;
  });

  // Setup axios interceptor for adding token to requests
  useEffect(() => {
    const requestInterceptor = axiosInstance.interceptors.request.use(
      (config) => {
        if (tokens?.access) {
          config.headers.Authorization = `Bearer ${tokens.access}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    return () => {
      axiosInstance.interceptors.request.eject(requestInterceptor);
    };
  }, [tokens]);

  // Fetch user data on mount if tokens exist
  useEffect(() => {
    if (tokens) {
      fetchUser();
    } else {
      setLoading(false);
    }
  }, []);

  const fetchUser = async () => {
    try {
      const response = await axiosInstance.get('/auth/me/');
      if (response.data.success) {
        setUser(response.data.user);
      }
    } catch (error) {
      // Token invalid, clear auth
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (username, password) => {
    try {
      const response = await axiosInstance.post('/auth/login/', {
        username,
        password,
      });

      if (response.data.success) {
        const { user, tokens } = response.data;
        setUser(user);
        setTokens(tokens);
        localStorage.setItem('tokens', JSON.stringify(tokens));
        message.success('Login successful!');
        return { success: true, user };
      }
    } catch (error) {
      message.error(error.response?.data?.error || 'Login failed');
       return { success: false };
    }
  };

  const register = async (username, email, password, phone) => {
    try {
      const response = await axiosInstance.post('/auth/register/', {
        username,
        email,
        password,
        phone,
      });

      if (response.data.success) {
        const { user, tokens } = response.data;
        setUser(user);
        setTokens(tokens);
        localStorage.setItem('tokens', JSON.stringify(tokens));
        message.success('Registration successful!');
        return { success: true, user };
      }
    } catch (error) {
      message.error(error.response?.data?.error || 'Registration failed');
      return { success: false };
    }
  };

  const logout = () => {
    setUser(null);
    setTokens(null);
    localStorage.removeItem('tokens');
    message.info('Logged out successfully');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        tokens,
        loading,
        login,
        register,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};