/**
 * CoLabour Backend - MVP
 * Cooperative-Owned Local Services Platform
 * 
 * This is the MINIMAL backend for MVP.
 * Currently ONLY Auth feature is connected to frontend via API.
 * Other features (Bookings, Matching, Ratings, Workers) are mocked on frontend
 * and will be connected later - see TODO comments.
 * 
 * API Base: http://localhost:5000/api
 * 
 * Endpoints:
 *  POST /api/auth/register - Register new user (customer/worker/admin)
 *  POST /api/auth/login    - Login and get JWT
 *  GET  /api/auth/me       - Get current user from token
 *  GET  /api/health        - Health check
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'colabour_mvp_secret_2026_change_in_prod';

// Middleware
app.use(cors()); // allow all origins for MVP (restrict in production)
app.use(express.json());

// Simple request logger
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

/**
 * In-memory data store for MVP
 * In production, replace with database (MongoDB/PostgreSQL)
 * Data is lost on server restart - intentional for MVP simplicity
 */
let users = [
  // Demo seeded user for testing without registration
  // email: demo@colabour.com , password: demo123 , role: customer
];
let nextUserId = 1;

// Seed demo user (hashed password)
(async () => {
  const hash = await bcrypt.hash('demo123', 10);
  users.push({
    id: nextUserId++,
    name: 'Demo User',
    email: 'demo@colabour.com',
    password: hash,
    role: 'customer', // customer | worker | admin
    skill: null,
    location: 'Pune',
    createdAt: new Date().toISOString()
  });
})();

/**
 * Helper: Generate JWT token
 * @param {Object} user - user object
 * @returns {string} JWT token valid for 7 days
 */
function generateToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

/**
 * Middleware: Verify JWT token
 * Checks Authorization header for "Bearer <token>"
 */
function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'No token provided' });
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }
}

// ==================== ROUTES ====================

// Health check - useful for frontend to test backend connection
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'CoLabour API is running', time: new Date().toISOString() });
});

/**
 * POST /api/auth/register
 * Body: { name, email, password, role, skill?, location? }
 * Roles: customer, worker, admin
 */
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password, role, skill, location } = req.body;

    // Basic validation
    if (!name || !email || !password || !role) {
      return res.status(400).json({ success: false, message: 'name, email, password, role are required' });
    }
    if (!['customer', 'worker', 'admin'].includes(role)) {
      return res.status(400).json({ success: false, message: 'role must be customer, worker or admin' });
    }
    if (password.length < 4) {
      return res.status(400).json({ success: false, message: 'password must be at least 4 characters' });
    }

    // Check duplicate email
    const exists = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (exists) {
      return res.status(409).json({ success: false, message: 'Email already registered' });
    }

    // Hash password
    const hashed = await bcrypt.hash(password, 10);

    const newUser = {
      id: nextUserId++,
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashed,
      role,
      skill: role === 'worker' ? (skill || 'General') : null,
      location: location || 'Pune',
      verified: role === 'worker' ? false : true, // workers need admin verification (future feature)
      createdAt: new Date().toISOString()
    };

    users.push(newUser);

    const token = generateToken(newUser);

    // Don't return password
    const { password: _, ...userWithoutPassword } = newUser;

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      user: userWithoutPassword
    });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

/**
 * POST /api/auth/login
 * Body: { email, password }
 */
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'email and password required' });
    }

    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const token = generateToken(user);
    const { password: _, ...userWithoutPassword } = user;

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: userWithoutPassword
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

/**
 * GET /api/auth/me
 * Header: Authorization: Bearer <token>
 * Returns current logged-in user
 */
app.get('/api/auth/me', authMiddleware, (req, res) => {
  const user = users.find(u => u.id === req.user.id);
  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }
  const { password: _, ...userWithoutPassword } = user;
  res.json({ success: true, user: userWithoutPassword });
});

/**
 * GET /api/workers - placeholder for future
 * Currently NOT connected to frontend (frontend uses mock data)
 * TODO: Implement DB query, verification filter, pagination
 */
app.get('/api/workers', (req, res) => {
  const workers = users.filter(u => u.role === 'worker').map(({ password, ...u }) => u);
  res.json({ success: true, workers, note: 'Mock endpoint - frontend currently uses local mock' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found: ' + req.originalUrl });
});

app.listen(PORT, () => {
  console.log(`\n✓ CoLabour Backend running on http://localhost:${PORT}`);
  console.log(`  Health: http://localhost:${PORT}/api/health`);
  console.log(`  Auth: POST http://localhost:${PORT}/api/auth/register | /api/auth/login`);
  console.log(`  Demo login -> email: demo@colabour.com | password: demo123\n`);
});
