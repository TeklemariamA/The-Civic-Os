import React, { useState } from 'react';

const initialPolls = [
  {
    id: 1,
    title: 'Community Park Renovation',
    description: 'Should the city proceed with renovating Riverside Park with new amenities?',
    closes: 'March 12, 2026',
    status: 'Open',
    options: [
      { label: 'Yes, proceed immediately', votes: 142 },
      { label: 'Yes, but reduce the budget', votes: 63 },
      { label: 'No, defer to next year', votes: 38 },
      { label: 'No, cancel the project', votes: 21 },
    ],
    userVote: null,
  },
  {
    id: 2,
    title: 'Downtown Revitalization Plan',
    description: 'Which approach should the city take for revitalizing the downtown area?',
    closes: 'March 15, 2026',
    status: 'Open',
    options: [
      { label: 'Focus on retail and commerce', votes: 88 },
      { label: 'Prioritize green spaces', votes: 105 },
      { label: 'Mixed-use development', votes: 134 },
      { label: 'Historic preservation only', votes: 29 },
    ],
    userVote: null,
  },
  {
    id: 3,
    title: 'School Infrastructure Bond',
    description: 'Do you support issuing a $50 million bond for school infrastructure improvements?',
    closes: 'March 20, 2026',
    status: 'Open',
    options: [
      { label: 'Strongly support', votes: 198 },
      { label: 'Support with conditions', votes: 87 },
      { label: 'Oppose', votes: 44 },
      { label: 'Strongly oppose', votes: 12 },
    ],
    userVote: null,
  },
  {
    id: 4,
    title: 'Transportation Budget 2025',
    description: 'Should the transportation budget be increased by 15% for 2026?',
    closes: 'Feb 28, 2026',
    status: 'Closed',
    options: [
      { label: 'Yes', votes: 95 },
      { label: 'No', votes: 130 },
    ],
    userVote: 0,
  },
];

export default function Voting() {
  const [polls, setPolls] = useState(initialPolls);
  const [activeTab, setActiveTab] = useState('Open');

  const filtered = polls.filter((p) => p.status === activeTab);

  const castVote = (pollId, optionIndex) => {
    setPolls((prev) =>
      prev.map((p) => {
        if (p.id !== pollId || p.userVote !== null || p.status === 'Closed') return p;
        const updatedOptions = p.options.map((o, i) =>
          i === optionIndex ? { ...o, votes: o.votes + 1 } : o
        );
        return { ...p, options: updatedOptions, userVote: optionIndex };
      })
    );
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Voting</h2>
        <p className="text-sm text-gray-500">Participate in active votes and view past results</p>
      </div>

      {/* Tabs */}
      <div className="mb-6 flex gap-2 border-b">
        {['Open', 'Closed'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab}
            <span className="ml-1.5 rounded-full bg-gray-100 px-2 py-0.5 text-xs">
              {polls.filter((p) => p.status === tab).length}
            </span>
          </button>
        ))}
      </div>

      <div className="space-y-6">
        {filtered.map((poll) => {
          const totalVotes = poll.options.reduce((sum, o) => sum + o.votes, 0);
          const hasVoted = poll.userVote !== null;
          const isClosed = poll.status === 'Closed';

          return (
            <div key={poll.id} className="rounded-xl bg-white p-6 shadow-sm">
              <div className="mb-1 flex items-start justify-between gap-2">
                <h3 className="font-semibold text-gray-800 text-lg">{poll.title}</h3>
                <span
                  className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    isClosed ? 'bg-gray-100 text-gray-600' : 'bg-green-100 text-green-700'
                  }`}
                >
                  {poll.status}
                </span>
              </div>
              <p className="mb-1 text-sm text-gray-500">{poll.description}</p>
              <p className="mb-4 text-xs text-gray-400">
                {isClosed ? 'Closed' : 'Closes'}: {poll.closes} &middot; {totalVotes} votes cast
              </p>

              <div className="space-y-3">
                {poll.options.map((option, i) => {
                  const pct = totalVotes > 0 ? Math.round((option.votes / totalVotes) * 100) : 0;
                  const isSelected = poll.userVote === i;

                  return (
                    <div key={i}>
                      {!hasVoted && !isClosed ? (
                        <button
                          onClick={() => castVote(poll.id, i)}
                          className="w-full rounded-lg border-2 border-gray-200 px-4 py-3 text-left text-sm hover:border-indigo-400 hover:bg-indigo-50 transition-colors"
                        >
                          {option.label}
                        </button>
                      ) : (
                        <div
                          className={`rounded-lg border-2 px-4 py-3 ${
                            isSelected ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200 bg-gray-50'
                          }`}
                        >
                          <div className="mb-1.5 flex items-center justify-between text-sm">
                            <span className={isSelected ? 'font-medium text-indigo-700' : 'text-gray-700'}>
                              {isSelected && '✓ '}{option.label}
                            </span>
                            <span className="font-semibold text-gray-700">{pct}%</span>
                          </div>
                          <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-200">
                            <div
                              className={`h-1.5 rounded-full ${isSelected ? 'bg-indigo-500' : 'bg-gray-400'}`}
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          <p className="mt-1 text-xs text-gray-400">{option.votes} votes</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {!hasVoted && !isClosed && (
                <p className="mt-3 text-xs text-gray-400">Click an option to cast your vote.</p>
              )}
              {hasVoted && !isClosed && (
                <p className="mt-3 text-xs text-green-600 font-medium">✓ Your vote has been recorded.</p>
              )}
            </div>
          );
        })}

        {filtered.length === 0 && (
          <p className="text-center text-gray-500 py-8">No {activeTab.toLowerCase()} votes at this time.</p>
        )}
      </div>
    </div>
  );
}
