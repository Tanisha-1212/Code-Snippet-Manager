import mongoose  from 'mongoose';

const snippetSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  code: {
    type: String,
    required: true
  },
  language: {
    type: String,
    default: 'javaScript',
    lowercase: true
  },
  description: [
    {
      type : String,
    }
  ],
  tags: [
    {
      type: String,
      trim: true
    }
  ],
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isPublic: {
    type: Boolean,
    default: false
  },
  collection: { 
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Collection',
    default: null
  },
  viewCount: {
    type: Number,
    default: 0
  },
  copyCount: {
    type: Number,
    default: 0
  },
  favoriteCount: {
    type: Number,
    default: 0
  },
}, { timestamps: true });

snippetSchema.index({ title: 'text', tags: 'text' });
snippetSchema.index({ language: 1 });
snippetSchema.index({ isPublic: 1, createdAt: -1 });  // For explore page
snippetSchema.index({ user: 1 });


export default mongoose.model("Snippet", snippetSchema);