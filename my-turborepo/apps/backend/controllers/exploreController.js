// controllers/exploreController.js
import Snippet from '../models/Snippet.js';

// @desc    Search snippets
// @route   GET /api/explore/search
// @access  Public
export const searchSnippets = async (req, res) => {
  try {
    const { q, language, tags, sort, page = 1, limit = 20 } = req.query;

    let query = { isPublic: true };

    // Text search
    if (q) {
      query.$text = { $search: q };
    }

    // Filter by language
    if (language) {
      query.language = language.toLowerCase();
    }

    // Filter by tags
    if (tags) {
      const tagArray = tags.split(',').map(tag => tag.toLowerCase().trim());
      query.tags = { $in: tagArray };
    }

    // Sorting
    let sortOption = { createdAt: -1 }; // default: newest first
    if (sort === 'oldest') sortOption = { createdAt: 1 };
    if (sort === 'views') sortOption = { viewCount: -1 };
    if (sort === 'copies') sortOption = { copyCount: -1 };
    if (sort === 'favorites') sortOption = { favoriteCount: -1 };

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const snippets = await Snippet.find(query)
      .sort(sortOption)
      .skip(skip)
      .limit(parseInt(limit))
      .populate('user', 'username profilePic')
      .populate('collection', 'name color');

    const total = await Snippet.countDocuments(query);

    res.json({
      snippets,
      currentPage: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit)),
      total
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get trending snippets
// @route   GET /api/explore/trending
// @access  Public
export const getTrendingSnippets = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;

    // Snippets from last 7 days, sorted by views + copies
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const snippets = await Snippet.find({
      isPublic: true,
      createdAt: { $gte: sevenDaysAgo }
    })
      .sort({ viewCount: -1, copyCount: -1 })
      .limit(limit)
      .populate('user', 'username profilePic')
      .populate('collection', 'name color');

    res.json(snippets);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get available languages (for filter)
// @route   GET /api/explore/languages
// @access  Public
export const getLanguages = async (req, res) => {
  try {
    const languages = await Snippet.distinct('language', { isPublic: true });
    res.json(languages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get popular tags
// @route   GET /api/explore/tags
// @access  Public
export const getPopularTags = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 20;

    const tags = await Snippet.aggregate([
      { $match: { isPublic: true } },
      { $unwind: '$tags' },
      { $group: { _id: '$tags', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: limit }
    ]);

    res.json(tags.map(tag => ({ name: tag._id, count: tag.count })));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};