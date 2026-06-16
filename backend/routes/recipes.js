/**
 * Recipe routes
 * - GET    /api/recipes         : list recent recipes (public)
 * - GET    /api/recipes/:id     : get single recipe (public)
 * - POST   /api/recipes         : create recipe (authenticated)
 * - PUT    /api/recipes/:id     : update recipe (authenticated owner only)
 */
const express = require('express');
const Recipe = require('../models/Recipe');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

// List recipes ordered by creation date (most recent first)
router.get('/', async (req, res) => {
  try {
    const recipes = await Recipe.find().populate('user', 'name email').sort({ createdAt: -1 });
    res.json(recipes);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Could not fetch recipes' });
  }
});

// Get a single recipe by id
router.get('/:id', async (req, res) => {
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
});

// Create a new recipe. Requires authentication middleware to set req.user
router.post('/', auth, async (req, res) => {
  try {
    const { title, ingredients, instructions } = req.body;
    if (!title || !ingredients || !instructions) {
      return res.status(400).json({ error: 'Title, ingredients, and instructions are required' });
    }

    // Accept either an array of ingredients or a comma-separated string
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
});

// Update an existing recipe. Only the owner may update.
router.put('/:id', auth, async (req, res) => {
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
});

module.exports = router;
