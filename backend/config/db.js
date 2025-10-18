const mongoose = require("mongoose");

const connectDB = async() =>{
    try{
        await mongoose.connect(process.env.MONGODB_URL);
        console.log("Connected to mongodb");
    }
    catch(error){
        console.log("Couldn't connect to mongodb", error.message);
    }
};

module.exports = connectDB;