// routes/userRoutes.js
import express from 'express';
import {
  getUserProfile,
  getUserPublicSnippets,
  searchUsers,
  getUserStats
} from '../controllers/userController.js';

const router = express.Router();
// Public routes
router.get('/search', searchUsers);                      // GET /api/users/search?q=username
router.get('/:userId', getUserProfile);                  // GET /api/users/:userId
router.get('/:userId/snippets', getUserPublicSnippets);  // GET /api/users/:userId/snippets
router.get('/:userId/stats', getUserStats);              // GET /api/users/:userId/stats (can be accessed by anyone, shows different data for owner)

export default router