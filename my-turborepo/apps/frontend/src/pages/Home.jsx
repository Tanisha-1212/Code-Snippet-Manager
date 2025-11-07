// pages/Dashboard.jsx
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSnippet } from '../context/SnippetContext';
import {
  Plus,
  Code2,
  Folder,
  Heart,
  TrendingUp,
  Calendar,
  Loader2,
  ArrowRight,
  Sparkles,
  FolderPlus
} from 'lucide-react';
import SnippetCard from '../components/SnippetCard';

const Dashboard = () => {
  const { user } = useAuth();
  const { userSnippets, loading, fetchUserSnippets } = useSnippet();
  const [recentSnippets, setRecentSnippets] = useState([]);

  useEffect(() => {
    // Fetch user's snippets
    fetchUserSnippets();
  }, []);

  useEffect(() => {
    // Get 6 most recent snippets
    if (userSnippets.length > 0) {
      setRecentSnippets(userSnippets.slice(0, 6));
    }
  }, [userSnippets]);

  const copyToClipboard = (code) => {
    navigator.clipboard.writeText(code);
  };

  // Stats from user object
  const stats = [
    {
      label: 'Total Snippets',
      value: user?.stats?.totalSnippets || 0,
      icon: Code2,
      color: 'from-blue-500 to-cyan-500',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
      textColor: 'text-blue-600 dark:text-blue-400',
      to: '/snippets' // Link to all snippets
    },
    {
      label: 'Collections',
      value: user?.collections?.length || 0,
      icon: Folder,
      color: 'from-purple-500 to-pink-500',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20',
      textColor: 'text-purple-600 dark:text-purple-400',
      to: '/collections' // Link to collections page
    },
    {
      label: 'Favorites',
      value: user?.favorites?.length || 0,
      icon: Heart,
      color: 'from-red-500 to-orange-500',
      bgColor: 'bg-red-50 dark:bg-red-900/20',
      textColor: 'text-red-600 dark:text-red-400',
      to: '/favorites' // Link to favorites page
    },
    {
      label: 'Public Snippets',
      value: user?.stats?.publicSnippets || 0,
      icon: TrendingUp,
      color: 'from-green-500 to-emerald-500',
      bgColor: 'bg-green-50 dark:bg-green-900/20',
      textColor: 'text-green-600 dark:text-green-400',
      to: '/snippets?filter=public' // Link to public snippets only
    }
  ];

  const quickActions = [
    {
      label: 'Create Snippet',
      description: 'Add a new code snippet',
      icon: Plus,
      to: '/snippet/create',
      color: 'bg-blue-600 hover:bg-blue-700 text-white'
    },
    {
      label: 'New Collection',
      description: 'Organize your snippets',
      icon: FolderPlus,
      to: '/collections',
      color: 'bg-purple-600 hover:bg-purple-700 text-white'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Welcome Section */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-2">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
              Welcome back, {user?.username}! 👋
            </h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            Here's what's happening with your snippets today
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Link
                key={index}
                to={stat.to}
                className="group bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg hover:border-blue-500 dark:hover:border-blue-400 transition-all transform hover:scale-105"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 rounded-xl ${stat.bgColor} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                    <Icon className={`w-6 h-6 ${stat.textColor}`} />
                  </div>
                  <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 group-hover:translate-x-1 transition-all" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                  {stat.value}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {stat.label}
                </p>
              </Link>
            );
          })}
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {quickActions.map((action, index) => {
            const Icon = action.icon;
            return (
              <Link
                key={index}
                to={action.to}
                className={`group relative overflow-hidden ${action.color} rounded-xl shadow-lg p-6 transition-all transform hover:scale-105`}
              >
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-3">
                    <Icon className="w-8 h-8" />
                    <ArrowRight className="w-5 h-5 transform group-hover:translate-x-1 transition-transform" />
                  </div>
                  <h3 className="text-xl font-bold mb-1">
                    {action.label}
                  </h3>
                  <p className="text-sm opacity-90">
                    {action.description}
                  </p>
                </div>
                
                {/* Decorative gradient */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-16 -mt-16"></div>
              </Link>
            );
          })}
        </div>

        {/* Recent Snippets Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
              <Sparkles className="w-6 h-6 mr-2 text-yellow-500" />
              Recent Snippets
            </h2>
            <Link
              to="/snippets"
              className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:underline"
            >
              View all
              <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 text-blue-600 dark:text-blue-400 animate-spin" />
            </div>
          ) : recentSnippets.length === 0 ? (
            /* Empty State */
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-12 text-center">
              <Code2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                No snippets yet
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Create your first code snippet to get started
              </p>
              <Link
                to="/snippet/create"
                className="inline-flex items-center px-6 py-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-colors"
              >
                <Plus className="w-5 h-5 mr-2" />
                Create Snippet
              </Link>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recentSnippets.map((snippet) => (
                <SnippetCard
                  key={snippet._id}
                  snippet={snippet}
                  onCopy={copyToClipboard}
                />
              ))}
            </div>
          )}
        </div>

        {/* Collections Section */}
        {user?.collections && user.collections.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
                <Folder className="w-6 h-6 mr-2 text-purple-500" />
                Your Collections
              </h2>
              <Link
                to="/collections"
                className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:underline"
              >
                View all
                <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {user.collections.slice(0, 4).map((collection) => (
                <Link
                  key={collection._id}
                  to={`/collections/${collection._id}`}
                  className="group bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-all hover:border-purple-500 dark:hover:border-purple-400"
                >
                  <div className="flex items-center space-x-3 mb-3">
                    <div 
                      className="w-10 h-10 rounded-lg flex items-center justify-center"
                      style={{
                        backgroundColor: collection.color ? `${collection.color}30` : '#e5e7eb'
                      }}
                    >
                      <Folder 
                        className="w-5 h-5"
                        style={{ color: collection.color || '#6b7280' }}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 dark:text-white truncate group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                        {collection.name}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {collection.snippets?.length || 0} snippets
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Activity Feed / Tips Section */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Quick Tip */}
          <div className="bg-linear-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800">
            <div className="flex items-start space-x-3">
              <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center shrink-0">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  💡 Quick Tip
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Use tags to organize your snippets better. Tags make it easier to find and filter your code later!
                </p>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center space-x-2 mb-4">
              <Calendar className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              <h3 className="font-semibold text-gray-900 dark:text-white">
                Recent Activity
              </h3>
            </div>
            <div className="space-y-3">
              {recentSnippets.slice(0, 3).map((snippet) => (
                <Link
                  key={snippet._id}
                  to={`/snippet/${snippet._id}`}
                  className="block text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  <span className="font-medium">Created</span> "{snippet.title}"
                  <span className="text-xs text-gray-400 dark:text-gray-500 ml-2">
                    {new Date(snippet.createdAt).toLocaleDateString()}
                  </span>
                </Link>
              ))}
              {recentSnippets.length === 0 && (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  No recent activity
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;