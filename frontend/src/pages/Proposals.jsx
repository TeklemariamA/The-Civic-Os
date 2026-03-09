import React, { useState, useEffect } from 'react';
import { api } from '../api';

const STATUS_COLORS = {
  Active:         'bg-green-100 text-green-800',
  Draft:          'bg-gray-100 text-gray-700',
  Passed:         'bg-blue-100 text-blue-800',
  Rejected:       'bg-red-100 text-red-700',
  'Under Review': 'bg-yellow-100 text-yellow-800',
};

const CATEGORIES = ['Environment', 'Infrastructure', 'Education', 'Urban Development', 'Transportation', 'Public Safety', 'Other'];
const STATUSES   = ['All', 'Active', 'Draft', 'Under Review', 'Passed', 'Rejected'];

export default function Proposals() {
  const [proposals,     setProposals]     = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [error,         setError]         = useState(null);
  const [filterStatus,  setFilterStatus]  = useState('All');
  const [showForm,      setShowForm]      = useState(false);
  const [form,          setForm]          = useState({ title: '', category: '', description: '' });
  const [submitting,    setSubmitting]    = useState(false);

  useEffect(() => {
    api.getProposals()
      .then(setProposals)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const filtered = filterStatus === 'All'
    ? proposals
    : proposals.filter((p) => p.status === filterStatus);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.category || !form.description.trim()) return;
    setSubmitting(true);
    try {
      const created = await api.createProposal(form);
      setProposals([created, ...proposals]);
      setForm({ title: '', category: '', description: '' });
      setShowForm(false);
    } catch (err) {
      alert(`Failed to submit proposal: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div role="status" className="text-gray-500 py-8 text-center">Loading proposals…</div>;
  if (error)   return <div role="alert" className="text-red-500 py-8 text-center">Error: {error}</div>;

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Proposals</h2>
          <p className="text-sm text-gray-500">Browse, filter, and submit civic proposals</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
        >
          + New Proposal
        </button>
      </div>

      {/* New Proposal Modal */}
      {showForm && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="w-full max-w-lg rounded-xl bg-white shadow-xl">
            <div className="border-b px-6 py-4">
              <h3 className="text-lg font-semibold text-gray-800">Submit New Proposal</h3>
            </div>
            <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Proposal title"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select
                  className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  required
                >
                  <option value="">Select category</option>
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  rows={4}
                  placeholder="Describe your proposal…"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  required
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => { setShowForm(false); setForm({ title: '', category: '', description: '' }); }}
                  className="rounded-lg border px-4 py-2 text-sm text-gray-600 hover:bg-gray-50"
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-60"
                >
                  {submitting ? 'Submitting…' : 'Submit Proposal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Status Filter */}
      <div className="mb-5 flex flex-wrap gap-2">
        {STATUSES.map((s) => (
          <button
            key={s}
            onClick={() => setFilterStatus(s)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              filterStatus === s
                ? 'bg-indigo-600 text-white'
                : 'bg-white text-gray-600 border hover:bg-gray-50'
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Proposals List */}
      <div className="grid gap-4 sm:grid-cols-1 lg:grid-cols-2">
        {filtered.map((p) => {
          const total      = p.votes.yes + p.votes.no;
          const yesPercent = total > 0 ? Math.round((p.votes.yes / total) * 100) : 0;
          return (
            <div key={p.id} className="rounded-xl bg-white p-5 shadow-sm">
              <div className="mb-2 flex items-start justify-between gap-2">
                <h4 className="font-semibold text-gray-800">{p.title}</h4>
                <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_COLORS[p.status]}`}>
                  {p.status}
                </span>
              </div>
              <p className="mb-3 text-sm text-gray-500">{p.description}</p>
              <div className="flex flex-wrap items-center gap-3 text-xs text-gray-400">
                <span className="rounded bg-gray-100 px-2 py-0.5 text-gray-600">{p.category}</span>
                <span>By {p.author}</span>
                <span>{p.date}</span>
              </div>
              {total > 0 && (
                <div className="mt-3">
                  <div className="mb-1 flex justify-between text-xs text-gray-500">
                    <span>👍 {p.votes.yes} Yes ({yesPercent}%)</span>
                    <span>👎 {p.votes.no} No ({100 - yesPercent}%)</span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-red-200">
                    <div className="h-1.5 rounded-full bg-green-500" style={{ width: `${yesPercent}%` }} />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <p className="mt-8 text-center text-gray-500">No proposals match the selected filter.</p>
      )}
    </div>
  );
}
