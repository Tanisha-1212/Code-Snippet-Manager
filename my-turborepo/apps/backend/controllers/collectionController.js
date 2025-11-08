// controllers/collectionController.js
import Collection from '../models/Collection.js';
import User from '../models/User.js';
import Snippet from '../models/Snippet.js';
import connectDB from '../config/db.js';

// @desc    Create new collection
// @route   POST /api/collections
// @access  Private
export const createCollection = async (req, res) => {
  try {
    await connectDB();
    const { name, description, color, icon } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Collection name is required' });
    }

    const collection = await Collection.create({
      name,
      description: description || "",
      color: color || '#3B82F6',
      icon: icon || 'folder',
      user: req.user._id
    });

    // Add to user's collections
    await User.findByIdAndUpdate(req.user._id, {
      $push: { collections: collection._id }
    });

    res.status(201).json(collection);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all user's collections
// @route   GET /api/collections
// @access  Private
export const getCollections = async (req, res) => {
  try {
    await connectDB();
    const collections = await Collection.find({ user: req.user._id })
      .populate('snippets', 'title language tags')
      .sort({ createdAt: -1 });

    res.json(collections);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get collection by ID
// @route   GET /api/collections/:id
// @access  Private
export const getCollectionById = async (req, res) => {
  try {
    await connectDB();
    const collection = await Collection.findById(req.params.id)
      .populate({
        path: 'snippets',
        populate: { path: 'user', select: 'username profilePic' }
      });

    if (!collection) {
      return res.status(404).json({ message: 'Collection not found' });
    }

    // Check ownership
    if (collection.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    res.json(collection);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update collection
// @route   PUT /api/collections/:id
// @access  Private
export const updateCollection = async (req, res) => {
  try {
    await connectDB();
    const collection = await Collection.findById(req.params.id);

    if (!collection) {
      return res.status(404).json({ message: 'Collection not found' });
    }

    // Check ownership
    if (collection.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const { name, description, color, icon } = req.body;

    collection.name = name || collection.name;
    collection.description = description || collection.description;
    collection.color = color || collection.color;
    collection.icon = icon || collection.icon;

    await collection.save();

    res.json(collection);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete collection
// @route   DELETE /api/collections/:id
// @access  Private
export const deleteCollection = async (req, res) => {
  try {
    await connectDB();
    const collection = await Collection.findById(req.params.id);

    if (!collection) {
      return res.status(404).json({ message: 'Collection not found' });
    }

    // Check ownership
    if (collection.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Remove collection reference from snippets
    await Snippet.updateMany(
      { collection: collection._id },
      { $set: { collection: null } }
    );

    // Remove from user's collections
    await User.findByIdAndUpdate(req.user._id, {
      $pull: { collections: collection._id }
    });

    await collection.deleteOne();

    res.json({ message: 'Collection deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};