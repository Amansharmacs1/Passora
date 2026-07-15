import { createContext, useState, useEffect, useContext } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('passora_user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch (e) {
      localStorage.removeItem('passora_user');
      return null;
    }
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Listen for unauthorized events to clear user
    const handleUnauthorized = () => {
      setUser(null);
      localStorage.removeItem('passora_user');
    };
    window.addEventListener('auth_unauthorized', handleUnauthorized);
    return () => window.removeEventListener('auth_unauthorized', handleUnauthorized);
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const response = await api.post('/auth/login', { email, password });
      setUser(response.data);
      localStorage.setItem('passora_user', JSON.stringify(response.data));
      return response.data;
    } finally {
      setLoading(false);
    }
  };

  const register = async (fullName, email, password) => {
    setLoading(true);
    try {
      const response = await api.post('/auth/register', { fullName, email, password });
      setUser(response.data);
      localStorage.setItem('passora_user', JSON.stringify(response.data));
      return response.data;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('passora_user');
    api.post('/auth/logout').catch(() => {}); // Optional call to backend
  };

  const updateProfile = async (data) => {
    setLoading(true);
    try {
      const response = await api.put('/user/profile', data);
      const updatedUser = { ...user, ...response.data };
      setUser(updatedUser);
      localStorage.setItem('passora_user', JSON.stringify(updatedUser));
      return response.data;
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, updateProfile, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
