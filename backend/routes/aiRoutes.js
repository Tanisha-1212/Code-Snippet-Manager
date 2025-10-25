// routes/aiRoutes.js
import express from "express";;
const router = express.Router();
import { generateSnippetAi } from '../controllers/aiController.js';
import {auth} from "../middleware/authMiddleware.js";

// Generate AI description + tags for a snippet
router.post('/generate/:id', auth, generateSnippetAi);


export default router; 
