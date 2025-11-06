// pages/ExplorePage.jsx
import { useState, useEffect } from 'react';
import { 
  Search, 
  Code2, 
  Tag,
  X,
  Loader2,
  ChevronLeft,
  ChevronRight,
  TrendingUp
} from 'lucide-react';
import { useExplore } from '../context/ExploreContext.jsx';
import SnippetCard from '../components/SnippetCard.jsx';

const ExplorePage = () => {
  const { 
    snippets, 
    trendingSnippets,
    languages, 
    popularTags, 
    pagination, 
    loading, 
    searchSnippets,
    getTrendingSnippets,
    getLanguages,
    getPopularTags
  } = useExplore();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('');
  const [selectedTag, setSelectedTag] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [showFilters, setShowFilters] = useState(false);
  const [showTrending, setShowTrending] = useState(true);

  // Fetch initial data on mount
  useEffect(() => {
    getLanguages();
    getPopularTags(20);
    getTrendingSnippets(6);
    
    // Initial search with default filters
    searchSnippets({ 
      page: 1, 
      limit: 20,
      sort: 'newest'
    });
  }, []);

  // Search when filters change
  useEffect(() => {
    const filters = {
      page: 1,
      limit: 20
    };

    if (searchQuery) filters.q = searchQuery;
    if (selectedLanguage) filters.language = selectedLanguage;
    if (selectedTag) filters.tags = selectedTag;
    if (sortBy) filters.sort = sortBy;

    // Debounce search query
    const timeoutId = setTimeout(() => {
      searchSnippets(filters);
    }, searchQuery ? 500 : 0);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, selectedLanguage, selectedTag, sortBy]);

  const handlePageChange = (page) => {
    const filters = {
      page,
      limit: 20
    };

    if (searchQuery) filters.q = searchQuery;
    if (selectedLanguage) filters.language = selectedLanguage;
    if (selectedTag) filters.tags = selectedTag;
    if (sortBy) filters.sort = sortBy;

    searchSnippets(filters);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  const copyToClipboard = (code) => {
    navigator.clipboard.writeText(code);
  };

  const clearFilters = () => {
    setSelectedLanguage('');
    setSelectedTag('');
    setSearchQuery('');
    setSortBy('newest');
  };

  const hasActiveFilters = selectedLanguage || selectedTag || searchQuery;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Explore Code Snippets
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Discover and learn from community-shared code snippets
          </p>
        </div>

        {/* Trending Snippets Section */}
        {showTrending && trendingSnippets.length > 0 && !hasActiveFilters && (
          <div className="mb-8 bg-linear-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
                <TrendingUp className="w-5 h-5 mr-2 text-blue-600 dark:text-blue-400" />
                Trending Now
              </h2>
              <button
                onClick={() => setShowTrending(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {trendingSnippets.slice(0, 3).map((snippet) => (
                <SnippetCard
                  key={snippet._id}
                  snippet={snippet}
                  onCopy={copyToClipboard}
                />
              ))}
            </div>
          </div>
        )}

        {/* Search Bar */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search snippets by title or tags..."
              value={searchQuery}
              onChange={handleSearch}
              className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>
        </div>

        {/* Filters Section */}
        <div className="mb-6">
          {/* Sort By */}
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Sort By</h3>
            <div className="flex flex-wrap gap-2">
              {[
                { value: 'newest', label: 'Newest' },
                { value: 'oldest', label: 'Oldest' },
                { value: 'views', label: 'Most Viewed' },
                { value: 'copies', label: 'Most Copied' },
                { value: 'favorites', label: 'Most Liked' }
              ].map(option => (
                <button
                  key={option.value}
                  onClick={() => setSortBy(option.value)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    sortBy === option.value
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:border-blue-500 dark:hover:border-blue-400'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Languages */}
          {languages.length > 0 && (
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Languages</h3>
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                >
                  {showFilters ? 'Hide' : 'Show all'}
                </button>
              </div>
              <div className={`flex flex-wrap gap-2 ${!showFilters ? 'max-h-20 overflow-hidden' : ''}`}>
                {languages.map(lang => (
                  <button
                    key={lang}
                    onClick={() => setSelectedLanguage(selectedLanguage === lang ? '' : lang)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      selectedLanguage === lang
                        ? 'bg-purple-600 text-white shadow-md'
                        : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:border-purple-500 dark:hover:border-purple-400'
                    }`}
                  >
                    {lang}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Tags */}
          {popularTags.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Popular Tags</h3>
              <div className="flex flex-wrap gap-2">
                {popularTags.map(tag => (
                  <button
                    key={tag.name}
                    onClick={() => setSelectedTag(selectedTag === tag.name ? '' : tag.name)}
                    className={`inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                      selectedTag === tag.name
                        ? 'bg-green-600 text-white shadow-md'
                        : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:border-green-500 dark:hover:border-green-400'
                    }`}
                  >
                    <Tag className="w-3 h-3 mr-1" />
                    {tag.name}
                  </button>
                ))}
              </div>
            </div>
          )}


          {/* Clear Filters Button */}
          {hasActiveFilters && (
            <div className="mt-4 flex justify-end">
              <button
                onClick={clearFilters}
                className="inline-flex items-center px-4 py-2 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors text-sm font-medium"
              >
                <X className="w-4 h-4 mr-2" />
                Clear All Filters
              </button>
            </div>
          )}
        </div>

        {/* Active Filters Display */}
        {(selectedLanguage || selectedTag) && (
          <div className="flex flex-wrap gap-2 mb-4">
            {selectedLanguage && (
              <span className="inline-flex items-center px-3 py-1.5 rounded-lg bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-sm font-medium">
                {selectedLanguage}
                <button onClick={() => setSelectedLanguage('')} className="ml-2 hover:bg-purple-200 dark:hover:bg-purple-900/50 rounded p-0.5">
                  <X className="w-3.5 h-3.5" />
                </button>
              </span>
            )}
            {selectedTag && (
              <span className="inline-flex items-center px-3 py-1.5 rounded-lg bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-sm font-medium">
                <Tag className="w-3 h-3 mr-1" />
                {selectedTag}
                <button onClick={() => setSelectedTag('')} className="ml-2 hover:bg-green-200 dark:hover:bg-green-900/50 rounded p-0.5">
                  <X className="w-3.5 h-3.5" />
                </button>
              </span>
            )}
          </div>
        )}

        {/* Results Count */}
        <div className="mb-4 text-sm text-gray-600 dark:text-gray-400">
          {loading ? (
            'Loading snippets...'
          ) : (
            `Showing ${snippets.length} of ${pagination.total} ${pagination.total === 1 ? 'snippet' : 'snippets'}`
          )}
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-blue-600 dark:text-blue-400 animate-spin" />
          </div>
        ) : snippets.length === 0 ? (
          /* Empty State */
          <div className="text-center py-20">
            <Code2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No snippets found
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {hasActiveFilters
                ? 'Try adjusting your search or filters' 
                : 'Be the first to share a code snippet!'}
            </p>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="px-6 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors"
              >
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          /* Snippets Grid */
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {snippets.map((snippet) => (
              <SnippetCard
                key={snippet._id}
                snippet={snippet}
                onCopy={copyToClipboard}
              />
            ))}
          </div>
        )}

        {/* Pagination */}
        {!loading && snippets.length > 0 && pagination.totalPages > 1 && (
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Page {pagination.currentPage} of {pagination.totalPages} ({pagination.total} total snippets)
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handlePageChange(pagination.currentPage - 1)}
                disabled={pagination.currentPage === 1}
                className="inline-flex items-center px-4 py-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Previous
              </button>
              
              <div className="flex items-center space-x-1">
                {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                  let pageNum;
                  if (pagination.totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (pagination.currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (pagination.currentPage >= pagination.totalPages - 2) {
                    pageNum = pagination.totalPages - 4 + i;
                  } else {
                    pageNum = pagination.currentPage - 2 + i;
                  }
                  
                  return (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={`w-10 h-10 rounded-lg font-medium transition-colors ${
                        pagination.currentPage === pageNum
                          ? 'bg-blue-600 text-white'
                          : 'bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>
              
              <button
                onClick={() => handlePageChange(pagination.currentPage + 1)}
                disabled={pagination.currentPage === pagination.totalPages}
                className="inline-flex items-center px-4 py-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Next
                <ChevronRight className="w-4 h-4 ml-1" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExplorePage;