import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../api';

const CATEGORY_COLORS = {
  Infrastructure: 'bg-blue-100 text-blue-800',
  Environment:    'bg-green-100 text-green-800',
  'Public Health':'bg-red-100 text-red-800',
  Education:      'bg-yellow-100 text-yellow-800',
  Other:          'bg-gray-100 text-gray-700',
};

const STATUS_COLORS = {
  open:     'bg-emerald-100 text-emerald-800',
  claimed:  'bg-yellow-100 text-yellow-800',
  verified: 'bg-blue-100 text-blue-800',
};

const CATEGORIES = ['Infrastructure', 'Environment', 'Public Health', 'Education', 'Other'];

export default function Bounties() {
  const [bounties,   setBounties]   = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState(null);
  const [showForm,   setShowForm]   = useState(false);
  const [form,       setForm]       = useState({ description: '', category: '', base_reward: '', urgency_coeff: '0.05' });
  const [submitting, setSubmitting] = useState(false);
  const [claiming,   setClaiming]   = useState(null);

  const load = useCallback(() => {
    api.getBounties()
      .then(setBounties)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
    // Refresh every 30s, but only when the tab is visible, to avoid
    // unnecessary server load when the user has navigated away.
    const interval = setInterval(() => {
      if (!document.hidden) load();
    }, 30000);
    return () => clearInterval(interval);
  }, [load]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.description.trim() || !form.category || !form.base_reward) return;
    setSubmitting(true);
    try {
      const created = await api.createBounty({
        description:   form.description,
        category:      form.category,
        base_reward:   parseFloat(form.base_reward),
        urgency_coeff: parseFloat(form.urgency_coeff),
      });
      setBounties([...bounties, created]);
      setForm({ description: '', category: '', base_reward: '', urgency_coeff: '0.05' });
      setShowForm(false);
    } catch (err) {
      alert(`Failed to post bounty: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleClaim = async (id) => {
    setClaiming(id);
    try {
      const updated = await api.claimBounty(id);
      setBounties((prev) => prev.map((b) => (b.id === id ? updated : b)));
    } catch (err) {
      alert(`Failed to claim bounty: ${err.message}`);
    } finally {
      setClaiming(null);
    }
  };

  if (loading) return <div role="status" className="text-gray-500 py-8 text-center">Loading bounties…</div>;
  if (error)   return <div role="alert"  className="text-red-500 py-8 text-center">Error: {error}</div>;

  const open   = bounties.filter((b) => b.status === 'open');
  const claimed = bounties.filter((b) => b.status !== 'open');

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Bounties</h2>
          <p className="text-sm text-gray-500">Community tasks with time-escalating rewards</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-medium text-white hover:bg-amber-600"
        >
          + Post Bounty
        </button>
      </div>

      {/* Stats */}
      <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-xl border bg-amber-50 border-amber-200 p-4 text-center">
          <p className="text-2xl font-bold text-gray-800">{open.length}</p>
          <p className="text-xs text-gray-500">Open</p>
        </div>
        <div className="rounded-xl border bg-yellow-50 border-yellow-200 p-4 text-center">
          <p className="text-2xl font-bold text-gray-800">{claimed.length}</p>
          <p className="text-xs text-gray-500">Claimed / Verified</p>
        </div>
        <div className="rounded-xl border bg-green-50 border-green-200 p-4 text-center">
          <p className="text-2xl font-bold text-gray-800">
            ${open.reduce((s, b) => s + b.current_reward, 0).toFixed(0)}
          </p>
          <p className="text-xs text-gray-500">Total Open Rewards</p>
        </div>
        <div className="rounded-xl border bg-blue-50 border-blue-200 p-4 text-center">
          <p className="text-2xl font-bold text-gray-800">{bounties.length}</p>
          <p className="text-xs text-gray-500">Total Bounties</p>
        </div>
      </div>

      {/* Post Bounty Modal */}
      {showForm && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="w-full max-w-lg rounded-xl bg-white shadow-xl">
            <div className="border-b px-6 py-4">
              <h3 className="text-lg font-semibold text-gray-800">Post New Bounty</h3>
            </div>
            <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Task Description</label>
                <textarea
                  className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                  rows={3}
                  placeholder="Describe the civic task…"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select
                    className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    required
                  >
                    <option value="">Select…</option>
                    {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Base Reward ($)</label>
                  <input
                    type="number"
                    min="1"
                    step="0.01"
                    className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                    placeholder="e.g. 100"
                    value={form.base_reward}
                    onChange={(e) => setForm({ ...form, base_reward: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Urgency Coefficient <span className="text-xs text-gray-400">(reward growth rate per minute, e.g. 0.05)</span>
                </label>
                <input
                  type="number"
                  min="0"
                  max="1"
                  step="0.01"
                  className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                  value={form.urgency_coeff}
                  onChange={(e) => setForm({ ...form, urgency_coeff: e.target.value })}
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)}
                  className="rounded-lg border px-4 py-2 text-sm text-gray-600 hover:bg-gray-50" disabled={submitting}>
                  Cancel
                </button>
                <button type="submit" disabled={submitting}
                  className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-medium text-white hover:bg-amber-600 disabled:opacity-60">
                  {submitting ? 'Posting…' : 'Post Bounty'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bounty List */}
      <div className="space-y-4">
        {bounties.map((b) => (
          <div key={b.id} className="rounded-xl bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${CATEGORY_COLORS[b.category] || CATEGORY_COLORS.Other}`}>
                    {b.category}
                  </span>
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_COLORS[b.status] || STATUS_COLORS.open}`}>
                    {b.status.charAt(0).toUpperCase() + b.status.slice(1)}
                  </span>
                </div>
                <p className="text-sm font-medium text-gray-800">{b.description}</p>
                <p className="mt-1 text-xs text-gray-400">Posted by {b.posted_by}</p>
                {b.claimed_by && (
                  <p className="mt-1 text-xs text-yellow-600">Claimed by {b.claimed_by}</p>
                )}
              </div>
              <div className="text-right shrink-0">
                <p className="text-2xl font-bold text-amber-600">${b.current_reward.toFixed(2)}</p>
                <p className="text-xs text-gray-400">
                  Base ${b.base_reward} · +{(b.urgency_coeff * 100).toFixed(0)}%/min
                </p>
                {b.status === 'open' && (
                  <button
                    onClick={() => handleClaim(b.id)}
                    disabled={claiming === b.id}
                    className="mt-2 rounded-lg bg-amber-500 px-4 py-1.5 text-xs font-medium text-white hover:bg-amber-600 disabled:opacity-60"
                  >
                    {claiming === b.id ? 'Claiming…' : 'Claim Bounty'}
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {bounties.length === 0 && (
        <p className="text-center text-gray-500 py-8">No bounties posted yet.</p>
      )}
    </div>
  );
}
