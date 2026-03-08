import React, { useState } from 'react';

const ROLE_COLORS = {
  Administrator: 'bg-purple-100 text-purple-800',
  Moderator: 'bg-blue-100 text-blue-800',
  Member: 'bg-green-100 text-green-800',
  Observer: 'bg-gray-100 text-gray-600',
};

const initialUsers = [
  { id: 1, name: 'Alice Johnson', email: 'alice@example.com', role: 'Administrator', joined: 'Jan 10, 2025', proposals: 8, votes: 42, active: true },
  { id: 2, name: 'Bob Martinez', email: 'bob@example.com', role: 'Moderator', joined: 'Feb 3, 2025', proposals: 5, votes: 37, active: true },
  { id: 3, name: 'Carol Wang', email: 'carol@example.com', role: 'Member', joined: 'Mar 15, 2025', proposals: 3, votes: 29, active: true },
  { id: 4, name: 'David Kim', email: 'david@example.com', role: 'Member', joined: 'Apr 22, 2025', proposals: 1, votes: 14, active: false },
  { id: 5, name: 'Eva Patel', email: 'eva@example.com', role: 'Moderator', joined: 'May 8, 2025', proposals: 6, votes: 51, active: true },
  { id: 6, name: 'Frank Nguyen', email: 'frank@example.com', role: 'Observer', joined: 'Jun 30, 2025', proposals: 0, votes: 8, active: true },
  { id: 7, name: 'Grace Lee', email: 'grace@example.com', role: 'Member', joined: 'Jul 17, 2025', proposals: 2, votes: 22, active: true },
  { id: 8, name: 'Henry Brown', email: 'henry@example.com', role: 'Member', joined: 'Aug 5, 2025', proposals: 0, votes: 5, active: false },
];

const roles = ['All', 'Administrator', 'Moderator', 'Member', 'Observer'];

export default function Users() {
  const [users, setUsers] = useState(initialUsers);
  const [search, setSearch] = useState('');
  const [filterRole, setFilterRole] = useState('All');
  const [showInvite, setShowInvite] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('Member');
  const [inviteSent, setInviteSent] = useState(false);

  const filtered = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());
    const matchesRole = filterRole === 'All' || u.role === filterRole;
    return matchesSearch && matchesRole;
  });

  const handleInvite = (e) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;
    setInviteSent(true);
    setTimeout(() => {
      setInviteSent(false);
      setShowInvite(false);
      setInviteEmail('');
      setInviteRole('Member');
    }, 2000);
  };

  const toggleActive = (id) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === id ? { ...u, active: !u.active } : u))
    );
  };

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Users</h2>
          <p className="text-sm text-gray-500">Manage community members and their roles</p>
        </div>
        <button
          onClick={() => setShowInvite(true)}
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
        >
          + Invite Member
        </button>
      </div>

      {/* Invite Modal */}
      {showInvite && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="w-full max-w-md rounded-xl bg-white shadow-xl">
            <div className="border-b px-6 py-4">
              <h3 className="text-lg font-semibold text-gray-800">Invite New Member</h3>
            </div>
            <form onSubmit={handleInvite} className="px-6 py-5 space-y-4">
              {inviteSent ? (
                <p className="text-center text-green-600 font-medium py-4">✓ Invitation sent to {inviteEmail}!</p>
              ) : (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                    <input
                      type="email"
                      className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="member@example.com"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                    <select
                      className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      value={inviteRole}
                      onChange={(e) => setInviteRole(e.target.value)}
                    >
                      {['Member', 'Moderator', 'Observer'].map((r) => (
                        <option key={r} value={r}>{r}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => { setShowInvite(false); setInviteEmail(''); }}
                      className="rounded-lg border px-4 py-2 text-sm text-gray-600 hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
                    >
                      Send Invitation
                    </button>
                  </div>
                </>
              )}
            </form>
          </div>
        </div>
      )}

      {/* Search and Filter */}
      <div className="mb-5 flex flex-wrap items-center gap-3">
        <input
          type="text"
          className="rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 w-64"
          placeholder="Search by name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div className="flex flex-wrap gap-2">
          {roles.map((r) => (
            <button
              key={r}
              onClick={() => setFilterRole(r)}
              className={`rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
                filterRole === r
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white text-gray-600 border hover:bg-gray-50'
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Summary */}
      <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {roles.slice(1).map((r) => (
          <div key={r} className="rounded-lg bg-white p-3 shadow-sm text-center">
            <p className="text-xl font-bold text-gray-800">{users.filter((u) => u.role === r).length}</p>
            <p className="text-xs text-gray-500">{r}s</p>
          </div>
        ))}
      </div>

      {/* User Table */}
      <div className="overflow-x-auto rounded-xl bg-white shadow-sm">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Member</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Role</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Joined</th>
              <th className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-500">Proposals</th>
              <th className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-500">Votes</th>
              <th className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-500">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white">
            {filtered.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-sm font-bold text-indigo-700">
                      {user.name.split(' ').map((n) => n[0]).join('')}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-800">{user.name}</p>
                      <p className="text-xs text-gray-400">{user.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${ROLE_COLORS[user.role]}`}>
                    {user.role}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">{user.joined}</td>
                <td className="px-6 py-4 text-center text-sm text-gray-700">{user.proposals}</td>
                <td className="px-6 py-4 text-center text-sm text-gray-700">{user.votes}</td>
                <td className="px-6 py-4 text-center">
                  <button
                    onClick={() => toggleActive(user.id)}
                    className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                      user.active
                        ? 'bg-green-100 text-green-700 hover:bg-green-200'
                        : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                    }`}
                  >
                    {user.active ? 'Active' : 'Inactive'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <p className="py-8 text-center text-gray-500">No users match your search.</p>
        )}
      </div>
    </div>
  );
}
