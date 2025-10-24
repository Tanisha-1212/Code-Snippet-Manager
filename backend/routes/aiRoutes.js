// routes/aiRoutes.js
const express = require('express');
const router = express.Router();
const { generateAIResult } = require('../controllers/aiController');
const auth = require('../middleware/auth');

// Generate AI description + tags for a snippet
router.post('/generate/:id', auth, generateAIResult);

module.exports = router;
