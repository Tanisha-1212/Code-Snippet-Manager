const experss = require("express");
const router = experss.Router();
const{
    createSnippet,
    getAllSnippets,
    getSnippetById,
    updateSnippet,
    deleteSnippet,
    togglePublicSnippet,
    getPublicSnippets,
    searchUserSnippet,
    searchPublicSnippets
} = require('../controllers/snippetController');

import auth from "../middleware/authMiddleware";

router.post('/', auth, createSnippet);

router.get('/', auth, getAllSnippets);

router.get('/:id', auth, getSnippetById);

router.put('/:id', auth, updateSnippet);

router.delete("/:id", auth, deleteSnippet);

router.patch("/:id/toggle", auth, togglePublicSnippet);

router.get("/public/all", getPublicSnippets);

router.get("/search", auth, searchUserSnippet);

router.get("/search/public", searchPublicSnippets);

module.exports = router;