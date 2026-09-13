/**
 * Express error middleware (4-arg signature required by Express to be
 * recognized as one). Every route handler's catch block calls
 * `next(error)`, which lands here instead of duplicating status/JSON
 * logic in each route.
 */
function errorHandler(error, _request, response, _next) {
  console.error(error);
  const status = error.status || 500;
  response.status(status).json({ error: error.message || 'Internal server error' });
}

module.exports = errorHandler;