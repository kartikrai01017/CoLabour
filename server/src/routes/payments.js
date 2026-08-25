/**
 * Payment routes: create, get, confirm with UTR, worker receipt confirmation.
 *
 * POST   /api/payments              → create payment for a booking (generates UPI URI)
 * GET    /api/payments/:id          → get payment details
 * GET    /api/payments              → list payments (by booking_id, worker_id, customer_id)
 * PATCH  /api/payments/:id/confirm  → customer confirms with UTR number
 * POST   /api/payments/:id/receive  → worker confirms receipt
 */

const { Router } = require('express');
const { getDB } = require('../db/database');
const db = getDB();
const { auth } = require('../middleware/auth');
const { uuid, ok, fail } = require('../utils/helpers');

const router = Router();

/** Build UPI payment URI. */
function buildUpiUri(worker, amount, bookingId) {
  const name = encodeURIComponent(worker.workerName || 'Worker');
  return `upi://pay?pa=${encodeURIComponent(worker.upi_id)}&pn=${name}&am=${Number(amount).toFixed(2)}&cu=INR&tn=CoLaber_${bookingId.slice(0, 8)}`;
}

/** Enrich payment with booking + worker info. */
function enrichPayment(row) {
  if (!row) return null;
  const booking = db.prepare('SELECT category, address FROM bookings WHERE id = ?').get(row.booking_id);
  const wp = db.prepare('SELECT upi_id, user_id FROM worker_profiles WHERE id = ?').get(row.worker_id);
  const workerUser = wp ? db.prepare('SELECT name FROM users WHERE id = ?').get(wp.user_id) : null;
  row.bookings = booking || null;
  row.worker = wp ? { ...wp, workerName: workerUser?.name } : null;
  return row;
}

// ── POST /api/payments ────────────────────────────────
router.post('/', auth, (req, res) => {
  const { booking_id } = req.body;
  if (!booking_id) return fail(res, 400, 'booking_id is required');

  const booking = db.prepare('SELECT * FROM bookings WHERE id = ?').get(booking_id);
  if (!booking) return fail(res, 404, 'Booking not found');

  // Check if payment already exists
  const existing = db.prepare('SELECT * FROM payments WHERE booking_id = ?').get(booking_id);
  if (existing) return ok(res, { payment: enrichPayment(existing) });

  const wp = db.prepare('SELECT * FROM worker_profiles WHERE id = ?').get(booking.worker_id);
  if (!wp) return fail(res, 404, 'Worker profile not found');

  const workerUser = db.prepare('SELECT name FROM users WHERE id = ?').get(wp.user_id);
  const wpWithWorkerName = { ...wp, workerName: workerUser?.name };

  const id = uuid();
  const token = uuid();
  const upiUri = buildUpiUri(wpWithWorkerName, booking.total_amount, booking.id);

  db.prepare(
    `INSERT INTO payments (id, booking_id, worker_id, customer_id, amount, upi_uri, verification_token, status)
     VALUES (?, ?, ?, ?, ?, ?, ?, 'pending')`
  ).run(id, booking_id, wp.id, booking.customer_id, booking.total_amount, upiUri, token);

  const payment = db.prepare('SELECT * FROM payments WHERE id = ?').get(id);
  ok(res, { payment: enrichPayment(payment) });
});

// ── GET /api/payments ─────────────────────────────────
router.get('/', auth, (req, res) => {
  let query = 'SELECT * FROM payments WHERE 1=1';
  const params = [];

  if (req.query.booking_id) { query += ' AND booking_id = ?'; params.push(req.query.booking_id); }
  if (req.query.worker_id) { query += ' AND worker_id = ?'; params.push(req.query.worker_id); }
  if (req.query.customer_id) { query += ' AND customer_id = ?'; params.push(req.query.customer_id); }
  if (req.query.status) { query += ' AND status = ?'; params.push(req.query.status); }

  query += ' ORDER BY created_at DESC';

  const rows = db.prepare(query).all(...params);
  ok(res, { payments: rows.map(enrichPayment) });
});

// ── GET /api/payments/:id ─────────────────────────────
router.get('/:id', auth, (req, res) => {
  const row = db.prepare('SELECT * FROM payments WHERE id = ?').get(req.params.id);
  if (!row) return fail(res, 404, 'Payment not found');
  ok(res, { payment: enrichPayment(row) });
});

// ── PATCH /api/payments/:id/confirm (customer enters UTR) ──
router.patch('/:id/confirm', auth, (req, res) => {
  const { utr_number } = req.body;
  if (!utr_number || utr_number.length < 8) {
    return fail(res, 400, 'Valid UTR number (min 8 digits) is required');
  }

  const payment = db.prepare('SELECT * FROM payments WHERE id = ?').get(req.params.id);
  if (!payment) return fail(res, 404, 'Payment not found');
  if (payment.customer_id !== req.user.id) return fail(res, 403, 'Not authorized');

  db.prepare('UPDATE payments SET utr_number = ?, status = ? WHERE id = ?')
    .run(utr_number, 'payment_submitted', req.params.id);
  db.prepare('UPDATE bookings SET status = ? WHERE id = ?')
    .run('payment_submitted', payment.booking_id);

  const updated = db.prepare('SELECT * FROM payments WHERE id = ?').get(req.params.id);
  ok(res, { payment: enrichPayment(updated) });
});

// ── POST /api/payments/:id/receive (worker confirms receipt) ──
router.post('/:id/receive', auth, (req, res) => {
  const payment = db.prepare('SELECT * FROM payments WHERE id = ?').get(req.params.id);
  if (!payment) return fail(res, 404, 'Payment not found');

  const wp = db.prepare('SELECT user_id FROM worker_profiles WHERE id = ?').get(payment.worker_id);
  if (!wp || wp.user_id !== req.user.id) return fail(res, 403, 'Not authorized');

  const now = new Date().toISOString();
  db.prepare('UPDATE payments SET status = ?, paid_at = ? WHERE id = ?')
    .run('paid', now, req.params.id);
  db.prepare('UPDATE bookings SET status = ? WHERE id = ?')
    .run('paid', payment.booking_id);

  const updated = db.prepare('SELECT * FROM payments WHERE id = ?').get(req.params.id);
  ok(res, { payment: enrichPayment(updated) });
});

// ── POST /api/payments/verify-token (one-click verification) ──
router.post('/verify-token', (req, res) => {
  const { token } = req.body;
  if (!token) return fail(res, 400, 'token is required');

  const payment = db.prepare('SELECT * FROM payments WHERE verification_token = ? AND status != ?')
    .get(token, 'paid');
  if (!payment) return fail(res, 404, 'Invalid or already used token');

  const now = new Date().toISOString();
  db.prepare('UPDATE payments SET status = ?, paid_at = ? WHERE id = ?')
    .run('paid', now, payment.id);
  db.prepare('UPDATE bookings SET status = ? WHERE id = ?')
    .run('paid', payment.booking_id);

  ok(res, { success: true, payment_id: payment.id, booking_id: payment.booking_id, amount: payment.amount });
});

module.exports = router;
