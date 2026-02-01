const { ValidationError } = require('./errors');

function validateSignup(username, email, password, confirmPassword) {
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

  if (password.length < 6) {
    throw new ValidationError('password', 'סיסמה חייבת להכיל לפחות 6 תווים');
  }

  if (password !== confirmPassword) {
    throw new ValidationError('confirmPassword', 'הסיסמאות אינן תואמות');
  }
}

function validateLogin(identifier, password) {
  if (!identifier || !password) {
    throw new ValidationError('fields', 'כל השדות הם חובה');
  }
}

module.exports = { validateSignup, validateLogin };
