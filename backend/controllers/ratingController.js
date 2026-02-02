const { db } = require('../db/database');
const RATING_SYSTEM = require('../services/ratingService');
const { ValidationError, DatabaseError } = require('../utils/errors');

async function submitRating(req, res, next) {
  try {
    const { recipeId, score, comment } = req.body;
    const userId = req.session.userId;

    if (!recipeId) {
      throw new ValidationError('recipeId', 'נדרש מזהה מתכון');
    }
    if (!score || score < 1 || score > 5) {
      throw new ValidationError('score', 'הדירוג חייב להיות בין 1 ל-5');
    }

    // Verify recipe exists
    const recipe = await db.get('SELECT id FROM recipes WHERE id = ?', [recipeId]);
    if (!recipe) {
      throw new ValidationError('recipeId', 'המתכון לא נמצא');
    }

    // Insert or update rating
    await db.run(`
      INSERT INTO ratings (recipe_id, user_id, score, comment)
      VALUES (?, ?, ?, ?)
      ON CONFLICT(recipe_id, user_id) DO UPDATE SET
        score = excluded.score,
        comment = excluded.comment,
        created_at = CURRENT_TIMESTAMP
    `, [recipeId, userId, score, comment || null]);

    // Update recipe average rating
    await updateRecipeRating(recipeId);

    res.json({ success: true, message: 'הדירוג נשמר בהצלחה' });
  } catch (error) {
    if (error.isOperational) return next(error);
    next(new DatabaseError('submit rating', error));
  }
}

async function getRatings(req, res, next) {
  try {
    const { recipeId } = req.params;

    const ratings = await db.all(`
      SELECT r.*, u.username
      FROM ratings r
      JOIN users u ON r.user_id = u.id
      WHERE r.recipe_id = ?
      ORDER BY r.created_at DESC
    `, [recipeId]);

    const stats = await db.get(`
      SELECT average_rating, ratings_count
      FROM recipes
      WHERE id = ?
    `, [recipeId]);

    res.json({
      success: true,
      ratings,
      average: stats ? stats.average_rating : 0,
      count: stats ? stats.ratings_count : 0
    });
  } catch (error) {
    next(new DatabaseError('get ratings', error));
  }
}

async function updateRecipeRating(recipeId) {
  const ratings = await db.all(`
    SELECT score, created_at
    FROM ratings
    WHERE recipe_id = ?
    ORDER BY created_at ASC
  `, [recipeId]);

  if (ratings.length === 0) {
    await db.run(`
      UPDATE recipes
      SET average_rating = 0, ratings_count = 0, is_recommended = 0
      WHERE id = ?
    `, [recipeId]);
    return;
  }

  const avgRating = RATING_SYSTEM.calculateWeightedAverage(ratings);
  const isRecommended = avgRating >= RATING_SYSTEM.RECOMMENDED_RATING &&
                        ratings.length >= RATING_SYSTEM.MIN_RATINGS_COUNT;

  await db.run(`
    UPDATE recipes
    SET average_rating = ?, ratings_count = ?, is_recommended = ?
    WHERE id = ?
  `, [avgRating, ratings.length, isRecommended ? 1 : 0, recipeId]);
}

module.exports = { submitRating, getRatings };
