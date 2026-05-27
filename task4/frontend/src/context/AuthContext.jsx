import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../utils/api.js';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userInfo = localStorage.getItem('tracker_userInfo');
    if (userInfo) {
      setUser(JSON.parse(userInfo));
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const { data } = await api.post('/api/auth/login', { email, password });
      setUser(data);
      localStorage.setItem('tracker_userInfo', JSON.stringify(data));
      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Login failed. Invalid email or password.',
      };
    }
  };

  const register = async (username, email, password) => {
    try {
      const { data } = await api.post('/api/auth/register', { username, email, password });
      setUser(data);
      localStorage.setItem('tracker_userInfo', JSON.stringify(data));
      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Registration failed. Try again.',
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('tracker_userInfo');
    setUser(null);
  };

  const updateBlockedDomains = async (domains) => {
    try {
      const { data } = await api.put('/api/settings', { blockedDomains: domains });
      const newUser = { ...user, settings: data.settings };
      setUser(newUser);
      localStorage.setItem('tracker_userInfo', JSON.stringify(newUser));
      return { success: true };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || 'Failed to update settings.' };
    }
  };

  const updateClassification = async (domain, classification) => {
    try {
      const { data } = await api.put('/api/settings', {
        customClassifications: { [domain]: classification }
      });
      const newUser = { ...user, settings: data.settings };
      setUser(newUser);
      localStorage.setItem('tracker_userInfo', JSON.stringify(newUser));
      return { success: true };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || 'Failed to update classification.' };
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateBlockedDomains, updateClassification }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
