/**
 * server.js
 * Entry point for the backend API.
 * - Loads configuration from `.env`
 * - Connects to MongoDB
 * - Registers route modules for authentication and recipes
 * - Provides a simple health endpoint and centralized error handler
 */
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const authRoutes = require('./routes/auth');
const recipeRoutes = require('./routes/recipes');

// Load environment variables from backend/.env
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB using configured URI
connectDB();

// Middleware: CORS and JSON body parsing
app.use(cors());
app.use(express.json());

// API routes
app.use('/api/auth', authRoutes); // user registration & login
app.use('/api/recipes', recipeRoutes); // recipe CRUD

// Basic health check
app.get('/', (req, res) => {
  res.json({ message: 'Recipe Sharing Platform API is running' });
});

// Centralized error handler for unexpected exceptions
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Server error' });
});

// Start HTTP server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
