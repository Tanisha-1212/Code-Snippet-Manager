import express from "express";
import { generateSnippet } from "../controllers/aiController.js";
import {auth} from "../middleware/authMiddleware.js";

const router = express.Router();

// POST route to send dynamic code
router.post("/generate", auth, generateSnippet);

export default router;
