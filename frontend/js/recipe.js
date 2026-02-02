// State
let currentRecipe = null;
let selectedRating = 0;

// DOM Elements
const preferencesSection = document.getElementById('preferences-section');
const loadingSection = document.getElementById('loading-section');
const recipeSection = document.getElementById('recipe-section');
const preferencesForm = document.getElementById('preferences-form');
const skipBtn = document.getElementById('skip-btn');
const saveBtn = document.getElementById('save-btn');
const rateBtn = document.getElementById('rate-btn');
const newRecipeBtn = document.getElementById('new-recipe-btn');
const ratingModal = document.getElementById('rating-modal');

// Check auth on load
(async () => {
  try {
    const data = await callAPI('/auth/me');
    if (!data || !data.success) {
      window.location.href = '/login';
    }
  } catch (e) {
    window.location.href = '/login';
  }
})();

// Show/hide sections
function showSection(section) {
  preferencesSection.classList.add('hidden');
  loadingSection.classList.add('hidden');
  recipeSection.classList.add('hidden');
  section.classList.remove('hidden');
}

// Collect preferences from form
function getPreferences() {
  return {
    mealType: document.getElementById('mealType').value,
    difficulty: document.getElementById('difficulty').value,
    maxTime: parseInt(document.getElementById('maxTime').value),
    servings: parseInt(document.getElementById('servings').value),
    dietary: document.getElementById('dietary').value || undefined,
    ingredients: document.getElementById('ingredients').value.trim() || undefined,
    exclude: document.getElementById('exclude').value.trim() || undefined,
  };
}

// Generate recipe
async function generateRecipe(preferences) {
  showSection(loadingSection);

  try {
    const data = await callAPI('/recipes/generate', {
      method: 'POST',
      body: JSON.stringify({ preferences })
    });

    if (data && data.success) {
      currentRecipe = data.recipe;
      displayRecipe(data.recipe);
      showSection(recipeSection);
    } else {
      showSection(preferencesSection);
    }
  } catch (error) {
    showSection(preferencesSection);
  }
}

// Display recipe in the UI
function displayRecipe(recipe) {
  document.getElementById('recipe-title').textContent = recipe.title;
  document.getElementById('recipe-description').textContent = recipe.description || '';

  // Tags
  document.getElementById('tag-difficulty').textContent = recipe.difficulty || 'קל';
  document.getElementById('tag-time').textContent = `${recipe.totalTime || recipe.prepTime || 0} דקות`;
  document.getElementById('tag-servings').textContent = `${recipe.servings || 4} מנות`;

  // Ingredients
  const ingredientsList = document.getElementById('ingredients-list');
  ingredientsList.innerHTML = '';
  (recipe.ingredients || []).forEach(ing => {
    const li = document.createElement('li');
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.className = 'ingredient-checkbox';
    const label = document.createElement('span');
    label.textContent = `${ing.amount || ''} ${ing.unit || ''} ${ing.item}`.trim();
    li.appendChild(checkbox);
    li.appendChild(label);
    ingredientsList.appendChild(li);
  });

  // Instructions
  const instructionsList = document.getElementById('instructions-list');
  instructionsList.innerHTML = '';
  (recipe.instructions || []).forEach(step => {
    const li = document.createElement('li');
    li.textContent = step;
    instructionsList.appendChild(li);
  });

  // Tips
  const tipsBlock = document.getElementById('tips-block');
  const tipsList = document.getElementById('tips-list');
  tipsList.innerHTML = '';
  if (recipe.tips && recipe.tips.length > 0) {
    tipsBlock.classList.remove('hidden');
    recipe.tips.forEach(tip => {
      const li = document.createElement('li');
      li.textContent = tip;
      tipsList.appendChild(li);
    });
  } else {
    tipsBlock.classList.add('hidden');
  }

  // Nutrition
  const nutritionBlock = document.getElementById('nutrition-block');
  const nutritionGrid = document.getElementById('nutrition-grid');
  nutritionGrid.innerHTML = '';
  if (recipe.nutrition && Object.keys(recipe.nutrition).length > 0) {
    nutritionBlock.classList.remove('hidden');
    const labels = {
      calories: 'קלוריות',
      protein: 'חלבון',
      carbs: 'פחמימות',
      fat: 'שומן'
    };
    Object.entries(recipe.nutrition).forEach(([key, value]) => {
      const item = document.createElement('div');
      item.className = 'nutrition-item';
      item.innerHTML = `<span class="nutrition-label">${labels[key] || key}</span><span class="nutrition-value">${value}</span>`;
      nutritionGrid.appendChild(item);
    });
  } else {
    nutritionBlock.classList.add('hidden');
  }

  // Reset save button
  saveBtn.disabled = false;
  saveBtn.textContent = 'שמור מתכון';

  // Hide success gif after 2 seconds
  const successGif = document.querySelector('.success-gif');
  if (successGif) {
    successGif.style.display = '';
    setTimeout(() => {
      successGif.style.opacity = '0';
      setTimeout(() => { successGif.style.display = 'none'; }, 300);
    }, 2000);
  }
}

