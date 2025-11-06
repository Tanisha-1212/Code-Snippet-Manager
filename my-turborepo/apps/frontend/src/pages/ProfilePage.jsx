// pages/ProfilePage.jsx
import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useUser } from '../context/UserContext';
import { useSnippet } from '../context/SnippetContext';
import SnippetCard from '../components/SnippetCard';
import {
  User,
  Mail,
  Calendar,
  Loader2,
  Code2,
  Heart,
  Eye,
  Copy,
  Settings,
  Grid3x3,
  List,
  Filter,
  Search,
  ArrowLeft,
  Globe,
  Lock
} from 'lucide-react';

const ProfilePage = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const { 
    profileUser, 
    userSnippets: publicUserSnippets, 
    userStats, 
    loading: userLoading, 
    fetchUserProfile 
  } = useUser();
  const { userSnippets: ownSnippets, loading: snippetLoading, fetchUserSnippets } = useSnippet();

  const [displaySnippets, setDisplaySnippets] = useState([]);
  const [viewMode, setViewMode] = useState('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

  // Check if viewing own profile
  const isOwnProfile = !userId || currentUser?._id === userId;

  useEffect(() => {
    if (isOwnProfile) {
      // Viewing own profile - fetch own snippets
      fetchUserSnippets();
    } else {
      // Viewing another user's profile - fetch public profile
      fetchUserProfile(userId);
    }
  }, [userId, isOwnProfile, currentUser]);

  useEffect(() => {
    // Set snippets to display based on profile type
    if (isOwnProfile) {
      setDisplaySnippets(ownSnippets || []);
    } else {
      setDisplaySnippets(publicUserSnippets || []);
    }
  }, [isOwnProfile, ownSnippets, publicUserSnippets]);

  const copyToClipboard = async (code) => {
    try {
      await navigator.clipboard.writeText(code);
    } catch (err) {
      console.error('Failed to copy code:', err);
    }
  };

  // Get unique languages
  const languages = displaySnippets
    ? [...new Set(displaySnippets.map(s => s.language))]
    : [];

  // Filter and sort snippets
  const filteredSnippets = displaySnippets
    .filter(snippet => {
      const matchesSearch = snippet.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          snippet.description?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesLanguage = selectedLanguage === 'all' || snippet.language === selectedLanguage;
      return matchesSearch && matchesLanguage;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'oldest':
          return new Date(a.createdAt) - new Date(b.createdAt);
        case 'mostViewed':
          return (b.viewCount || 0) - (a.viewCount || 0);
        case 'mostCopied':
          return (b.copyCount || 0) - (a.copyCount || 0);
        case 'newest':
        default:
          return new Date(b.createdAt) - new Date(a.createdAt);
      }
    });

  // Calculate stats for display
  const displayStats = isOwnProfile 
    ? {
        totalSnippets: currentUser?.stats?.totalSnippets || 0,
        publicSnippets: currentUser?.stats?.publicSnippets || 0,
        privateSnippets: currentUser?.stats?.privateSnippets || 0,
        totalViews: displaySnippets.reduce((sum, s) => sum + (s.viewCount || 0), 0),
        totalCopies: displaySnippets.reduce((sum, s) => sum + (s.copyCount || 0), 0),
        totalFavorites: displaySnippets.reduce((sum, s) => sum + (s.favoriteCount || 0), 0)
      }
    : userStats;

  const loading = userLoading || snippetLoading;

  if (loading && !profileUser && !currentUser) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-blue-600 dark:text-blue-400 animate-spin" />
      </div>
    );
  }

  if (!isOwnProfile && !profileUser && !loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            User not found
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            This user doesn't exist
          </p>
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center px-6 py-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const displayUser = isOwnProfile ? currentUser : profileUser;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Profile Header */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden mb-6">
          {/* Cover Image */}
          <div className="h-32 bg-linear-to-r from-blue-500 via-purple-500 to-pink-500"></div>

          <div className="px-6 pb-6">
            {/* Profile Picture and Basic Info */}
            <div className="flex flex-col sm:flex-row items-center sm:items-end -mt-16 mb-4">
              <div className="relative mb-4 sm:mb-0">
                {displayUser?.profilePic ? (
                  <img
                    src={displayUser.profilePic}
                    alt={displayUser.username}
                    className="w-32 h-32 rounded-full border-4 border-white dark:border-gray-800 object-cover shadow-lg"
                  />
                ) : (
                  <div className="w-32 h-32 rounded-full border-4 border-white dark:border-gray-800 bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center shadow-lg">
                    <User className="w-16 h-16 text-blue-600 dark:text-blue-400" />
                  </div>
                )}
              </div>

              <div className="flex-1 sm:ml-6 text-center sm:text-left">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                      {displayUser?.username}
                    </h1>
                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-sm text-gray-600 dark:text-gray-400">
                      {isOwnProfile && displayUser?.email && (
                        <div className="flex items-center space-x-1">
                          <Mail className="w-4 h-4" />
                          <span>{displayUser.email}</span>
                        </div>
                      )}
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-4 h-4" />
                        <span>
                          Joined {new Date(displayUser?.createdAt).toLocaleDateString('en-US', {
                            month: 'short',
                            year: 'numeric'
                          })}
                        </span>
                      </div>
                    </div>
                  </div>

                  {isOwnProfile && (
                    <Link
                      to="/profile/settings"
                      className="inline-flex items-center px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors mt-4 sm:mt-0"
                    >
                      <Settings className="w-4 h-4 mr-2" />
                      Edit Profile
                    </Link>
                  )}
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 pt-6 border-t border-gray-200 dark:border-gray-700">
              <div className="text-center">
                <div className="flex items-center justify-center space-x-1 text-gray-600 dark:text-gray-400 mb-1">
                  <Code2 className="w-4 h-4" />
                  <span className="text-sm">Snippets</span>
                </div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {displayStats.totalSnippets}
                </p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center space-x-1 text-gray-600 dark:text-gray-400 mb-1">
                  <Globe className="w-4 h-4" />
                  <span className="text-sm">Public</span>
                </div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {displayStats.publicSnippets}
                </p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center space-x-1 text-gray-600 dark:text-gray-400 mb-1">
                  <Eye className="w-4 h-4" />
                  <span className="text-sm">Views</span>
                </div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {displayStats.totalViews}
                </p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center space-x-1 text-gray-600 dark:text-gray-400 mb-1">
                  <Copy className="w-4 h-4" />
                  <span className="text-sm">Copies</span>
                </div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {displayStats.totalCopies}
                </p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center space-x-1 text-gray-600 dark:text-gray-400 mb-1">
                  <Heart className="w-4 h-4" />
                  <span className="text-sm">Favorites</span>
                </div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {displayStats.totalFavorites}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        {displaySnippets.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-4 mb-6">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search */}
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search snippets..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Language Filter */}
              {languages.length > 1 && (
                <div className="flex items-center space-x-2">
                  <Filter className="w-5 h-5 text-gray-400" />
                  <select
                    value={selectedLanguage}
                    onChange={(e) => setSelectedLanguage(e.target.value)}
                    className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">All Languages</option>
                    {languages.map(lang => (
                      <option key={lang} value={lang}>{lang}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Sort */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="mostViewed">Most Viewed</option>
                <option value="mostCopied">Most Copied</option>
              </select>

              {/* View Mode Toggle */}
              <div className="flex items-center space-x-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded ${
                    viewMode === 'grid'
                      ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-400'
                      : 'text-gray-600 dark:text-gray-400'
                  }`}
                >
                  <Grid3x3 className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded ${
                    viewMode === 'list'
                      ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-400'
                      : 'text-gray-600 dark:text-gray-400'
                  }`}
                >
                  <List className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Content */}
        {filteredSnippets.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-12 text-center">
            <Code2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              {searchQuery || selectedLanguage !== 'all'
                ? 'No snippets found'
                : 'No snippets yet'}
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              {searchQuery || selectedLanguage !== 'all'
                ? 'Try adjusting your filters'
                : isOwnProfile
                  ? 'Start creating your first snippet'
                  : 'This user hasn\'t created any public snippets yet'}
            </p>
            {isOwnProfile && !searchQuery && selectedLanguage === 'all' && (
              <Link
                to="/snippet/create"
                className="inline-flex items-center px-6 py-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors mt-6"
              >
                <Code2 className="w-5 h-5 mr-2" />
                Create Snippet
              </Link>
            )}
          </div>
        ) : (
          <div className={viewMode === 'grid'
            ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
            : 'space-y-4'
          }>
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

export default ProfilePage;