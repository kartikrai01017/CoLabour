-- CoLabour Database Schema
-- SQLite — persistent local storage

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  phone TEXT DEFAULT '',
  role TEXT NOT NULL DEFAULT 'customer' CHECK(role IN ('customer','worker','admin')),
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS worker_profiles (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  bio TEXT DEFAULT '',
  category TEXT NOT NULL,
  skills TEXT DEFAULT '[]',
  upi_id TEXT NOT NULL,
  hourly_rate REAL DEFAULT 0,
  rating REAL DEFAULT 5.0,
  total_ratings INTEGER DEFAULT 0,
  is_verified INTEGER DEFAULT 0,
  location TEXT DEFAULT '',
  avatar_url TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS bookings (
  id TEXT PRIMARY KEY,
  customer_id TEXT NOT NULL REFERENCES users(id),
  worker_id TEXT NOT NULL REFERENCES worker_profiles(id),
  category TEXT NOT NULL,
  scheduled_at TEXT NOT NULL,
  address TEXT NOT NULL,
  total_amount REAL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK(status IN ('pending','confirmed','in_progress','completed','cancelled','payment_submitted','paid')),
  notes TEXT DEFAULT '',
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS payments (
  id TEXT PRIMARY KEY,
  booking_id TEXT NOT NULL REFERENCES bookings(id),
  worker_id TEXT NOT NULL REFERENCES worker_profiles(id),
  customer_id TEXT NOT NULL REFERENCES users(id),
  amount REAL DEFAULT 0,
  upi_uri TEXT,
  utr_number TEXT,
  verification_token TEXT,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK(status IN ('pending','payment_submitted','paid','failed','refunded')),
  paid_at TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

-- Performance indexes
CREATE INDEX IF NOT EXISTS idx_wp_user ON worker_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_wp_category ON worker_profiles(category);
CREATE INDEX IF NOT EXISTS idx_wp_verified ON worker_profiles(is_verified);
CREATE INDEX IF NOT EXISTS idx_bk_customer ON bookings(customer_id);
CREATE INDEX IF NOT EXISTS idx_bk_worker ON bookings(worker_id);
CREATE INDEX IF NOT EXISTS idx_bk_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_pm_booking ON payments(booking_id);
CREATE INDEX IF NOT EXISTS idx_pm_worker ON payments(worker_id);
CREATE INDEX IF NOT EXISTS idx_pm_customer ON payments(customer_id);
CREATE INDEX IF NOT EXISTS idx_pm_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_pm_token ON payments(verification_token);
