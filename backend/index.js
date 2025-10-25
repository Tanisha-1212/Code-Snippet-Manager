import express from "express";
const app = express();
import cors from "cors";
import connectDB from "./config/db.js";
import cookieParser from "cookie-parser";

import dotenv from "dotenv";
dotenv.config();
connectDB();

app.use(cors({origin : "http://localhost:5173", credentials: true}));
app.use(express.json());
app.use(cookieParser());

import authRoutes from "./routes/authRoutes.js";
import snippetRoutes from "./routes/snippetRoutes.js";
import aiRoutes from "./routes/aiRoutes.js";

app.use('/api/auth', authRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/ai', snippetRoutes);



const PORT = process.env.PORT;
app.listen(PORT, ()=>{
    console.log(`Server is connected on port ${PORT}`)
});