import { createContext, useState, useContext } from 'react';
import axiosInstance from '../utils/axiosInstance';

const ExploreContext = createContext();

export const useExplore = () => {
  const context = useContext(ExploreContext);
  if (!context) {
    throw new Error('useExplore must be used within ExploreProvider');
  }
  return context;
};

export const ExploreProvider = ({ children }) => {
  const [snippets, setSnippets] = useState([]);
  const [trendingSnippets, setTrendingSnippets] = useState([]);
  const [languages, setLanguages] = useState([]);
  const [popularTags, setPopularTags] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    total: 0
  });

  // Search snippets with filters
  const searchSnippets = async (filters = {}) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      
      if (filters.q) params.append('q', filters.q);
      if (filters.language) params.append('language', filters.language);
      if (filters.tags) params.append('tags', filters.tags);
      if (filters.sort) params.append('sort', filters.sort);
      if (filters.page) params.append('page', filters.page);
      if (filters.limit) params.append('limit', filters.limit);

      const { data } = await axiosInstance.get(`/api/explore/search?${params.toString()}`);
      
      setSnippets(data.snippets);
      setPagination({
        currentPage: data.currentPage,
        totalPages: data.totalPages,
        total: data.total
      });
      
      return { success: true, data };
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to search snippets';
      setError(message);
      console.error('Error searching snippets:', err);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  // Get trending snippets
  const getTrendingSnippets = async (limit = 10) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await axiosInstance.get(`/api/explore/trending?limit=${limit}`);
      setTrendingSnippets(data);
      return { success: true, data };
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to fetch trending snippets';
      setError(message);
      console.error('Error fetching trending snippets:', err);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  // Get available languages
  const getLanguages = async () => {
    setError(null);
    try {
      const { data } = await axiosInstance.get('/api/explore/languages');
      setLanguages(data);
      return { success: true, data };
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to fetch languages';
      setError(message);
      console.error('Error fetching languages:', err);
      return { success: false, error: message };
    }
  };

  // Get popular tags
  const getPopularTags = async (limit = 20) => {
    setError(null);
    try {
      const { data } = await axiosInstance.get(`/api/explore/tags?limit=${limit}`);
      setPopularTags(data);
      return { success: true, data };
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to fetch popular tags';
      setError(message);
      console.error('Error fetching popular tags:', err);
      return { success: false, error: message };
    }
  };

  // Clear search results
  const clearSearch = () => {
    setSnippets([]);
    setPagination({
      currentPage: 1,
      totalPages: 1,
      total: 0
    });
    setError(null);
  };

  // Clear all data
  const clearAll = () => {
    setSnippets([]);
    setTrendingSnippets([]);
    setLanguages([]);
    setPopularTags([]);
    setPagination({
      currentPage: 1,
      totalPages: 1,
      total: 0
    });
    setError(null);
  };

  const value = {
    snippets,
    trendingSnippets,
    languages,
    popularTags,
    loading,
    error,
    pagination,
    searchSnippets,
    getTrendingSnippets,
    getLanguages,
    getPopularTags,
    clearSearch,
    clearAll
  };

  return (
    <ExploreContext.Provider value={value}>
      {children}
    </ExploreContext.Provider>
  );
};