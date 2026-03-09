import React, { useState, useEffect } from 'react';
import { api } from '../api';

const STATUS_COLORS = {
  open:          'bg-blue-100 text-blue-800',
  deliberating:  'bg-yellow-100 text-yellow-800',
  resolved:      'bg-green-100 text-green-800',
};

const CATEGORIES = ['Contract', 'Conduct', 'Property', 'Energy', 'Governance', 'Other'];
const VERDICTS   = ['liable', 'not liable', 'dismissed'];

export default function Justice() {
  const [cases,      setCases]      = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState(null);
  const [showForm,   setShowForm]   = useState(false);
  const [form,       setForm]       = useState({ plaintiff: '', defendant: '', category: '', description: '', evidence: '' });
  const [submitting, setSubmitting] = useState(false);
  const [verdictState, setVerdictState] = useState({}); // {caseId: {juror, verdict}}
  const [submittingVerdict, setSubmittingVerdict] = useState(null);

  useEffect(() => {
    api.getCases()
      .then(setCases)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const handleFileCase = async (e) => {
    e.preventDefault();
    const { plaintiff, defendant, category, description, evidence } = form;
    if (!plaintiff.trim() || !defendant.trim() || !category || !description.trim() || !evidence.trim()) return;
    setSubmitting(true);
    try {
      const created = await api.fileCase({ plaintiff, defendant, category, description, evidence });
      setCases([created, ...cases]);
      setForm({ plaintiff: '', defendant: '', category: '', description: '', evidence: '' });
      setShowForm(false);
    } catch (err) {
      alert(`Failed to file case: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleVerdict = async (caseId) => {
    const vs = verdictState[caseId];
    if (!vs || !vs.juror || !vs.verdict) return;
    setSubmittingVerdict(caseId);
    try {
      const updated = await api.castVerdict(caseId, { juror_name: vs.juror, verdict: vs.verdict });
      setCases((prev) => prev.map((c) => (c.id === caseId ? updated : c)));
      setVerdictState((prev) => ({ ...prev, [caseId]: {} }));
    } catch (err) {
      alert(`Verdict failed: ${err.message}`);
    } finally {
      setSubmittingVerdict(null);
    }
  };

  if (loading) return <div role="status" className="text-gray-500 py-8 text-center">Loading cases…</div>;
  if (error)   return <div role="alert"  className="text-red-500 py-8 text-center">Error: {error}</div>;

  const open        = cases.filter((c) => c.status === 'open').length;
  const deliberating = cases.filter((c) => c.status === 'deliberating').length;
  const resolved    = cases.filter((c) => c.status === 'resolved').length;

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Justice System</h2>
          <p className="text-sm text-gray-500">Decentralised dispute resolution with merit-weighted jurors</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="rounded-lg bg-rose-600 px-4 py-2 text-sm font-medium text-white hover:bg-rose-700"
        >
          + File Case
        </button>
      </div>

      {/* Stats */}
      <div className="mb-6 grid grid-cols-3 gap-4">
        <div className="rounded-xl border bg-blue-50 border-blue-200 p-4 text-center">
          <p className="text-2xl font-bold text-gray-800">{open}</p>
          <p className="text-xs text-gray-500">Open</p>
        </div>
        <div className="rounded-xl border bg-yellow-50 border-yellow-200 p-4 text-center">
          <p className="text-2xl font-bold text-gray-800">{deliberating}</p>
          <p className="text-xs text-gray-500">Deliberating</p>
        </div>
        <div className="rounded-xl border bg-green-50 border-green-200 p-4 text-center">
          <p className="text-2xl font-bold text-gray-800">{resolved}</p>
          <p className="text-xs text-gray-500">Resolved</p>
        </div>
      </div>

      {/* File Case Modal */}
      {showForm && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="w-full max-w-lg rounded-xl bg-white shadow-xl max-h-screen overflow-y-auto">
            <div className="border-b px-6 py-4">
              <h3 className="text-lg font-semibold text-gray-800">File a New Case</h3>
            </div>
            <form onSubmit={handleFileCase} className="px-6 py-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Plaintiff (Your Name)</label>
                  <input type="text"
                    className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400"
                    placeholder="Your full name"
                    value={form.plaintiff}
                    onChange={(e) => setForm({ ...form, plaintiff: e.target.value })}
                    required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Defendant</label>
                  <input type="text"
                    className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400"
                    placeholder="Respondent name"
                    value={form.defendant}
                    onChange={(e) => setForm({ ...form, defendant: e.target.value })}
                    required />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select
                  className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400"
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  required>
                  <option value="">Select category</option>
                  {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Case Description</label>
                <textarea rows={3}
                  className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400"
                  placeholder="Describe the dispute in detail…"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Evidence Summary <span className="text-xs text-gray-400">(hashed before storage)</span>
                </label>
                <textarea rows={2}
                  className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400"
                  placeholder="Key evidence details…"
                  value={form.evidence}
                  onChange={(e) => setForm({ ...form, evidence: e.target.value })}
                  required />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)} disabled={submitting}
                  className="rounded-lg border px-4 py-2 text-sm text-gray-600 hover:bg-gray-50">Cancel</button>
                <button type="submit" disabled={submitting}
                  className="rounded-lg bg-rose-600 px-4 py-2 text-sm font-medium text-white hover:bg-rose-700 disabled:opacity-60">
                  {submitting ? 'Filing…' : 'File Case'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Cases List */}
      <div className="space-y-5">
        {cases.map((c) => {
          const vs = verdictState[c.id] || {};
          const alreadyVoted = Object.keys(c.votes).length;
          return (
            <div key={c.id} className="rounded-xl bg-white p-5 shadow-sm">
              <div className="mb-3 flex items-start justify-between gap-3 flex-wrap">
                <div>
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="text-sm font-semibold text-gray-800">Case #{c.id}</span>
                    <span className="rounded bg-gray-100 text-gray-600 px-2 py-0.5 text-xs">{c.category}</span>
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_COLORS[c.status]}`}>
                      {c.status.charAt(0).toUpperCase() + c.status.slice(1)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700">{c.description}</p>
                  <div className="mt-1 flex gap-4 text-xs text-gray-400">
                    <span>Plaintiff: <strong className="text-gray-600">{c.plaintiff}</strong></span>
                    <span>Defendant: <strong className="text-gray-600">{c.defendant}</strong></span>
                    <span>Filed: {c.filed_date}</span>
                  </div>
                </div>
                {c.status === 'resolved' && c.verdict && (
                  <div className="shrink-0 rounded-xl bg-green-50 border border-green-200 px-4 py-2 text-center">
                    <p className="text-xs text-gray-500">Verdict</p>
                    <p className="text-sm font-bold text-green-700 capitalize">{c.verdict}</p>
                  </div>
                )}
              </div>

              {/* Jurors */}
              <div className="mb-3">
                <p className="text-xs font-medium text-gray-500 mb-1">Jury ({c.jurors.length} members):</p>
                <div className="flex flex-wrap gap-2">
                  {c.jurors.map((j) => (
                    <span key={j} className={`rounded-full px-3 py-0.5 text-xs font-medium ${
                      c.votes[j] ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {j}{c.votes[j] ? ` → ${c.votes[j]}` : ''}
                    </span>
                  ))}
                </div>
              </div>

              {/* Vote progress */}
              <div className="mb-3 text-xs text-gray-400">
                {alreadyVoted} / {c.jurors.length} votes cast
                <div className="mt-1 h-1.5 w-full rounded-full bg-gray-200">
                  <div className="h-1.5 rounded-full bg-rose-400"
                    style={{ width: `${c.jurors.length > 0 ? (alreadyVoted / c.jurors.length) * 100 : 0}%` }} />
                </div>
              </div>

              {/* Cast verdict */}
              {c.status !== 'resolved' && (
                <div className="flex flex-wrap items-center gap-3 pt-2 border-t">
                  <span className="text-xs text-gray-500">Cast verdict as juror:</span>
                  <select
                    className="rounded-lg border px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-rose-400"
                    value={vs.juror || ''}
                    onChange={(e) => setVerdictState((prev) => ({ ...prev, [c.id]: { ...vs, juror: e.target.value } }))}
                  >
                    <option value="">Select juror…</option>
                    {c.jurors.filter((j) => !c.votes[j]).map((j) => (
                      <option key={j} value={j}>{j}</option>
                    ))}
                  </select>
                  <select
                    className="rounded-lg border px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-rose-400"
                    value={vs.verdict || ''}
                    onChange={(e) => setVerdictState((prev) => ({ ...prev, [c.id]: { ...vs, verdict: e.target.value } }))}
                  >
                    <option value="">Verdict…</option>
                    {VERDICTS.map((v) => <option key={v} value={v}>{v}</option>)}
                  </select>
                  <button
                    onClick={() => handleVerdict(c.id)}
                    disabled={!vs.juror || !vs.verdict || submittingVerdict === c.id}
                    className="rounded-lg bg-rose-600 px-3 py-1 text-xs font-medium text-white hover:bg-rose-700 disabled:opacity-50"
                  >
                    {submittingVerdict === c.id ? 'Submitting…' : 'Submit Verdict'}
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {cases.length === 0 && (
        <p className="text-center text-gray-500 py-8">No cases filed yet.</p>
      )}
    </div>
  );
}
