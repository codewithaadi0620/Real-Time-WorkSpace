const { sendError } = require('../utils/responseHandler');

const errorHandler = (err, req, res, next) => {
  console.error('Unhandled Error caught by middleware:', {
    message: err.message,
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
  });

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  return sendError(res, message, statusCode);
};

module.exports = errorHandler;
