/**
 * Shared utility functions.
 */

/** Generate a UUID v4 (simple, no dependency). */
function uuid() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
  });
}

/** ISO timestamp string. */
function now() {
  return new Date().toISOString();
}

/** Send success JSON: { success: true, ...data }. */
function ok(res, data = {}) {
  return res.json({ success: true, ...data });
}

/** Send error JSON: { success: false, message }. */
function fail(res, status, message) {
  return res.status(status).json({ success: false, message });
}

module.exports = { uuid, now, ok, fail };
