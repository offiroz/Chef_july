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
