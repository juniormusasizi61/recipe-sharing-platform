/**
 * db.js
 * Mongoose connection helper. Reads `MONGO_URI` from environment variables
 * and attempts to establish a connection to MongoDB. On failure the process
 * exits with a non-zero code so the service does not run in a broken state.
 */
const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const uri = process.env.MONGO_URI;
    if (!uri) {
      throw new Error('MONGO_URI is not defined in environment variables');
    }
    // Use recommended options for modern Mongoose
    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB connected');
  } catch (error) {
    // Log and exit so container/orchestrator can restart if needed
    console.error('MongoDB connection failed:', error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
