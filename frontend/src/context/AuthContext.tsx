import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import api from '../lib/api';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, role: 'buyer' | 'agent') => Promise<void>;
  logout: () => void;
  addFavorite: (propertyId: string) => Promise<void>;
  removeFavorite: (propertyId: string) => Promise<void>;
  isFavorite: (propertyId: string) => boolean;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Load user from localStorage on init
  useEffect(() => {
    const storedUser = localStorage.getItem('estatehub_user');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        // Let's refresh favorites to ensure state matches DB
        if (parsedUser) {
          refreshFavorites(parsedUser);
        }
      } catch (err) {
        console.error('Failed to parse local stored user:', err);
        localStorage.removeItem('estatehub_user');
      }
    }
    setLoading(false);
  }, []);

  const refreshFavorites = async (currentUser: User) => {
    try {
      const response = await api.get('/favorites');
      const favoriteIds = response.data.map((fav: any) => fav._id);
      const updatedUser = { ...currentUser, favorites: favoriteIds };
      setUser(updatedUser);
      localStorage.setItem('estatehub_user', JSON.stringify(updatedUser));
    } catch (err) {
      console.error('Failed to refresh user favorites from backend:', err);
    }
  };

  const login = async (email: string, password: string) => {
    setError(null);
    setLoading(true);
    try {
      const response = await api.post('/auth/login', { email, password });
      setUser(response.data);
      localStorage.setItem('estatehub_user', JSON.stringify(response.data));
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid email or password');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string, role: 'buyer' | 'agent') => {
    setError(null);
    setLoading(true);
    try {
      const response = await api.post('/auth/register', { name, email, password, role });
      setUser(response.data);
      localStorage.setItem('estatehub_user', JSON.stringify(response.data));
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setError(null);
    localStorage.removeItem('estatehub_user');
  };

  const addFavorite = async (propertyId: string) => {
    if (!user) return;
    try {
      await api.post(`/favorites/${propertyId}`);
      const updatedFavorites = [...(user.favorites || []), propertyId];
      const updatedUser = { ...user, favorites: updatedFavorites };
      setUser(updatedUser);
      localStorage.setItem('estatehub_user', JSON.stringify(updatedUser));
    } catch (err: any) {
      console.error('Error adding favorite:', err);
    }
  };

  const removeFavorite = async (propertyId: string) => {
    if (!user) return;
    try {
      await api.delete(`/favorites/${propertyId}`);
      const updatedFavorites = (user.favorites || []).filter((id) => id !== propertyId);
      const updatedUser = { ...user, favorites: updatedFavorites };
      setUser(updatedUser);
      localStorage.setItem('estatehub_user', JSON.stringify(updatedUser));
    } catch (err: any) {
      console.error('Error removing favorite:', err);
    }
  };

  const isFavorite = (propertyId: string): boolean => {
    if (!user || !user.favorites) return false;
    return user.favorites.includes(propertyId);
  };

  const clearError = () => setError(null);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        login,
        register,
        logout,
        addFavorite,
        removeFavorite,
        isFavorite,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
