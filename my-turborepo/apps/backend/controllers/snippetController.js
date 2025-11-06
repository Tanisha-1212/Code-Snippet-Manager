// controllers/snippetController.js
import Snippet from '../models/Snippet.js';
import User from '../models/User.js';
import Collection from '../models/Collection.js';
import gemini from '../config/gemini.js';

// @desc    Generate snippet metadata using Gemini
// @route   POST /api/snippets/generate-metadata
// @access  Private
export const generateMetadata = async (req, res) => {
  try {
    const { code } = req.body;

    if (!code) {
      return res.status(400).json({ message: 'Code is required' });
    }

    // Call Gemini to generate metadata
    const metadata = await gemini(code);


    res.json({
      title: metadata.title,
      language: metadata.language,
      description: metadata.description,
      tags: metadata.tags
    });
  } catch (error) {
    console.error('Gemini error:', error);
    res.status(500).json({ message: 'Failed to generate metadata', error: error.message });
  }
};

// @desc    Create new snippet
// @route   POST /api/snippets
// @access  Private
export const createSnippet = async (req, res) => {
  try {
    const { title, code, language, description, tags, isPublic, collection } = req.body;

    if (!title || !code) {
      return res.status(400).json({ message: 'Title and code are required' });
    }

    const snippet = await Snippet.create({
      title,
      code,
      language: language?.toLowerCase() || 'javascript',
      description: description || [],
      tags: tags?.map(tag => tag.toLowerCase().trim()) || [],
      user: req.user._id,
      isPublic: isPublic || false,
      collection: collection || null
    });

    // Update user's snippets array and stats
    await User.findByIdAndUpdate(req.user._id, {
      $push: { snippets: snippet._id },
      $inc: {
        'stats.totalSnippets': 1,
        [`stats.${isPublic ? 'publicSnippets' : 'privateSnippets'}`]: 1
      }
    });

    // If collection specified, add to collection
    if (collection) {
      await Collection.findByIdAndUpdate(collection._id, {
        $push: { snippets: snippet._id }
      });
    }

    const populatedSnippet = await Snippet.findById(snippet._id)
      .populate('user', 'username profilePic')
      .populate('collection', 'name color');

    res.status(201).json(populatedSnippet);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all public snippets
// @route   GET /api/snippets/public
// @access  Public
export const getPublicSnippets = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const snippets = await Snippet.find({ isPublic: true })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('user', 'username profilePic')
      .populate('collection', 'name color');

    const total = await Snippet.countDocuments({ isPublic: true });

    res.json({
      snippets,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      total
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get snippet by ID
// @route   GET /api/snippet/:id
// @access  Public (but owner can see private)
export const getSnippetById = async (req, res) => {
  try {
    const snippet = await Snippet.findById(req.params.id)
      .populate('user', 'username profilePic')
      .populate('collection', 'name color');

    if (!snippet) {
      return res.status(404).json({ message: 'Snippet not found' });
    }

    // Check if snippet is private
    if (!snippet.isPublic) {
      // If user is authenticated and is the owner, allow access
      if (req.user && snippet.user._id.toString() === req.user._id.toString()) {
        return res.json(snippet);
      }
      // Otherwise, deny access
      return res.status(403).json({ message: 'This snippet is private' });
    }

    // Public snippet - anyone can access
    return res.json(snippet);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// @desc    Update snippet
// @route   PUT /api/snippets/:id
// @access  Private
export const updateSnippet = async (req, res) => {
  try {
    const snippet = await Snippet.findById(req.params.id);

    if (!snippet) {
      return res.status(404).json({ message: 'Snippet not found' });
    }

    // Check ownership
    if (snippet.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this snippet' });
    }

    const wasPublic = snippet.isPublic;
    const oldCollection = snippet.collection;
    const { title, code, language, description, tags, isPublic, collection } = req.body;

    // Update fields
    snippet.title = title || snippet.title;
    snippet.code = code || snippet.code;
    snippet.language = language?.toLowerCase() || snippet.language;
    snippet.description = description || snippet.description;
    snippet.tags = tags?.map(tag => tag.toLowerCase().trim()) || snippet.tags;
    snippet.isPublic = isPublic ?? snippet.isPublic;
    
    // Fix: Allow collection to be set to null/undefined
    if (req.body.hasOwnProperty('collection')) {
      snippet.collection = collection;
    }

    // Check if collection changed (including null cases)
    const oldCollectionId = oldCollection?.toString();
    const newCollectionId = snippet.collection?.toString();

    if (oldCollectionId !== newCollectionId) {
      // Remove from old collection
      if (oldCollection) {
        console.log('Removing snippet from old collection:', oldCollection, snippet._id);
        await Collection.findByIdAndUpdate(
          oldCollection,
          { $pull: { snippets: snippet._id } },
          { new: true }
        );
      }

      // Add to new collection
      if (snippet.collection) {
        console.log('Adding snippet to new collection:', snippet.collection);
        await Collection.findByIdAndUpdate(
          snippet.collection,
          { $addToSet: { snippets: snippet._id } },
          { new: true }
        );
      }
    }

    await snippet.save();

    // Update user stats if public/private changed
    if (wasPublic !== snippet.isPublic) {
      if (snippet.isPublic) {
        await User.findByIdAndUpdate(req.user._id, {
          $inc: { 'stats.publicSnippets': 1, 'stats.privateSnippets': -1 }
        });
      } else {
        await User.findByIdAndUpdate(req.user._id, {
          $inc: { 'stats.publicSnippets': -1, 'stats.privateSnippets': 1 }
        });
      }
    }

    const updatedSnippet = await Snippet.findById(snippet._id)
      .populate('user', 'username profilePic')
      .populate('collection', 'name color');

    res.json(updatedSnippet);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete snippet
// @route   DELETE /api/snippets/:id
// @access  Private
export const deleteSnippet = async (req, res) => {
  try {
    const snippet = await Snippet.findById(req.params.id);

    if (!snippet) {
      return res.status(404).json({ message: 'Snippet not found' });
    }

    // Check ownership
    if (snippet.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this snippet' });
    }

    // Remove from user's snippets
    await User.findByIdAndUpdate(req.user._id, {
      $pull: { snippets: snippet._id },
      $inc: {
        'stats.totalSnippets': -1,
        [`stats.${snippet.isPublic ? 'publicSnippets' : 'privateSnippets'}`]: -1
      }
    });

    // Remove from collection if it belongs to one
    if (snippet.collection) {
      await Collection.findByIdAndUpdate(snippet.collection, {
        $pull: { snippets: snippet._id }
      });
    }

    await snippet.deleteOne();

    res.json({ message: 'Snippet deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// controllers/snippetController.js

// @desc    Increment view count
// @route   POST /api/snippet/:id/view
// @access  Public
export const incrementViewCount = async (req, res) => {
  try {
    const snippet = await Snippet.findByIdAndUpdate(
      req.params.id,
      { $inc: { viewCount: 1 } },
      { new: true }
    );

    if (!snippet) {
      return res.status(404).json({ message: 'Snippet not found' });
    }

    res.json({ viewCount: snippet.viewCount });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Increment copy count
// @route   POST /api/snippet/:id/copy
// @access  Public
export const incrementCopyCount = async (req, res) => {
  try {
    const snippet = await Snippet.findByIdAndUpdate(
      req.params.id,
      { $inc: { copyCount: 1 } },
      { new: true }
    );

    if (!snippet) {
      return res.status(404).json({ message: 'Snippet not found' });
    }

    res.json({ copyCount: snippet.copyCount });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Toggle favorite (add/remove from user's favorites)
// @route   POST /api/snippet/:id/favorite
// @access  Private
export const toggleFavorite = async (req, res) => {
  try {
    const snippet = await Snippet.findById(req.params.id);
    
    if (!snippet) {
      return res.status(404).json({ message: 'Snippet not found' });
    }

    const user = await User.findById(req.user._id);
    const isFavorited = user.favorites.includes(snippet._id);

    if (isFavorited) {
      // Remove from favorites
      await User.findByIdAndUpdate(req.user._id, {
        $pull: { favorites: snippet._id }
      });
      await Snippet.findByIdAndUpdate(snippet._id, {
        $inc: { favoriteCount: -1 }
      });
      res.json({ isFavorited: false, favoriteCount: snippet.favoriteCount - 1 });
    } else {
      // Add to favorites
      await User.findByIdAndUpdate(req.user._id, {
        $push: { favorites: snippet._id }
      });
      await Snippet.findByIdAndUpdate(snippet._id, {
        $inc: { favoriteCount: 1 }
      });
      res.json({ isFavorited: true, favoriteCount: snippet.favoriteCount + 1 });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// @desc    Get current user's snippets
// @route   GET /api/snippet/user
// @access  Private
export const getUserSnippets = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50; // Get more for dashboard
    const skip = (page - 1) * limit;

    // Optional filters
    const { isPublic, language, collection } = req.query;
    
    let query = { user: req.user._id };

    // Filter by public/private
    if (isPublic !== undefined) {
      query.isPublic = isPublic === 'true';
    }

    // Filter by language
    if (language) {
      query.language = language.toLowerCase();
    }

    // Filter by collection
    if (collection) {
      query.collection = collection;
    }

    const snippets = await Snippet.find(query)
      .sort({ createdAt: -1 }) // Newest first
      .skip(skip)
      .limit(limit)
      .populate('user', 'username profilePic')
      .populate('collection', 'name color icon');

    const total = await Snippet.countDocuments(query);

    res.json({
      snippets,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      total
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get current user's favourite snippets
// @route   GET /api/snippet/getfavouriteSnippets
// @access  Private
export const getfavoriteSnippets = async(req, res) => {
  try {
    const userId = req.user._id;

    const user = await User.findById(userId).populate({
      path: 'favorites',
      populate: {
          path: 'user',
          select: 'username email profilePic'
        }
    });

    if(!user){
      return res.status(404).json({message : 'User not found'});
    }

    const favorites = user.favorites.filter(snippet => snippet && (snippet.isPublic || snippet.user._id.toString() === userId.toString()));

    res.status(200).json({
      success: true,
      favorites : favorites,
      count : favorites.length
    })
  } catch (error) {
    console.error('Error fetching favorite snippets:', error);
    res.status(500).json({ 
      message: 'Failed to fetch favorite snippets',
      error: error.message 
    });
  }
}