const express = require('express');
const app = express();
const cors = require("cors");
const connectDB = require("./config/db");
const cookieParser = require("cookie-parser");
app.use(cookieParser());

require('dotenv').config();
connectDB();

app.use(cors({origin : "http://localhost:5173", credentials: true}));
app.use(express.json());


const PORT = process.env.PORT;
app.listen(PORT, ()=>{
    console.log(`Server is connected on port ${PORT}`)
});