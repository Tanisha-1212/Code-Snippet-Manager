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
    default: 'JavaScript'
  },
  description: [
    {
      type : String,
    }
  ],
  tags: [
    {
      type: String
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
  }
}, { timestamps: true });

export default mongoose.model("Snippet", snippetSchema);