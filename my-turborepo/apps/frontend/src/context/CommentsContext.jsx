import { createContext, useState, useContext } from 'react';
import axiosInstance from '../utils/axiosInstance';

const CommentContext = createContext();

export const useComments = () => {
  const context = useContext(CommentContext);
  if (!context) {
    throw new Error('useComments must be used within CommentProvider');
  }
  return context;
};

export const CommentProvider = ({ children }) => {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch comments for a snippet
  const fetchComments = async (snippetId) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await axiosInstance.get(`/comments/snippet/${snippetId}`);
      setComments(data);
      return { success: true, data };
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to fetch comments';
      setError(message);
      console.error('Error fetching comments:', err);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  // Create a new comment
  const createComment = async (commentData) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await axiosInstance.post('/comments', commentData);
      
      // If it's a top-level comment, add to comments array
      if (!commentData.parentComment) {
        setComments(prev => [data, ...prev]);
      } else {
        // If it's a reply, update the parent comment's replies
        setComments(prev => prev.map(comment => {
          if (comment._id === commentData.parentComment) {
            return {
              ...comment,
              replies: [...(comment.replies || []), data]
            };
          }
          return comment;
        }));
      }
      
      return { success: true, data };
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to create comment';
      setError(message);
      console.error('Error creating comment:', err);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  // Update a comment
  const updateComment = async (commentId, content) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await axiosInstance.put(`/comments/${commentId}`, { content });
      
      // Update in state
      setComments(prev => prev.map(comment => {
        if (comment._id === commentId) {
          return data;
        }
        // Update in replies
        if (comment.replies) {
          return {
            ...comment,
            replies: comment.replies.map(reply => 
              reply._id === commentId ? data : reply
            )
          };
        }
        return comment;
      }));
      
      return { success: true, data };
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to update comment';
      setError(message);
      console.error('Error updating comment:', err);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  // Delete a comment
  const deleteComment = async (commentId, parentCommentId = null) => {
    setLoading(true);
    setError(null);
    try {
      await axiosInstance.delete(`/comments/${commentId}`);

      // Remove from state
      if (!parentCommentId) {
        // Remove top-level comment
        setComments(prev => prev.filter(c => c._id !== commentId));
      } else {
        // Remove reply from parent
        setComments(prev => prev.map(comment => {
          if (comment._id === parentCommentId) {
            return {
              ...comment,
              replies: comment.replies.filter(r => r._id !== commentId)
            };
          }
          return comment;
        }));
      }
      
      return { success: true };
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to delete comment';
      setError(message);
      console.error('Error deleting comment:', err);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  // Toggle like on a comment
  const toggleLike = async (commentId, isReply = false, parentCommentId = null) => {
    setError(null);
    try {
      const { data } = await axiosInstance.post(`/comments/${commentId}/like`);
      
      // Update in state
      setComments(prev => prev.map(comment => {
        if (!isReply && comment._id === commentId) {
          return {
            ...comment,
            likes: data.isLiked 
              ? [...comment.likes, 'currentUser'] 
              : comment.likes.filter(id => id !== 'currentUser')
          };
        }
        
        // Update in replies
        if (isReply && comment.replies) {
          return {
            ...comment,
            replies: comment.replies.map(reply => {
              if (reply._id === commentId) {
                return {
                  ...reply,
                  likes: data.isLiked 
                    ? [...(reply.likes || []), 'currentUser']
                    : (reply.likes || []).filter(id => id !== 'currentUser')
                };
              }
              return reply;
            })
          };
        }
        
        return comment;
      }));
      
      return { success: true, data };
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to toggle like';
      setError(message);
      console.error('Error toggling like:', err);
      return { success: false, error: message };
    }
  };

  // Clear comments (useful when navigating away)
  const clearComments = () => {
    setComments([]);
    setError(null);
  };

  const value = {
    comments,
    loading,
    error,
    fetchComments,
    createComment,
    updateComment,
    deleteComment,
    toggleLike,
    clearComments
  };

  return (
    <CommentContext.Provider value={value}>
      {children}
    </CommentContext.Provider>
  );
};