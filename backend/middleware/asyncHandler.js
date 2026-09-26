// Wraps an async route handler so a thrown error (e.g. a database hiccup) reaches
// Express's error-handling middleware instead of leaving the request hanging.
function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

module.exports = asyncHandler;
