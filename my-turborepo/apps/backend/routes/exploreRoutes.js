import express from "express";
const router = express();
import {
    searchSnippets,
    getTrendingSnippets,
    getLanguages,
    getPopularTags
} from "../controllers/exploreController.js"

router.get("/search", searchSnippets);

router.get("/trending", getTrendingSnippets);

router.get("/languages", getLanguages);

router.get("/tags", getPopularTags);

export default router;