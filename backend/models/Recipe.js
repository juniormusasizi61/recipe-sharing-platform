/**
 * Recipe model
 * Represents a shared recipe with a title, ingredients list, instructions,
 * and a reference to the creating user.
 */
const mongoose = require('mongoose');

const recipeSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  // Simple array of ingredient strings
  ingredients: [{ type: String, required: true }],
  instructions: { type: String, required: true },
  // Reference to the User who created the recipe
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Recipe', recipeSchema);
