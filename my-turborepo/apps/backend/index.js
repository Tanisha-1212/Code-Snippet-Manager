import express from "express";
const app = express();
import cors from "cors";
import connectDB from "./config/db.js";
import cookieParser from "cookie-parser";
import passport from './config/passport.js';

import dotenv from "dotenv";
dotenv.config();
connectDB();

app.use(cookieParser());

// CORS configuration
app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:5174',
    'https://code-snippet-manager-inky.vercel.app',
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
  exposedHeaders: ['Set-Cookie'],
}));

// Body parsers
app.use((req, res, next) => {
  if (req.is('multipart/form-data')) {
    return next();
  }
  
  express.json()(req, res, () => {
    express.urlencoded({ extended: true })(req, res, next);
  });
});

app.use(passport.initialize());

app.use((req, res, next) => {
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; " +
    "connect-src 'self' https://accounts.google.com https://*.googleapis.com; " +
    "script-src 'self' https://accounts.google.com https://apis.google.com; " +
    "frame-src https://accounts.google.com; " +
    "style-src 'self' 'unsafe-inline'; " +
    "img-src 'self' data: https:;"
  );
  next();
});

// Routes
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

// Start server (skipped in serverless environments like Vercel)
if (process.env.VERCEL !== '1') {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
}

export default app;