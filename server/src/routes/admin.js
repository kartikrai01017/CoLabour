/**
 * Admin routes: dashboard stats, worker verification, dispute resolution.
 *
 * GET  /api/admin/stats                → platform telemetry
 * PATCH /api/admin/workers/:id/verify  → toggle worker verification
 * POST /api/admin/payments/:id/resolve → force-mark disputed payment as paid
 */

const { Router } = require('express');
const { getDB } = require('../db/database');
const db = getDB();
const { auth } = require('../middleware/auth');
const { ok, fail } = require('../utils/helpers');

const router = Router();

/** Admin-only guard. Must be placed after auth middleware. */
function adminOnly(req, res, next) {
  if (req.user.role !== 'admin') {
    return fail(res, 403, 'Admin access required');
  }
  next();
}

// ── GET /api/admin/stats ──────────────────────────────
router.get('/stats', auth, adminOnly, (_req, res) => {
  const totalWorkers = db.prepare('SELECT COUNT(*) as c FROM worker_profiles').get().c;
  const verifiedWorkers = db.prepare('SELECT COUNT(*) as c FROM worker_profiles WHERE is_verified = 1').get().c;
  const pendingVerifications = totalWorkers - verifiedWorkers;
  const totalBookings = db.prepare('SELECT COUNT(*) as c FROM bookings').get().c;
  const activeBookings = db.prepare(
    "SELECT COUNT(*) as c FROM bookings WHERE status IN ('pending','confirmed','in_progress','payment_submitted')"
  ).get().c;
  const totalPayments = db.prepare('SELECT COUNT(*) as c FROM payments').get().c;
  const totalRevenue = db.prepare("SELECT COALESCE(SUM(amount), 0) as s FROM payments WHERE status = 'paid'").get().s;
  const disputes = db.prepare("SELECT COUNT(*) as c FROM payments WHERE status = 'payment_submitted'").get().c;

  ok(res, {
    stats: {
      totalWorkers,
      verifiedWorkers,
      pendingVerifications,
      totalBookings,
      activeBookings,
      totalPayments,
      totalRevenue,
      disputes,
    }
  });
});

// ── PATCH /api/admin/workers/:id/verify ────────────────
router.patch('/workers/:id/verify', auth, adminOnly, (req, res) => {
  const wp = db.prepare('SELECT * FROM worker_profiles WHERE id = ?').get(req.params.id);
  if (!wp) return fail(res, 404, 'Worker not found');

  const newStatus = wp.is_verified ? 0 : 1;
  db.prepare('UPDATE worker_profiles SET is_verified = ? WHERE id = ?').run(newStatus, req.params.id);

  const updated = db.prepare('SELECT * FROM worker_profiles WHERE id = ?').get(req.params.id);
  const user = db.prepare('SELECT name, email FROM users WHERE id = ?').get(wp.user_id);

  ok(res, { worker: { ...updated, users: user, skills: JSON.parse(updated.skills || '[]') } });
});

// ── POST /api/admin/payments/:id/resolve ───────────────
router.post('/payments/:id/resolve', auth, adminOnly, (req, res) => {
  const payment = db.prepare('SELECT * FROM payments WHERE id = ?').get(req.params.id);
  if (!payment) return fail(res, 404, 'Payment not found');

  const now = new Date().toISOString();
  db.prepare('UPDATE payments SET status = ?, paid_at = ? WHERE id = ?')
    .run('paid', now, req.params.id);
  db.prepare('UPDATE bookings SET status = ? WHERE id = ?')
    .run('paid', payment.booking_id);

  const updated = db.prepare('SELECT * FROM payments WHERE id = ?').get(req.params.id);
  ok(res, { payment: updated });
});

// ── GET /api/admin/workers (all workers, including unverified) ──
router.get('/workers', auth, adminOnly, (_req, res) => {
  const rows = db.prepare('SELECT * FROM worker_profiles ORDER BY created_at DESC').all();
  const enriched = rows.map((row) => {
    const user = db.prepare('SELECT name, email FROM users WHERE id = ?').get(row.user_id);
    return { ...row, users: user, skills: JSON.parse(row.skills || '[]') };
  });
  ok(res, { workers: enriched });
});

module.exports = router;
