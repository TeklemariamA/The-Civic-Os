import React from 'react';
import { Link } from 'react-router-dom';

const stats = [
  { label: 'Active Proposals', value: '12', change: '+3 this week', color: 'bg-blue-50 border-blue-200', icon: '📋' },
  { label: 'Open Votes', value: '5', change: '2 closing soon', color: 'bg-yellow-50 border-yellow-200', icon: '🗳️' },
  { label: 'Registered Users', value: '1,284', change: '+47 this month', color: 'bg-green-50 border-green-200', icon: '👥' },
  { label: 'Passed Measures', value: '89', change: 'All time', color: 'bg-purple-50 border-purple-200', icon: '✅' },
];

const recentActivity = [
  { type: 'proposal', text: 'New proposal submitted: "Green Energy Initiative"', time: '2 hours ago', icon: '📋' },
  { type: 'vote', text: 'Vote started: "Community Park Renovation"', time: '5 hours ago', icon: '🗳️' },
  { type: 'user', text: 'New member joined: Sarah Mitchell', time: '1 day ago', icon: '👤' },
  { type: 'passed', text: 'Proposal passed: "Public Library Expansion"', time: '2 days ago', icon: '✅' },
  { type: 'vote', text: 'Vote closed: "Transportation Budget 2025"', time: '3 days ago', icon: '🏁' },
];

const upcomingVotes = [
  { title: 'Community Park Renovation', closes: 'March 12, 2026', participation: 62 },
  { title: 'Downtown Revitalization Plan', closes: 'March 15, 2026', participation: 38 },
  { title: 'School Infrastructure Bond', closes: 'March 20, 2026', participation: 74 },
];

export default function Dashboard() {
  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Dashboard</h2>
        <p className="text-sm text-gray-500">Overview of civic activity and engagement</p>
      </div>

      {/* Stats */}
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className={`rounded-xl border p-5 ${s.color}`}>
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-gray-600">{s.label}</p>
              <span className="text-2xl">{s.icon}</span>
            </div>
            <p className="mt-2 text-3xl font-bold text-gray-800">{s.value}</p>
            <p className="mt-1 text-xs text-gray-500">{s.change}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Recent Activity */}
        <div className="lg:col-span-2">
          <div className="rounded-xl bg-white shadow-sm">
            <div className="border-b px-6 py-4">
              <h3 className="font-semibold text-gray-800">Recent Activity</h3>
            </div>
            <ul className="divide-y">
              {recentActivity.map((item, i) => (
                <li key={i} className="flex items-start gap-3 px-6 py-4">
                  <span className="mt-0.5 text-xl">{item.icon}</span>
                  <div className="flex-1">
                    <p className="text-sm text-gray-700">{item.text}</p>
                    <p className="text-xs text-gray-400">{item.time}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Upcoming Votes */}
        <div>
          <div className="rounded-xl bg-white shadow-sm">
            <div className="border-b px-6 py-4 flex items-center justify-between">
              <h3 className="font-semibold text-gray-800">Upcoming Votes</h3>
              <Link to="/voting" className="text-xs text-indigo-600 hover:underline">View all</Link>
            </div>
            <ul className="divide-y px-6">
              {upcomingVotes.map((vote, i) => (
                <li key={i} className="py-4">
                  <p className="text-sm font-medium text-gray-700">{vote.title}</p>
                  <p className="text-xs text-gray-400">Closes {vote.closes}</p>
                  <div className="mt-2">
                    <div className="mb-1 flex justify-between text-xs text-gray-500">
                      <span>Participation</span>
                      <span>{vote.participation}%</span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-gray-200">
                      <div
                        className="h-1.5 rounded-full bg-indigo-500"
                        style={{ width: `${vote.participation}%` }}
                      />
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-4 rounded-xl bg-indigo-700 p-5 text-white">
            <h4 className="font-semibold">Submit a Proposal</h4>
            <p className="mt-1 text-sm text-indigo-200">
              Have an idea for your community? Start by submitting a proposal.
            </p>
            <Link
              to="/proposals"
              className="mt-3 inline-block rounded-lg bg-white px-4 py-2 text-sm font-medium text-indigo-700 hover:bg-indigo-50"
            >
              Get Started
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
