// context/UserContext.jsx
import { createContext, useContext, useState } from 'react';
import axiosInstance from '../utils/axiosInstance';

const UserContext = createContext();

// Custom hook to use the UserContext
export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

export const UserProvider = ({ children }) => {
  const [profileUser, setProfileUser] = useState(null);
  const [userSnippets, setUserSnippets] = useState([]);
  const [userStats, setUserStats] = useState({
    totalSnippets: 0,
    publicSnippets: 0,
    privateSnippets: 0,
    totalViews: 0,
    totalCopies: 0,
    totalFavorites: 0,
    languages: []
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch user profile by ID
  const fetchUserProfile = async (userId) => {
    setLoading(true);
    setError(null);
    try {
      // Remove /api and credentials (already handled by axiosInstance)
      const response = await axiosInstance.get(`/api/users/${userId}`);

      const data = response.data;
      setProfileUser(data);
      setUserSnippets(data.snippets || []);
      setUserStats(data.stats || {});
      return { success: true, data };
    } catch (err) {
      const message = err.response?.data?.message || err.message;
      setError(message);
      console.error('Error fetching user profile:', err);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  // Fetch user's public snippets with pagination
  const fetchUserPublicSnippets = async (userId, page = 1, limit = 20) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axiosInstance.get(
        `/users/${userId}/snippets?page=${page}&limit=${limit}`
      );

      const data = response.data;
      setUserSnippets(data.snippets || []);
      return { success: true, data };
    } catch (err) {
      const message = err.response?.data?.message || err.message;
      setError(message);
      console.error('Error fetching user snippets:', err);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  // Fetch user stats
  const fetchUserStats = async (userId) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axiosInstance.get(`/api/users/${userId}/stats`);

      const data = response.data;
      setUserStats(data);
      return { success: true, data };
    } catch (err) {
      const message = err.response?.data?.message || err.message;
      setError(message);
      console.error('Error fetching user stats:', err);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  // Search users by username
  const searchUsers = async (query) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axiosInstance.get(`/api/users/search?q=${encodeURIComponent(query)}`);

      const data = response.data;
      return { success: true, data: data.users };
    } catch (err) {
      const message = err.response?.data?.message || err.message;
      setError(message);
      console.error('Error searching users:', err);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  // Clear user data
  const clearUserData = () => {
    setProfileUser(null);
    setUserSnippets([]);
    setUserStats({
      totalSnippets: 0,
      publicSnippets: 0,
      privateSnippets: 0,
      totalViews: 0,
      totalCopies: 0,
      totalFavorites: 0,
      languages: []
    });
    setError(null);
  };

  const value = {
    profileUser,
    userSnippets,
    userStats,
    loading,
    error,
    fetchUserProfile,
    fetchUserPublicSnippets,
    fetchUserStats,
    searchUsers,
    clearUserData
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

