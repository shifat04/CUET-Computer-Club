const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ MongoDB connected');
    } catch (error) {
        console.error('❌ MongoDB connection failed:', error.message);
        console.error('ℹ️ Check your MONGO_URI in backend/.env (local MongoDB or MongoDB Atlas URI).');
        process.exit(1);
    }
};

module.exports = connectDB;
