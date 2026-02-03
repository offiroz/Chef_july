const { db } = require('../db/database');
const { DatabaseError, ValidationError } = require('../utils/errors');

async function getProfile(req, res, next) {
  try {
    const userId = req.session.userId;

    const user = await db.get(
      'SELECT id, username, email, created_at FROM users WHERE id = ?',
      [userId]
    );

    if (!user) {
      throw new ValidationError('user', 'המשתמש לא נמצא');
    }

    // Get stats
    const recipesCreated = await db.get(
      'SELECT COUNT(*) as count FROM recipes WHERE user_id = ?',
      [userId]
    );

    const recipesSaved = await db.get(
      'SELECT COUNT(*) as count FROM saved_recipes WHERE user_id = ?',
      [userId]
    );

    const ratingsGiven = await db.get(
      'SELECT COUNT(*) as count FROM ratings WHERE user_id = ?',
      [userId]
    );

    res.json({
      success: true,
      user,
      stats: {
        recipesCreated: recipesCreated.count,
        recipesSaved: recipesSaved.count,
        ratingsGiven: ratingsGiven.count
      }
    });
  } catch (error) {
    if (error.isOperational) return next(error);
    next(new DatabaseError('get profile', error));
  }
}

async function getPreferences(req, res, next) {
  try {
    const userId = req.session.userId;

    const prefs = await db.get(
      'SELECT * FROM user_preferences WHERE user_id = ?',
      [userId]
    );

    res.json({
      success: true,
      preferences: prefs || {
        default_difficulty: null,
        default_max_time: null,
        default_servings: null,
        dietary_preference: null
      }
    });
  } catch (error) {
    next(new DatabaseError('get preferences', error));
  }
}

async function updatePreferences(req, res, next) {
  try {
    const userId = req.session.userId;
    const { defaultDifficulty, defaultMaxTime, defaultServings, dietaryPreference } = req.body;

    // Validate
    if (defaultMaxTime && (defaultMaxTime < 5 || defaultMaxTime > 300)) {
      throw new ValidationError('defaultMaxTime', 'זמן ההכנה חייב להיות בין 5 ל-300 דקות');
    }
    if (defaultServings && (defaultServings < 1 || defaultServings > 20)) {
      throw new ValidationError('defaultServings', 'מספר מנות חייב להיות בין 1 ל-20');
    }

    await db.run(`
      INSERT INTO user_preferences (user_id, default_difficulty, default_max_time, default_servings, dietary_preference)
      VALUES (?, ?, ?, ?, ?)
      ON CONFLICT(user_id) DO UPDATE SET
        default_difficulty = excluded.default_difficulty,
        default_max_time = excluded.default_max_time,
        default_servings = excluded.default_servings,
        dietary_preference = excluded.dietary_preference
    `, [
      userId,
      defaultDifficulty || null,
      defaultMaxTime || null,
      defaultServings || null,
      dietaryPreference || null
    ]);

    res.json({ success: true, message: 'ההעדפות נשמרו בהצלחה' });
  } catch (error) {
    if (error.isOperational) return next(error);
    next(new DatabaseError('update preferences', error));
  }
}

module.exports = { getProfile, getPreferences, updatePreferences };
