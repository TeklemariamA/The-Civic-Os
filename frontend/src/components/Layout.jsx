import React, { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';

const navGroups = [
  {
    label: 'Governance',
    items: [
      { to: '/',          label: 'Dashboard',         icon: '🏛️' },
      { to: '/proposals', label: 'Proposals',          icon: '📋' },
      { to: '/voting',    label: 'Voting',             icon: '🗳️' },
    ],
  },
  {
    label: 'Community',
    items: [
      { to: '/users',     label: 'Users',              icon: '👥' },
      { to: '/bounties',  label: 'Bounties',           icon: '🏅' },
      { to: '/justice',   label: 'Justice',            icon: '⚖️' },
    ],
  },
  {
    label: 'Privacy & Identity',
    items: [
      { to: '/zk-audit',  label: 'ZK-Audit',           icon: '🔐' },
      { to: '/consent',   label: 'Consent Forms',      icon: '📝' },
      { to: '/identity',  label: 'Sovereign Identity', icon: '🪪' },
    ],
  },
];

const linkClass = ({ isActive }) =>
  `flex items-center gap-3 rounded-lg px-4 py-2.5 mb-0.5 text-sm font-medium transition-colors ${
    isActive
      ? 'bg-indigo-700 text-white'
      : 'text-indigo-200 hover:bg-indigo-800 hover:text-white'
  }`;

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-30 w-64 transform bg-indigo-900 text-white transition-transform duration-300 lg:static lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 border-b border-indigo-700 px-6 py-5">
          <span className="text-2xl">🏛️</span>
          <div>
            <h1 className="text-xl font-bold tracking-wide">Civic OS</h1>
            <p className="text-xs text-indigo-300">Civic Engagement Platform</p>
          </div>
        </div>

        {/* Nav groups */}
        <nav className="mt-4 px-3 overflow-y-auto flex-1" style={{ maxHeight: 'calc(100vh - 160px)' }}>
          {navGroups.map((group) => (
            <div key={group.label} className="mb-4">
              <p className="px-4 py-1 text-xs font-semibold uppercase tracking-widest text-indigo-400">
                {group.label}
              </p>
              {group.items.map(({ to, label, icon }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={to === '/'}
                  className={linkClass}
                  onClick={() => setSidebarOpen(false)}
                >
                  <span className="text-lg">{icon}</span>
                  {label}
                </NavLink>
              ))}
            </div>
          ))}
        </nav>

        {/* User footer */}
        <div className="absolute bottom-0 left-0 right-0 border-t border-indigo-700 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-600 text-sm font-bold">
              CX
            </div>
            <div>
              <p className="text-sm font-medium">Civic User</p>
              <p className="text-xs text-indigo-300">Administrator</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top bar */}
        <header className="flex items-center justify-between bg-white px-6 py-4 shadow-sm">
          <button
            className="rounded-md p-2 text-gray-500 hover:bg-gray-100 lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <div className="hidden text-sm text-gray-500 lg:block">
            Empowering communities through transparent governance
          </div>
          <div className="flex items-center gap-2 text-sm text-indigo-700 font-medium">
            <span className="h-2 w-2 rounded-full bg-green-400"></span>
            Connected
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
