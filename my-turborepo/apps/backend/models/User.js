import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema({
  googleId: {
    type: String,
    required: true,
    unique: true
  },
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  profilePic: {
    type: String, // URL or file path
    default: ''
  },
  snippets: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Snippet'
    }
  ],
   collections: [  
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Collection'
    }
  ],
  favorites: [  
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Snippet'
    }
  ],
  stats: {
    totalSnippets: {
      type: Number,
      default: 0
    },
    publicSnippets: {
      type: Number,
      default: 0
    },
    privateSnippets: {
      type: Number,
      default: 0
    }
  }
}, { timestamps: true });

userSchema.pre("save", async function(next){
    if(!this.isModified("password")) return next();
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

userSchema.methods.matchPassword = async function(enteredPassword){
    return await bcrypt.compare(enteredPassword, this.password);
};

export default mongoose.model("User", userSchema);