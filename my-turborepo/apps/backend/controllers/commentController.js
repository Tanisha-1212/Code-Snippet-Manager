// controllers/commentController.js
import Comment from '../models/Comment.js';
import Snippet from '../models/Snippet.js';

// @desc    Create comment
// @route   POST /api/comments
// @access  Private
export const createComment = async (req, res) => {
  try {
    const { snippet, content, lineNumber, parentComment } = req.body;

    if (!snippet || !content) {
      return res.status(400).json({ message: 'Snippet and content are required' });
    }

    // Check if snippet exists
    const snippetExists = await Snippet.findById(snippet);
    if (!snippetExists) {
      return res.status(404).json({ message: 'Snippet not found' });
    }

    const comment = await Comment.create({
      snippet,
      user: req.user._id,
      content,
      lineNumber: lineNumber || null,
      parentComment: parentComment || null
    });

    // If it's a reply, add to parent's replies
    if (parentComment) {
      await Comment.findByIdAndUpdate(parentComment, {
        $push: { replies: comment._id }
      });
    }

    const populatedComment = await Comment.findById(comment._id)
      .populate('user', 'username profilePic');

    res.status(201).json(populatedComment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get comments for a snippet
// @route   GET /api/comments/snippet/:snippetId
// @access  Public
export const getCommentsBySnippet = async (req, res) => {
  try {
    const comments = await Comment.find({ 
      snippet: req.params.snippetId,
      parentComment: null // Only top-level comments
    })
      .sort({ createdAt: -1 })
      .populate('user', 'username profilePic')
      .populate({
        path: 'replies',
        populate: { path: 'user', select: 'username profilePic' }
      });

    res.json(comments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update comment
// @route   PUT /api/comments/:id
// @access  Private
export const updateComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);

    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    // Check ownership
    if (comment.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    comment.content = req.body.content || comment.content;
    await comment.save();

    const updatedComment = await Comment.findById(comment._id)
      .populate('user', 'username profilePic');

    res.json(updatedComment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete comment
// @route   DELETE /api/comments/:id
// @access  Private
export const deleteComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);

    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    // Check ownership
    if (comment.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Delete all replies
    await Comment.deleteMany({ parentComment: comment._id });

    // Remove from parent's replies if it's a reply
    if (comment.parentComment) {
      await Comment.findByIdAndUpdate(comment.parentComment, {
        $pull: { replies: comment._id }
      });
    }

    await comment.deleteOne();

    res.json({ message: 'Comment deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Toggle like on comment
// @route   POST /api/comments/:id/like
// @access  Private
export const toggleLike = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);

    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    const isLiked = comment.likes.includes(req.user._id);

    if (isLiked) {
      comment.likes = comment.likes.filter(
        userId => userId.toString() !== req.user._id.toString()
      );
    } else {
      comment.likes.push(req.user._id);
    }

    await comment.save();

    res.json({ 
      message: isLiked ? 'Like removed' : 'Comment liked',
      isLiked: !isLiked,
      likesCount: comment.likes.length
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};