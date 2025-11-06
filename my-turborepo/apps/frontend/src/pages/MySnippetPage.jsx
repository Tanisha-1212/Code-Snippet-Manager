// pages/MySnippetsPage.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSnippet } from '../context/SnippetContext';
import {
  Search,
  Plus,
  Grid3x3,
  List,
  Code2,
  Loader2,
  Filter,
  X,
  Globe,
  Lock,
  ChevronDown
} from 'lucide-react';
import SnippetCard from '../components/SnippetCard';

const MySnippetsPage = () => {
  const { userSnippets, loading, fetchUserSnippets } = useSnippet();

  const [activeTab, setActiveTab] = useState('all'); // all, public, private
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('');
  const [selectedCollection, setSelectedCollection] = useState('');
  const [viewMode, setViewMode] = useState('grid'); // grid or list
  const [showFilters, setShowFilters] = useState(false);

  // Fetch snippets on mount
  useEffect(() => {
    fetchUserSnippets({ limit: 100 });
  }, []);

  const copyToClipboard = (code) => {
    navigator.clipboard.writeText(code);
  };

  // Filter snippets based on active tab and filters
  const getFilteredSnippets = () => {
    let filtered = [...userSnippets];

    // Filter by tab
    if (activeTab === 'public') {
      filtered = filtered.filter(s => s.isPublic === true);
    } else if (activeTab === 'private') {
      filtered = filtered.filter(s => s.isPublic === false);
    }

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(snippet =>
        snippet.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        snippet.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Language filter
    if (selectedLanguage) {
      filtered = filtered.filter(s => s.language?.toLowerCase() === selectedLanguage.toLowerCase());
    }

    // Collection filter
    if (selectedCollection) {
      filtered = filtered.filter(s => s.collection?._id === selectedCollection);
    }

    return filtered;
  };

  const filteredSnippets = getFilteredSnippets();

  // Get unique languages from user's snippets
  const languages = [...new Set(userSnippets.map(s => s.language).filter(Boolean))];

  // Get unique collections from user's snippets
  const collections = [...new Set(userSnippets
    .map(s => s.collection)
    .filter(Boolean)
    .map(c => JSON.stringify(c)))]
    .map(c => JSON.parse(c));

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedLanguage('');
    setSelectedCollection('');
  };

  const hasActiveFilters = searchQuery || selectedLanguage || selectedCollection;

  // Stats for each tab
  const stats = {
    all: userSnippets.length,
    public: userSnippets.filter(s => s.isPublic).length,
    private: userSnippets.filter(s => !s.isPublic).length
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              My Snippets
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Manage and organize your code snippets
            </p>
          </div>
          <Link
            to="/snippet/create"
            className="mt-4 sm:mt-0 inline-flex items-center px-6 py-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-colors shadow-lg"
          >
            <Plus className="w-5 h-5 mr-2" />
            Create Snippet
          </Link>
        </div>

        {/* Tabs */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 mb-6">
          <div className="flex border-b border-gray-200 dark:border-gray-700">
            <button
              onClick={() => setActiveTab('all')}
              className={`flex-1 px-6 py-4 text-sm font-medium transition-colors relative ${
                activeTab === 'all'
                  ? 'text-blue-600 dark:text-blue-400'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              All Snippets
              <span className="ml-2 px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700 text-xs">
                {stats.all}
              </span>
              {activeTab === 'all' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400"></div>
              )}
            </button>
            <button
              onClick={() => setActiveTab('public')}
              className={`flex-1 px-6 py-4 text-sm font-medium transition-colors relative ${
                activeTab === 'public'
                  ? 'text-blue-600 dark:text-blue-400'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              <Globe className="w-4 h-4 inline mr-1" />
              Public
              <span className="ml-2 px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700 text-xs">
                {stats.public}
              </span>
              {activeTab === 'public' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400"></div>
              )}
            </button>
            <button
              onClick={() => setActiveTab('private')}
              className={`flex-1 px-6 py-4 text-sm font-medium transition-colors relative ${
                activeTab === 'private'
                  ? 'text-blue-600 dark:text-blue-400'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              <Lock className="w-4 h-4 inline mr-1" />
              Private
              <span className="ml-2 px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700 text-xs">
                {stats.private}
              </span>
              {activeTab === 'private' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400"></div>
              )}
            </button>
          </div>
        </div>

        {/* Search and View Controls */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by title or tags..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>

            {/* Filter Button */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="inline-flex items-center justify-center px-4 py-3 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              <Filter className="w-5 h-5 mr-2" />
              Filters
              {hasActiveFilters && (
                <span className="ml-2 w-2 h-2 rounded-full bg-blue-600"></span>
              )}
              <ChevronDown className={`w-4 h-4 ml-2 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
            </button>

            {/* View Mode Toggle */}
            <div className="flex rounded-lg border border-gray-300 dark:border-gray-600 overflow-hidden">
              <button
                onClick={() => setViewMode('grid')}
                className={`px-4 py-3 transition-colors ${
                  viewMode === 'grid'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                <Grid3x3 className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-4 py-3 transition-colors ${
                  viewMode === 'list'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                <List className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Expandable Filters */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 space-y-4">
              {/* Language Filter */}
              {languages.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Language
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {languages.map(lang => (
                      <button
                        key={lang}
                        onClick={() => setSelectedLanguage(selectedLanguage === lang ? '' : lang)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                          selectedLanguage === lang
                            ? 'bg-purple-600 text-white shadow-md'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                        }`}
                      >
                        {lang}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Collection Filter */}
              {collections.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Collection
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {collections.map(collection => (
                      <button
                        key={collection._id}
                        onClick={() => setSelectedCollection(selectedCollection === collection._id ? '' : collection._id)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                          selectedCollection === collection._id
                            ? 'bg-blue-600 text-white shadow-md'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                        }`}
                      >
                        {collection.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Clear Filters */}
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="inline-flex items-center px-4 py-2 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors text-sm font-medium"
                >
                  <X className="w-4 h-4 mr-2" />
                  Clear Filters
                </button>
              )}
            </div>
          )}
        </div>

        {/* Active Filters Display */}
        {hasActiveFilters && (
          <div className="flex flex-wrap gap-2 mb-4">
            {selectedLanguage && (
              <span className="inline-flex items-center px-3 py-1.5 rounded-lg bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-sm font-medium">
                {selectedLanguage}
                <button onClick={() => setSelectedLanguage('')} className="ml-2 hover:bg-purple-200 dark:hover:bg-purple-900/50 rounded p-0.5">
                  <X className="w-3.5 h-3.5" />
                </button>
              </span>
            )}
            {selectedCollection && (
              <span className="inline-flex items-center px-3 py-1.5 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-sm font-medium">
                {collections.find(c => c._id === selectedCollection)?.name}
                <button onClick={() => setSelectedCollection('')} className="ml-2 hover:bg-blue-200 dark:hover:bg-blue-900/50 rounded p-0.5">
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
            `Showing ${filteredSnippets.length} ${filteredSnippets.length === 1 ? 'snippet' : 'snippets'}`
          )}
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-blue-600 dark:text-blue-400 animate-spin" />
          </div>
        ) : filteredSnippets.length === 0 ? (
          /* Empty State */
          <div className="text-center py-20">
            <Code2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              {hasActiveFilters ? 'No snippets found' : 'No snippets yet'}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {hasActiveFilters
                ? 'Try adjusting your search or filters'
                : `Create your first ${activeTab === 'all' ? '' : activeTab} snippet to get started`}
            </p>
            {hasActiveFilters ? (
              <button
                onClick={clearFilters}
                className="px-6 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors"
              >
                Clear Filters
              </button>
            ) : (
              <Link
                to="/snippet/create"
                className="inline-flex items-center px-6 py-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-colors"
              >
                <Plus className="w-5 h-5 mr-2" />
                Create Snippet
              </Link>
            )}
          </div>
        ) : (
          /* Snippets Display */
          <div className={viewMode === 'grid' ? 'grid md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
            {filteredSnippets.map((snippet) => (
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

export default MySnippetsPage;