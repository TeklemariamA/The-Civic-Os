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

  // ── Bounties ─────────────────────────────────────────────────────────────
  getBounties: () => request('/bounties'),
  createBounty: (data) =>
    request('/bounties', { method: 'POST', body: JSON.stringify(data) }),
  claimBounty: (bountyId, claimer = 'Civic User') =>
    request(`/bounties/${bountyId}/claim?claimer=${encodeURIComponent(claimer)}`, { method: 'POST' }),

  // ── ZK-Audit ─────────────────────────────────────────────────────────────
  getAuditLog: () => request('/audit/log'),
  submitZKProof: (data) =>
    request('/audit/submit', { method: 'POST', body: JSON.stringify(data) }),

  // ── Justice ──────────────────────────────────────────────────────────────
  getCases: () => request('/justice/cases'),
  fileCase: (data) =>
    request('/justice/cases', { method: 'POST', body: JSON.stringify(data) }),
  castVerdict: (caseId, data) =>
    request(`/justice/cases/${caseId}/verdict`, { method: 'POST', body: JSON.stringify(data) }),

  // ── Consent Forms ─────────────────────────────────────────────────────────
  getConsentForms: () => request('/consent/forms'),
  signConsent: (formId) =>
    request(`/consent/forms/${formId}/sign`, { method: 'POST' }),

  // ── Sovereign Identity ────────────────────────────────────────────────────
  listIdentities: () => request('/identity/list'),
  issueIdentity: (data) =>
    request('/identity/issue', { method: 'POST', body: JSON.stringify(data) }),
};
