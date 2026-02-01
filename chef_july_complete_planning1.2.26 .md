# Chef July - תכנון מלא ומפורט
## חוברת עבודה לפיתוח האפליקציה

**תאריך עדכון:** 1 בפברואר 2026  
**גרסה:** 2.0 - מסמך מלא עם כל הפרטים הטכניים

---

## תוכן עניינים

1. [סקירה כללית](#1-סקירה-כללית)
2. [החלטות טכניות](#2-החלטות-טכניות)
3. [ארכיטקטורה](#3-ארכיטקטורה)
4. [מפרט AI Prompts](#4-מפרט-ai-prompts)
5. [מערכת דירוג](#5-מערכת-דירוג)
6. [טיפול בשגיאות](#6-טיפול-בשגיאות)
7. [Environment Variables](#7-environment-variables)
8. [מסכים ו-Wireframes](#8-מסכים-ו-wireframes)
9. [User Flows](#9-user-flows)
10. [GIF Animations](#10-gif-animations)
11. [Database Schema](#11-database-schema)
12. [Backend Routes](#12-backend-routes)
13. [תכנית פיתוח](#13-תכנית-פיתוח)

---

## 1. סקירה כללית

### מטרת הפרויקט
אפליקציה מונעת AI למתן המלצות מתכונים איכותיות ומותאמות אישית.

### ערכי ליבה
- **איכות**: מניעת המלצות גרועות דרך דירוגי משתמשים
- **פשטות**: ממשק נקי וברור
- **התאמה אישית**: מתכונים מותאמים להעדפות המשתמש
- **למידה מתמשכת**: שיפור המלצות על בסיס פידבק

### קהל יעד
משתמשים כלליים המחפשים מתכונים פשוטים וברורים, דוברי עברית.

---

## 2. החלטות טכניות

### Frontend
- **טכנולוגיה**: HTML5, CSS3, Vanilla JavaScript
- **סגנון**: RTL (ימין לשמאל), עיצוב מינימליסטי
- **תאימות**: דפדפנים מודרניים, responsive design

### Backend
- **סביבה**: Node.js
- **Framework**: Express.js
- **Session Management**: express-session
- **Security**: bcrypt לסיסמאות

### Database
- **טכנולוגיה**: SQLite (MVP), אפשרות להעברה ל-PostgreSQL
- **ORM/Driver**: sqlite3 package

### AI Integration
- **ספק**: Google Gemini API
- **מודל**: gemini-pro
- **ספריה**: @google/generative-ai

### Deployment
- **פלטפורמה**: Railway
- **סיבה**: ניסיון קודם, פשטות

### Custom Assets
- **אנימציות**: 5 GIFs מותאמים אישית (ייצור עצמי)

---

## 3. ארכיטקטורה

### מבנה תיקיות

```
chef-july/
├── frontend/
│   ├── index.html              # דף נחיתה
│   ├── css/
│   │   ├── main.css           # סגנונות כלליים
│   │   ├── animations.css     # אנימציות GIF
│   │   └── components.css     # קומפוננטות UI
│   ├── js/
│   │   ├── main.js           # לוגיקה ראשית
│   │   ├── api.js            # קריאות API
│   │   ├── auth.js           # אימות
│   │   └── animations.js     # ניהול GIFs
│   ├── assets/
│   │   └── gifs/
│   │       ├── idle.gif
│   │       ├── loading.gif
│   │       ├── success.gif
│   │       ├── save.gif
│   │       └── thankyou.gif
│   └── pages/
│       ├── login.html
│       ├── signup.html
│       ├── home.html
│       ├── recipe.html
│       ├── saved.html
│       ├── inspiration.html
│       ├── settings.html
│       └── profile.html
├── backend/
│   ├── server.js              # Entry point
│   ├── config/
│   │   └── config.js         # הגדרות מרכזיות
│   ├── middleware/
│   │   ├── auth.js           # אימות
│   │   ├── errorHandler.js   # טיפול בשגיאות
│   │   └── rateLimiter.js    # Rate limiting
│   ├── routes/
│   │   ├── auth.js           # מסלולי אימות
│   │   ├── recipes.js        # מסלולי מתכונים
│   │   ├── users.js          # מסלולי משתמשים
│   │   └── ratings.js        # מסלולי דירוג
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── recipeController.js
│   │   ├── userController.js
│   │   └── ratingController.js
│   ├── services/
│   │   ├── geminiService.js  # אינטגרציה עם Gemini
│   │   └── ratingService.js  # לוגיקת דירוג
│   ├── utils/
│   │   ├── errors.js         # מחלקות שגיאות
│   │   ├── validation.js     # ולידציה
│   │   └── helpers.js        # פונקציות עזר
│   └── db/
│       ├── database.js       # חיבור DB
│       └── init.sql          # יצירת טבלאות
├── data/
│   └── chef_july.db          # קובץ SQLite
├── .env                       # משתני סביבה (לא ב-Git)
├── .env.example              # דוגמה למשתני סביבה
├── .gitignore
├── package.json
├── package-lock.json
└── README.md
```

---

## 4. מפרט AI Prompts

### 4.1 מבנה בסיסי של הפרומפט

```javascript
// קובץ: /backend/services/geminiService.js

const { GoogleGenerativeAI } = require("@google/generative-ai");
const config = require('../config/config');
const { APIError } = require('../utils/errors');

const genAI = new GoogleGenerativeAI(config.gemini.apiKey);

const recipePrompt = {
  systemInstruction: `אתה שף מקצועי שמתמחה ביצירת מתכונים פשוטים וברורים בעברית.
  
כללי זהב:
- כל מתכון חייב להיות ברור ומפורט
- הוראות צעד אחר צעד, ממוספרות
- כמויות מדויקות (גרם, מ"ל, כפות)
- זמני הכנה ובישול מציאותיים
- רשימת מצרכים מסודרת לפי סדר שימוש
- רמת קושי מוגדרת: קל/בינוני/מאתגר

פורמט תשובה: JSON בלבד, ללא טקסט נוסף.`,
  
  userPrompt: (preferences) => `
צור מתכון ${preferences.difficulty || 'קל'} ל${preferences.mealType || 'ארוחה'}.

דרישות:
- זמן הכנה: עד ${preferences.maxTime || 45} דקות
- מספר מנות: ${preferences.servings || 4}
${preferences.dietary ? `- דיאטה: ${preferences.dietary}` : ''}
${preferences.ingredients ? `- חובה להכיל: ${preferences.ingredients}` : ''}
${preferences.exclude ? `- אסור להכיל: ${preferences.exclude}` : ''}

החזר JSON בפורמט הבא בדיוק:
{
  "title": "שם המתכון בעברית",
  "description": "תיאור קצר ומפתה (1-2 משפטים)",
  "difficulty": "קל/בינוני/מאתגר",
  "prepTime": מספר_דקות_הכנה,
  "cookTime": מספר_דקות_בישול,
  "totalTime": סך_הכל_דקות,
  "servings": מספר_מנות,
  "ingredients": [
    {
      "item": "שם המצרך",
      "amount": "כמות",
      "unit": "יחידת_מידה"
    }
  ],
  "instructions": [
    "שלב 1 - הוראה מפורטת",
    "שלב 2 - הוראה מפורטת"
  ],
  "tips": [
    "טיפ מועיל 1",
    "טיפ מועיל 2"
  ],
  "nutrition": {
    "calories": מספר_לכ_100_גרם,
    "protein": "גרם",
    "carbs": "גרם",
    "fat": "גרם"
  }
}
`
};

async function generateRecipe(userPreferences) {
  const model = genAI.getGenerativeModel({ 
    model: "gemini-pro",
    generationConfig: {
      temperature: 0.9,
      maxOutputTokens: 2048,
      topP: 0.95,
    }
  });

  const prompt = recipePrompt.userPrompt(userPreferences);
  
  try {
    const result = await model.generateContent([
      recipePrompt.systemInstruction,
      prompt
    ]);
    
    const response = await result.response;
    const text = response.text();
    
    // נקה את התשובה
    const jsonText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const recipe = JSON.parse(jsonText);
    
    // ולידציה בסיסית
    if (!recipe.title || !recipe.ingredients || !recipe.instructions) {
      throw new Error('מתכון לא תקין');
    }
    
    return recipe;
    
  } catch (error) {
    console.error('שגיאה ביצירת מתכון:', error);
    throw error;
  }
}

// Retry logic
async function generateRecipeWithRetry(preferences, maxRetries = 3) {
  let lastError;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const recipe = await generateRecipe(preferences);
      return recipe;
      
    } catch (error) {
      lastError = error;
      console.warn(`Attempt ${attempt} failed:`, error.message);
      
      if (error.message.includes('rate limit')) {
        await sleep(attempt * 2000);
        continue;
      }
      
      if (attempt < maxRetries) {
        await sleep(1000);
      }
    }
  }
  
  throw new APIError('Gemini', lastError);
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

module.exports = { generateRecipeWithRetry };
```

### 4.2 דוגמאות שימוש

```javascript
// דוגמה פשוטה
const recipe1 = await generateRecipeWithRetry({
  difficulty: 'קל',
  maxTime: 30,
  servings: 4
});

// דוגמה מתקדמת
const recipe2 = await generateRecipeWithRetry({
  difficulty: 'בינוני',
  maxTime: 60,
  servings: 2,
  mealType: 'ארוחת ערב רומנטית',
  dietary: 'צמחוני',
  ingredients: 'פסטה, עגבניות',
  exclude: 'שום, בצל'
});
```

---

## 5. מערכת דירוג

### 5.1 כללי הדירוג

```javascript
// קובץ: /backend/services/ratingService.js

const RATING_SYSTEM = {
  MIN_DISPLAY_RATING: 3.5,
  RECOMMENDED_RATING: 4.0,
  MIN_RATINGS_COUNT: 3,
  FIRST_RATING_WEIGHT: 0.8,
  
  calculateWeightedAverage: (ratings) => {
    if (ratings.length === 0) return 0;
    if (ratings.length === 1) return ratings[0].score * RATING_SYSTEM.FIRST_RATING_WEIGHT;
    
    const weightedSum = ratings.reduce((sum, rating, index) => {
      const recencyWeight = 1 + (index / ratings.length) * 0.2;
      return sum + (rating.score * recencyWeight);
    }, 0);
    
    const totalWeight = ratings.reduce((sum, rating, index) => {
      return sum + (1 + (index / ratings.length) * 0.2);
    }, 0);
    
    return weightedSum / totalWeight;
  }
};

module.exports = RATING_SYSTEM;
```

### 5.2 Database Schema

```sql
-- קובץ: /backend/db/init.sql

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

CREATE INDEX IF NOT EXISTS idx_ratings_recipe ON ratings(recipe_id);
CREATE INDEX IF NOT EXISTS idx_recipes_rating ON recipes(average_rating DESC);
```

### 5.3 Backend Functions

```javascript
// קובץ: /backend/controllers/ratingController.js

const db = require('../db/database');
const RATING_SYSTEM = require('../services/ratingService');
const { ValidationError } = require('../utils/errors');

async function saveRating(recipeId, userId, score, comment = null) {
  if (score < 1 || score > 5) {
    throw new ValidationError('score', 'הדירוג חייב להיות בין 1 ל-5');
  }
  
  try {
    await db.run(`
      INSERT INTO ratings (recipe_id, user_id, score, comment)
      VALUES (?, ?, ?, ?)
      ON CONFLICT(recipe_id, user_id) DO UPDATE SET
        score = excluded.score,
        comment = excluded.comment,
        created_at = CURRENT_TIMESTAMP
    `, [recipeId, userId, score, comment]);
    
    await updateRecipeRating(recipeId);
    
    return { success: true };
  } catch (error) {
    console.error('שגיאה בשמירת דירוג:', error);
    throw error;
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
      SET average_rating = 0,
          ratings_count = 0,
          is_recommended = 0
      WHERE id = ?
    `, [recipeId]);
    return;
  }
  
  const avgRating = RATING_SYSTEM.calculateWeightedAverage(ratings);
  const isRecommended = avgRating >= RATING_SYSTEM.RECOMMENDED_RATING && 
                        ratings.length >= RATING_SYSTEM.MIN_RATINGS_COUNT;
  
  await db.run(`
    UPDATE recipes
    SET average_rating = ?,
        ratings_count = ?,
        is_recommended = ?
    WHERE id = ?
  `, [avgRating, ratings.length, isRecommended ? 1 : 0, recipeId]);
}

async function getInspirationalRecipes(limit = 20, filters = {}) {
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
  
  if (filters.difficulty) {
    query += ` AND r.difficulty = ?`;
    params.push(filters.difficulty);
  }
  
  if (filters.maxTime) {
    query += ` AND r.total_time <= ?`;
    params.push(filters.maxTime);
  }
  
  query += ` ORDER BY r.is_recommended DESC, r.average_rating DESC, r.ratings_count DESC
             LIMIT ?`;
  params.push(limit);
  
  return await db.all(query, params);
}

module.exports = { saveRating, updateRecipeRating, getInspirationalRecipes };
```

---

## 6. טיפול בשגיאות

### 6.1 Error Classes

```javascript
// קובץ: /backend/utils/errors.js

class AppError extends Error {
  constructor(message, statusCode, userMessage) {
    super(message);
    this.statusCode = statusCode;
    this.userMessage = userMessage;
    this.isOperational = true;
  }
}

class APIError extends AppError {
  constructor(service, originalError) {
    super(
      `${service} API Error: ${originalError.message}`,
      503,
      'אופס! הייתה בעיה בחיבור לשירות. אנא נסה שוב בעוד כמה רגעים.'
    );
    this.service = service;
  }
}

class DatabaseError extends AppError {
  constructor(operation, originalError) {
    super(
      `Database ${operation} Error: ${originalError.message}`,
      500,
      'אירעה שגיאה בשמירת הנתונים. אנא נסה שוב.'
    );
  }
}

class ValidationError extends AppError {
  constructor(field, message) {
    super(
      `Validation Error: ${field} - ${message}`,
      400,
      message
    );
  }
}

class AuthError extends AppError {
  constructor(message) {
    super(
      `Authentication Error: ${message}`,
      401,
      'שם משתמש או סיסמה שגויים'
    );
  }
}

module.exports = { AppError, APIError, DatabaseError, ValidationError, AuthError };
```

### 6.2 Error Handler Middleware

```javascript
// קובץ: /backend/middleware/errorHandler.js

const { AppError } = require('../utils/errors');

const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

const errorHandler = (err, req, res, next) => {
  console.error('Error occurred:', {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    timestamp: new Date().toISOString()
  });
  
  if (err.isOperational) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.userMessage,
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
  
  res.status(500).json({
    success: false,
    message: 'אירעה שגיאה בלתי צפויה. אנא נסה שוב מאוחר יותר.',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
};

const notFoundHandler = (req, res) => {
  res.status(404).json({
    success: false,
    message: 'הדף המבוקש לא נמצא'
  });
};

module.exports = { asyncHandler, errorHandler, notFoundHandler };
```

### 6.3 Frontend Error Handling

```javascript
// קובץ: /frontend/js/api.js

async function callAPI(endpoint, options = {}) {
  try {
    const response = await fetch(`/api${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'אירעה שגיאה');
    }
    
    return data;
    
  } catch (error) {
    if (!navigator.onLine) {
      showError('אין חיבור לאינטרנט. אנא בדוק את החיבור ונסה שוב.');
      return null;
    }
    
    showError(error.message);
    throw error;
  }
}

function showError(message) {
  const errorDiv = document.createElement('div');
  errorDiv.className = 'error-toast';
  errorDiv.textContent = message;
  document.body.appendChild(errorDiv);
  
  setTimeout(() => errorDiv.classList.add('show'), 10);
  setTimeout(() => {
    errorDiv.classList.remove('show');
    setTimeout(() => errorDiv.remove(), 300);
  }, 4000);
}
```

### 6.4 Error Toast Styles

```css
/* קובץ: /frontend/css/components.css */

.error-toast {
  position: fixed;
  top: -100px;
  left: 50%;
  transform: translateX(-50%);
  background: #e74c3c;
  color: white;
  padding: 15px 25px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.3);
  font-size: 16px;
  z-index: 10000;
  transition: top 0.3s ease;
  max-width: 90%;
  text-align: center;
}

.error-toast.show {
  top: 20px;
}
```

---

## 7. Environment Variables

### 7.1 .env (Development)

```env
# קובץ: /.env

NODE_ENV=development
PORT=3000
HOST=localhost

DATABASE_PATH=./data/chef_july.db

GEMINI_API_KEY=your_gemini_api_key_here

SESSION_SECRET=your_very_long_random_secret_string_here_change_this

BCRYPT_ROUNDS=10

RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### 7.2 .env.example

```env
# קובץ: /.env.example

NODE_ENV=development
PORT=3000
HOST=localhost

DATABASE_PATH=./data/chef_july.db

# Get your API key from: https://makersuite.google.com/app/apikey
GEMINI_API_KEY=

# Generate a random string for session secret
SESSION_SECRET=

BCRYPT_ROUNDS=10

RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### 7.3 .env.production (Railway)

```env
NODE_ENV=production
PORT=3000

DATABASE_URL=${{DATABASE_URL}}

GEMINI_API_KEY=${{GEMINI_API_KEY}}
SESSION_SECRET=${{SESSION_SECRET}}

BCRYPT_ROUNDS=12

RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=50
```

### 7.4 Config File

```javascript
// קובץ: /backend/config/config.js

require('dotenv').config();

const config = {
  env: process.env.NODE_ENV || 'development',
  port: process.env.PORT || 3000,
  host: process.env.HOST || 'localhost',
  
  database: {
    path: process.env.DATABASE_PATH || './data/chef_july.db',
    url: process.env.DATABASE_URL
  },
  
  gemini: {
    apiKey: process.env.GEMINI_API_KEY,
  },
  
  session: {
    secret: process.env.SESSION_SECRET,
    maxAge: 7 * 24 * 60 * 60 * 1000
  },
  
  security: {
    bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS) || 10
  },
  
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 900000,
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100
  }
};

const requiredEnvVars = ['GEMINI_API_KEY', 'SESSION_SECRET'];
requiredEnvVars.forEach(varName => {
  if (!process.env[varName]) {
    throw new Error(`Missing required environment variable: ${varName}`);
  }
});

module.exports = config;
```

---

## 8. מסכים ו-Wireframes

### 8.1 Landing Page (index.html)

**מטרה:** הצגת האפליקציה ואפשרויות כניסה/הרשמה

**רכיבים:**
- לוגו "Chef July" (טקסט + GIF idle)
- כותרת: "המתכון המושלם שלך, ברגע"
- תת-כותרת: "בינה מלאכותית שיוצרת מתכונים מותאמים אישית"
- כפתור "התחל עכשיו" (→ signup)
- קישור "כבר רשום? התחבר" (→ login)

**GIF:** idle (בלופ רגוע)

---

### 8.2 Sign Up (signup.html)

**מטרה:** יצירת חשבון חדש

**שדות:**
- שם משתמש (username) - חובה, ייחודי
- אימייל (email) - חובה, ולידציה
- סיסמה (password) - חובה, מינימום 6 תווים
- אישור סיסמה - חובה, התאמה

**כפתורים:**
- "צור חשבון" → שליחה ל-POST /api/auth/signup
- "יש לי חשבון" → login.html

**GIF:** idle

**ולידציה צד לקוח:**
```javascript
- username: 3-20 תווים, אותיות ומספרים בלבד
- email: פורמט אימייל תקין
- password: מינימום 6 תווים
- confirmPassword: זהה ל-password
```

---

### 8.3 Login (login.html)

**מטרה:** התחברות למשתמשים קיימים

**שדות:**
- שם משתמש או אימייל
- סיסמה

**כפתורים:**
- "התחבר" → POST /api/auth/login
- "עדיין אין לי חשבון" → signup.html

**GIF:** idle

---

### 8.4 Home (home.html)

**מטרה:** נקודת מוצא למשתמש מחובר

**רכיבים:**
- ברכה: "שלום, [username]!"
- GIF idle במרכז
- כפתור ראשי גדול: "קבל מתכון" → recipe generation flow
- ניווט תחתון:
  - "מתכונים שמורים" → saved.html
  - "השראה" → inspiration.html
  - "פרופיל" → profile.html

**GIF:** idle

---

### 8.5 Recipe Generation (recipe.html)

**Flow מלא:**

1. **שלב בחירת העדפות** (אופציונלי)
   - רמת קושי: קל/בינוני/מאתגר
   - זמן מקסימלי: slider (15-120 דקות)
   - מספר מנות: input
   - העדפות תזונה: dropdown (רגיל/צמחוני/טבעוני/ללא גלוטן)
   - מרכיבים חובה: text input
   - מרכיבים לא רצויים: text input
   - כפתור "דלג" / "המשך"

2. **Loading State**
   - GIF loading (אנימציה של חיתוך ירקות)
   - טקסט: "מכין לך משהו טעים..."

3. **הצגת מתכון**
   - GIF success (אנימציית חגיגה)
   - כותרת המתכון
   - תיאור קצר
   - תגיות: קושי, זמן, מנות
   - רשימת מצרכים (עם checkboxes)
   - הוראות הכנה (ממוספרות)
   - טיפים
   - ערכים תזונתיים

4. **פעולות על המתכון**
   - כפתור "שמור מתכון" → POST /api/recipes/save
     - אם נשמר: GIF save + "נשמר בהצלחה!"
   - כפתור "דרג מתכון" → modal דירוג
   - כפתור "קבל מתכון אחר" → חזרה לשלב 2

---

### 8.6 Rating Modal

**מופיע כ-overlay על recipe.html**

**רכיבים:**
- כותרת: "איך היה המתכון?"
- 5 כוכבים (interactive)
- שדה טקסט אופציונלי: "רוצה לשתף פידבק?"
- כפתור "שלח דירוג" → POST /api/ratings
  - אם נשלח: GIF thankyou + "תודה על הדירוג!"
- כפתור "ביטול"

---

### 8.7 Saved Recipes (saved.html)

**מטרה:** הצגת כל המתכונים השמורים של המשתמש

**רכיבים:**
- כותרת: "המתכונים שלי"
- רשת/רשימה של כרטיסי מתכונים:
  - שם המתכון
  - תמונה/איקון
  - רמת קושי
  - זמן הכנה
  - דירוג (אם דורג)
  - כפתור "פתח" → recipe view mode
  - כפתור "מחק" → DELETE /api/recipes/:id
- אם ריק: "עדיין לא שמרת מתכונים. בוא נתחיל!"
- ניווט תחתון

**GIF:** idle (קטן, בפינה)

---

### 8.8 Inspiration Feed (inspiration.html)

**מטרה:** הצגת מתכונים מומלצים מהקהילה

**רכיבים:**
- כותרת: "השראה מהקהילה"
- פילטרים (אופציונלי):
  - רמת קושי
  - זמן מקסימלי
- רשת של כרטיסי מתכונים:
  - שם המתכון
  - יוצר (username)
  - דירוג ממוצע (כוכבים)
  - מספר דירוגים
  - תג "מומלץ" אם is_recommended = 1
  - כפתור "צפה במתכון" → recipe view
- אם ריק: "עדיין אין מתכונים מדורגים. היה הראשון!"
- ניווט תחתון

**GIF:** idle

---

### 8.9 Profile (profile.html)

**מטרה:** הצגת פרטי משתמש והגדרות

**רכיבים:**
- שם משתמש
- אימייל
- סטטיסטיקות:
  - מספר מתכונים שנוצרו
  - מספר מתכונים שמורים
  - מספר דירוגים שניתנו
- כפתור "הגדרות" → settings.html
- כפתור "התנתק" → logout → index.html
- ניווט תחתון

**GIF:** idle

---

### 8.10 Settings (settings.html)

**מטרה:** העדפות משתמש

**רכיבים:**
- העדפות ברירת מחדל למתכונים:
  - רמת קושי מועדפת
  - זמן הכנה ממוצע
  - העדפות תזונה
- שפה (עתידי)
- כפתור "שמור שינויים"
- כפתור "חזור"

**GIF:** idle

---

## 9. User Flows

### Flow 1: הרשמה והתחברות
```
index.html → signup.html → POST /api/auth/signup → home.html
index.html → login.html → POST /api/auth/login → home.html
```

### Flow 2: יצירת מתכון פשוט
```
home.html → [לחיצה על "קבל מתכון"] 
→ recipe.html (העדפות + loading) 
→ POST /api/recipes/generate 
→ הצגת מתכון
```

### Flow 3: שמירת מתכון
```
recipe.html → [לחיצה על "שמור"] 
→ POST /api/recipes/save 
→ GIF save + הודעה
```

### Flow 4: דירוג מתכון
```
recipe.html → [לחיצה על "דרג"] 
→ rating modal 
→ POST /api/ratings 
→ GIF thankyou + סגירת modal
```

### Flow 5: צפייה במתכונים שמורים
```
home.html → saved.html 
→ GET /api/recipes/saved 
→ הצגת רשימה
→ [לחיצה על מתכון] → recipe view mode
```

### Flow 6: עיון ב-Inspiration Feed
```
home.html → inspiration.html 
→ GET /api/recipes/inspiration 
→ הצגת מתכונים מדורגים
→ [אופציונלי: פילטרים] → GET עם query params
```

### Flow 7: עריכת פרופיל
```
home.html → profile.html → settings.html 
→ [שינוי העדפות] 
→ POST /api/users/preferences 
→ חזרה ל-profile
```

### Flow 8: התנתקות
```
profile.html → [לחיצה על "התנתק"] 
→ POST /api/auth/logout 
→ index.html
```

---

## 10. GIF Animations

### מפרט טכני כללי
- **פורמט:** GIF
- **גודל:** 300x300 פיקסלים
- **משקל:** מקסימום 500KB לכל GIF
- **FPS:** 24 frames per second
- **צבעים:** פלטה של 256 צבעים מקסימום
- **Loop:** אינסופי
- **סגנון:** מינימליסטי, קווי, צבעוני-רך

---

### 10.1 Idle GIF

**שם קובץ:** `idle.gif`

**תיאור:**
אנימציה רגועה של Chef July (דמות/לוגו) שנושם/מתנועע קלות.

**דטיילים:**
- דמות פשוטה (יכול להיות שף חמוד או כלי בישול מחייך)
- תנועה עדינה למעלה-למטה (breathing effect)
- 2 שניות מלאות = 48 frames
- צבעים: לבן, תכלת בהיר, ורוד בהיר

**שימוש:**
- Landing page
- Home page
- כל מסך לא-פעיל

---

### 10.2 Loading GIF

**שם קובץ:** `loading.gif`

**תיאור:**
דמות חותכת ירקות או מערבבת בסיר, אנימציה מהירה יותר.

**דטיילים:**
- תנועה מעגלית (חיתוך/ערבוב)
- 1.5 שניות = 36 frames
- צבעים: כתום, ירוק, צהוב

**שימוש:**
- במהלך קריאה ל-Gemini API
- recipe.html - loading state

---

### 10.3 Success GIF

**שם קובץ:** `success.gif`

**תיאור:**
דמות חוגגת עם ניצוצות/כוכבים/לבבות.

**דטיילים:**
- תנועה אנרגטית - קפיצה/הנפת ידיים
- 2 שניות = 48 frames
- אלמנטים מתפוצצים החוצה
- צבעים: זהב, צהוב, ירוק בהיר

**שימוש:**
- recipe.html - אחרי קבלת מתכון מוצלח
- הצגה לשנייה-שתיים ואז מעבר לתוכן

---

### 10.4 Save GIF

**שם קובץ:** `save.gif`

**תיאור:**
דמות שמה משהו בקופסה/מדף עם check mark.

**דטיילים:**
- תנועה של "הכנסה" + V mark מופיע
- 1 שנייה = 24 frames (מהיר)
- צבעים: כחול, לבן, ירוק

**שימוש:**
- recipe.html - לאחר שמירת מתכון
- הצגה רגעית עם הודעה "נשמר!"

---

### 10.5 Thank You GIF

**שם קובץ:** `thankyou.gif`

**תיאור:**
דמות משתחווה/מודה עם לבבות.

**דטיילים:**
- תנועת קידה או הנפת כובע
- 1.5 שניות = 36 frames
- לבבות עפים למעלה
- צבעים: ורוד, סגול בהיר, לבן

**שימוש:**
- rating modal - אחרי שליחת דירוג
- הצגה רגעית עם הודעה "תודה!"

---

## 11. Database Schema

### קובץ: /backend/db/init.sql

```sql
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
```

---

## 12. Backend Routes

### 12.1 Authentication Routes

```javascript
// קובץ: /backend/routes/auth.js

POST /api/auth/signup
Body: { username, email, password }
Response: { success: true, user: { id, username, email } }

POST /api/auth/login
Body: { username/email, password }
Response: { success: true, user: { id, username, email } }

POST /api/auth/logout
Response: { success: true }

GET /api/auth/me
Response: { user: { id, username, email } } או 401
```

### 12.2 Recipe Routes

```javascript
// קובץ: /backend/routes/recipes.js

POST /api/recipes/generate
Body: { preferences: { difficulty, maxTime, servings, dietary, ingredients, exclude } }
Response: { success: true, recipe: { ... } }

POST /api/recipes/save
Body: { recipeId }
Response: { success: true }

GET /api/recipes/saved
Response: { recipes: [ ... ] }

DELETE /api/recipes/:id
Response: { success: true }

GET /api/recipes/inspiration?difficulty=...&maxTime=...
Response: { recipes: [ ... ] }

GET /api/recipes/:id
Response: { recipe: { ... } }
```

### 12.3 Rating Routes

```javascript
// קובץ: /backend/routes/ratings.js

POST /api/ratings
Body: { recipeId, score, comment? }
Response: { success: true }

GET /api/ratings/:recipeId
Response: { ratings: [ ... ], average: 4.2, count: 15 }
```

### 12.4 User Routes

```javascript
// קובץ: /backend/routes/users.js

GET /api/users/profile
Response: { user: { ... }, stats: { recipesCreated, recipesSaved, ratingsGiven } }

PUT /api/users/preferences
Body: { defaultDifficulty, defaultMaxTime, defaultServings, dietaryPreference }
Response: { success: true }
```

---

## 13. תכנית פיתוח

### Phase 1: MVP (שבוע 1-2)

**מטרה:** אפליקציה פונקציונלית בסיסית

**משימות:**

1. **Setup (יום 1)**
   - [ ] יצירת מבנה תיקיות
   - [ ] התקנת dependencies
   - [ ] הגדרת .env
   - [ ] הקמת database

2. **Authentication (יום 2)**
   - [ ] טבלת users
   - [ ] POST /signup
   - [ ] POST /login
   - [ ] Session management
   - [ ] UI: signup.html, login.html

3. **Recipe Generation (ימים 3-4)**
   - [ ] אינטגרציה עם Gemini API
   - [ ] POST /recipes/generate
   - [ ] טבלת recipes
   - [ ] UI: home.html, recipe.html
   - [ ] GIF: idle, loading, success

4. **Save Recipes (יום 5)**
   - [ ] טבלת saved_recipes
   - [ ] POST /recipes/save
   - [ ] GET /recipes/saved
   - [ ] UI: saved.html
   - [ ] GIF: save

5. **Rating System (יום 6)**
   - [ ] טבלת ratings
   - [ ] POST /ratings
   - [ ] Logic: calculateWeightedAverage
   - [ ] UI: rating modal
   - [ ] GIF: thankyou

6. **Testing & Bug Fixes (יום 7)**
   - [ ] בדיקות end-to-end
   - [ ] תיקון באגים
   - [ ] שיפור UX

---

### Phase 2: Enhancements (שבוע 3)

**מטרה:** שיפור חוויית משתמש

**משימות:**

1. **Inspiration Feed**
   - [ ] GET /recipes/inspiration
   - [ ] פילטרים
   - [ ] UI: inspiration.html

2. **User Preferences**
   - [ ] טבלת user_preferences
   - [ ] PUT /users/preferences
   - [ ] UI: settings.html

3. **Profile & Stats**
   - [ ] GET /users/profile
   - [ ] UI: profile.html
   - [ ] סטטיסטיקות

4. **Error Handling**
   - [ ] Error classes
   - [ ] Middleware
   - [ ] Toast notifications

5. **GIF Animations**
   - [ ] יצירת כל 5 ה-GIFs
   - [ ] אינטגרציה ב-UI

---

### Phase 3: Polish & Deploy (שבוע 4)

**מטרה:** הכנה ל-production

**משימות:**

1. **Performance**
   - [ ] אופטימיזציה של queries
   - [ ] Caching
   - [ ] Rate limiting

2. **Security**
   - [ ] HTTPS
   - [ ] CSRF protection
   - [ ] Input sanitization

3. **UI/UX Polish**
   - [ ] Responsive design
   - [ ] Accessibility
   - [ ] Loading states

4. **Deployment**
   - [ ] הגדרת Railway
   - [ ] Environment variables
   - [ ] Database migration
   - [ ] Testing ב-production

5. **Documentation**
   - [ ] README
   - [ ] API documentation
   - [ ] User guide

---

### Phase 4: Post-Launch (ongoing)

**מטרה:** שיפור מתמשך

**רעיונות:**
- מערכת חיפוש מתקדמת
- תמונות למתכונים (upload או AI-generated)
- שיתוף מתכונים ברשתות חברתיות
- תרגום לאנגלית
- אפליקציית mobile native
- מתכונים בסרטון (AI-generated)

---

## סיכום - Checklist לפני התחלה

### Prerequisites

- [ ] Node.js מותקן (v16+)
- [ ] npm מותקן
- [ ] Google Gemini API Key (https://makersuite.google.com/app/apikey)
- [ ] Railway account (https://railway.app)
- [ ] Git מותקן (אופציונלי אבל מומלץ)
- [ ] עורך קוד (VS Code מומלץ)

### First Steps

1. [ ] צור תיקיית פרויקט: `mkdir chef-july && cd chef-july`
2. [ ] העתק את המסמך הזה לתיקייה
3. [ ] התקן Claude Code (אם בחרת בזה)
4. [ ] צור `.env` עם המפתחות שלך
5. [ ] התחל לעבוד לפי Phase 1!

---

## נספחים

### A. Dependencies List

```json
{
  "dependencies": {
    "express": "^4.18.2",
    "express-session": "^1.17.3",
    "bcrypt": "^5.1.1",
    "sqlite3": "^5.1.6",
    "@google/generative-ai": "^0.1.3",
    "dotenv": "^16.3.1",
    "express-rate-limit": "^7.1.5"
  },
  "devDependencies": {
    "nodemon": "^3.0.2"
  }
}
```

### B. Useful Commands

```bash
# פיתוח
npm run dev

# Production
npm start

# יצירת database
node backend/db/init.js

# בדיקות
npm test
```

### C. Resources

- **Gemini API Docs:** https://ai.google.dev/docs
- **Railway Docs:** https://docs.railway.app
- **Express.js:** https://expressjs.com
- **SQLite:** https://www.sqlite.org/docs.html

---

**זהו! המסמך המלא והמפורט לפיתוח Chef July.**

**אופיר, בהצלחה עם הפיתוח! 🚀**
