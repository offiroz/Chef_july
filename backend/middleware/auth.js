const { AuthError } = require('../utils/errors');

function requireAuth(req, res, next) {
  if (req.session && req.session.userId) {
    return next();
  }

  return res.status(401).json({
    success: false,
    message: 'נדרשת התחברות'
  });
}

module.exports = { requireAuth };
