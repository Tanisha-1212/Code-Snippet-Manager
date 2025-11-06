import express from "express";
const router = express();
import {protect} from "../middleware/authMiddleware.js"
import {
    createComment,
    getCommentsBySnippet,
    updateComment,
    deleteComment,
    toggleLike
} from "../controllers/commentController.js";

router.post("/", protect, createComment);

router.get("/snippet/:snippetId", getCommentsBySnippet);

router.put("/:id", protect, updateComment);

router.delete("/:id", protect, deleteComment);

router.post("/:id/like", protect, toggleLike);

export default router;
