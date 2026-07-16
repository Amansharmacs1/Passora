import { createContext, useState, useEffect, useContext } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';

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

  // 10-minute Inactivity Auto-Logout
  useEffect(() => {
    if (!user) return;

    let lastActivity = Date.now();
    const INACTIVITY_LIMIT = 10 * 60 * 1000; // 10 minutes

    const updateActivity = () => {
      lastActivity = Date.now();
    };

    window.addEventListener('mousemove', updateActivity, { passive: true });
    window.addEventListener('keydown', updateActivity, { passive: true });
    window.addEventListener('scroll', updateActivity, { passive: true });
    window.addEventListener('click', updateActivity, { passive: true });

    const intervalId = setInterval(() => {
      if (Date.now() - lastActivity > INACTIVITY_LIMIT) {
        logout();
        toast.error('Logged out due to 10 minutes of inactivity');
        window.dispatchEvent(new CustomEvent('auth_timeout'));
      }
    }, 30000); // Check every 30 seconds

    return () => {
      window.removeEventListener('mousemove', updateActivity);
      window.removeEventListener('keydown', updateActivity);
      window.removeEventListener('scroll', updateActivity);
      window.removeEventListener('click', updateActivity);
      clearInterval(intervalId);
    };
  }, [user]);

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
