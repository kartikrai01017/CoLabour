/**
 * CoLabour Server — Express entry point.
 * Initializes DB, mounts all route modules, configures CORS, starts listening.
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { initDB } = require('./db/database');

async function main() {
  await initDB();

  const app = express();
  const PORT = process.env.PORT || 5000;

  app.use(cors());
  app.use(express.json());

  app.use((req, _res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
    next();
  });

  // Routes loaded AFTER DB is ready, so getDB() works at module level
  app.use('/api/auth', require('./routes/auth'));
  app.use('/api/workers', require('./routes/workers'));
  app.use('/api/bookings', require('./routes/bookings'));
  app.use('/api/payments', require('./routes/payments'));
  app.use('/api/admin', require('./routes/admin'));

  app.get('/api/health', (_req, res) => {
    res.json({ success: true, message: 'CoLabour API running', time: new Date().toISOString() });
  });

  app.use((_req, res) => {
    res.status(404).json({ success: false, message: `Not found: ${_req.originalUrl}` });
  });

  app.use((err, _req, res, _next) => {
    console.error('[error]', err.message);
    res.status(500).json({ success: false, message: 'Internal server error' });
  });

  app.listen(PORT, () => {
    console.log(`\n  CoLabour API running on http://localhost:${PORT}`);
    console.log(`  Health: http://localhost:${PORT}/api/health`);
    console.log(`  Demo login: worker@colabour.com / password123\n`);
  });
}

main().catch(err => { console.error('[fatal]', err); process.exit(1); });
