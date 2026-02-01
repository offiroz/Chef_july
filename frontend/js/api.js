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
  // Remove existing toast if any
  const existing = document.querySelector('.error-toast');
  if (existing) existing.remove();

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

function showSuccess(message) {
  const existing = document.querySelector('.success-toast');
  if (existing) existing.remove();

  const div = document.createElement('div');
  div.className = 'success-toast';
  div.textContent = message;
  document.body.appendChild(div);

  setTimeout(() => div.classList.add('show'), 10);
  setTimeout(() => {
    div.classList.remove('show');
    setTimeout(() => div.remove(), 300);
  }, 3000);
}
