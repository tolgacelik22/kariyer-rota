import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../api';

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState({
    userId: null,
    name: null,
    balance: 0,
    tier: { id: 'FREE', name: 'Free', color: '#9CA3AF' },
    completedModules: [],
    completedModulesCount: 0,
    skills: {},
    categoryProgress: {},
  });
  const [loading, setLoading] = useState(true);

  const refreshUser = async () => {
    try {
      const userId = await AsyncStorage.getItem('userId');
      if (userId) {
        const response = await api.post('/auth/guest', { userId });
        setUser({
          userId: response.data.userId,
          name: response.data.name || null,
          balance: response.data.balance,
          tier: response.data.tier,
          completedModules: response.data.completedModules || [],
          completedModulesCount: response.data.completedModulesCount || 0,
          skills: response.data.skills || {},
          categoryProgress: response.data.categoryProgress || {},
        });
        // If reward granted, we could show a toast here, but simpler to let UI handle it
        return response.data; 
      }
    } catch (error) {
      console.error("Error refreshing user:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateBalance = (newBalance) => {
    setUser(prev => ({ ...prev, balance: newBalance }));
  };

  const updateTier = (newTier) => {
    setUser(prev => ({ ...prev, tier: newTier }));
  };

  useEffect(() => {
    refreshUser();
  }, []);

  return (
    <UserContext.Provider value={{ user, setUser, refreshUser, updateBalance, updateTier, loading }}>
      {children}
    </UserContext.Provider>
  );
};

