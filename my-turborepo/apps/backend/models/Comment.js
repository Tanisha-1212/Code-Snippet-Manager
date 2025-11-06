// models/Comment.js
import mongoose from 'mongoose';

const commentSchema = new mongoose.Schema({
  snippet: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Snippet',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: true,
    trim: true
  },
  lineNumber: {  // Optional: for line-specific comments
    type: Number,
    default: null
  },
  // For threaded comments
  parentComment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Comment',
    default: null
  },
  replies: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Comment'
    }
  ],
  likes: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  ]
}, { timestamps: true });

export default mongoose.model('Comment', commentSchema);