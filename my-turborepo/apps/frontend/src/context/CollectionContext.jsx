import { createContext, useState, useContext } from 'react';
import axiosInstance from '../utils/axiosInstance';

const CollectionContext = createContext();

export const useCollections = () => {
  const context = useContext(CollectionContext);
  if (!context) {
    throw new Error('useCollections must be used within CollectionProvider');
  }
  return context;
};

export const CollectionProvider = ({ children }) => {
  const [collections, setCollections] = useState([]);
  const [currentCollection, setCurrentCollection] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch all user's collections
  const fetchCollections = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await axiosInstance.get('collections');
      setCollections(data);
      return { success: true, data };
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to fetch collections';
      setError(message);
      console.error('Error fetching collections:', err);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  // Fetch collection by ID
  const fetchCollectionById = async (collectionId) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await axiosInstance.get(`collections/${collectionId}`);
      setCurrentCollection(data);
      return { success: true, data };
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to fetch collection';
      setError(message);
      console.error('Error fetching collection:', err);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  // Create a new collection
  const createCollection = async (collectionData) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await axiosInstance.post('collections', collectionData);
      setCollections(prev => [data, ...prev]);
      return { success: true, data };
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to create collection';
      setError(message);
      console.error('Error creating collection:', err);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  // Update a collection
  const updateCollection = async (collectionId, collectionData) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await axiosInstance.put(`collections/${collectionId}`, collectionData);
      
      // Update in collections list
      setCollections(prev => prev.map(collection => 
        collection._id === collectionId ? data : collection
      ));
      
      // Update current collection if it's the one being updated
      if (currentCollection?._id === collectionId) {
        setCurrentCollection(data);
      }
      
      return { success: true, data };
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to update collection';
      setError(message);
      console.error('Error updating collection:', err);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  // Delete a collection
  const deleteCollection = async (collectionId) => {
    setLoading(true);
    setError(null);
    try {
      await axiosInstance.delete(`collections/${collectionId}`);
      
      // Remove from collections list
      setCollections(prev => prev.filter(c => c._id !== collectionId));
      
      // Clear current collection if it's the one being deleted
      if (currentCollection?._id === collectionId) {
        setCurrentCollection(null);
      }
      
      return { success: true };
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to delete collection';
      setError(message);
      console.error('Error deleting collection:', err);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  // Clear current collection
  const clearCurrentCollection = () => {
    setCurrentCollection(null);
  };

  // Clear all collections
  const clearCollections = () => {
    setCollections([]);
    setCurrentCollection(null);
    setError(null);
  };

  const value = {
    collections,
    currentCollection,
    loading,
    error,
    fetchCollections,
    fetchCollectionById,
    createCollection,
    updateCollection,
    deleteCollection,
    clearCurrentCollection,
    clearCollections
  };

  return (
    <CollectionContext.Provider value={value}>
      {children}
    </CollectionContext.Provider>
  );
};