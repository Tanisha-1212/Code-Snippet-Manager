// components/AddToCollectionDropdown.jsx
import { useState, useEffect, useRef } from 'react';
import { FolderPlus, Check, X, Loader, Folder } from 'lucide-react';
import { useCollections } from '../context/CollectionContext';
import { useSnippet } from '../context/SnippetContext';

const AddToCollectionDropdown = ({ 
  snippet,
  compact = false,
  onSuccess
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [updating, setUpdating] = useState(false);
  const dropdownRef = useRef(null);
  
  const { collections, fetchCollections, loading: collectionsLoading } = useCollections();
  const { updateSnippet } = useSnippet();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // Fetch collections when dropdown opens (if not already loaded)
  useEffect(() => {
    if (isOpen && collections.length === 0) {
      fetchCollections();
    }
  }, [isOpen]);

  const handleToggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const handleCollectionSelect = async (collectionId) => {
    if (collectionId === snippet.collection?._id) {
      setIsOpen(false);
      return;
    }

    setUpdating(true);
    try {
      const result = await updateSnippet(snippet._id, { collection: collectionId });
      
      if (result.success) {
        onSuccess?.(result.data);
        setIsOpen(false);
      }
    } catch (err) {
      console.error('Error updating collection:', err);
    } finally {
      setUpdating(false);
    }
  };

  const handleRemoveFromCollection = async () => {
    setUpdating(true);
    try {
      const result = await updateSnippet(snippet._id, { collection: null });
      
      if (result.success) {
        onSuccess?.(result.data);
        setIsOpen(false);
      }
    } catch (err) {
      console.error('Error removing from collection:', err);
    } finally {
      setUpdating(false);
    }
  };

  const currentCollectionId = snippet.collection?._id;
  const hasCollection = !!currentCollectionId;

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        onClick={handleToggleDropdown}
        disabled={updating}
        className={`
          ${compact 
            ? 'p-2 rounded-lg'
            : 'inline-flex items-center px-4 py-2 rounded-lg'
          }
          ${hasCollection 
            ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 hover:bg-green-100 dark:hover:bg-green-900/30' 
            : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
          }
          transition-colors disabled:opacity-50 disabled:cursor-not-allowed
        `}
      >
        {updating ? (
          <>
            <Loader className="w-4 h-4 animate-spin" />
            {!compact && <span className="ml-2">Updating...</span>}
          </>
        ) : (
          <>
            {hasCollection ? (
              <>
                <Check className="w-4 h-4" />
                {!compact && <span className="ml-2">In Collection</span>}
              </>
            ) : (
              <>
                <FolderPlus className="w-4 h-4" />
                {!compact && <span className="ml-2">Add to Collection</span>}
              </>
            )}
          </>
        )}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 z-50 overflow-hidden">
          {/* Header */}
          <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
            <h3 className="font-semibold text-gray-900 dark:text-white">
              {hasCollection ? 'Change Collection' : 'Add to Collection'}
            </h3>
          </div>

          {/* Collections List */}
          <div className="max-h-80 overflow-y-auto">
            {collectionsLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader className="w-5 h-5 text-blue-600 dark:text-blue-400 animate-spin" />
              </div>
            ) : collections.length === 0 ? (
              <div className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                <Folder className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No collections yet</p>
              </div>
            ) : (
              <div className="py-2">
                {/* Remove from Collection Option */}
                {hasCollection && (
                  <button
                    onClick={handleRemoveFromCollection}
                    disabled={updating}
                    className="w-full px-4 py-3 text-left hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-3 text-red-600 dark:text-red-400 border-b border-gray-100 dark:border-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <X className="w-4 h-4 shrink-0" />
                    <span className="font-medium">Remove from Collection</span>
                  </button>
                )}

                {/* Collection Options */}
                {collections.map((collection) => {
                  const isSelected = collection._id === currentCollectionId;
                  const snippetCount = collection.snippets?.length || 0;

                  return (
                    <button
                      key={collection._id}
                      onClick={() => !isSelected && handleCollectionSelect(collection._id)}
                      disabled={updating || isSelected}
                      className={`
                        w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700/50 
                        flex items-center justify-between gap-3 transition-colors
                        ${isSelected ? 'bg-blue-50 dark:bg-blue-900/20' : ''}
                        disabled:cursor-not-allowed
                      `}
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        {/* Color Indicator */}
                        <div
                          className="w-3 h-3 rounded-full shrink-0"
                          style={{ backgroundColor: collection.color || '#6B7280' }}
                        />
                        
                        {/* Collection Info */}
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-gray-900 dark:text-white truncate">
                            {collection.name}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {snippetCount} {snippetCount === 1 ? 'snippet' : 'snippets'}
                          </div>
                        </div>
                      </div>

                      {/* Selected Indicator */}
                      {isSelected && (
                        <Check className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AddToCollectionDropdown;