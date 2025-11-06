// models/Collection.js
import mongoose from 'mongoose';

const collectionSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description:{
      type : String,
    },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  snippets: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Snippet'
    }
  ],
  color: {  // For visual organization
    type: String,
    default: '#3B82F6'
  },
  icon: {  // Optional icon name
    type: String,
    default: 'folder'
  }
}, { timestamps: true });

export default mongoose.model('Collection', collectionSchema);