// Form submit - generate with preferences
preferencesForm.addEventListener('submit', (e) => {
  e.preventDefault();
  generateRecipe(getPreferences());
});

// Skip - generate with defaults
skipBtn.addEventListener('click', () => {
  generateRecipe({});
});

// Save recipe
saveBtn.addEventListener('click', async () => {
  if (!currentRecipe || !currentRecipe.id) return;

  try {
    const data = await callAPI('/recipes/save', {
      method: 'POST',
      body: JSON.stringify({ recipeId: currentRecipe.id })
    });

    if (data && data.success) {
      saveBtn.textContent = 'נשמר!';
      saveBtn.disabled = true;
      showSuccess('המתכון נשמר בהצלחה!');
    }
  } catch (error) {
    // Error already shown by callAPI
  }
});

// New recipe
newRecipeBtn.addEventListener('click', () => {
  showSection(preferencesSection);
  currentRecipe = null;
});

// Rating modal
rateBtn.addEventListener('click', () => {
  if (!currentRecipe) return;
  selectedRating = 0;
  updateStars(0);
  document.getElementById('rating-comment').value = '';
  document.getElementById('submit-rating-btn').disabled = true;
  ratingModal.classList.remove('hidden');
});

// Close modal
document.getElementById('cancel-rating-btn').addEventListener('click', () => {
  ratingModal.classList.add('hidden');
});

document.querySelector('.modal-overlay').addEventListener('click', () => {
  ratingModal.classList.add('hidden');
});

// Stars interaction
const stars = document.querySelectorAll('.star');
stars.forEach(star => {
  star.addEventListener('click', () => {
    selectedRating = parseInt(star.dataset.value);
    updateStars(selectedRating);
    document.getElementById('submit-rating-btn').disabled = false;
  });

  star.addEventListener('mouseenter', () => {
    updateStars(parseInt(star.dataset.value));
  });
});

document.getElementById('stars-container').addEventListener('mouseleave', () => {
  updateStars(selectedRating);
});

function updateStars(count) {
  stars.forEach(star => {
    const value = parseInt(star.dataset.value);
    star.classList.toggle('active', value <= count);
  });
}

// Submit rating
document.getElementById('submit-rating-btn').addEventListener('click', async () => {
  if (!currentRecipe || !selectedRating) return;

  try {
    const data = await callAPI('/ratings', {
      method: 'POST',
      body: JSON.stringify({
        recipeId: currentRecipe.id,
        score: selectedRating,
        comment: document.getElementById('rating-comment').value.trim() || null
      })
    });

    if (data && data.success) {
      ratingModal.classList.add('hidden');
      showSuccess('תודה על הדירוג!');
    }
  } catch (error) {
    // Error already shown by callAPI
  }
});
