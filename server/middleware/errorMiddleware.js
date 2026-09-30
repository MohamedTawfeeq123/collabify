/**
 * Centralized Error Handling Middleware for Collabify
 */

// 404 Route Handler
const notFound = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

// General Centralized Error Handler
const errorHandler = (err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;

  // Handle Mongoose duplicate key error (code 11000)
  let message = err.message;
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0];
    if (field === 'email') {
      message = 'An account with this Gmail address already exists.';
    } else if (field === 'username') {
      message = 'This username is already taken.';
    } else {
      message = `${field} already exists.`;
    }
  }

  // Handle Mongoose CastError (invalid ObjectId)
  if (err.name === 'CastError') {
    message = 'Resource not found or invalid ID provided';
  }

  res.status(statusCode).json({
    success: false,
    message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack
  });
};

module.exports = { notFound, errorHandler };
