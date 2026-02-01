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
