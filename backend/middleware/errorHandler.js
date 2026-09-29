import ErrorResponse from '../utils/errorResponse.js';

const errorHandler = (err, req, res, next) => {
  let error = { ...err };

  error.message = err.message;

  // Log to console for dev
  console.log(err);

  // Mongoose bad ObjectID
  if (err.name === 'CastError') {
    const message = 'Resource not found';
    error = new ErrorResponse(message, 404);
  }

  // MongoDB duplicate key
  if (err.code === 11000) {
    const message = 'Duplicate field value entered';
    error = new ErrorResponse(message, 400);
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map((val) => val.message);
    error = new ErrorResponse(message, 400);
  }

  /*
   * Preserve a status that was already set by the controller.
   *
   * Example:
   *   res.status(404);
   *   throw new Error('Product not found');
   *
   * A normal Error has no statusCode, so fall back to res.statusCode
   * instead of incorrectly returning 500.
   */
  const statusCode =
    error.statusCode || (res.statusCode >= 400 ? res.statusCode : 500);

  /*
   * Never expose unexpected server error details in production.
   * Client-safe 4xx messages are still returned normally.
   */
  const message =
    statusCode >= 500 && process.env.NODE_ENV === 'production'
      ? 'Server Error'
      : error.message || 'Server Error';

  res.status(statusCode).json({
    success: false,
    error: message,
  });
};

export default errorHandler;
