import express from "express";
const router = express();
import {protect} from "../middleware/authMiddleware.js";
import{
    createCollection,
    getCollections, 
    getCollectionById,
    updateCollection,
    deleteCollection
} from "../controllers/collectionController.js"

router.post("/", protect, createCollection);

router.get("/", protect, getCollections);

router.get("/:id", protect, getCollectionById);

router.put("/:id", protect, updateCollection);

router.delete("/:id", protect, deleteCollection);

export default router;
