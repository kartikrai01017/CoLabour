/**
 * Booking routes: create, list, update status.
 *
 * POST   /api/bookings              → create a new booking
 * GET    /api/bookings              → list bookings (by customer_id or worker_id)
 * GET    /api/bookings/:id          → get single booking
 * PATCH  /api/bookings/:id/status   → transition status
 */

const { Router } = require('express');
const { getDB } = require('../db/database');
const db = getDB();
const { auth } = require('../middleware/auth');
const { uuid, ok, fail } = require('../utils/helpers');

const router = Router();

/** Enrich booking with related user/worker names. */
function enrichBooking(row) {
  if (!row) return null;
  const customer = db.prepare('SELECT name, phone FROM users WHERE id = ?').get(row.customer_id);
  const wp = db.prepare('SELECT user_id, category, hourly_rate FROM worker_profiles WHERE id = ?').get(row.worker_id);
  const workerUser = wp ? db.prepare('SELECT name FROM users WHERE id = ?').get(wp.user_id) : null;

  row.customer = customer || null;
  row.worker = wp ? { ...wp, users: workerUser } : null;
  return row;
}

// ── POST /api/bookings ────────────────────────────────
router.post('/', auth, (req, res) => {
  const { worker_id, category, scheduled_at, address, total_amount, notes } = req.body;

  if (!worker_id || !category || !scheduled_at || !address) {
    return fail(res, 400, 'worker_id, category, scheduled_at, address are required');
  }

  const wp = db.prepare('SELECT * FROM worker_profiles WHERE id = ?').get(worker_id);
  if (!wp) return fail(res, 404, 'Worker not found');

  const id = uuid();
  db.prepare(
    `INSERT INTO bookings (id, customer_id, worker_id, category, scheduled_at, address, total_amount, status, notes)
     VALUES (?, ?, ?, ?, ?, ?, ?, 'pending', ?)`
  ).run(id, req.user.id, worker_id, category, scheduled_at, address, total_amount || 0, notes || '');

  const booking = db.prepare('SELECT * FROM bookings WHERE id = ?').get(id);
  ok(res, { booking: enrichBooking(booking) });
});

// ── GET /api/bookings ─────────────────────────────────
router.get('/', auth, (req, res) => {
  let query = 'SELECT * FROM bookings WHERE 1=1';
  const params = [];

  // Filter by customer or worker
  if (req.query.customer_id) {
    query += ' AND customer_id = ?';
    params.push(req.query.customer_id);
  }
  if (req.query.worker_id) {
    query += ' AND worker_id = ?';
    params.push(req.query.worker_id);
  }

  // Filter by status
  if (req.query.status) {
    query += ' AND status = ?';
    params.push(req.query.status);
  }

  query += ' ORDER BY created_at DESC';

  const rows = db.prepare(query).all(...params);
  ok(res, { bookings: rows.map(enrichBooking) });
});

// ── GET /api/bookings/:id ─────────────────────────────
router.get('/:id', auth, (req, res) => {
  const row = db.prepare('SELECT * FROM bookings WHERE id = ?').get(req.params.id);
  if (!row) return fail(res, 404, 'Booking not found');
  ok(res, { booking: enrichBooking(row) });
});

// ── PATCH /api/bookings/:id/status ─────────────────────
router.patch('/:id/status', auth, (req, res) => {
  const { status } = req.body;
  const valid = ['pending', 'confirmed', 'in_progress', 'completed', 'cancelled', 'payment_submitted', 'paid'];
  if (!status || !valid.includes(status)) {
    return fail(res, 400, `status must be one of: ${valid.join(', ')}`);
  }

  const booking = db.prepare('SELECT * FROM bookings WHERE id = ?').get(req.params.id);
  if (!booking) return fail(res, 404, 'Booking not found');

  // Basic authorization: customer, worker, or admin
  const wp = db.prepare('SELECT user_id FROM worker_profiles WHERE id = ?').get(booking.worker_id);
  const isOwner = booking.customer_id === req.user.id;
  const isWorker = wp && wp.user_id === req.user.id;
  const isAdmin = req.user.role === 'admin';

  if (!isOwner && !isWorker && !isAdmin) {
    return fail(res, 403, 'Not authorized');
  }

  db.prepare('UPDATE bookings SET status = ? WHERE id = ?').run(status, req.params.id);

  const updated = db.prepare('SELECT * FROM bookings WHERE id = ?').get(req.params.id);
  ok(res, { booking: enrichBooking(updated) });
});

module.exports = router;
