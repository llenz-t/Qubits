'use strict';

require('dotenv').config();

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

const { attachIdentity } = require('./middleware/auth');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');
const attendanceRoutes = require('./routes/attendanceRoutes');
const justificationRoutes = require('./routes/justificationRoutes');

const app = express();

const corsOrigins = (process.env.CORS_ORIGINS || 'http://localhost:3000')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);

app.use(cors({ origin: corsOrigins, credentials: true }));
app.use(morgan('dev'));
app.use(express.json({ limit: '1mb' }));
app.use(attachIdentity);

app.get('/api/health', (req, res) => {
  res.json({ ok: true, service: 'attendease-backend', time: new Date().toISOString() });
});

app.use('/api', attendanceRoutes);
app.use('/api', justificationRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

const PORT = Number(process.env.PORT) || 4000;
app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`[attendease-backend] listening on http://localhost:${PORT}`);
});

module.exports = app;
