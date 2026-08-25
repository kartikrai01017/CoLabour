/**
 * Worker routes: list, get profile, update settings.
 *
 * GET  /api/workers              → list workers (filter by category, verified)
 * GET  /api/workers/:id          → get worker profile with user info
 * PATCH /api/workers/:id         → update worker settings (upi_id, hourly_rate)
 */

const { Router } = require('express');
const { getDB } = require('../db/database');
const db = getDB();
const { auth } = require('../middleware/auth');
const { ok, fail } = require('../utils/helpers');

const router = Router();

/** Helper: join worker_profiles with users, parse skills JSON. */
function enrichWorker(row) {
  if (!row) return null;
  const user = db.prepare('SELECT name, email, phone FROM users WHERE id = ?').get(row.user_id);
  row.users = user || null;
  if (typeof row.skills === 'string') {
    try { row.skills = JSON.parse(row.skills); } catch { row.skills = []; }
  }
  return row;
}

// ── GET /api/workers ───────────────────────────────────
router.get('/', (req, res) => {
  let query = 'SELECT * FROM worker_profiles WHERE 1=1';
  const params = [];

  // Filter: verified only (default true for public listing)
  if (req.query.is_verified === 'true') {
    query += ' AND is_verified = 1';
  } else if (req.query.is_verified === 'false') {
    query += ' AND is_verified = 0';
  }

  // Filter: by category
  if (req.query.category) {
    query += ' AND category = ?';
    params.push(req.query.category);
  }

  // Ordering
  const sort = req.query.order || 'created_at,desc';
  const [col, dir] = sort.split(',');
  const allowed = ['created_at', 'rating', 'hourly_rate', 'total_ratings'];
  const sortCol = allowed.includes(col) ? col : 'created_at';
  const sortDir = dir === 'asc' ? 'ASC' : 'DESC';
  query += ` ORDER BY ${sortCol} ${sortDir}`;

  const rows = db.prepare(query).all(...params);
  const enriched = rows.map(enrichWorker);

  ok(res, { workers: enriched });
});

// ── GET /api/workers/:id ──────────────────────────────
router.get('/:id', (req, res) => {
  const row = db.prepare('SELECT * FROM worker_profiles WHERE id = ?').get(req.params.id);
  if (!row) return fail(res, 404, 'Worker not found');

  ok(res, { worker: enrichWorker(row) });
});

// ── PATCH /api/workers/:id ────────────────────────────
router.patch('/:id', auth, (req, res) => {
  const wp = db.prepare('SELECT * FROM worker_profiles WHERE id = ?').get(req.params.id);
  if (!wp) return fail(res, 404, 'Worker not found');

  // Only the worker owner or admin can update
  if (wp.user_id !== req.user.id && req.user.role !== 'admin') {
    return fail(res, 403, 'Not authorized');
  }

  const { upi_id, hourly_rate, bio, location } = req.body;
  const updates = [];
  const params = [];

  if (upi_id !== undefined) { updates.push('upi_id = ?'); params.push(upi_id); }
  if (hourly_rate !== undefined) { updates.push('hourly_rate = ?'); params.push(hourly_rate); }
  if (bio !== undefined) { updates.push('bio = ?'); params.push(bio); }
  if (location !== undefined) { updates.push('location = ?'); params.push(location); }

  if (updates.length === 0) return fail(res, 400, 'No fields to update');

  params.push(req.params.id);
  db.prepare(`UPDATE worker_profiles SET ${updates.join(', ')} WHERE id = ?`).run(...params);

  const updated = db.prepare('SELECT * FROM worker_profiles WHERE id = ?').get(req.params.id);
  ok(res, { worker: enrichWorker(updated) });
});

module.exports = router;
