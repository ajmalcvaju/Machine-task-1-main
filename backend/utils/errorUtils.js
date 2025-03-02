const createError = (message, status) => {
    const error = new Error(message);
    error.status = status || 500;
    return error;
  };
  
  module.exports = { createError };