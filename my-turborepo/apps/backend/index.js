import express from "express";
const app = express();
import cors from "cors";
import connectDB from "./config/db.js";
import cookieParser from "cookie-parser";

app.use(express.json()); // for JSON requests
app.use(express.text({ type: "*/*" })); // for raw text requests

import dotenv from "dotenv";
dotenv.config();
connectDB();

app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(cookieParser());

import authRoutes from "./routes/authRoutes.js";
import snippetRoutes from "./routes/snippetRoutes.js";
import aiRoutes from "./routes/aiRoutes.js";

app.use('/api/auth', authRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/snippet', snippetRoutes);
app.get("/", (req, res) => {
  res.send("Backend");
});

const PORT = process.env.PORT || 5000;
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
}

// To:
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
}

export default app;