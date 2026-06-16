/**
 * User model
 * Stores registered user accounts. Passwords are stored hashed (see auth routes).
 */
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  // email is unique and normalized to lowercase
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  // hashed password (never store plaintext)
  password: { type: String, required: true },
}, {
  timestamps: true,
});

module.exports = mongoose.model('User', userSchema);
