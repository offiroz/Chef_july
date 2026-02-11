const { GoogleGenerativeAI } = require("@google/generative-ai");
const config = require('../config/config');
const { APIError } = require('../utils/errors');

const genAI = new GoogleGenerativeAI(config.gemini.apiKey);

const SYSTEM_INSTRUCTION = `אתה שף מקצועי שמתמחה ביצירת מתכונים פשוטים וברורים בעברית.

כללי זהב:
- כל מתכון חייב להיות ברור ומפורט
- הוראות צעד אחר צעד, ממוספרות
- כמויות מדויקות (גרם, מ"ל, כפות)
- זמני הכנה ובישול מציאותיים
- רשימת מצרכים מסודרת לפי סדר שימוש
- רמת קושי מוגדרת: קל/בינוני/מאתגר

פורמט תשובה: JSON בלבד, ללא טקסט נוסף.`;

function buildUserPrompt(preferences) {
  // Free-text mode: user describes what they want in natural language
  if (preferences.freeText) {
    const constraints = [];
    if (preferences.difficulty) constraints.push(`- רמת קושי: ${preferences.difficulty}`);
    if (preferences.maxTime) constraints.push(`- זמן הכנה: עד ${preferences.maxTime} דקות`);
    if (preferences.servings) constraints.push(`- מספר מנות: ${preferences.servings}`);

    return `צור מתכון על בסיס הבקשה הבאה: "${preferences.freeText}"
${constraints.length > 0 ? `\nדרישות נוספות:\n${constraints.join('\n')}` : ''}

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
}`;
  }

  // Structured mode: preferences with specific fields
  return `צור מתכון ${preferences.difficulty || 'קל'} ל${preferences.mealType || 'ארוחה'}.

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
}`;
}

async function generateRecipe(userPreferences) {
  const model = genAI.getGenerativeModel({
    model: "gemini-1.5-pro",
    generationConfig: {
      temperature: 0.9,
      maxOutputTokens: 2048,
      topP: 0.95,
    }
  });

  const prompt = buildUserPrompt(userPreferences);

  const result = await model.generateContent([
    SYSTEM_INSTRUCTION,
    prompt
  ]);

  const response = await result.response;
  const text = response.text();

  // Clean the response - remove markdown code blocks if present
  const jsonText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
  const recipe = JSON.parse(jsonText);

  // Basic validation
  if (!recipe.title || !recipe.ingredients || !recipe.instructions) {
    throw new Error('מתכון לא תקין - חסרים שדות חובה');
  }

  return recipe;
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function generateRecipeWithRetry(preferences, maxRetries = 3) {
  let lastError;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const recipe = await generateRecipe(preferences);
      return recipe;
    } catch (error) {
      lastError = error;
      console.warn(`Attempt ${attempt} failed:`, error.message);

      if (error.message && error.message.includes('rate limit')) {
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

module.exports = { generateRecipeWithRetry };
