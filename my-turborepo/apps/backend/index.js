import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";

import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import snippetRoutes from "./routes/snippetRoutes.js";
import collectionRoutes from "./routes/collectionRoutes.js";
import commentRoutes from "./routes/commentRoutes.js";
import exploreRoutes from "./routes/exploreRoutes.js";
import UserRoutes from "./routes/userRoutes.js";

// Load environment variables
dotenv.config();

// Initialize Express
const app = express();
const PORT = process.env.PORT || 5000;

// Security middleware
app.use(helmet());
app.use(cookieParser());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: 'Too many requests, please try again later.'
});
app.use('/api/', limiter);

// CORS configuration
const allowedOrigins = process.env.NODE_ENV === 'production'
  ? [process.env.FRONTEND_URL]
  : ['http://localhost:5173'];

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Body parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging (development only)
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Health check
app.get("/", (req, res) => {
  res.json({ 
    status: "success",
    message: "Code Snippet Manager API",
    version: "1.0.0"
  });
});

app.get("/api/health", (req, res) => {
  res.json({ 
    status: "healthy",
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/collections', collectionRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/explore', exploreRoutes);
app.use('/api/snippet', snippetRoutes);
app.use('/api/users', UserRoutes);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  
  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { 
      stack: err.stack 
    })
  });
});

// Start server with database connection
const startServer = async () => {
  try {
    await connectDB();
    console.log('✅ Database connected successfully');
    
    // Only start server if not in Vercel serverless environment
    if (process.env.VERCEL !== '1') {
      app.listen(PORT, () => {
        console.log(`🚀 Server running on http://localhost:${PORT}`);
        console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
      });
    }
  } catch (error) {
    console.error('❌ Failed to connect to database:', error);
    process.exit(1);
  }
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('UNHANDLED REJECTION! 💥');
  console.error(err);
  process.exit(1);
});

// Start the server
startServer();

export default app;