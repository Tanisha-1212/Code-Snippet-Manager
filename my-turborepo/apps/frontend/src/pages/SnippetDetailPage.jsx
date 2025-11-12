// pages/SnippetDetailPage.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useSnippet } from '../context/SnippetContext';
import { useComments } from '../context/CommentsContext';
import { useAuth } from '../context/AuthContext';
import AddToCollectionDropdown from '../components/CollectionDropdown';
import {
  Copy,
  Check,
  Edit,
  Trash2,
  Tag,
  Calendar,
  User,
  Folder,
  ArrowLeft,
  Code2,
  Loader2,
  MessageCircle,
  Send,
  Heart,
  MoreVertical,
  Reply,
  Eye,
  Star
} from 'lucide-react';

const SnippetDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { 
    currentSnippet, 
    loading: snippetLoading, 
    fetchSnippetById,
    deleteSnippet,
    trackView,
    trackCopy,
    toggleFavorite
  } = useSnippet();
  const { 
    comments, 
    loading: commentsLoading, 
    fetchComments, 
    createComment, 
    deleteComment,
    toggleLike 
  } = useComments();

  const [copied, setCopied] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);
  const [favoriteCount, setFavoriteCount] = useState(0);
  const [commentText, setCommentText] = useState('');
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [localSnippet, setLocalSnippet] = useState(null);

  useEffect(() => {
    if (id) {
      fetchSnippetById(id);
      fetchComments(id);
      trackView(id);
    }
  }, [id]);

  useEffect(() => {
    if (currentSnippet) {
      setLocalSnippet(currentSnippet);
      setFavoriteCount(currentSnippet.favoriteCount || 0);
    }
  }, [currentSnippet]);

  useEffect(() => {
    // Check if current user has favorited this snippet
    const checkFavoriteStatus = async () => {
      if (isAuthenticated && user && currentSnippet) {
        const favorited = user.favorites?.some(fav => 
          (typeof fav === 'string' ? fav : fav._id) === currentSnippet._id
        );
        setIsFavorited(favorited || false);
      } else {
        setIsFavorited(false);
      }
    };
    
    checkFavoriteStatus();
  }, [currentSnippet, user, isAuthenticated]);

  const handleCopy = async () => {
    if (currentSnippet?.code) {
      navigator.clipboard.writeText(currentSnippet.code);
      await trackCopy(id);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleFavorite = async () => {
    if (!isAuthenticated) {
      navigate('/auth');
      return;
    }

    const result = await toggleFavorite(id);
    if (result.success) {
      setIsFavorited(result.data.isFavorited);
      setFavoriteCount(result.data.favoriteCount);
    }
  };

  const handleDelete = async () => {
    const result = await deleteSnippet(id);
    if (result.success) {
      navigate('/explore');
    }
    setShowDeleteModal(false);
  };

  const handleCollectionUpdate = (updatedSnippet) => {
    setLocalSnippet(updatedSnippet);
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    const result = await createComment({
      snippet: id,
      content: commentText
    });

    if (result.success) {
      setCommentText('');
    }
  };

  const handleReplySubmit = async (e, parentCommentId) => {
    e.preventDefault();
    if (!replyText.trim()) return;

    const result = await createComment({
      snippet: id,
      content: replyText,
      parentComment: parentCommentId
    });

    if (result.success) {
      setReplyText('');
      setReplyingTo(null);
    }
  };

  const handleCommentDelete = async (commentId, parentId = null) => {
    const result = await deleteComment(commentId, parentId);
    if (result.success) {
      // Comment deleted successfully
    }
  };

  const handleLike = async (commentId, isReply = false, parentId = null) => {
    await toggleLike(commentId, isReply, parentId);
  };

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

  if (snippetLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-blue-600 dark:text-blue-400 animate-spin" />
      </div>
    );
  }

  if (!currentSnippet) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Code2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Snippet not found
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            This snippet doesn't exist or has been deleted
          </p>
          <Link
            to="/explore"
            className="inline-flex items-center px-6 py-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Explore
          </Link>
        </div>
      </div>
    );
  }

  const isOwner = user?._id === currentSnippet.user?._id;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </button>

        {/* Snippet Card */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden mb-6">
          
          {/* Header */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  {currentSnippet.title}
                </h1>
                {currentSnippet.description && currentSnippet.description.length > 0 && (
                  <div className="text-gray-600 dark:text-gray-400">
                    {Array.isArray(currentSnippet.description) ? (
                      <ul className="list-disc list-inside space-y-2">
                        {currentSnippet.description.map((point, index) => (
                          <li key={index}>{point}</li>
                        ))}
                      </ul>
                    ) : (
                      <p>{currentSnippet.description}</p>
                    )}
                  </div>
                )}
              </div>
              
              {/* Language Badge */}
              <span className={`inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-medium ml-4 ${getLanguageColor(currentSnippet.language)}`}>
                {currentSnippet.language}
              </span>
            </div>

            {/* Tags */}
            {currentSnippet.tags && currentSnippet.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {currentSnippet.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm"
                  >
                    <Tag className="w-3 h-3 mr-1" />
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* Collection */}
            {localSnippet?.collection && (
              <div className="mb-4">
                <span 
                  className="inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-medium"
                  style={{
                    backgroundColor: localSnippet.collection.color ? `${localSnippet.collection.color}20` : '#e5e7eb',
                    color: localSnippet.collection.color || '#374151'
                  }}
                >
                  <Folder className="w-4 h-4 mr-2" />
                  {localSnippet.collection.name}
                </span>
              </div>
            )}

            {/* Author and Date */}
            <div className="flex items-center justify-between flex-wrap gap-4">
              <Link 
                to={`/users/${currentSnippet.user?._id}`}
                className="flex items-center space-x-3 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                {currentSnippet.user?.profilePic ? (
                  <img 
                    src={currentSnippet.user.profilePic} 
                    alt={currentSnippet.user.username}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                    <User className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                )}
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {currentSnippet.user?.username || 'Anonymous'}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
                    <Calendar className="w-3 h-3 mr-1" />
                    {new Date(currentSnippet.createdAt).toLocaleDateString('en-US', { 
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              </Link>

              {/* Action Buttons */}
              <div className="flex items-center space-x-2 flex-wrap gap-2">
                <button
                  onClick={handleCopy}
                  className="inline-flex items-center px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4 mr-2 text-green-600 dark:text-green-400" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 mr-2" />
                      Copy
                    </>
                  )}
                </button>

                {/* Favorite Button */}
                <button
                  onClick={handleFavorite}
                  className={`inline-flex items-center px-4 py-2 rounded-lg transition-colors ${
                    isFavorited
                      ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  <Heart className={`w-4 h-4 mr-2 ${isFavorited ? 'fill-current' : ''}`} />
                  {isFavorited ? 'Favorited' : 'Favorite'}
                </button>

                {/* Add to Collection Button - Only for owner */}
                {isOwner && localSnippet && (
                  <AddToCollectionDropdown 
                    snippet={localSnippet}
                    onSuccess={handleCollectionUpdate}
                  />
                )}

                {isOwner && (
                  <>
                    <Link
                      to={`/snippet/${id}/edit`}
                      className="inline-flex items-center px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-blue-700  transition-colors"
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Edit
                    </Link>
                    <button
                      onClick={() => setShowDeleteModal(true)}
                      className="inline-flex items-center px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-red-700  transition-colors"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Code Display */}
          <div className="bg-gray-900 dark:bg-gray-950 relative">
            {/* Stats Bar */}
            <div className="flex items-center justify-between px-6 py-3 border-b border-gray-800">
              <div className="flex items-center space-x-6 text-sm text-gray-400">
                <div className="flex items-center space-x-1">
                  <Eye className="w-4 h-4" />
                  <span>{currentSnippet.viewCount || 0} views</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Copy className="w-4 h-4" />
                  <span>{currentSnippet.copyCount || 0} copies</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Heart className="w-4 h-4" />
                  <span>{favoriteCount} favorites</span>
                </div>
              </div>
            </div>
            
            {/* Code */}
            <div className="p-6 overflow-x-auto">
              <pre className="text-sm text-gray-300 font-mono">
                <code>{currentSnippet.code}</code>
              </pre>
            </div>
          </div>
        </div>

        {/* Comments Section */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
            <MessageCircle className="w-6 h-6 mr-2" />
            Comments ({comments.length})
          </h2>

          {/* Add Comment Form */}
          {isAuthenticated ? (
            <form onSubmit={handleCommentSubmit} className="mb-8">
              <textarea
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Add a comment..."
                rows="3"
                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              />
              <div className="flex justify-end mt-2">
                <button
                  type="submit"
                  disabled={!commentText.trim()}
                  className="inline-flex items-center px-6 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white transition-colors"
                >
                  <Send className="w-4 h-4 mr-2" />
                  Post Comment
                </button>
              </div>
            </form>
          ) : (
            <div className="mb-8 p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
              <p className="text-blue-800 dark:text-blue-300">
                <Link to="/login" className="font-semibold hover:underline">
                  Sign in
                </Link>{' '}
                to join the conversation
              </p>
            </div>
          )}

          {/* Comments List */}
          {commentsLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-6 h-6 text-blue-600 dark:text-blue-400 animate-spin" />
            </div>
          ) : comments.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              No comments yet. Be the first to comment!
            </div>
          ) : (
            <div className="space-y-6">
              {comments.map((comment) => (
                <CommentItem
                  key={comment._id}
                  comment={comment}
                  currentUser={user}
                  onDelete={handleCommentDelete}
                  onLike={handleLike}
                  onReply={(commentId) => setReplyingTo(commentId)}
                  replyingTo={replyingTo}
                  replyText={replyText}
                  setReplyText={setReplyText}
                  onReplySubmit={handleReplySubmit}
                  onCancelReply={() => {
                    setReplyingTo(null);
                    setReplyText('');
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Delete Snippet
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Are you sure you want to delete this snippet? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Comment Item Component
const CommentItem = ({ 
  comment, 
  currentUser, 
  onDelete, 
  onLike, 
  onReply,
  replyingTo,
  replyText,
  setReplyText,
  onReplySubmit,
  onCancelReply,
  isReply = false 
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const isOwner = currentUser?._id === comment.user?._id;
  const isLiked = comment.likes?.includes(currentUser?._id);

  return (
    <div className={`${isReply ? 'ml-12' : ''}`}>
      <div className="flex space-x-3">
        {/* Avatar */}
        <Link to={`/user/${comment.user?._id}`}>
          {comment.user?.profilePic ? (
            <img
              src={comment.user.profilePic}
              alt={comment.user.username}
              className="w-10 h-10 rounded-full object-cover"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <User className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
          )}
        </Link>

        {/* Comment Content */}
        <div className="flex-1">
          <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <Link 
                to={`/user/${comment.user?._id}`}
                className="font-semibold text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400"
              >
                {comment.user?.username || 'Anonymous'}
              </Link>
              {isOwner && (
                <div className="relative">
                  <button
                    onClick={() => setShowMenu(!showMenu)}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <MoreVertical className="w-4 h-4" />
                  </button>
                  {showMenu && (
                    <div className="absolute right-0 mt-2 w-32 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-10">
                      <button
                        onClick={() => {
                          onDelete(comment._id, comment.parentComment);
                          setShowMenu(false);
                        }}
                        className="w-full px-4 py-2 text-left text-red-600 dark:text-red-400 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg"
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
            <p className="text-gray-700 dark:text-gray-300">{comment.content}</p>
          </div>

          {/* Comment Actions */}
          <div className="flex items-center space-x-4 mt-2 text-sm">
            <button
              onClick={() => onLike(comment._id, isReply, comment.parentComment)}
              className={`flex items-center space-x-1 ${
                isLiked 
                  ? 'text-red-600 dark:text-red-400' 
                  : 'text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400'
              }`}
            >
              <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
              <span>{comment.likes?.length || 0}</span>
            </button>

            {!isReply && currentUser && (
              <button
                onClick={() => onReply(comment._id)}
                className="flex items-center space-x-1 text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
              >
                <Reply className="w-4 h-4" />
                <span>Reply</span>
              </button>
            )}

            <span className="text-gray-400 dark:text-gray-500 text-xs">
              {new Date(comment.createdAt).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: new Date(comment.createdAt).getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
              })}
            </span>
          </div>

          {/* Reply Form */}
          {replyingTo === comment._id && (
            <form onSubmit={(e) => onReplySubmit(e, comment._id)} className="mt-3">
              <textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Write a reply..."
                rows="2"
                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-sm"
                autoFocus
              />
              <div className="flex justify-end space-x-2 mt-2">
                <button
                  type="button"
                  onClick={onCancelReply}
                  className="px-3 py-1 text-sm rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!replyText.trim()}
                  className="px-3 py-1 text-sm rounded-lg bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white"
                >
                  Reply
                </button>
              </div>
            </form>
          )}

          {/* Nested Replies */}
          {comment.replies && comment.replies.length > 0 && (
            <div className="mt-4 space-y-4">
              {comment.replies.map((reply) => (
                <CommentItem
                  key={reply._id}
                  comment={reply}
                  currentUser={currentUser}
                  onDelete={onDelete}
                  onLike={onLike}
                  isReply={true}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SnippetDetailPage;