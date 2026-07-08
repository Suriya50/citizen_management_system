import { createContext, useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../services/api';

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
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('village_token');
    const userData = localStorage.getItem('village_user');
    const villageId = localStorage.getItem('villageId');
    
    if (token && userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        // Store villageId if not already there
        if (parsedUser.villageId && !villageId) {
          localStorage.setItem('villageId', parsedUser.villageId);
          localStorage.setItem('village', parsedUser.village || '');
        }
        
        console.log('✅ Auth init - User:', parsedUser.username);
        console.log('✅ Auth init - VillageId:', parsedUser.villageId || villageId);
      } catch (error) {
        console.error('Error parsing user data:', error);
        localStorage.removeItem('village_token');
        localStorage.removeItem('village_user');
        localStorage.removeItem('villageId');
        localStorage.removeItem('village');
      }
    }
    setLoading(false);
  }, []);

  const login = async (username, password) => {
    try {
      console.log('🔐 Login attempt:', username);
      
      const response = await api.post('/auth/login', { username, password });
      const { token, user: userData } = response.data;
      
      console.log('✅ User data:', userData);
      console.log('✅ Village ID:', userData.villageId);
      
      // Store ALL data including villageId
      localStorage.setItem('village_token', token);
      localStorage.setItem('village_user', JSON.stringify(userData));
      localStorage.setItem('villageId', userData.villageId || '');
      localStorage.setItem('village', userData.village || '');
      
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setUser(userData);
      
      console.log('✅ Stored villageId in localStorage:', localStorage.getItem('villageId'));
      
      toast.success(`Welcome, ${userData.name}!`);
      navigate('/', { replace: true });
      return true;
    } catch (error) {
      console.error('Login error:', error);
      const message = error.response?.data?.message || 'Login failed';
      toast.error(message);
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('village_token');
    localStorage.removeItem('village_user');
    localStorage.removeItem('villageId');
    localStorage.removeItem('village');
    delete api.defaults.headers.common['Authorization'];
    setUser(null);
    toast.success('Logged out successfully');
    navigate('/login', { replace: true });
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};