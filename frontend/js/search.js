const searchForm = document.getElementById('search-form');
const searchInput = document.getElementById('search-input');
const initialState = document.getElementById('initial-state');
const loadingEl = document.getElementById('loading');
const emptyResults = document.getElementById('empty-results');
const resultsInfo = document.getElementById('results-info');
const recipesGrid = document.getElementById('recipes-grid');
const recipeModal = document.getElementById('recipe-modal');
const signupCta = document.getElementById('signup-cta');
const filterDifficulty = document.getElementById('filter-difficulty');
const filterTime = document.getElementById('filter-time');

ChefAnim.init('search-anim', 'idle', 'small');

// Search on form submit
searchForm.addEventListener('submit', (e) => {
  e.preventDefault();
  performSearch();
});

// Re-search when filters change (only if there's a query)
filterDifficulty.addEventListener('change', () => {
  if (searchInput.value.trim()) performSearch();
});
filterTime.addEventListener('change', () => {
  if (searchInput.value.trim()) performSearch();
});

async function performSearch() {
  const query = searchInput.value.trim();
  if (!query) {
    showInitial();
    return;
  }

  showLoading();

  try {
    let url = `/recipes/search?q=${encodeURIComponent(query)}`;
    if (filterDifficulty.value) url += `&difficulty=${encodeURIComponent(filterDifficulty.value)}`;
    if (filterTime.value) url += `&maxTime=${filterTime.value}`;

    const data = await callAPI(url);

    hideAll();

    if (!data || !data.recipes || data.recipes.length === 0) {
      emptyResults.classList.remove('hidden');
      signupCta.classList.remove('hidden');
      return;
    }

    resultsInfo.textContent = `נמצאו ${data.recipes.length} מתכונים`;
    resultsInfo.classList.remove('hidden');
    recipesGrid.classList.remove('hidden');
    signupCta.classList.remove('hidden');
    renderRecipes(data.recipes);
  } catch (error) {
    hideAll();
    emptyResults.classList.remove('hidden');
  }
}

function showInitial() {
  hideAll();
  initialState.classList.remove('hidden');
}

function showLoading() {
  hideAll();
  loadingEl.classList.remove('hidden');
}

function hideAll() {
  initialState.classList.add('hidden');
  loadingEl.classList.add('hidden');
  emptyResults.classList.add('hidden');
  resultsInfo.classList.add('hidden');
  recipesGrid.classList.add('hidden');
  signupCta.classList.add('hidden');
}

function renderRecipes(recipes) {
  recipesGrid.innerHTML = '';

  recipes.forEach(recipe => {
    const card = document.createElement('div');
    card.className = 'recipe-card-mini';
    card.innerHTML = `
      <div class="card-header">
        <h3 class="card-title">${escapeHtml(recipe.title)}</h3>
        ${recipe.is_recommended ? '<span class="recommended-badge">מומלץ</span>' : ''}
      </div>
      <p class="card-description">${escapeHtml(recipe.description || '')}</p>
      <div class="card-meta">
        <span class="card-creator">מאת ${escapeHtml(recipe.creator_name || 'אנונימי')}</span>
      </div>
      <div class="card-tags">
        <span class="tag">${escapeHtml(recipe.difficulty || 'קל')}</span>
        <span class="tag">${recipe.total_time || 0} דקות</span>
        ${recipe.ratings_count > 0 ? `<span class="tag tag-rating">&#9733; ${(recipe.average_rating || 0).toFixed(1)} (${recipe.ratings_count})</span>` : ''}
      </div>
      <button class="btn btn-primary btn-small view-btn" data-id="${recipe.id}">צפה במתכון</button>
    `;
    recipesGrid.appendChild(card);
  });

  recipesGrid.querySelectorAll('.view-btn').forEach(btn => {
    btn.addEventListener('click', () => viewRecipe(btn.dataset.id));
  });
}

async function viewRecipe(id) {
  try {
    const data = await callAPI(`/recipes/public/${id}`);

    if (!data || !data.recipe) {
      showSignupPrompt();
      return;
    }

    showRecipeModal(data.recipe);
  } catch (error) {
    showSignupPrompt();
  }
}

function showRecipeModal(recipe) {
  const content = document.getElementById('modal-recipe-content');

  const ingredientsList = (recipe.ingredients || [])
    .map(ing => `<li>${escapeHtml(`${ing.amount || ''} ${ing.unit || ''} ${ing.item}`.trim())}</li>`)
    .join('');

  const instructionsList = (recipe.instructions || [])
    .map(step => `<li>${escapeHtml(step)}</li>`)
    .join('');

  const tipsList = (recipe.tips || [])
    .map(tip => `<li>${escapeHtml(tip)}</li>`)
    .join('');

  content.innerHTML = `
    <h2 class="recipe-title">${escapeHtml(recipe.title)}</h2>
    <p class="recipe-description">${escapeHtml(recipe.description || '')}</p>
    <div class="recipe-tags">
      <span class="tag">${escapeHtml(recipe.difficulty || 'קל')}</span>
      <span class="tag">${recipe.total_time || 0} דקות</span>
      <span class="tag">${recipe.servings || 4} מנות</span>
    </div>
    <div class="recipe-block">
      <h3>מצרכים</h3>
      <ul class="ingredients-list">${ingredientsList}</ul>
    </div>
    <div class="recipe-block">
      <h3>הוראות הכנה</h3>
      <ol class="instructions-list">${instructionsList}</ol>
    </div>
    ${tipsList ? `<div class="recipe-block"><h3>טיפים</h3><ul class="tips-list">${tipsList}</ul></div>` : ''}
  `;

  recipeModal.classList.remove('hidden');
}

function showSignupPrompt() {
  const content = document.getElementById('modal-recipe-content');
  content.innerHTML = `
    <div style="text-align:center;padding:20px 0;">
      <h2 class="recipe-title">רוצה לראות את המתכון המלא?</h2>
      <p class="recipe-description" style="margin-bottom:24px;">הירשם בחינם כדי לצפות בכל המתכונים וליצור מתכונים משלך</p>
      <a href="/signup" class="btn btn-primary">הרשם בחינם</a>
      <p style="margin-top:12px;"><a href="/login">כבר רשום? התחבר</a></p>
    </div>
  `;
  recipeModal.classList.remove('hidden');
}

// Close modal
document.getElementById('close-modal-btn').addEventListener('click', () => {
  recipeModal.classList.add('hidden');
});

document.querySelector('#recipe-modal .modal-overlay').addEventListener('click', () => {
  recipeModal.classList.add('hidden');
});

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Auto-expand textarea as user types
function autoExpandInput() {
  searchInput.style.height = 'auto';
  const maxHeight = 300;
  if (searchInput.scrollHeight > maxHeight) {
    searchInput.style.height = maxHeight + 'px';
    searchInput.style.overflowY = 'auto';
  } else {
    searchInput.style.height = searchInput.scrollHeight + 'px';
    searchInput.style.overflowY = 'hidden';
  }
}

searchInput.addEventListener('input', autoExpandInput);

// Submit on Enter (without Shift), allow Shift+Enter for new line
searchInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    performSearch();
  }
});

// Focus search input on load
searchInput.focus();
