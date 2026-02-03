const loadingEl = document.getElementById('loading');
const emptyState = document.getElementById('empty-state');
const recipesGrid = document.getElementById('recipes-grid');
const recipeModal = document.getElementById('recipe-modal');
const filterDifficulty = document.getElementById('filter-difficulty');
const filterTime = document.getElementById('filter-time');

// Auth check
(async () => {
  try {
    const auth = await callAPI('/auth/me');
    if (!auth || !auth.success) {
      window.location.href = '/login';
      return;
    }
    await loadInspiration();
  } catch (e) {
    window.location.href = '/login';
  }
})();

// Filters
filterDifficulty.addEventListener('change', loadInspiration);
filterTime.addEventListener('change', loadInspiration);

async function loadInspiration() {
  loadingEl.classList.remove('hidden');
  emptyState.classList.add('hidden');
  recipesGrid.classList.add('hidden');

  try {
    let url = '/recipes/inspiration?';
    if (filterDifficulty.value) url += `difficulty=${encodeURIComponent(filterDifficulty.value)}&`;
    if (filterTime.value) url += `maxTime=${filterTime.value}&`;

    const data = await callAPI(url);

    loadingEl.classList.add('hidden');

    if (!data || !data.recipes || data.recipes.length === 0) {
      emptyState.classList.remove('hidden');
      return;
    }

    recipesGrid.classList.remove('hidden');
    renderRecipes(data.recipes);
  } catch (error) {
    loadingEl.classList.add('hidden');
    emptyState.classList.remove('hidden');
  }
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
        <span class="tag tag-rating">&#9733; ${(recipe.average_rating || 0).toFixed(1)} (${recipe.ratings_count || 0})</span>
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
    const data = await callAPI(`/recipes/${id}`);
    if (!data || !data.recipe) return;

    const recipe = data.recipe;
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
  } catch (error) {
    // Error shown by callAPI
  }
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
