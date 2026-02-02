const { ValidationError } = require('./errors');

// Sanitize string input - trim and limit length
function sanitize(str, maxLength = 500) {
  if (typeof str !== 'string') return '';
  return str.trim().slice(0, maxLength);
}

function validateSignup(username, email, password, confirmPassword) {
  username = sanitize(username, 20);
  email = sanitize(email, 100);

  if (!username || !email || !password || !confirmPassword) {
    throw new ValidationError('fields', 'כל השדות הם חובה');
  }

  if (username.length < 3 || username.length > 20) {
    throw new ValidationError('username', 'שם משתמש חייב להיות בין 3 ל-20 תווים');
  }

  if (!/^[a-zA-Z0-9_\u0590-\u05FF]+$/.test(username)) {
    throw new ValidationError('username', 'שם משתמש יכול להכיל אותיות, מספרים וקו תחתון בלבד');
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new ValidationError('email', 'כתובת אימייל לא תקינה');
  }

  if (password.length < 6 || password.length > 128) {
    throw new ValidationError('password', 'סיסמה חייבת להכיל בין 6 ל-128 תווים');
  }

  if (password !== confirmPassword) {
    throw new ValidationError('confirmPassword', 'הסיסמאות אינן תואמות');
  }

  return { username, email };
}

function validateLogin(identifier, password) {
  if (!identifier || !password) {
    throw new ValidationError('fields', 'כל השדות הם חובה');
  }

  return { identifier: sanitize(identifier, 100) };
}

module.exports = { validateSignup, validateLogin, sanitize };
