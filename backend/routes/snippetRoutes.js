import express from "express";
const router = express.Router();
import {
    createSnippet,
    getAllSnippets,
    getSnippetById,
    updateSnippet,
    deleteSnippet,
    togglePublicSnippet,
    getPublicSnippets,
    searchUserSnippet,
    searchPublicSnippets
} from '../controllers/snippetController.js';

import {auth} from "../middleware/authMiddleware.js";

router.get("/search", auth, searchUserSnippet);

router.post('/', auth, createSnippet);

router.get('/', auth, getAllSnippets);

router.get('/:id', auth, getSnippetById);

router.put('/:id', auth, updateSnippet);

router.delete("/:id", auth, deleteSnippet);

router.patch("/:id/toggle", auth, togglePublicSnippet);

router.get("/public/all", getPublicSnippets);

router.get("/search/public", searchPublicSnippets);


export default router; 