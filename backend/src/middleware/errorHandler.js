'use strict';

// Multer surfaces validation/size errors with a `.code`; everything else is a
// generic 500. Centralising this keeps every route handler free of
// try/catch boilerplate for the "something unexpected happened" case.
function errorHandler(err, req, res, _next) {
  // eslint-disable-next-line no-console
  console.error('[error]', err);

  if (err && err.name === 'MulterError') {
    return res.status(400).json({ error: `Upload rejected: ${err.message}` });
  }

  if (err && err.status) {
    return res.status(err.status).json({ error: err.message });
  }

  return res.status(500).json({ error: 'Internal server error' });
}

function notFoundHandler(req, res) {
  return res.status(404).json({ error: `No route: ${req.method} ${req.originalUrl}` });
}

module.exports = { errorHandler, notFoundHandler };
