// context/UserContext.jsx
import { createContext, useContext, useState } from 'react';

const UserContext = createContext();

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
      const response = await fetch(`/api/users/${userId}`, {
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to fetch user profile');
      }

      const data = await response.json();
      setProfileUser(data);
      setUserSnippets(data.snippets || []);
      setUserStats(data.stats || {});
      return { success: true, data };
    } catch (err) {
      setError(err.message);
      console.error('Error fetching user profile:', err);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  // Fetch user's public snippets with pagination
  const fetchUserPublicSnippets = async (userId, page = 1, limit = 20) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `/api/users/${userId}/snippets?page=${page}&limit=${limit}`,
        {
          credentials: 'include'
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch user snippets');
      }

      const data = await response.json();
      setUserSnippets(data.snippets || []);
      return { success: true, data };
    } catch (err) {
      setError(err.message);
      console.error('Error fetching user snippets:', err);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  // Fetch user stats
  const fetchUserStats = async (userId) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/users/${userId}/stats`, {
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to fetch user stats');
      }

      const data = await response.json();
      setUserStats(data);
      return { success: true, data };
    } catch (err) {
      setError(err.message);
      console.error('Error fetching user stats:', err);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  // Search users by username
  const searchUsers = async (query) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/users/search?q=${encodeURIComponent(query)}`, {
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to search users');
      }

      const data = await response.json();
      return { success: true, data: data.users };
    } catch (err) {
      setError(err.message);
      console.error('Error searching users:', err);
      return { success: false, error: err.message };
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

// Custom hook to use the UserContext
export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};