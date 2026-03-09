import React, { useState, useEffect } from 'react';
import { api } from '../api';

const ACTION_TYPES = [
  'cast_vote',
  'sign_consent',
  'submit_proposal',
  'claim_bounty',
  'file_case',
  'issue_identity',
];

function formatTime(ts) {
  const d = new Date(ts * 1000);
  return d.toLocaleString();
}

function shortHash(h) {
  return `${h.slice(0, 10)}…${h.slice(-8)}`;
}

export default function ZKAudit() {
  const [log,        setLog]        = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState(null);
  const [showForm,   setShowForm]   = useState(false);
  const [action,     setAction]     = useState('cast_vote');
  const [secret,     setSecret]     = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [lastProof,  setLastProof]  = useState(null);

  useEffect(() => {
    api.getAuditLog()
      .then(setLog)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!secret.trim()) return;
    setSubmitting(true);
    try {
      const result = await api.submitZKProof({ action_type: action, user_secret: secret });
      setLastProof(result.proof_signature);
      // Refresh log
      const updated = await api.getAuditLog();
      setLog(updated);
      setSecret('');
      setShowForm(false);
    } catch (err) {
      alert(`Submission failed: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div role="status" className="text-gray-500 py-8 text-center">Loading audit log…</div>;
  if (error)   return <div role="alert"  className="text-red-500 py-8 text-center">Error: {error}</div>;

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">ZK-Audit</h2>
          <p className="text-sm text-gray-500">
            Zero-Knowledge public audit log — verifiable actions with anonymised identities
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-700"
        >
          + Submit Action
        </button>
      </div>

      {/* Explainer */}
      <div className="mb-6 rounded-xl bg-violet-50 border border-violet-200 p-4">
        <p className="text-sm font-semibold text-violet-800 mb-1">🔐 How ZK-Audit works</p>
        <p className="text-sm text-violet-700">
          When you perform an action, your local device hashes your identity together with
          a private secret you choose. Only the resulting <strong>proof hash</strong> is sent
          to the server — the server verifies that an action occurred without ever learning
          who performed it. Anyone can inspect the public log to confirm integrity.
        </p>
      </div>

      {/* Stats */}
      <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border bg-white p-4 shadow-sm text-center">
          <p className="text-2xl font-bold text-gray-800">{log.length}</p>
          <p className="text-xs text-gray-500">Total Logged Actions</p>
        </div>
        <div className="rounded-xl border bg-white p-4 shadow-sm text-center">
          <p className="text-2xl font-bold text-gray-800">{log.filter((e) => e.verified).length}</p>
          <p className="text-xs text-gray-500">Verified</p>
        </div>
        <div className="rounded-xl border bg-white p-4 shadow-sm text-center">
          <p className="text-2xl font-bold text-gray-800">{new Set(log.map((e) => e.action)).size}</p>
          <p className="text-xs text-gray-500">Distinct Action Types</p>
        </div>
      </div>

      {/* Success banner */}
      {lastProof && (
        <div className="mb-4 rounded-xl bg-green-50 border border-green-200 p-4">
          <p className="text-sm font-semibold text-green-800">✓ Action recorded on public ledger</p>
          <p className="text-xs text-green-700 font-mono mt-1 break-all">Proof: {lastProof}</p>
          <button onClick={() => setLastProof(null)} className="mt-1 text-xs text-green-600 underline">Dismiss</button>
        </div>
      )}

      {/* Submit Modal */}
      {showForm && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="w-full max-w-md rounded-xl bg-white shadow-xl">
            <div className="border-b px-6 py-4">
              <h3 className="text-lg font-semibold text-gray-800">Submit Anonymised Action</h3>
            </div>
            <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Action Type</label>
                <select
                  className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                  value={action}
                  onChange={(e) => setAction(e.target.value)}
                >
                  {ACTION_TYPES.map((a) => <option key={a} value={a}>{a.replace(/_/g, ' ')}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Private Secret <span className="text-xs text-gray-400">(never sent — hashed locally)</span>
                </label>
                <input
                  type="password"
                  className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                  placeholder="Your private passphrase"
                  value={secret}
                  onChange={(e) => setSecret(e.target.value)}
                  required
                />
              </div>
              <p className="text-xs text-gray-400">
                Your secret is hashed together with the action type before transmission.
                The server stores only the hash — your identity remains private.
              </p>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)} disabled={submitting}
                  className="rounded-lg border px-4 py-2 text-sm text-gray-600 hover:bg-gray-50">
                  Cancel
                </button>
                <button type="submit" disabled={submitting}
                  className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-700 disabled:opacity-60">
                  {submitting ? 'Submitting…' : 'Submit Proof'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Public Audit Log */}
      <div className="rounded-xl bg-white shadow-sm overflow-hidden">
        <div className="border-b px-6 py-4">
          <h3 className="font-semibold text-gray-800">Public Audit Log</h3>
          <p className="text-xs text-gray-400">All actions are verified and anonymised. WHO is hidden; WHAT is public.</p>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">#</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Timestamp</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Action</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Proof Signature (truncated)</th>
                <th className="px-4 py-3 text-center text-xs font-medium uppercase text-gray-500">Verified</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {log.map((entry) => (
                <tr key={entry.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm text-gray-500">{entry.id}</td>
                  <td className="px-4 py-3 text-sm text-gray-500 whitespace-nowrap">{formatTime(entry.timestamp)}</td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-violet-100 text-violet-800 px-2.5 py-0.5 text-xs font-medium">
                      {entry.action.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-gray-500">{shortHash(entry.proof_signature)}</td>
                  <td className="px-4 py-3 text-center">
                    {entry.verified
                      ? <span className="text-green-600 font-semibold">✓</span>
                      : <span className="text-red-500">✗</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {log.length === 0 && (
          <p className="py-8 text-center text-gray-500">No audit entries yet.</p>
        )}
      </div>
    </div>
  );
}
