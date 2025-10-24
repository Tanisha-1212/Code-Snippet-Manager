const express = require('express');
const app = express();
const cors = require("cors");
const connectDB = require("./config/db");
const cookieParser = require("cookie-parser");
app.use(cookieParser());

require('dotenv').config();
connectDB();
app.use(express.json());

app.use(cors({origin : "http://localhost:5173", credentials: true}));


const authRoutes = require("./routes/authRoutes");
const snippetRoutes = require("./routes/snippetRoutes");
const aiRoutes = require("./routes/aiRoutes");

app.use('/api/auth', authRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/ai', snippetRoutes);



const PORT = process.env.PORT;
app.listen(PORT, ()=>{
    console.log(`Server is connected on port ${PORT}`)
});