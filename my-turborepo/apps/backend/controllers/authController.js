import User from '../models/User.js';
import connectDB from '../config/db.js';
import passport from 'passport';
import { FRONTEND_REDIRECT } from '../config/passport.js';

// @desc    Google OAuth
// @route   GET /api/auth/google
// @access  Public
export const googleAuth = passport.authenticate('google', {
  scope: ['profile', 'email']
});

// @desc    Google OAuth Callback
// @route   GET /api/auth/google/callback
// @access  Public
export const googleAuthCallback = async (req, res) => {
  try {
    await connectDB();
    
    if (!req.user) {
      console.error('No user in request after Google auth');
      return res.redirect(`${FRONTEND_REDIRECT}/auth/callback?error=auth_failed`);
    }

    console.log('Google auth successful for user:', req.user.email);
    console.log('Session ID:', req.sessionID);

    // User is now in session, redirect to frontend
    res.redirect(`${FRONTEND_REDIRECT}/auth/callback`);
  } catch (error) {
    console.error('Google auth callback error:', error);
    res.redirect(`${FRONTEND_REDIRECT}/auth/callback?error=auth_failed`);
  }
};

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
export const register = async (req, res) => {
  try {
    await connectDB();
    const { username, email, password } = req.body;

    // Validation
    if (!username || !email || !password) {
      return res.status(400).json({ message: 'Please provide all fields' });
    }

    // Check if user exists
    const userExists = await User.findOne({ 
      $or: [{ email }, { username }] 
    });

    if (userExists) {
      return res.status(400).json({ 
        message: 'User with this email or username already exists' 
      });
    }

    // Create user
    const user = await User.create({
      username,
      email,
      password,
      collections: [],
      favorites: [],
      stats: {
        totalSnippets: 0,
        publicSnippets: 0,
        privateSnippets: 0
      }
    });

    // Log user in (create session)
    req.login(user, (err) => {
      if (err) {
        return res.status(500).json({ message: 'Login failed after registration' });
      }

      // Fetch user with populated fields
      User.findById(user._id)
        .select('-password')
        .populate('snippets', 'title language tags createdAt')
        .populate('collections', 'name color icon')
        .populate('favorites', 'title language tags')
        .then(populatedUser => {
          res.status(201).json(populatedUser);
        });
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res) => {
  try {
    await connectDB();
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    console.log('Attempting to find user with email:', email);

    // Find user by email
    const user = await User.findOne({ email })
      .populate('snippets', 'title language tags createdAt')
      .populate('favorites', 'title language tags')
      .populate({
        path: 'collections',
        select: 'name color icon snippets',
        populate: {
          path: 'snippets',
          select: 'title language tags createdAt',
        }
      });

    console.log('User found:', user ? 'Yes' : 'No');

    if (user && (await user.matchPassword(password))) {
      // Log user in (create session)
      req.login(user, (err) => {
        if (err) {
          return res.status(500).json({ message: 'Login failed' });
        }

        // Remove password from response
        const userResponse = user.toObject();
        delete userResponse.password;

        // Ensure arrays exist
        userResponse.collections = userResponse.collections || [];
        userResponse.favorites = userResponse.favorites || [];

        console.log('=== USER LOGGED IN ===');
        console.log('Session ID:', req.sessionID);
        console.log('User:', userResponse.email);
        console.log('=====================');

        res.json(userResponse);
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
export const logout = async (req, res) => {
  try {
    req.logout((err) => {
      if (err) {
        return res.status(500).json({ message: 'Logout failed' });
      }
      
      req.session.destroy((err) => {
        if (err) {
          return res.status(500).json({ message: 'Session destruction failed' });
        }
        res.clearCookie('connect.sid'); // Clear session cookie
        res.json({ message: 'Logged out successfully' });
      });
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res) => {
  try {
    await connectDB();
    
    if (!req.user) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    const user = await User.findById(req.user._id)
      .select('-password')
      .populate('snippets', 'title language tags createdAt')
      .populate('collections', 'name color icon')
      .populate('favorites', 'title language tags');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Ensure arrays exist
    const userResponse = user.toObject();
    userResponse.collections = userResponse.collections || [];
    userResponse.favorites = userResponse.favorites || [];

    res.json(userResponse);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
export const updateProfile = async (req, res) => {
  try {
    await connectDB();
    const userId = req.user._id;
    const { username, email, bio } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: 'User not found' 
      });
    }

    // Check username/email availability
    if (username && username !== user.username) {
      const usernameExists = await User.findOne({ 
        username, 
        _id: { $ne: userId } 
      });
      if (usernameExists) {
        return res.status(400).json({ 
          success: false,
          message: 'Username already taken' 
        });
      }
    }

    if (email && email !== user.email) {
      const emailExists = await User.findOne({ 
        email, 
        _id: { $ne: userId } 
      });
      if (emailExists) {
        return res.status(400).json({ 
          success: false,
          message: 'Email already in use' 
        });
      }
    }

    // Update fields
    if (username) user.username = username;
    if (email) user.email = email;
    if (bio !== undefined) user.bio = bio;

    // Handle profile picture
    if (req.file) {
      user.profilePic = req.file.path;
    }

    await user.save();

    // Return updated user with populated fields
    const updatedUser = await User.findById(userId)
      .select('-password')
      .populate('snippets', 'title language tags createdAt')
      .populate('collections', 'name color icon')
      .populate('favorites', 'title language tags');

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: updatedUser
    });

  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

// @desc    Change user password
// @route   PUT /api/auth/change-password
// @access  Private
export const changePassword = async (req, res) => {
  try {
    await connectDB();
    const userId = req.user._id;
    const { currentPassword, newPassword, confirmPassword } = req.body;

    // Validation
    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({ 
        message: 'Please provide all password fields' 
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ 
        message: 'New passwords do not match' 
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ 
        message: 'New password must be at least 6 characters' 
      });
    }

    // Find user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Verify current password
    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({ message: 'Current password is incorrect' });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.json({
      success: true,
      message: 'Password changed successfully'
    });

  } catch (error) {
    console.error('Error changing password:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete user account
// @route   DELETE /api/auth/account
// @access  Private
export const deleteAccount = async (req, res) => {
  try {
    await connectDB();
    const userId = req.user._id;
    const { password, confirmation } = req.body;

    // Validation
    if (!password || confirmation !== 'DELETE') {
      return res.status(400).json({ 
        message: 'Please provide password and type DELETE to confirm' 
      });
    }

    // Find user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Verify password
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Incorrect password' });
    }

    // Import models if needed
    const Snippet = (await import('../models/Snippet.js')).default;
    const Collection = (await import('../models/Collection.js')).default;

    await Snippet.deleteMany({ owner: userId });
    await Collection.deleteMany({ owner: userId });

    // Delete user
    await User.findByIdAndDelete(userId);

    // Destroy session
    req.logout((err) => {
      if (err) console.error('Logout error:', err);
      
      req.session.destroy((err) => {
        if (err) console.error('Session destroy error:', err);
        res.clearCookie('connect.sid');
        res.json({
          success: true,
          message: 'Account deleted successfully'
        });
      });
    });

  } catch (error) {
    console.error('Error deleting account:', error);
    res.status(500).json({ message: error.message });
  }
};