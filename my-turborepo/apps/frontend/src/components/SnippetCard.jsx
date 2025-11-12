// components/SnippetCard.jsx
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Copy, Eye, Tag, Calendar, User, Check, Folder, MessageCircle } from 'lucide-react';

const SnippetCard = ({ snippet, onCopy }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    onCopy(snippet.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Get language color
  const getLanguageColor = (language) => {
    const colors = {
      javascript: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300',
      python: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
      java: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300',
      typescript: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
      cpp: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300',
      'c++': 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300',
      html: 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300',
      css: 'bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300',
      ruby: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300',
      go: 'bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-300',
      rust: 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300',
      php: 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300',
    };
    return colors[language?.toLowerCase()] || 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300';
  };

  // Get comment count (total comments including replies)
  const getCommentCount = () => {
    if (!snippet.comments) return 0;
    return snippet.comments.length;
  };

  return (
    <div className="flex flex-col justify-between group bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-300 overflow-hidden hover:border-blue-500 dark:hover:border-blue-400">
      {/* Card Header */}
      <div className="p-2">
        <div className="flex items-start justify-between">
          <Link 
            to={`/snippet/${snippet._id}`}
            className="flex-1"
          >
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2">
              {snippet.title}
            </h3>
          </Link>
          <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ml-2 shrink-0 ${getLanguageColor(snippet.language)}`}>
            {snippet.language}
          </span>
        </div>
      </div>

      {/* Card Footer */}
      <div className="p-4">
        {/* Tags */}
        {snippet.tags && snippet.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {snippet.tags.slice(0, 3).map((tag, index) => (
              <span
                key={index}
                className="inline-flex items-center px-2 py-1 rounded-md bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs"
              >
                <Tag className="w-3 h-3 mr-1" />
                {tag}
              </span>
            ))}
            {snippet.tags.length > 3 && (
              <span className="text-xs text-gray-500 dark:text-gray-400 px-2 py-1">
                +{snippet.tags.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Collection Badge */}
        {snippet.collection && (
          <div className="mb-3">
            <span 
              className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium"
              style={{
                backgroundColor: snippet.collection.color ? `${snippet.collection.color}20` : '#e5e7eb',
                color: snippet.collection.color || '#374151'
              }}
            >
              <Folder className="w-3 h-3 mr-1" />
              {snippet.collection.name}
            </span>
          </div>
        )}

        {/* Author, Date, and Comments */}
        <div className="flex items-center justify-between text-sm mb-3">
          <Link 
            to={`/users/${snippet.user?._id}`}
            className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          >
            {snippet.user?.profilePic ? (
              <img 
                src={snippet.user.profilePic} 
                alt={snippet.user.username}
                className="w-6 h-6 rounded-full object-cover"
              />
            ) : (
              <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <User className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              </div>
            )}
            <span className="font-medium">{snippet.user?.username || 'Anonymous'}</span>
          </Link>
          
          <div className="flex items-center space-x-3">
            {/* Comment Count */}
            {getCommentCount() > 0 && (
              <div className="flex items-center space-x-1 text-gray-500 dark:text-gray-400">
                <MessageCircle className="w-4 h-4" />
                <span className="text-xs">{getCommentCount()}</span>
              </div>
            )}
            
            {/* Date */}
            <div className="flex items-center space-x-1 text-gray-500 dark:text-gray-400">
              <Calendar className="w-4 h-4" />
              <span className="text-xs">
                {new Date(snippet.createdAt).toLocaleDateString('en-US', { 
                  month: 'short', 
                  day: 'numeric',
                  year: new Date(snippet.createdAt).getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
                })}
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-2">
          <button
            onClick={handleCopy}
            className="flex-1 flex items-center justify-center space-x-1 px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-green-600 dark:text-green-400" />
                <span className="text-sm">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span className="text-sm">Copy</span>
              </>
            )}
          </button>

          <Link
            to={`/snippet/${snippet._id}`}
            className="flex-1 flex items-center justify-center space-x-1 px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors"
          >
            <Eye className="w-4 h-4" />
            <span className="text-sm">View</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SnippetCard;