/**
 * app.js
 * Creates the Express app and registers middleware and API routes.
 * Exported for testing so the application can be served without starting a listener.
 */
const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const recipeRoutes = require('./routes/recipes');

const app = express();

app.use(cors());
app.use(express.json());

// Mount feature-specific routers under API paths.
app.use('/api/auth', authRoutes);
app.use('/api/recipes', recipeRoutes);

// Basic health check route for backend availability.
app.get('/', (req, res) => {
  res.json({ message: 'Recipe Sharing Platform API is running' });
});

// Fallback error handler for unexpected exceptions.
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Server error' });
});

module.exports = app;
