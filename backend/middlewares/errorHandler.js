// errorHandler.js
const errorHandler = (err, req, res, next) => {
  const statusCode = err.status || 500;
  const message = err.message || "An unexpected error occurred";
  const response = { message };

  if (process.env.NODE_ENV === "development") {
    response.stack = err.stack;
  }

  res.status(statusCode).json(response);
};

module.exports = errorHandler;
