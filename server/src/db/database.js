/**
 * SQLite database (sql.js — pure WASM, no native compilation).
 * Provides a thin wrapper so routes use the same API as better-sqlite3.
 * DB file: colabour.db (created in server/ root).
 */

const initSqlJs = require('sql.js');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');
const { uuid } = require('../utils/helpers');

const DB_PATH = path.join(__dirname, '..', '..', 'colabour.db');
const SCHEMA_PATH = path.join(__dirname, 'schema.sql');

// ── sql.js wrapper ─────────────────────────────────────
class DatabaseWrapper {
  constructor(sqlDb) { this._db = sqlDb; }

  prepare(sql) {
    const db = this._db;
    return {
      run(...params) {
        db.run(sql, params);
        return { lastInsertRowid: db.exec('SELECT last_insert_rowid()')[0]?.values[0]?.[0], changes: db.getRowsModified() };
      },
      get(...params) {
        const stmt = db.prepare(sql);
        stmt.bind(params);
        if (stmt.step()) { const row = stmt.getAsObject(); stmt.free(); return row; }
        stmt.free();
        return undefined;
      },
      all(...params) {
        const stmt = db.prepare(sql);
        stmt.bind(params);
        const rows = [];
        while (stmt.step()) rows.push(stmt.getAsObject());
        stmt.free();
        return rows;
      },
    };
  }

  exec(sql) { this._db.exec(sql); }

  transaction(fn) {
    const self = this;
    return function (...args) {
      self._db.run('BEGIN');
      try { const r = fn(...args); self._db.run('COMMIT'); return r; }
      catch (e) { self._db.run('ROLLBACK'); throw e; }
    };
  }

  pragma(p) { try { this._db.run(`PRAGMA ${p}`); } catch {} }

  save() {
    const data = this._db.export();
    fs.writeFileSync(DB_PATH, Buffer.from(data));
  }
}

// ── Initialize ─────────────────────────────────────────
let db;

async function initDB() {
  const SQL = await initSqlJs();

  let sqlDb;
  if (fs.existsSync(DB_PATH)) {
    const buf = fs.readFileSync(DB_PATH);
    sqlDb = new SQL.Database(buf);
  } else {
    sqlDb = new SQL.Database();
  }

  db = new DatabaseWrapper(sqlDb);
  db.pragma('foreign_keys = ON');

  // Run schema
  const schema = fs.readFileSync(SCHEMA_PATH, 'utf-8');
  db.exec(schema);

  console.log('[db] SQLite connected:', DB_PATH);

  // Seed demo data (only if empty)
  const userCount = db.prepare('SELECT COUNT(*) as c FROM users').get().c;

  if (userCount === 0) {
    console.log('[db] Seeding demo data...');
    const hash = bcrypt.hashSync('password123', 10);
    const insertUser = db.prepare(
      'INSERT INTO users (id, name, email, password_hash, phone, role) VALUES (?, ?, ?, ?, ?, ?)'
    );
    const insertWorker = db.prepare(
      `INSERT INTO worker_profiles (id, user_id, bio, category, skills, upi_id, hourly_rate, rating, total_ratings, is_verified, location)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    );

    const seed = db.transaction(() => {
      const adminId = uuid();
      insertUser.run(adminId, 'Admin User', 'admin@colabour.com', hash, '9000000000', 'admin');

      const custId = uuid();
      insertUser.run(custId, 'Riya Sharma', 'customer@colabour.com', hash, '9111111111', 'customer');

      const workers = [
        { name: 'Rajesh Kumar', email: 'worker@colabour.com', phone: '9222222222', bio: '10+ years in electrical work', category: 'Electrician', skills: ['Wiring', 'Repair', 'Installation'], upi: 'rajesh@upi', rate: 350, rating: 4.9, ratings: 47, verified: 1, loc: 'Mumbai' },
        { name: 'Priya Patil', email: 'priya@colabour.com', phone: '9333333333', bio: 'Professional cleaning service', category: 'Cleaner', skills: ['Deep Clean', 'Office', 'Sanitization'], upi: 'priya@upi', rate: 250, rating: 4.7, ratings: 32, verified: 1, loc: 'Pune' },
        { name: 'Amit Verma', email: 'amit@colabour.com', phone: '9444444444', bio: 'Expert plumber', category: 'Plumber', skills: ['Pipe Fitting', 'Leak Repair', 'Bathroom'], upi: 'amit@upi', rate: 300, rating: 4.8, ratings: 21, verified: 1, loc: 'Mumbai' },
        { name: 'Suresh Yadav', email: 'suresh@colabour.com', phone: '9555555555', bio: 'New carpenter looking for work', category: 'Carpenter', skills: ['Furniture', 'Repair'], upi: 'suresh@upi', rate: 280, rating: 5.0, ratings: 0, verified: 0, loc: 'Nashik' },
        { name: 'Meena Devi', email: 'meena@colabour.com', phone: '9666666666', bio: 'Painter with 8 years experience', category: 'Painter', skills: ['Interior', 'Exterior', 'Texture'], upi: 'meena@upi', rate: 320, rating: 4.6, ratings: 15, verified: 1, loc: 'Nagpur' },
      ];

      for (const w of workers) {
        const uid = uuid();
        insertUser.run(uid, w.name, w.email, hash, w.phone, 'worker');
        insertWorker.run(uuid(), uid, w.bio, w.category, JSON.stringify(w.skills), w.upi, w.rate, w.rating, w.ratings, w.verified, w.loc);
      }
    });

    seed();
    console.log('[db] Seeded 1 admin, 1 customer, 5 workers');
    db.save();
  }

  return db;
}

function getDB() {
  if (!db) throw new Error('Database not initialized. Call initDB() first.');
  return db;
}

module.exports = { initDB, getDB };
