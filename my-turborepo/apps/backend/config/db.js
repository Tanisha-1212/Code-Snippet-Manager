import mongoose from 'mongoose';

let isConnected = false;

const connectDB = async () => {
  // If already connected, reuse connection
  if (isConnected) {
    console.log('✅ Using existing MongoDB connection');
    return;
  }

  try {
    // Mongoose settings for serverless
    mongoose.set('strictQuery', false);
    
    const db = await mongoose.connect(process.env.MONGODB_URL, {
      serverSelectionTimeoutMS: 5000,
      maxPoolSize: 10,
      minPoolSize: 1,
    });

    isConnected = db.connections[0].readyState === 1;
    console.log('✅ MongoDB Connected Successfully');
  } catch (error) {
    console.error('❌ MongoDB Connection Error:', error.message);
    throw error;
  }
};

export default connectDB;