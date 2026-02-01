const bcrypt = require('bcrypt');
const { db } = require('../db/database');
const config = require('../config/config');
const { AuthError, DatabaseError, ValidationError } = require('../utils/errors');
const { validateSignup, validateLogin } = require('../utils/validation');

async function signup(req, res, next) {
  try {
    const { username, email, password, confirmPassword } = req.body;

    validateSignup(username, email, password, confirmPassword);

    // Check if username or email already exists
    const existingUser = await db.get(
      'SELECT id FROM users WHERE username = ? OR email = ?',
      [username, email.toLowerCase()]
    );

    if (existingUser) {
      throw new ValidationError('username', 'שם משתמש או אימייל כבר קיימים במערכת');
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, config.security.bcryptRounds);

    // Insert user
    const result = await db.run(
      'INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)',
      [username, email.toLowerCase(), passwordHash]
    );

    // Set session
    req.session.userId = result.lastID;
    req.session.username = username;

    res.status(201).json({
      success: true,
      user: {
        id: result.lastID,
        username,
        email: email.toLowerCase()
      }
    });
  } catch (error) {
    if (error.isOperational) return next(error);
    next(new DatabaseError('signup', error));
  }
}

async function login(req, res, next) {
  try {
    const { identifier, password } = req.body;

    validateLogin(identifier, password);

    // Find user by username or email
    const user = await db.get(
      'SELECT id, username, email, password_hash FROM users WHERE username = ? OR email = ?',
      [identifier, identifier.toLowerCase()]
    );

    if (!user) {
      throw new AuthError('User not found');
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      throw new AuthError('Invalid password');
    }

    // Update last login
    await db.run('UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?', [user.id]);

    // Set session
    req.session.userId = user.id;
    req.session.username = user.username;

    res.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        email: user.email
      }
    });
  } catch (error) {
    if (error.isOperational) return next(error);
    next(new DatabaseError('login', error));
  }
}

async function logout(req, res) {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ success: false, message: 'שגיאה בהתנתקות' });
    }
    res.json({ success: true });
  });
}

async function me(req, res) {
  if (!req.session || !req.session.userId) {
    return res.status(401).json({ success: false, message: 'לא מחובר' });
  }

  const user = await db.get(
    'SELECT id, username, email FROM users WHERE id = ?',
    [req.session.userId]
  );

  if (!user) {
    return res.status(401).json({ success: false, message: 'משתמש לא נמצא' });
  }

  res.json({ success: true, user });
}

module.exports = { signup, login, logout, me };
