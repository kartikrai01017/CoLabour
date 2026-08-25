/**
 * API client for CoLabour MVP
 * 
 * ONLY Auth is connected to backend in this MVP version.
 * All other features (bookings, matching, ratings) use local mock data
 * stored in localStorage / React state.
 * 
 * To connect a new feature to backend:
 * 1. Create endpoint in backend/server.js
 * 2. Add function here like: export const createBooking = (data) => fetch(...)
 * 3. Replace mock logic in pages/* with this function
 */

const BASE = 'http://localhost:5000/api';

function getToken() {
  return localStorage.getItem('colabour_token');
}

async function request(path, options = {}) {
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  const token = getToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${BASE}${path}`, { ...options, headers });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || `Request failed: ${res.status}`);
  return data;
}

// --- Auth (CONNECTED) ---
export const register = (payload) => request('/auth/register', { method: 'POST', body: JSON.stringify(payload) });
export const login = (payload) => request('/auth/login', { method: 'POST', body: JSON.stringify(payload) });
export const fetchMe = () => request('/auth/me');
export const healthCheck = () => request('/health');

// --- Future (MOCK for now) ---
// TODO: Uncomment and implement when backend ready
// export const getWorkers = () => request('/workers');
// export const createBooking = (data) => request('/bookings', { method: 'POST', body: JSON.stringify(data) });
// export const acceptBooking = (id) => request(`/bookings/${id}/accept`, { method: 'PATCH' });
