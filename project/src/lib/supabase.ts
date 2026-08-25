/**
 * Local Supabase-compatible client (v2 — clean Node.js backend).
 * Translates Supabase query-builder calls to REST calls against /api/* endpoints.
 * Frontend pages import `supabase` and call it identically to real Supabase.
 *
 * Backend: http://localhost:5000 (see server/src/index.js)
 */

const API = 'http://localhost:5000';

// ── Token persistence ──────────────────────────────────
function getToken() { try { return localStorage.getItem('colabour_token'); } catch { return null; } }
function setToken(t) { try { t ? localStorage.setItem('colabour_token', t) : localStorage.removeItem('colabour_token'); } catch {} }

// ── Auth listeners ─────────────────────────────────────
const authListeners = new Set();
function notify(event, session) { for (const cb of authListeners) try { cb(event, session); } catch {} }

// ── HTTP helper ────────────────────────────────────────
async function api(path, opts = {}) {
  const headers = { 'Content-Type': 'application/json', ...opts.headers };
  const token = getToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API}${path}`, { ...opts, headers });
  const ct = res.headers.get('content-type') || '';
  const data = ct.includes('json') ? await res.json() : await res.text();
  return { data: res.ok ? data : null, error: res.ok ? null : { message: typeof data === 'string' ? data : data?.message || 'Error' }, status: res.status };
}

// ── QueryBuilder ───────────────────────────────────────
class QueryBuilder {
  constructor(table) {
    this._table = table;
    this._selectCols = '*';
    this._filters = [];
    this._orderCol = null;
    this._orderAsc = true;
    this._single = false;
    this._maybeSingle = false;
    this._insertData = null;
    this._updateData = null;
  }

  select(cols = '*') { this._selectCols = cols; return this; }
  eq(col, val) { this._filters.push({ col, val }); return this; }
  order(col, opts = {}) { this._orderCol = col; this._orderAsc = opts.ascending !== false; return this; }
  single() { this._single = true; return this; }
  maybeSingle() { this._maybeSingle = true; return this; }
  insert(data) { this._insertData = data; return this; }
  update(data) { this._updateData = data; return this; }

  // Make awaitable (thenable pattern)
  async then(resolve, reject) {
    try { resolve(await this._exec()); }
    catch (e) { reject ? reject(e) : resolve({ data: null, error: { message: e.message } }); }
  }

  async _exec() {
    if (this._insertData) return this._doInsert();
    if (this._updateData) return this._doUpdate();
    return this._doSelect();
  }

  // ── SELECT: maps table+filters to correct endpoint ──
  async _doSelect() {
    const t = this._table;
    const idFilter = this._filters.find(f => f.col === 'id');
    const workerIdFilter = this._filters.find(f => f.col === 'worker_id');
    const customerIdFilter = this._filters.find(f => f.col === 'customer_id');
    const bookingIdFilter = this._filters.find(f => f.col === 'booking_id');
    const verifiedFilter = this._filters.find(f => f.col === 'is_verified');
    const categoryFilter = this._filters.find(f => f.col === 'category');
    const statusFilter = this._filters.find(f => f.col === 'status');
    const userIdFilter = this._filters.find(f => f.col === 'user_id');

    // ── users table ──
    if (t === 'users') {
      // AuthContext: users.select('*').eq('id', userId).maybeSingle()
      // AuthPages: users.select('role').eq('id', data.user.id).maybeSingle()
      const { data, error } = await api('/api/auth/me');
      if (error) return { data: null, error };
      // Return the user object (with workerProfile if worker)
      if (this._maybeSingle || this._single) return { data: data.user, error: null };
      return { data: [data.user], error: null };
    }

    // ── worker_profiles table ──
    if (t === 'worker_profiles') {
      // AdminPage: worker_profiles.select('...').order(...) — no specific filter
      if (this._selectCols.includes('users:user_id') && !idFilter) {
        const { data, error } = await api('/api/admin/workers');
        if (error) return { data: null, error };
        let rows = data.workers || [];
        if (this._orderCol) rows = this._sort(rows);
        return { data: rows, error: null };
      }

      // WorkerDashboard/WorkerProfile: .eq('user_id', userId).maybeSingle()
      if (userIdFilter && !idFilter) {
        // We need to find worker by user_id — backend doesn't have this endpoint directly
        // Use /api/auth/me which returns workerProfile for workers
        const { data, error } = await api('/api/auth/me');
        if (error) return { data: null, error };
        if (this._maybeSingle || this._single) return { data: data.workerProfile, error: null };
        return { data: data.workerProfile ? [data.workerProfile] : [], error: null };
      }

      // By ID: worker_profiles.select('...').eq('id', id).maybeSingle()
      if (idFilter) {
        const { data, error } = await api(`/api/workers/${idFilter.val}`);
        if (error) return { data: null, error };
        return { data: data.worker, error: null };
      }

      // List workers (WorkersDirectoryPage): .eq('is_verified', true) + optional category
      const params = new URLSearchParams();
      if (verifiedFilter) params.set('is_verified', verifiedFilter.val);
      if (categoryFilter) params.set('category', categoryFilter.val);
      const qs = params.toString();
      const { data, error } = await api(`/api/workers${qs ? '?' + qs : ''}`);
      if (error) return { data: null, error };
      let rows = data.workers || [];
      if (this._orderCol) rows = this._sort(rows);
      return { data: rows, error: null };
    }

    // ── bookings table ──
    if (t === 'bookings') {
      // By ID: bookings.select('*').eq('id', id).maybeSingle()
      if (idFilter && (this._maybeSingle || this._single)) {
        const { data, error } = await api(`/api/bookings/${idFilter.val}`);
        if (error) return { data: null, error };
        return { data: data.booking, error: null };
      }

      // List by customer/worker: bookings.select('...').eq('customer_id'/'worker_id', val).order(...)
      const params = new URLSearchParams();
      if (customerIdFilter) params.set('customer_id', customerIdFilter.val);
      if (workerIdFilter) params.set('worker_id', workerIdFilter.val);
      if (statusFilter) params.set('status', statusFilter.val);
      const qs = params.toString();
      const { data, error } = await api(`/api/bookings${qs ? '?' + qs : ''}`);
      if (error) return { data: null, error };
      return { data: data.bookings || [], error: null };
    }

    // ── payments table ──
    if (t === 'payments') {
      // By ID
      if (idFilter && (this._maybeSingle || this._single)) {
        const { data, error } = await api(`/api/payments/${idFilter.val}`);
        if (error) return { data: null, error };
        return { data: data.payment, error: null };
      }

      // By booking_id
      if (bookingIdFilter) {
        const { data, error } = await api(`/api/payments?booking_id=${bookingIdFilter.val}`);
        if (error) return { data: null, error };
        const payments = data.payments || [];
        return { data: payments[0] || null, error: null };
      }

      // List by worker/customer (WorkerDashboard/CustomerDashboard)
      const params = new URLSearchParams();
      if (workerIdFilter) params.set('worker_id', workerIdFilter.val);
      if (customerIdFilter) params.set('customer_id', customerIdFilter.val);
      const qs = params.toString();

      // AdminPage: payments.select('*').order(...) — no filter, use admin stats or all payments
      const { data, error } = await api(`/api/payments${qs ? '?' + qs : ''}`);
      if (error) return { data: null, error };
      return { data: data.payments || [], error: null };
    }

    return { data: [], error: null };
  }

  // ── INSERT ──────────────────────────────────────────
  async _doInsert() {
    const t = this._table;

    if (t === 'bookings') {
      const { data, error } = await api('/api/bookings', { method: 'POST', body: JSON.stringify(this._insertData) });
      if (error) return { data: null, error };
      return { data: this._single || this._maybeSingle ? data.booking : [data.booking], error: null };
    }

    if (t === 'payments') {
      const { data, error } = await api('/api/payments', { method: 'POST', body: JSON.stringify(this._insertData) });
      if (error) return { data: null, error };
      return { data: this._single || this._maybeSingle ? data.payment : [data.payment], error: null };
    }

    return { data: this._insertData, error: null };
  }

  // ── UPDATE ──────────────────────────────────────────
  async _doUpdate() {
    const t = this._table;
    const idFilter = this._filters.find(f => f.col === 'id');

    // ── worker_profiles update (settings) ──
    if (t === 'worker_profiles' && idFilter) {
      // AdminPage toggle verify: PATCH /api/admin/workers/:id/verify
      if (this._updateData.is_verified !== undefined) {
        const { data, error } = await api(`/api/admin/workers/${idFilter.val}/verify`, { method: 'PATCH' });
        if (error) return { data: null, error };
        return { data: data.worker, error: null };
      }
      // WorkerDashboard: PATCH /api/workers/:id
      const { data, error } = await api(`/api/workers/${idFilter.val}`, { method: 'PATCH', body: JSON.stringify(this._updateData) });
      if (error) return { data: null, error };
      return { data: data.worker, error: null };
    }

    // ── bookings status update ──
    if (t === 'bookings' && idFilter) {
      const status = this._updateData.status;
      const { data, error } = await api(`/api/bookings/${idFilter.val}/status`, { method: 'PATCH', body: JSON.stringify({ status }) });
      if (error) return { data: null, error };
      return { data: data.booking, error: null };
    }

    // ── payments update ──
    if (t === 'payments' && idFilter) {
      // PaymentPage confirm with UTR: PATCH /api/payments/:id/confirm
      if (this._updateData.utr_number) {
        const { data, error } = await api(`/api/payments/${idFilter.val}/confirm`, { method: 'PATCH', body: JSON.stringify({ utr_number: this._updateData.utr_number }) });
        if (error) return { data: null, error };
        return { data: this._single || this._maybeSingle ? data.payment : [data.payment], error: null };
      }
      // AdminPage resolve dispute: POST /api/admin/payments/:id/resolve
      if (this._updateData.status === 'paid') {
        const { data, error } = await api(`/api/admin/payments/${idFilter.val}/resolve`, { method: 'POST' });
        if (error) return { data: null, error };
        return { data: data.payment, error: null };
      }
      return { data: this._updateData, error: null };
    }

    return { data: this._updateData, error: null };
  }

  _sort(rows) {
    const col = this._orderCol;
    const asc = this._orderAsc;
    return [...rows].sort((a, b) => {
      if (a[col] < b[col]) return asc ? -1 : 1;
      if (a[col] > b[col]) return asc ? 1 : -1;
      return 0;
    });
  }
}

// ── Auth module ────────────────────────────────────────
const auth = {
  async getSession() {
    const token = getToken();
    if (!token) return { data: { session: null }, error: null };
    const res = await api('/api/auth/me');
    if (res.error) { setToken(null); return { data: { session: null }, error: null }; }
    return { data: { session: { access_token: token, user: res.data.user } }, error: null };
  },

  async signUp({ email, password, options = {} }) {
    const body = { email, password, name: options.data?.name, phone: options.data?.phone, role: options.data?.role };
    const res = await api('/api/auth/signup', { method: 'POST', body: JSON.stringify(body) });
    if (res.error) return { data: { user: null }, error: res.error };
    setToken(res.data.token);
    notify('SIGNED_IN', { user: res.data.user });
    return { data: { user: res.data.user }, error: null };
  },

  async signInWithPassword({ email, password }) {
    const res = await api('/api/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) });
    if (res.error) return { data: { user: null }, error: res.error };
    setToken(res.data.token);
    notify('SIGNED_IN', { user: res.data.user });
    return { data: { user: res.data.user, session: { access_token: res.data.token } }, error: null };
  },

  async signOut() {
    await api('/api/auth/logout', { method: 'POST' });
    setToken(null);
    notify('SIGNED_OUT', null);
    return { error: null };
  },

  onAuthStateChange(callback) {
    authListeners.add(callback);
    return { data: { subscription: { unsubscribe: () => authListeners.delete(callback) } } };
  },
};

// ── RPC helper ─────────────────────────────────────────
// Maps old Supabase RPC calls to new API endpoints
async function rpc(fn, params = {}) {
  if (fn === 'confirm_payment_received') {
    const res = await api(`/api/payments/${params.p_payment_id}/receive`, {
      method: 'POST',
      body: JSON.stringify({}),
    });
    return res;
  }
  if (fn === 'create_worker_profile' || fn === 'create_customer_profile') {
    // These are handled during signup — return success
    return { data: { success: true }, error: null };
  }
  return { data: null, error: { message: `Unknown RPC: ${fn}` } };
}

// ── Public API ─────────────────────────────────────────
export const supabase = {
  auth,
  from(table) { return new QueryBuilder(table); },
  rpc,
};

// ── Types & constants (unchanged) ─────────────────────
export type UserRole = 'customer' | 'worker' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  created_at: string;
}

export interface WorkerProfile {
  id: string;
  user_id: string;
  bio: string | null;
  category: string;
  skills: string[];
  upi_id: string;
  hourly_rate: number;
  rating: number;
  total_ratings: number;
  is_verified: boolean;
  location: string | null;
  avatar_url: string | null;
  created_at: string;
}

export interface WorkerWithUser extends WorkerProfile {
  users: Pick<User, 'name' | 'email' | 'phone'> | null;
}

export interface Booking {
  id: string;
  customer_id: string;
  worker_id: string;
  category: string;
  scheduled_at: string;
  address: string;
  total_amount: number;
  status: string;
  notes: string | null;
  created_at: string;
}

export interface Payment {
  id: string;
  booking_id: string;
  worker_id: string;
  customer_id: string;
  amount: number;
  upi_uri: string | null;
  utr_number: string | null;
  verification_token: string | null;
  status: string;
  paid_at: string | null;
  created_at: string;
}

export interface AuthSession {
  user: User | null;
  workerProfile: WorkerProfile | null;
  loading: boolean;
}

export const CATEGORIES = [
  'Electrician', 'Plumber', 'Carpenter', 'Painter', 'Cleaner',
  'Driver', 'Gardener', 'Caregiver', 'Technician',
] as const;

export type Category = (typeof CATEGORIES)[number];
