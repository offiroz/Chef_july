// Mobile Debug Logger - shows logs on screen for iOS debugging
const mobileDebug = document.getElementById('mobile-debug');
if (mobileDebug) {
  mobileDebug.style.display = 'block';
}

function mlog(emoji, ...args) {
  const msg = emoji + ' ' + args.map(a => typeof a === 'object' ? JSON.stringify(a) : a).join(' ');
  console.log(msg);
  if (mobileDebug) {
    const line = document.createElement('div');
    line.textContent = new Date().toLocaleTimeString() + ' ' + msg;
    mobileDebug.appendChild(line);
    mobileDebug.scrollTop = mobileDebug.scrollHeight;
  }
}

// Make mlog available globally for inline onclick
window.mlog = mlog;

const searchForm = document.getElementById('search-form');
const searchInput = document.getElementById('search-input');
const initialState = document.getElementById('initial-state');
const loadingEl = document.getElementById('loading');
const errorState = document.getElementById('error-state');
const recipeResult = document.getElementById('recipe-result');
const signupCta = document.getElementById('signup-cta');
const filterDifficulty = document.getElementById('filter-difficulty');
const filterTime = document.getElementById('filter-time');

// Check if all required elements exist
const requiredElements = {
  'search-form': searchForm,
  'search-input': searchInput,
  'initial-state': initialState,
  'loading': loadingEl,
  'error-state': errorState,
  'recipe-result': recipeResult,
  'signup-cta': signupCta,
  'filter-difficulty': filterDifficulty,
  'filter-time': filterTime
};

const missingElements = Object.entries(requiredElements)
  .filter(([name, element]) => !element)
  .map(([name]) => name);

if (missingElements.length > 0) {
  mlog('❌', 'Missing required elements:', missingElements);
  mlog('❌', 'Page missing HTML elements');
  // Don't proceed if elements are missing
} else {
  mlog('✅', 'All elements found. Init...');
  mlog('📱', 'UA:', navigator.userAgent.substring(0, 50));
  mlog('📐', 'Screen:', window.innerWidth, 'x', window.innerHeight);

  ChefAnim.init('search-anim', 'idle', 'small');

  // Simple, direct form submit handler
  searchForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    mlog('🔥🔥🔥', 'FORM SUBMIT!');
    mlog('🔥', 'Event:', e.type);

    // Close keyboard
    if (searchInput) {
      mlog('🔥', 'Blur input...');
      searchInput.blur();
    }

    // Wait a moment for keyboard to close
    mlog('🔥', 'Wait 150ms...');
    await new Promise(resolve => setTimeout(resolve, 150));

    mlog('🔥', 'Call performGenerate()');
    performGenerate();
    mlog('🔥', 'performGenerate() done');
  });

  mlog('🔥', 'Handler attached OK');

  // Re-generate when filters change (only if there's a query)
  filterDifficulty.addEventListener('change', () => {
    if (searchInput.value.trim()) performGenerate();
  });
  filterTime.addEventListener('change', () => {
    if (searchInput.value.trim()) performGenerate();
  });

async function performGenerate() {
  mlog('🔥🔥🔥', '=== performGenerate START ===');

  if (!searchInput) {
    mlog('❌', 'searchInput is null!');
    return;
  }

  const query = searchInput.value.trim();
  mlog('🔥', 'Query:', query);
  mlog('🔥', 'Length:', query.length);

  if (!query) {
    mlog('⚠️', 'Empty query - show initial');
    showInitial();
    mlog('🔥', '=== END (no query) ===');
    return;
  }

  mlog('🔥', 'Valid query! Loading...');
  showLoading();
  mlog('🔥', 'Loading shown');

  try {
    const preferences = { freeText: query };
    if (filterDifficulty.value) preferences.difficulty = filterDifficulty.value;
    if (filterTime.value) preferences.maxTime = parseInt(filterTime.value);

    mlog('🔥', 'API call:', preferences);
    mlog('🔥', 'URL: /recipes/generate-public');
    const data = await callAPI('/recipes/generate-public', {
      method: 'POST',
      body: JSON.stringify({ preferences })
    });

    console.log('API response:', data);
    hideAll();

    if (!data || !data.success || !data.recipe) {
      console.log('API returned error or no recipe');
      errorState.classList.remove('hidden');
      return;
    }

    console.log('Displaying recipe');
    displayRecipe(data.recipe);
    recipeResult.classList.remove('hidden');
    signupCta.classList.remove('hidden');

    // Scroll to top so the recipe is visible and search bar doesn't disappear
    window.scrollTo({ top: 0, behavior: 'smooth' });
  } catch (error) {
    console.error('Error generating recipe:', error);
    hideAll();
    errorState.classList.remove('hidden');
  }
}

function showInitial() {
  mlog('🔥', 'showInitial()');
  hideAll();
  initialState.classList.remove('hidden');
  mlog('🔥', 'Initial visible');
}

function showLoading() {
  mlog('🔥', 'showLoading()');
  hideAll();
  loadingEl.classList.remove('hidden');
  mlog('🔥', 'Loading visible');
}

function hideAll() {
  mlog('🔥', 'hideAll()');
  initialState.classList.add('hidden');
  loadingEl.classList.add('hidden');
  errorState.classList.add('hidden');
  recipeResult.classList.add('hidden');
  signupCta.classList.add('hidden');
}

function displayRecipe(recipe) {
  document.getElementById('result-title').textContent = recipe.title;
  document.getElementById('result-description').textContent = recipe.description || '';

  // Tags
  document.getElementById('result-difficulty').textContent = recipe.difficulty || 'קל';
  document.getElementById('result-time').textContent = `${recipe.totalTime || recipe.prepTime || 0} דקות`;
  document.getElementById('result-servings').textContent = `${recipe.servings || 4} מנות`;

  // Ingredients
  const ingredientsList = document.getElementById('result-ingredients');
  ingredientsList.innerHTML = '';
  (recipe.ingredients || []).forEach(ing => {
    const li = document.createElement('li');
    li.textContent = `${ing.amount || ''} ${ing.unit || ''} ${ing.item}`.trim();
    ingredientsList.appendChild(li);
  });

  // Instructions
  const instructionsList = document.getElementById('result-instructions');
  instructionsList.innerHTML = '';
  (recipe.instructions || []).forEach(step => {
    const li = document.createElement('li');
    li.textContent = step;
    instructionsList.appendChild(li);
  });

  // Tips
  const tipsBlock = document.getElementById('result-tips-block');
  const tipsList = document.getElementById('result-tips');
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
  const nutritionBlock = document.getElementById('result-nutrition-block');
  const nutritionGrid = document.getElementById('result-nutrition');
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
}

  // New recipe button
  const newSearchBtn = document.getElementById('new-search-btn');
  if (newSearchBtn) {
    newSearchBtn.addEventListener('click', () => {
      showInitial();
      searchInput.value = '';
      searchInput.focus();
    });
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
      performGenerate();
    }
  });

  // Focus search input on load (only on desktop, not on mobile)
  // Auto-focus causes keyboard to open on mobile which can interfere with button clicks
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  if (!isMobile) {
    searchInput.focus();
  }
  mlog('📱', isMobile ? 'Mobile detected - skip auto-focus' : 'Desktop - auto-focus');
}
