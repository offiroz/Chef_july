// DOM Elements
const loadingEl = document.getElementById('loading');
const emptyState = document.getElementById('empty-state');
const recipesGrid = document.getElementById('recipes-grid');
const recipeModal = document.getElementById('recipe-modal');

// Check auth and load saved recipes
(async () => {
  try {
    const auth = await callAPI('/auth/me');
    if (!auth || !auth.success) {
      window.location.href = '/login';
      return;
    }
    await loadSavedRecipes();
  } catch (e) {
    window.location.href = '/login';
  }
})();

async function loadSavedRecipes() {
  try {
    const data = await callAPI('/recipes/saved');

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
        <button class="delete-btn" data-id="${recipe.id}" title="הסר משמורים">&times;</button>
      </div>
      <p class="card-description">${escapeHtml(recipe.description || '')}</p>
      <div class="card-tags">
        <span class="tag">${escapeHtml(recipe.difficulty || 'קל')}</span>
        <span class="tag">${recipe.total_time || 0} דקות</span>
        <span class="tag">${recipe.servings || 4} מנות</span>
        ${recipe.average_rating > 0 ? `<span class="tag tag-rating">&#9733; ${recipe.average_rating.toFixed(1)}</span>` : ''}
      </div>
      <button class="btn btn-primary btn-small view-btn" data-id="${recipe.id}">פתח מתכון</button>
    `;
    recipesGrid.appendChild(card);
  });

  // Attach event listeners
  recipesGrid.querySelectorAll('.view-btn').forEach(btn => {
    btn.addEventListener('click', () => viewRecipe(btn.dataset.id));
  });

  recipesGrid.querySelectorAll('.delete-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      unsaveRecipe(btn.dataset.id);
    });
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

      ${tipsList ? `
        <div class="recipe-block">
          <h3>טיפים</h3>
          <ul class="tips-list">${tipsList}</ul>
        </div>
      ` : ''}
    `;

    recipeModal.classList.remove('hidden');
  } catch (error) {
    // Error shown by callAPI
  }
}

async function unsaveRecipe(id) {
  if (!confirm('להסיר את המתכון מהשמורים?')) return;

  try {
    const data = await callAPI(`/recipes/unsave/${id}`, { method: 'DELETE' });
    if (data && data.success) {
      showSuccess('המתכון הוסר מהשמורים');
      await loadSavedRecipes();
    }
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

// Utility: escape HTML to prevent XSS
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}
