import React, { useState, useEffect } from 'react';
import { api } from '../api';

export default function Voting() {
  const [polls,      setPolls]      = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState(null);
  const [activeTab,  setActiveTab]  = useState('Open');
  // Track which option the current user voted on, keyed by poll id
  const [userVotes,  setUserVotes]  = useState({});

  useEffect(() => {
    api.getPolls()
      .then(setPolls)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const filtered = polls.filter((p) => p.status === activeTab);

  const castVote = async (pollId, optionIndex) => {
    if (userVotes[pollId] !== undefined) return; // already voted
    try {
      const updated = await api.castVote(pollId, optionIndex);
      setPolls((prev) => prev.map((p) => (p.id === pollId ? updated : p)));
      setUserVotes((prev) => ({ ...prev, [pollId]: optionIndex }));
    } catch (err) {
      alert(`Vote failed: ${err.message}`);
    }
  };

  if (loading) return <div role="status" className="text-gray-500 py-8 text-center">Loading polls…</div>;
  if (error)   return <div role="alert" className="text-red-500 py-8 text-center">Error: {error}</div>;

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
          const userVote   = userVotes[poll.id] ?? null;
          const hasVoted   = userVote !== null;
          const isClosed   = poll.status === 'Closed';

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
                  const pct        = totalVotes > 0 ? Math.round((option.votes / totalVotes) * 100) : 0;
                  const isSelected = userVote === i;

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
