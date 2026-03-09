/**
 * Civic OS – API client
 * Thin fetch wrapper for all backend endpoints.
 * In development (vite dev server) requests are proxied to http://localhost:8000.
 * In production nginx proxies /api/ to the backend container.
 */

const BASE = '/api';

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `HTTP ${res.status}`);
  }
  return res.json();
}

export const api = {
  // ── Health ──────────────────────────────────────────────────────────────
  health: () => request('/health'),

  // ── Dashboard ───────────────────────────────────────────────────────────
  getDashboard: () => request('/dashboard'),

  // ── Proposals ───────────────────────────────────────────────────────────
  getProposals: () => request('/proposals'),
  createProposal: (data) =>
    request('/proposals', { method: 'POST', body: JSON.stringify(data) }),

  // ── Polls / Voting ───────────────────────────────────────────────────────
  getPolls: () => request('/polls'),
  castVote: (pollId, optionIndex) =>
    request(`/polls/${pollId}/vote`, {
      method: 'POST',
      body: JSON.stringify({ option_index: optionIndex }),
    }),

  // ── Users ────────────────────────────────────────────────────────────────
  getUsers: () => request('/users'),
  toggleUser: (userId) =>
    request(`/users/${userId}/toggle`, { method: 'POST' }),
};
