// controllers/userController.js
import User from '../models/User.js';
import Snippet from '../models/Snippet.js';

// @desc    Get user profile by ID (public profile)
// @route   GET /api/users/:userId
// @access  Public
export const getUserProfile = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId)
      .select('-password'); // Hide password

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get only public snippets for this user
    const publicSnippets = await Snippet.find({ 
      user: userId, 
      isPublic: true 
    })
      .sort({ createdAt: -1 })
      .select('title language tags createdAt viewCount copyCount favoriteCount')
      .populate('user', 'username profilePic');

    // Calculate public stats
    const publicStats = {
      totalSnippets: publicSnippets.length,
      totalViews: publicSnippets.reduce((sum, s) => sum + (s.viewCount || 0), 0),
      totalCopies: publicSnippets.reduce((sum, s) => sum + (s.copyCount || 0), 0),
      totalFavorites: publicSnippets.reduce((sum, s) => sum + (s.favoriteCount || 0), 0),
    };

    res.json({
      _id: user._id,
      username: user.username,
      profilePic: user.profilePic,
      createdAt: user.createdAt,
      snippets: publicSnippets,
      stats: publicStats
    });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user's public snippets by user ID
// @route   GET /api/users/:userId/snippets
// @access  Public
export const getUserPublicSnippets = async (req, res) => {
  try {
    const { userId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get public snippets
    const snippets = await Snippet.find({ 
      user: userId, 
      isPublic: true 
    })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('user', 'username profilePic')
      .populate('collection', 'name color');

    const total = await Snippet.countDocuments({ 
      user: userId, 
      isPublic: true 
    });

    res.json({
      snippets,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      total
    });
  } catch (error) {
    console.error('Error fetching user public snippets:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Search users by username
// @route   GET /api/users/search?q=query
// @access  Public
export const searchUsers = async (req, res) => {
  try {
    const { q } = req.query;

    if (!q || q.trim().length === 0) {
      return res.status(400).json({ message: 'Search query is required' });
    }

    const users = await User.find({
      username: { $regex: q, $options: 'i' } // Case-insensitive search
    })
      .select('username profilePic createdAt')
      .limit(10);

    res.json({
      users,
      total: users.length
    });
  } catch (error) {
    console.error('Error searching users:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user stats (for own profile or public)
// @route   GET /api/users/:userId/stats
// @access  Public
export const getUserStats = async (req, res) => {
  try {
    const { userId } = req.params;
    const isOwnProfile = req.user && req.user._id.toString() === userId;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    let snippets;
    if (isOwnProfile) {
      // Show all snippets for own profile
      snippets = await Snippet.find({ user: userId });
    } else {
      // Show only public snippets for others
      snippets = await Snippet.find({ user: userId, isPublic: true });
    }

    const stats = {
      totalSnippets: snippets.length,
      publicSnippets: snippets.filter(s => s.isPublic).length,
      privateSnippets: isOwnProfile ? snippets.filter(s => !s.isPublic).length : 0,
      totalViews: snippets.reduce((sum, s) => sum + (s.viewCount || 0), 0),
      totalCopies: snippets.reduce((sum, s) => sum + (s.copyCount || 0), 0),
      totalFavorites: snippets.reduce((sum, s) => sum + (s.favoriteCount || 0), 0),
      languages: [...new Set(snippets.map(s => s.language))]
    };

    res.json(stats);
  } catch (error) {
    console.error('Error fetching user stats:', error);
    res.status(500).json({ message: error.message });
  }
};