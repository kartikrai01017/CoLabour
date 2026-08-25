/**
 * Auth routes: signup, login, logout, me.
 * Passwords are bcrypt-hashed and verified (unlike old mock).
 *
 * POST /api/auth/signup   → register + return token
 * POST /api/auth/login    → verify credentials + return token
 * POST /api/auth/logout   → acknowledge (JWT is stateless)
 * GET  /api/auth/me       → return current user from token
 */

const { Router } = require('express');
const bcrypt = require('bcryptjs');
const { getDB } = require('../db/database');
const db = getDB();
const { auth, createToken } = require('../middleware/auth');
const { uuid, ok, fail } = require('../utils/helpers');

const router = Router();

// ── POST /api/auth/signup ──────────────────────────────
router.post('/signup', (req, res) => {
  const { name, email, password, phone, role } = req.body;

  if (!name || !email || !password) {
    return fail(res, 400, 'name, email, password are required');
  }
  if (password.length < 6) {
    return fail(res, 400, 'password must be at least 6 characters');
  }

  const validRoles = ['customer', 'worker', 'admin'];
  const userRole = validRoles.includes(role) ? role : 'customer';

  // Check duplicate email
  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email.toLowerCase());
  if (existing) {
    return fail(res, 409, 'An account with this email already exists');
  }

  const id = uuid();
  const hash = bcrypt.hashSync(password, 10);

  db.prepare(
    'INSERT INTO users (id, name, email, password_hash, phone, role) VALUES (?, ?, ?, ?, ?, ?)'
  ).run(id, name.trim(), email.toLowerCase(), hash, phone || '', userRole);

  const user = db.prepare('SELECT id, name, email, phone, role, created_at FROM users WHERE id = ?').get(id);
  const token = createToken(user);

  ok(res, { token, user });
});

// ── POST /api/auth/login ───────────────────────────────
router.post('/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return fail(res, 400, 'email and password are required');
  }

  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email.toLowerCase());
  if (!user) {
    return fail(res, 401, 'Invalid credentials');
  }

  const valid = bcrypt.compareSync(password, user.password_hash);
  if (!valid) {
    return fail(res, 401, 'Invalid credentials');
  }

  const token = createToken(user);
  const { password_hash, ...safe } = user;

  ok(res, { token, user: safe });
});

// ── POST /api/auth/logout ──────────────────────────────
router.post('/logout', (_req, res) => {
  ok(res, { message: 'Logged out' });
});

// ── GET /api/auth/me ───────────────────────────────────
router.get('/me', auth, (req, res) => {
  const user = db.prepare('SELECT id, name, email, phone, role, created_at FROM users WHERE id = ?').get(req.user.id);
  if (!user) return fail(res, 404, 'User not found');

  // If worker, also return their profile
  let workerProfile = null;
  if (user.role === 'worker') {
    workerProfile = db.prepare('SELECT * FROM worker_profiles WHERE user_id = ?').get(user.id);
    if (workerProfile && workerProfile.skills) {
      workerProfile.skills = JSON.parse(workerProfile.skills);
    }
  }

  ok(res, { user, workerProfile });
});

module.exports = router;
