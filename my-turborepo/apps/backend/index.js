import express from 'express';
import cors from 'cors';
import session from 'express-session';
import MongoStore from 'connect-mongo';
import passport from './config/passport.js';
import authRoutes from './routes/authRoutes.js';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import cookieParser from 'cookie-parser';

dotenv.config();

const app = express();
connectDB();

// Trust proxy - CRITICAL for Vercel
app.set('trust proxy', 1);

// CORS configuration
const corsOptions = {
  origin: function(origin, callback) {
    const allowedOrigins = [
      'http://localhost:5173',
      'https://code-snippet-manager-inky.vercel.app'
    ];
    
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie', 'Set-Cookie'],
  exposedHeaders: ['Set-Cookie'],
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));

// Cookie parser
app.use(cookieParser());

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  proxy: true,
  store: MongoStore.create({
    mongoUrl: process.env.MONGODB_URL,
    touchAfter: 24 * 3600,
  }),
  cookie: {
    secure: true,
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 24 * 7,
    sameSite: 'none',
    path: '/',
  },
  name: 'connect.sid',
  rolling: true,
}));

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Ensure CORS credentials headers
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin && (origin === 'http://localhost:5173' || origin === 'https://code-snippet-manager-inky.vercel.app')) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
  }
  next();
});

// Debug middleware
app.use((req, res, next) => {
  console.log('📍 Request:', req.method, req.path);
  console.log('🍪 Session ID:', req.sessionID);
  console.log('👤 User:', req.user ? req.user.email : 'Not authenticated');
  console.log('🍪 Cookies:', req.cookies);
  next();
});

// CSP headers
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

if (process.env.VERCEL !== '1') {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
}

export default app;