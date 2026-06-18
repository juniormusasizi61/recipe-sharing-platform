/**
 * validation.js
 * Shared request validation helper using express-validator.
 */
const { validationResult } = require('express-validator');

const validateRequest = (req, res, next) => {
  // Collect validation errors from the route validators.
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      errors: errors.array().map(({ param, msg }) => ({ param, msg })),
    });
  }
  next();
};

module.exports = validateRequest;
