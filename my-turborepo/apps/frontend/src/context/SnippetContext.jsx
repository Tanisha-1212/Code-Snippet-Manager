// context/SnippetContext.jsx
import { createContext, useContext, useState } from 'react';
import axiosInstance from '../utils/axiosInstance';

const SnippetContext = createContext();

export const useSnippet = () => {
  const context = useContext(SnippetContext);
  if (!context) {
    throw new Error('useSnippet must be used within a SnippetProvider');
  }
  return context;
};

export const SnippetProvider = ({ children }) => {
  const [publicSnippets, setPublicSnippets] = useState([]);
  const [userSnippets, setUserSnippets] = useState([]);
  const [currentSnippet, setCurrentSnippet] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [favoriteSnippets, setFavoriteSnippets] = useState([]);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    total: 0
  });

  // Generate metadata using Gemini AI
  const generateMetadata = async (code) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await axiosInstance.post('/api/snippet/generate-metadata', { code });
      return { success: true, data };
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to generate metadata';
      setError(message);
      console.error('Error generating metadata:', err);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  // Create new snippet
  const createSnippet = async (snippetData) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await axiosInstance.post('/api/snippet', snippetData);
      setUserSnippets(prev => [data, ...prev]);
      return { success: true, data };
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to create snippet';
      setError(message);
      console.error('Error creating snippet:', err);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  // Get all public snippets (paginated)
  const fetchPublicSnippets = async (page = 1, limit = 20) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await axiosInstance.get('/api/snippet/public', {
        params: { page, limit }
      });
      setPublicSnippets(data.snippets || []);
      setPagination({
        currentPage: data.currentPage || 1,
        totalPages: data.totalPages || 1,
        total: data.total || 0
      });
      return { success: true, data };
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to fetch public snippets';
      setError(message);
      console.error('Error fetching public snippets:', err);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  // Get snippet by ID (works for both public and owner's private snippets)
  const fetchSnippetById = async (id) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await axiosInstance.get(`/api/snippet/${id}`);
      setCurrentSnippet(data);
      return { success: true, data };
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to fetch snippet';
      setError(message);
      console.error('Error fetching snippet:', err);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  // Update snippet
  const updateSnippet = async (id, snippetData) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await axiosInstance.put(`/api/snippet/${id}`, snippetData);
      
      // Update in userSnippets if exists
      setUserSnippets(prev => 
        prev.map(snippet => snippet._id === id ? data : snippet)
      );
      
      // Update currentSnippet if it's the one being updated
      if (currentSnippet?._id === id) {
        setCurrentSnippet(data);
      }
      
      return { success: true, data };
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to update snippet';
      setError(message);
      console.error('Error updating snippet:', err);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  // Delete snippet
  const deleteSnippet = async (id) => {
    setLoading(true);
    setError(null);
    try {
      await axiosInstance.delete(`/api/snippet/${id}`);
      
      // Remove from userSnippets
      setUserSnippets(prev => prev.filter(snippet => snippet._id !== id));
      
      // Remove from publicSnippets
      setPublicSnippets(prev => prev.filter(snippet => snippet._id !== id));
      
      // Clear currentSnippet if it's the deleted one
      if (currentSnippet?._id === id) {
        setCurrentSnippet(null);
      }
      
      return { success: true };
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to delete snippet';
      setError(message);
      console.error('Error deleting snippet:', err);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  // Get user's snippets with filters
  const fetchUserSnippets = async (filters = {}) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      
      if (filters.page) params.append('page', filters.page);
      if (filters.limit) params.append('limit', filters.limit);
      if (filters.isPublic !== undefined) params.append('isPublic', filters.isPublic);
      if (filters.language) params.append('language', filters.language);
      if (filters.collection) params.append('collection', filters.collection);

      const { data } = await axiosInstance.get(`/api/snippet/user?${params.toString()}`);
      setUserSnippets(data.snippets || []);
      return { success: true, data };
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to fetch user snippets';
      setError(message);
      console.error('Error fetching user snippets:', err);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  // Track view
  const trackView = async (snippetId) => {
    try {
      await axiosInstance.post(`/api/snippet/${snippetId}/view`);
    } catch (err) {
      console.error('Error tracking view:', err);
    }
  };

  // Track copy
  const trackCopy = async (snippetId) => {
    try {
      await axiosInstance.post(`/api/snippet/${snippetId}/copy`);
    } catch (err) {
      console.error('Error tracking copy:', err);
    }
  };

  // Toggle favorite
  const toggleFavorite = async (snippetId) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await axiosInstance.post(`/api/snippet/${snippetId}/favorite`);
      return { success: true, data };
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to toggle favorite';
      setError(message);
      console.error('Error toggling favorite:', err);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  const fetchFavoriteSnippets = async () => {
  setLoading(true);
  setError(null);
  try {
    const { data } = await axiosInstance.get('/api/snippet/favorites');
    setFavoriteSnippets(data.favorites || []);
    return { success: true, data };
  } catch (err) {
    const message = err.response?.data?.message || 'Failed to fetch favorites';
    setError(message);
    console.error('Error fetching favorites:', err);
    return { success: false, error: message };
  } finally {
    setLoading(false);
  }
};

  const value = {
    publicSnippets,
    userSnippets,
    currentSnippet,
    loading,
    error,
    pagination,
    generateMetadata,
    createSnippet,
    fetchPublicSnippets,
    fetchSnippetById,
    updateSnippet,
    deleteSnippet,
    fetchUserSnippets,
    setError, 
    trackCopy,
    trackView,
    toggleFavorite,
    favoriteSnippets,
    fetchFavoriteSnippets
  };

  return (
    <SnippetContext.Provider value={value}>
      {children}
    </SnippetContext.Provider>
  );
};