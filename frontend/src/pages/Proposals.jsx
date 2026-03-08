import React, { useState } from 'react';

const STATUS_COLORS = {
  Active: 'bg-green-100 text-green-800',
  Draft: 'bg-gray-100 text-gray-700',
  Passed: 'bg-blue-100 text-blue-800',
  Rejected: 'bg-red-100 text-red-700',
  'Under Review': 'bg-yellow-100 text-yellow-800',
};

const initialProposals = [
  {
    id: 1,
    title: 'Green Energy Initiative',
    category: 'Environment',
    status: 'Active',
    author: 'Jane Cooper',
    date: 'Mar 5, 2026',
    description: 'Transition all municipal buildings to renewable energy sources by 2028.',
    votes: { yes: 142, no: 38 },
  },
  {
    id: 2,
    title: 'Community Park Renovation',
    category: 'Infrastructure',
    status: 'Active',
    author: 'Tom Harris',
    date: 'Mar 3, 2026',
    description: 'Renovate Riverside Park with new playground equipment, walking paths, and lighting.',
    votes: { yes: 205, no: 21 },
  },
  {
    id: 3,
    title: 'Public Library Expansion',
    category: 'Education',
    status: 'Passed',
    author: 'Linda Park',
    date: 'Feb 18, 2026',
    description: 'Expand the downtown library with a new wing dedicated to digital resources and youth programs.',
    votes: { yes: 310, no: 62 },
  },
  {
    id: 4,
    title: 'Downtown Revitalization Plan',
    category: 'Urban Development',
    status: 'Under Review',
    author: 'Mark Spencer',
    date: 'Mar 1, 2026',
    description: 'Redevelop the downtown core to attract businesses and improve pedestrian accessibility.',
    votes: { yes: 88, no: 44 },
  },
  {
    id: 5,
    title: 'Transportation Budget 2026',
    category: 'Transportation',
    status: 'Rejected',
    author: 'Rachel Nguyen',
    date: 'Feb 10, 2026',
    description: 'Allocate additional budget for road maintenance and public transit improvements.',
    votes: { yes: 95, no: 130 },
  },
  {
    id: 6,
    title: 'School Safety Cameras',
    category: 'Education',
    status: 'Draft',
    author: 'Carlos Rivera',
    date: 'Mar 7, 2026',
    description: 'Install updated security camera systems across all public schools.',
    votes: { yes: 0, no: 0 },
  },
];

export default function Proposals() {
  const [proposals, setProposals] = useState(initialProposals);
  const [filterStatus, setFilterStatus] = useState('All');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', category: '', description: '' });

  const statuses = ['All', 'Active', 'Draft', 'Under Review', 'Passed', 'Rejected'];
  const categories = ['Environment', 'Infrastructure', 'Education', 'Urban Development', 'Transportation', 'Public Safety', 'Other'];

  const filtered = filterStatus === 'All' ? proposals : proposals.filter((p) => p.status === filterStatus);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.category || !form.description.trim()) return;
    const newProposal = {
      id: proposals.length + 1,
      title: form.title,
      category: form.category,
      status: 'Draft',
      author: 'Civic User',
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      description: form.description,
      votes: { yes: 0, no: 0 },
    };
    setProposals([newProposal, ...proposals]);
    setForm({ title: '', category: '', description: '' });
    setShowForm(false);
  };

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
                  {categories.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  rows={4}
                  placeholder="Describe your proposal..."
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
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
                >
                  Submit Proposal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Status Filter */}
      <div className="mb-5 flex flex-wrap gap-2">
        {statuses.map((s) => (
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
          const total = p.votes.yes + p.votes.no;
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
