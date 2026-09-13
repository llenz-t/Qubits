/**
 * Express entry point. Wires CORS, JSON body parsing, the three portal
 * route groups (student/parent/admin), and a catch-all error handler.
 * No auth middleware — each portal's "login" is a lookup, not a session.
 */
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const express = require('express');
const cors = require('cors');
const studentRoutes = require('./routes/studentRoutes');
const parentRoutes = require('./routes/parentRoutes');
const adminRoutes = require('./routes/adminRoutes');
const errorHandler = require('./middleware/errorHandler');

const app = express();
const origins = (process.env.CORS_ORIGINS || 'http://localhost:5173').split(',').map(origin => origin.trim());
app.use(cors({ origin: origins }));
app.use(express.json());
app.get('/health', (_request, response) => response.json({ status: 'ok' }));
app.use('/api/students', studentRoutes);
app.use('/api/parents', parentRoutes);
app.use('/api/admin', adminRoutes);
app.use(errorHandler);

const port = Number(process.env.PORT || 3000);
app.listen(port, () => console.log(`Qubits API listening on port ${port}`));