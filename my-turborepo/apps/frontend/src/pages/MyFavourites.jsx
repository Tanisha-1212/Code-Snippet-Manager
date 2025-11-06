import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useSnippet } from '../context/SnippetContext.jsx';
import SnippetCard from '../components/SnippetCard';
import { 
  Loader2, 
  Heart, 
  Sparkles, 
  Grid3x3, 
  List
} from 'lucide-react';

const MyFavourites = () => {
  const { user } = useAuth();
  const {
    favoriteSnippets,
    loading,
    fetchFavoriteSnippets,
  } = useSnippet();

  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'

  useEffect(() => {
    fetchFavoriteSnippets();
  }, []);

  const copyToClipboard = (code) => {
    navigator.clipboard.writeText(code);
    // Add toast notification if you have one
  };

  if (loading) {
    return (
      <div className='min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center'>
        <Loader2 className="w-8 h-8 text-blue-600 dark:text-blue-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header with View Toggle */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <Heart className="w-8 h-8 text-red-500" />
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
                  My Favorites
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  {favoriteSnippets.length} snippet{favoriteSnippets.length !== 1 ? 's' : ''} saved
                </p>
              </div>
            </div>

            {/* View Mode Toggle */}
            {favoriteSnippets.length > 0 && (
              <div className="flex items-center space-x-2 bg-white dark:bg-gray-800 rounded-lg p-1 border border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-md transition-colors ${
                    viewMode === 'grid'
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                  title="Grid View"
                >
                  <Grid3x3 className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-md transition-colors ${
                    viewMode === 'list'
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                  title="List View"
                >
                  <List className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>
        </div>

        {favoriteSnippets.length === 0 ? (
          /* Empty State */
          <div className='bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-12 text-center'>
            <Heart className='w-16 h-16 text-gray-400 mx-auto mb-4' />
            <h2 className='text-2xl font-bold text-gray-900 dark:text-white mb-2'>
              No Favorites Yet!
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Start exploring and save your favorite snippets
            </p>
            <Link
              to="/explore"
              className='inline-flex items-center px-6 py-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-colors'
            >
              <Sparkles className="w-5 h-5 mr-2" />
              Explore Snippets
            </Link>
          </div>
        ) : (
          /* Snippets Display */
          <div className={viewMode === 'grid' 
            ? 'grid md:grid-cols-2 lg:grid-cols-3 gap-6'
            : 'space-y-4'
          }>
            {favoriteSnippets.map((snippet) => (
              <SnippetCard 
                key={snippet._id}
                snippet={snippet}
                onCopy={copyToClipboard}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyFavourites;