const { db } = require('../db/database');
const { generateRecipeWithRetry } = require('../services/geminiService');
const { ValidationError, DatabaseError } = require('../utils/errors');

async function generate(req, res, next) {
  try {
    const preferences = req.body.preferences || {};
    const userId = req.session.userId;

    // Validate preferences
    if (preferences.maxTime && (preferences.maxTime < 5 || preferences.maxTime > 300)) {
      throw new ValidationError('maxTime', 'זמן ההכנה חייב להיות בין 5 ל-300 דקות');
    }
    if (preferences.servings && (preferences.servings < 1 || preferences.servings > 20)) {
      throw new ValidationError('servings', 'מספר מנות חייב להיות בין 1 ל-20');
    }

    // Generate recipe via Gemini
    const recipe = await generateRecipeWithRetry(preferences);

    // Save to database
    const result = await db.run(`
      INSERT INTO recipes (user_id, title, description, difficulty, prep_time, cook_time, total_time, servings, ingredients, instructions, tips, nutrition)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      userId,
      recipe.title,
      recipe.description || '',
      recipe.difficulty || 'קל',
      recipe.prepTime || 0,
      recipe.cookTime || 0,
      recipe.totalTime || 0,
      recipe.servings || 4,
      JSON.stringify(recipe.ingredients || []),
      JSON.stringify(recipe.instructions || []),
      JSON.stringify(recipe.tips || []),
      JSON.stringify(recipe.nutrition || {})
    ]);

    res.json({
      success: true,
      recipe: {
        id: result.lastID,
        ...recipe
      }
    });
  } catch (error) {
    if (error.isOperational) return next(error);
    next(new DatabaseError('generate recipe', error));
  }
}

async function getById(req, res, next) {
  try {
    const { id } = req.params;

    const recipe = await db.get('SELECT * FROM recipes WHERE id = ?', [id]);

    if (!recipe) {
      throw new ValidationError('id', 'המתכון לא נמצא');
    }

    // Parse JSON fields
    recipe.ingredients = JSON.parse(recipe.ingredients || '[]');
    recipe.instructions = JSON.parse(recipe.instructions || '[]');
    recipe.tips = JSON.parse(recipe.tips || '[]');
    recipe.nutrition = JSON.parse(recipe.nutrition || '{}');

    res.json({ success: true, recipe });
  } catch (error) {
    if (error.isOperational) return next(error);
    next(new DatabaseError('get recipe', error));
  }
}

async function saveRecipe(req, res, next) {
  try {
    const { recipeId } = req.body;
    const userId = req.session.userId;

    if (!recipeId) {
      throw new ValidationError('recipeId', 'נדרש מזהה מתכון');
    }

    // Verify recipe exists
    const recipe = await db.get('SELECT id FROM recipes WHERE id = ?', [recipeId]);
    if (!recipe) {
      throw new ValidationError('recipeId', 'המתכון לא נמצא');
    }

    // Save (ignore if already saved)
    await db.run(`
      INSERT OR IGNORE INTO saved_recipes (user_id, recipe_id)
      VALUES (?, ?)
    `, [userId, recipeId]);

    res.json({ success: true, message: 'המתכון נשמר בהצלחה' });
  } catch (error) {
    if (error.isOperational) return next(error);
    next(new DatabaseError('save recipe', error));
  }
}

async function unsaveRecipe(req, res, next) {
  try {
    const { id } = req.params;
    const userId = req.session.userId;

    await db.run(
      'DELETE FROM saved_recipes WHERE user_id = ? AND recipe_id = ?',
      [userId, id]
    );

    res.json({ success: true });
  } catch (error) {
    next(new DatabaseError('unsave recipe', error));
  }
}

async function getSaved(req, res, next) {
  try {
    const userId = req.session.userId;

    const recipes = await db.all(`
      SELECT r.*, sr.saved_at
      FROM saved_recipes sr
      JOIN recipes r ON sr.recipe_id = r.id
      WHERE sr.user_id = ?
      ORDER BY sr.saved_at DESC
    `, [userId]);

    // Parse JSON fields
    const parsed = recipes.map(recipe => ({
      ...recipe,
      ingredients: JSON.parse(recipe.ingredients || '[]'),
      instructions: JSON.parse(recipe.instructions || '[]'),
      tips: JSON.parse(recipe.tips || '[]'),
      nutrition: JSON.parse(recipe.nutrition || '{}')
    }));

    res.json({ success: true, recipes: parsed });
  } catch (error) {
    next(new DatabaseError('get saved recipes', error));
  }
}

async function deleteRecipe(req, res, next) {
  try {
    const { id } = req.params;
    const userId = req.session.userId;

    // Only allow deleting own recipes
    const recipe = await db.get(
      'SELECT id FROM recipes WHERE id = ? AND user_id = ?',
      [id, userId]
    );

    if (!recipe) {
      throw new ValidationError('id', 'המתכון לא נמצא או שאין לך הרשאה למחוק אותו');
    }

    await db.run('DELETE FROM recipes WHERE id = ?', [id]);

    res.json({ success: true });
  } catch (error) {
    if (error.isOperational) return next(error);
    next(new DatabaseError('delete recipe', error));
  }
}

const RATING_SYSTEM = require('../services/ratingService');

async function getInspiration(req, res, next) {
  try {
    const { difficulty, maxTime } = req.query;
    const limit = parseInt(req.query.limit) || 20;

    let query = `
      SELECT
        r.*,
        u.username as creator_name
      FROM recipes r
      LEFT JOIN users u ON r.user_id = u.id
      WHERE r.average_rating >= ?
        AND r.ratings_count >= ?
    `;

    const params = [
      RATING_SYSTEM.MIN_DISPLAY_RATING,
      RATING_SYSTEM.MIN_RATINGS_COUNT
    ];

    if (difficulty) {
      query += ` AND r.difficulty = ?`;
      params.push(difficulty);
    }

    if (maxTime) {
      query += ` AND r.total_time <= ?`;
      params.push(parseInt(maxTime));
    }

    query += ` ORDER BY r.is_recommended DESC, r.average_rating DESC, r.ratings_count DESC LIMIT ?`;
    params.push(limit);

    const recipes = await db.all(query, params);

    const parsed = recipes.map(recipe => ({
      ...recipe,
      ingredients: JSON.parse(recipe.ingredients || '[]'),
      instructions: JSON.parse(recipe.instructions || '[]'),
      tips: JSON.parse(recipe.tips || '[]'),
      nutrition: JSON.parse(recipe.nutrition || '{}')
    }));

    res.json({ success: true, recipes: parsed });
  } catch (error) {
    next(new DatabaseError('get inspiration', error));
  }
}

async function getByIdPublic(req, res, next) {
  try {
    const { id } = req.params;

    const recipe = await db.get(`
      SELECT r.*, u.username as creator_name
      FROM recipes r
      LEFT JOIN users u ON r.user_id = u.id
      WHERE r.id = ?
    `, [id]);

    if (!recipe) {
      throw new ValidationError('id', 'המתכון לא נמצא');
    }

    recipe.ingredients = JSON.parse(recipe.ingredients || '[]');
    recipe.instructions = JSON.parse(recipe.instructions || '[]');
    recipe.tips = JSON.parse(recipe.tips || '[]');
    recipe.nutrition = JSON.parse(recipe.nutrition || '{}');

    res.json({ success: true, recipe });
  } catch (error) {
    if (error.isOperational) return next(error);
    next(new DatabaseError('get recipe', error));
  }
}

async function searchPublic(req, res, next) {
  try {
    const { q, difficulty, maxTime } = req.query;
    const limit = Math.min(parseInt(req.query.limit) || 20, 50);

    if (!q || q.trim().length === 0) {
      throw new ValidationError('q', 'נדרש מונח חיפוש');
    }

    const searchTerm = `%${q.trim()}%`;

    let query = `
      SELECT
        r.id, r.title, r.description, r.difficulty,
        r.prep_time, r.cook_time, r.total_time, r.servings,
        r.ingredients, r.average_rating, r.ratings_count, r.is_recommended,
        r.created_at,
        u.username as creator_name
      FROM recipes r
      LEFT JOIN users u ON r.user_id = u.id
      WHERE (r.title LIKE ? OR r.description LIKE ? OR r.ingredients LIKE ?)
    `;

    const params = [searchTerm, searchTerm, searchTerm];

    if (difficulty) {
      query += ` AND r.difficulty = ?`;
      params.push(difficulty);
    }

    if (maxTime) {
      query += ` AND r.total_time <= ?`;
      params.push(parseInt(maxTime));
    }

    query += ` ORDER BY r.is_recommended DESC, r.average_rating DESC, r.ratings_count DESC LIMIT ?`;
    params.push(limit);

    const recipes = await db.all(query, params);

    const parsed = recipes.map(recipe => ({
      ...recipe,
      ingredients: JSON.parse(recipe.ingredients || '[]'),
    }));

    res.json({ success: true, recipes: parsed });
  } catch (error) {
    if (error.isOperational) return next(error);
    next(new DatabaseError('search recipes', error));
  }
}

module.exports = { generate, getById, getByIdPublic, saveRecipe, unsaveRecipe, getSaved, deleteRecipe, getInspiration, searchPublic };
