import express from "express";
const router = express.Router();
import {protect, optionalAuth} from "../middleware/authMiddleware.js";
import {
    generateMetadata, 
    createSnippet,
    getPublicSnippets,
    getSnippetById,
    updateSnippet,
    deleteSnippet,
    incrementViewCount,
    incrementCopyCount,
    toggleFavorite,
    getUserSnippets,
    getfavoriteSnippets
} from "../controllers/snippetController.js";

router.get('/user', protect, getUserSnippets);

router.post("/generate-metadata", generateMetadata);

router.post("/", protect, createSnippet);

router.get("/public", getPublicSnippets);

router.get('/favorites', protect, getfavoriteSnippets);

router.get("/:id", optionalAuth, getSnippetById);

router.put("/:id", protect, updateSnippet);

router.delete("/:id", protect, deleteSnippet);

router.post('/:id/view', incrementViewCount);

router.post('/:id/copy', incrementCopyCount);

router.post('/:id/favorite', protect, toggleFavorite);



export default router;