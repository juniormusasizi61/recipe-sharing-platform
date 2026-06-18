/**
 * db.js
 * Mongoose connection helper. Reads `MONGO_URI` from environment variables
 * and attempts to establish a connection to MongoDB. On failure the process
 * exits with a non-zero code so the service does not run in a broken state.
 */
const mongoose = require('mongoose');

const connectDB = async (uri) => {
  try {
    const connectionString = uri || process.env.MONGO_URI;
    if (!connectionString) {
      throw new Error('MONGO_URI is not defined in environment variables');
    }
    await mongoose.connect(connectionString, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB connected');
  } catch (error) {
    console.error('MongoDB connection failed:', error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
