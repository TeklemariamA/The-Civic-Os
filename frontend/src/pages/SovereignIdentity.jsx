import React, { useState, useEffect } from 'react';
import { api } from '../api';

const STATUS_COLORS = {
  active:  'bg-green-100 text-green-800',
  expired: 'bg-gray-100 text-gray-600',
  revoked: 'bg-red-100 text-red-800',
};

const WARDS = ['Ward 1', 'Ward 2', 'Ward 3', 'Ward 4', 'Ward 5', 'Ward 6'];

function MeritBar({ score }) {
  const pct = Math.min(100, Math.max(0, score));
  const color = pct >= 70 ? 'bg-green-500' : pct >= 40 ? 'bg-yellow-500' : 'bg-red-400';
  return (
    <div>
      <div className="flex justify-between text-xs text-gray-500 mb-0.5">
        <span>Merit Score</span>
        <span>{score}</span>
      </div>
      <div className="h-1.5 w-full rounded-full bg-gray-200">
        <div className={`h-1.5 rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export default function SovereignIdentity() {
  const [identities, setIdentities] = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState(null);
  const [showForm,   setShowForm]   = useState(false);
  const [form,       setForm]       = useState({ holder: '', ward: '' });
  const [submitting, setSubmitting] = useState(false);
  const [expanded,   setExpanded]   = useState(null);

  useEffect(() => {
    api.listIdentities()
      .then(setIdentities)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const handleIssue = async (e) => {
    e.preventDefault();
    if (!form.holder.trim() || !form.ward) return;
    setSubmitting(true);
    try {
      const issued = await api.issueIdentity({ holder: form.holder, ward: form.ward });
      setIdentities([...identities, issued]);
      setForm({ holder: '', ward: '' });
      setShowForm(false);
    } catch (err) {
      alert(`Failed to issue identity: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div role="status" className="text-gray-500 py-8 text-center">Loading identities…</div>;
  if (error)   return <div role="alert"  className="text-red-500 py-8 text-center">Error: {error}</div>;

  const active = identities.filter((i) => i.status === 'active').length;

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Sovereign Identity</h2>
          <p className="text-sm text-gray-500">
            Issue and manage decentralised citizen identity credentials (DIDs)
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700"
        >
          + Issue Identity
        </button>
      </div>

      {/* Explainer */}
      <div className="mb-6 rounded-xl bg-teal-50 border border-teal-200 p-4">
        <p className="text-sm font-semibold text-teal-800 mb-1">🪪 What is a Sovereign Identity?</p>
        <p className="text-sm text-teal-700">
          A Sovereign Digital Identity (DID) gives citizens full control over their civic credentials.
          Each DID is unique, cryptographically secure, and not controlled by any single authority.
          It stores verifiable credentials like residency, voting eligibility, and merit score — used
          across all Civic OS governance processes.
        </p>
      </div>

      {/* Stats */}
      <div className="mb-6 grid grid-cols-3 gap-4">
        <div className="rounded-xl border bg-teal-50 border-teal-200 p-4 text-center">
          <p className="text-2xl font-bold text-gray-800">{identities.length}</p>
          <p className="text-xs text-gray-500">Issued</p>
        </div>
        <div className="rounded-xl border bg-green-50 border-green-200 p-4 text-center">
          <p className="text-2xl font-bold text-gray-800">{active}</p>
          <p className="text-xs text-gray-500">Active</p>
        </div>
        <div className="rounded-xl border bg-gray-50 border-gray-200 p-4 text-center">
          <p className="text-2xl font-bold text-gray-800">
            {identities.length > 0
              ? Math.round(identities.reduce((s, i) => s + i.merit_score, 0) / identities.length)
              : 0}
          </p>
          <p className="text-xs text-gray-500">Avg Merit Score</p>
        </div>
      </div>

      {/* Issue Modal */}
      {showForm && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="w-full max-w-md rounded-xl bg-white shadow-xl">
            <div className="border-b px-6 py-4">
              <h3 className="text-lg font-semibold text-gray-800">Issue New Sovereign Identity</h3>
            </div>
            <form onSubmit={handleIssue} className="px-6 py-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Citizen Name</label>
                <input
                  type="text"
                  className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="Full legal name"
                  value={form.holder}
                  onChange={(e) => setForm({ ...form, holder: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ward</label>
                <select
                  className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                  value={form.ward}
                  onChange={(e) => setForm({ ...form, ward: e.target.value })}
                  required
                >
                  <option value="">Select ward…</option>
                  {WARDS.map((w) => <option key={w} value={w}>{w}</option>)}
                </select>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)} disabled={submitting}
                  className="rounded-lg border px-4 py-2 text-sm text-gray-600 hover:bg-gray-50">
                  Cancel
                </button>
                <button type="submit" disabled={submitting}
                  className="rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700 disabled:opacity-60">
                  {submitting ? 'Issuing…' : 'Issue DID'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Identity Cards */}
      <div className="grid gap-4 sm:grid-cols-1 lg:grid-cols-2">
        {identities.map((id) => (
          <div key={id.id} className="rounded-xl bg-white shadow-sm overflow-hidden">
            {/* Card header — gradient */}
            <div className="bg-gradient-to-r from-teal-700 to-indigo-700 px-5 py-4 text-white">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs text-teal-200 uppercase tracking-widest">Sovereign Identity</p>
                  <p className="text-lg font-bold mt-0.5">{id.holder}</p>
                  <p className="text-xs text-teal-200">{id.ward}</p>
                </div>
                <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_COLORS[id.status]}`}>
                  {id.status.charAt(0).toUpperCase() + id.status.slice(1)}
                </span>
              </div>
            </div>

            {/* Card body */}
            <div className="px-5 py-4 space-y-3">
              <div>
                <p className="text-xs text-gray-400 mb-0.5">Decentralised Identifier (DID)</p>
                <p className="font-mono text-xs text-gray-700 break-all">{id.did}</p>
              </div>
              <MeritBar score={id.merit_score} />
              <div className="flex justify-between text-xs text-gray-500">
                <span>Issued: {id.issued_date}</span>
                <span>Expires: {id.expiry_date}</span>
              </div>

              {/* Credentials */}
              <button
                onClick={() => setExpanded(expanded === id.id ? null : id.id)}
                className="w-full text-left text-xs text-indigo-600 font-medium hover:underline"
              >
                {expanded === id.id ? '▲ Hide credentials' : `▼ View ${id.credentials.length} credentials`}
              </button>
              {expanded === id.id && (
                <div className="flex flex-wrap gap-2 pt-1">
                  {id.credentials.map((cred) => (
                    <span key={cred} className="rounded-full bg-teal-50 border border-teal-200 text-teal-700 px-3 py-0.5 text-xs font-medium">
                      ✓ {cred}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {identities.length === 0 && (
        <p className="text-center text-gray-500 py-8">No identities issued yet.</p>
      )}
    </div>
  );
}
