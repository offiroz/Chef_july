-- טבלת משתמשים
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  last_login DATETIME
);

-- טבלת מתכונים
CREATE TABLE IF NOT EXISTS recipes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  difficulty TEXT CHECK(difficulty IN ('קל', 'בינוני', 'מאתגר')),
  prep_time INTEGER,
  cook_time INTEGER,
  total_time INTEGER,
  servings INTEGER,
  ingredients TEXT NOT NULL, -- JSON array
  instructions TEXT NOT NULL, -- JSON array
  tips TEXT, -- JSON array
  nutrition TEXT, -- JSON object
  average_rating REAL DEFAULT 0,
  ratings_count INTEGER DEFAULT 0,
  is_recommended BOOLEAN DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- טבלת דירוגים
CREATE TABLE IF NOT EXISTS ratings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  recipe_id INTEGER NOT NULL,
  user_id INTEGER NOT NULL,
  score INTEGER NOT NULL CHECK(score >= 1 AND score <= 5),
  comment TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE(recipe_id, user_id)
);

-- טבלת מתכונים שמורים
CREATE TABLE IF NOT EXISTS saved_recipes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  recipe_id INTEGER NOT NULL,
  saved_at DATETIME DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE CASCADE,
  UNIQUE(user_id, recipe_id)
);

-- טבלת העדפות משתמש
CREATE TABLE IF NOT EXISTS user_preferences (
  user_id INTEGER PRIMARY KEY,
  default_difficulty TEXT,
  default_max_time INTEGER,
  default_servings INTEGER,
  dietary_preference TEXT,

  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- אינדקסים לביצועים
CREATE INDEX IF NOT EXISTS idx_recipes_user ON recipes(user_id);
CREATE INDEX IF NOT EXISTS idx_recipes_rating ON recipes(average_rating DESC);
CREATE INDEX IF NOT EXISTS idx_ratings_recipe ON ratings(recipe_id);
CREATE INDEX IF NOT EXISTS idx_saved_recipes_user ON saved_recipes(user_id);
