const rateLimit = require('express-rate-limit');
const config = require('../config/config');

const generalLimiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.maxRequests,
  message: {
    success: false,
    message: 'יותר מדי בקשות. אנא נסה שוב מאוחר יותר.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20,
  message: {
    success: false,
    message: 'יותר מדי ניסיונות התחברות. אנא נסה שוב בעוד 15 דקות.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

module.exports = { generalLimiter, authLimiter };
