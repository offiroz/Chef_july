// Signup form handler
const signupForm = document.getElementById('signupForm');
if (signupForm) {
  signupForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearErrors();

    const username = document.getElementById('username').value.trim();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    // Client-side validation
    let hasError = false;

    if (username.length < 3 || username.length > 20) {
      setFieldError('username', 'שם משתמש חייב להיות בין 3 ל-20 תווים');
      hasError = true;
    }

    if (!/^[a-zA-Z0-9_\u0590-\u05FF]+$/.test(username)) {
      setFieldError('username', 'שם משתמש יכול להכיל אותיות, מספרים וקו תחתון בלבד');
      hasError = true;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setFieldError('email', 'כתובת אימייל לא תקינה');
      hasError = true;
    }

    if (password.length < 6) {
      setFieldError('password', 'סיסמה חייבת להכיל לפחות 6 תווים');
      hasError = true;
    }

    if (password !== confirmPassword) {
      setFieldError('confirmPassword', 'הסיסמאות אינן תואמות');
      hasError = true;
    }

    if (hasError) return;

    try {
      const data = await callAPI('/auth/signup', {
        method: 'POST',
        body: JSON.stringify({ username, email, password, confirmPassword })
      });

      if (data && data.success) {
        window.location.href = '/home';
      }
    } catch (error) {
      // Error already shown by callAPI
    }
  });
}

// Login form handler
const loginForm = document.getElementById('loginForm');
if (loginForm) {
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearErrors();

    const identifier = document.getElementById('identifier').value.trim();
    const password = document.getElementById('password').value;

    if (!identifier) {
      setFieldError('identifier', 'שדה חובה');
      return;
    }
    if (!password) {
      setFieldError('password', 'שדה חובה');
      return;
    }

    try {
      const data = await callAPI('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ identifier, password })
      });

      if (data && data.success) {
        window.location.href = '/home';
      }
    } catch (error) {
      // Error already shown by callAPI
    }
  });
}

// Helper functions
function setFieldError(fieldId, message) {
  const errorSpan = document.getElementById(fieldId + 'Error');
  if (errorSpan) {
    errorSpan.textContent = message;
    errorSpan.style.display = 'block';
  }
  const input = document.getElementById(fieldId);
  if (input) {
    input.classList.add('input-error');
  }
}

function clearErrors() {
  document.querySelectorAll('.field-error').forEach(el => {
    el.textContent = '';
    el.style.display = 'none';
  });
  document.querySelectorAll('.input-error').forEach(el => {
    el.classList.remove('input-error');
  });
}
