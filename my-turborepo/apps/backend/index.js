import express from "express";
const app = express();
import cors from "cors";
import connectDB from "./config/db.js";
import cookieParser from "cookie-parser";

import dotenv from "dotenv";
dotenv.config();
connectDB();

app.use(cookieParser());

// CORS must come early
app.use(cors({
  origin: ['http://localhost:5173', 'https://code-snippet-manager-inky.vercel.app'],
  credentials: true,
}));

// CRITICAL FIX: Body parsers should NOT process multipart/form-data
app.use((req, res, next) => {
  // Skip body parsing for multipart requests - let multer handle them
  if (req.is('multipart/form-data')) {
    return next();
  }
  
  // Only parse JSON and urlencoded for non-multipart requests
  express.json()(req, res, () => {
    express.urlencoded({ extended: true })(req, res, next);
  });
});

// Remove this line - it breaks multipart parsing
// app.use(express.text({ type: "*/*" })); 

import authRoutes from "./routes/authRoutes.js";
import snippetRoutes from "./routes/snippetRoutes.js";
import collectionRoutes from "./routes/collectionRoutes.js";
import commentRoutes from "./routes/commentRoutes.js";
import exploreRoutes from "./routes/exploreRoutes.js";
import UserRoutes from "./routes/userRoutes.js"

app.use('/api/auth', authRoutes);
app.use('/api/collections', collectionRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/explore', exploreRoutes);
app.use('/api/snippet', snippetRoutes);
app.use('/api/users', UserRoutes);

app.get("/", (req, res) => {
  res.send("Backend");
});

const PORT = process.env.PORT || 5000;
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
}

app.listen(PORT, () => {
  console.log("Server running!");
})
export default app;