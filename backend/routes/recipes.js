/**
 * Recipe routes
 * - GET    /api/recipes         : list recent recipes (public)
 * - GET    /api/recipes/mine    : list recipes created by the current user
 * - GET    /api/recipes/:id     : get single recipe (public)
 * - POST   /api/recipes         : create recipe (authenticated)
 * - PUT    /api/recipes/:id     : update recipe (authenticated owner only)
 * - DELETE /api/recipes/:id     : delete recipe (authenticated owner only)
 */
const express = require('express');
const { body, param } = require('express-validator');
const Recipe = require('../models/Recipe');
const auth = require('../middleware/auth');
const validateRequest = require('../middleware/validation');

const router = express.Router();

// List recipes ordered by creation date (most recent first).
// Supports optional query parameters for keyword search, pagination, and page size.
router.get('/', async (req, res) => {
  try {
    const { search, page = 1, limit = 6 } = req.query;
    const pageNumber = Math.max(1, parseInt(page, 10) || 1);
    const limitNumber = Math.min(20, Math.max(2, parseInt(limit, 10) || 6));

    const query = {};
    if (search) {
      // Use a case-insensitive regex to search title or instructions.
      const regex = new RegExp(String(search).trim(), 'i');
      query.$or = [{ title: regex }, { instructions: regex }];
    }

    const total = await Recipe.countDocuments(query);
    const recipes = await Recipe.find(query)
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .skip((pageNumber - 1) * limitNumber)
      .limit(limitNumber);

    res.json({
      recipes,
      page: pageNumber,
      limit: limitNumber,
      total,
      totalPages: Math.max(1, Math.ceil(total / limitNumber)),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Could not fetch recipes' });
  }
});

// Get recipes created by the authenticated user.
router.get('/mine', auth, async (req, res) => {
  try {
    const recipes = await Recipe.find({ user: req.user.id })
      .populate('user', 'name email')
      .sort({ createdAt: -1 });
    res.json(recipes);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Could not fetch your recipes' });
  }
});

// Get a single recipe by id.
router.get(
  '/:id',
  [param('id').isMongoId().withMessage('Invalid recipe id')],
  validateRequest,
  async (req, res) => {
    try {
      const recipe = await Recipe.findById(req.params.id).populate('user', 'name email');
      if (!recipe) {
        return res.status(404).json({ error: 'Recipe not found' });
      }
      res.json(recipe);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Could not fetch recipe' });
    }
  }
);

// Create a new recipe. Requires authentication middleware to set req.user.
router.post(
  '/',
  auth,
  [
    body('title').trim().notEmpty().withMessage('Title is required'),
    body('ingredients')
      .custom((value) => {
        if (Array.isArray(value)) {
          return value.length > 0 && value.every((item) => typeof item === 'string' && item.trim().length > 0);
        }
        if (typeof value === 'string') {
          return value.trim().length > 0;
        }
        return false;
      })
      .withMessage('Ingredients are required and must be a string or array of non-empty strings'),
    body('instructions').trim().notEmpty().withMessage('Instructions are required'),
  ],
  validateRequest,
  async (req, res) => {
    try {
      const { title, ingredients, instructions } = req.body;

      const ingredientList = Array.isArray(ingredients)
        ? ingredients.map((item) => item.trim()).filter(Boolean)
        : String(ingredients).split(',').map((item) => item.trim()).filter(Boolean);

      const recipe = new Recipe({
        title,
        ingredients: ingredientList,
        instructions,
        user: req.user.id,
      });

      await recipe.save();
      const populated = await recipe.populate('user', 'name email');
      res.status(201).json(populated);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Could not create recipe' });
    }
  }
);

// Update an existing recipe. Only the owner may update.
router.put(
  '/:id',
  auth,
  [
    param('id').isMongoId().withMessage('Invalid recipe id'),
    body('title').optional().trim().notEmpty().withMessage('Title cannot be blank'),
    body('ingredients')
      .optional()
      .custom((value) => {
        if (Array.isArray(value)) {
          return value.length > 0 && value.every((item) => typeof item === 'string' && item.trim().length > 0);
        }
        if (typeof value === 'string') {
          return value.trim().length > 0;
        }
        return false;
      })
      .withMessage('Ingredients must be a string or array of non-empty strings'),
    body('instructions').optional().trim().notEmpty().withMessage('Instructions cannot be blank'),
  ],
  validateRequest,
  async (req, res) => {
    try {
      const recipe = await Recipe.findById(req.params.id);
      if (!recipe) {
        return res.status(404).json({ error: 'Recipe not found' });
      }
      if (recipe.user.toString() !== req.user.id) {
        return res.status(403).json({ error: 'You are not allowed to update this recipe' });
      }

      const { title, ingredients, instructions } = req.body;
      if (title) recipe.title = title;
      if (instructions) recipe.instructions = instructions;
      if (ingredients) {
        recipe.ingredients = Array.isArray(ingredients)
          ? ingredients.map((item) => item.trim()).filter(Boolean)
          : String(ingredients).split(',').map((item) => item.trim()).filter(Boolean);
      }

      await recipe.save();
      const updated = await Recipe.findById(recipe._id).populate('user', 'name email');
      res.json(updated);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Could not update recipe' });
    }
  }
);

// Delete an existing recipe. Only the owner may delete.
router.delete(
  '/:id',
  auth,
  [param('id').isMongoId().withMessage('Invalid recipe id')],
  validateRequest,
  async (req, res) => {
    try {
      const recipe = await Recipe.findById(req.params.id);
      if (!recipe) {
        return res.status(404).json({ error: 'Recipe not found' });
      }
      if (recipe.user.toString() !== req.user.id) {
        return res.status(403).json({ error: 'You are not allowed to delete this recipe' });
      }

      await recipe.deleteOne();
      res.json({ message: 'Recipe deleted successfully' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Could not delete recipe' });
    }
  }
);

module.exports = router;
