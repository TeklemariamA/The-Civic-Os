import React, { useState, useEffect } from 'react';
import { api } from '../api';

const CATEGORY_COLORS = {
  Privacy:        'bg-purple-100 text-purple-800',
  Identity:       'bg-blue-100 text-blue-800',
  Governance:     'bg-indigo-100 text-indigo-800',
  Communications: 'bg-teal-100 text-teal-800',
};

export default function Consent() {
  const [forms,   setForms]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);
  const [signing, setSigning] = useState(null);

  useEffect(() => {
    api.getConsentForms()
      .then(setForms)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const handleSign = async (id) => {
    setSigning(id);
    try {
      const updated = await api.signConsent(id);
      setForms((prev) => prev.map((f) => (f.id === id ? updated : f)));
    } catch (err) {
      alert(`Failed to sign: ${err.message}`);
    } finally {
      setSigning(null);
    }
  };

  if (loading) return <div role="status" className="text-gray-500 py-8 text-center">Loading consent forms…</div>;
  if (error)   return <div role="alert"  className="text-red-500 py-8 text-center">Error: {error}</div>;

  const signedCount  = forms.filter((f) => f.signed_by_me).length;
  const pendingReqd  = forms.filter((f) => f.required && !f.signed_by_me).length;
  const allSigned    = signedCount === forms.length && forms.length > 0;

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Consent Forms</h2>
        <p className="text-sm text-gray-500">Review and sign required and optional consent agreements</p>
      </div>

      {/* Stats */}
      <div className="mb-6 grid grid-cols-3 gap-4">
        <div className="rounded-xl border bg-purple-50 border-purple-200 p-4 text-center">
          <p className="text-2xl font-bold text-gray-800">{signedCount}</p>
          <p className="text-xs text-gray-500">Signed by You</p>
        </div>
        <div className="rounded-xl border bg-red-50 border-red-200 p-4 text-center">
          <p className="text-2xl font-bold text-gray-800">{pendingReqd}</p>
          <p className="text-xs text-gray-500">Required Pending</p>
        </div>
        <div className="rounded-xl border bg-gray-50 border-gray-200 p-4 text-center">
          <p className="text-2xl font-bold text-gray-800">{forms.length}</p>
          <p className="text-xs text-gray-500">Total Forms</p>
        </div>
      </div>

      {/* Banners */}
      {pendingReqd > 0 && (
        <div className="mb-5 rounded-xl bg-red-50 border border-red-200 px-5 py-3 flex items-center gap-3">
          <span className="text-lg">⚠️</span>
          <p className="text-sm text-red-700">
            You have <strong>{pendingReqd}</strong> required consent form{pendingReqd > 1 ? 's' : ''} pending your signature.
          </p>
        </div>
      )}
      {allSigned && (
        <div className="mb-5 rounded-xl bg-green-50 border border-green-200 px-5 py-3 flex items-center gap-3">
          <span className="text-lg">✅</span>
          <p className="text-sm text-green-700 font-medium">All consent forms signed. Thank you!</p>
        </div>
      )}

      {/* Forms */}
      <div className="space-y-4">
        {forms.map((form) => (
          <div
            key={form.id}
            className={`rounded-xl bg-white p-5 shadow-sm border-l-4 ${
              form.signed_by_me ? 'border-green-400' : form.required ? 'border-red-400' : 'border-gray-200'
            }`}
          >
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap mb-2">
                  <h4 className="font-semibold text-gray-800">{form.title}</h4>
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${CATEGORY_COLORS[form.category] || 'bg-gray-100 text-gray-700'}`}>
                    {form.category}
                  </span>
                  {form.required && (
                    <span className="rounded-full bg-red-100 text-red-700 px-2.5 py-0.5 text-xs font-medium">Required</span>
                  )}
                  <span className="text-xs text-gray-400">v{form.version}</span>
                </div>
                <p className="text-sm text-gray-600">{form.description}</p>
                <p className="mt-2 text-xs text-gray-400">{form.signatories.toLocaleString()} signatories</p>
              </div>
              <div className="shrink-0">
                {form.signed_by_me ? (
                  <span className="flex items-center gap-1.5 rounded-full bg-green-100 text-green-700 px-4 py-2 text-sm font-medium">
                    ✓ Signed
                  </span>
                ) : (
                  <button
                    onClick={() => handleSign(form.id)}
                    disabled={signing === form.id}
                    className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-60"
                  >
                    {signing === form.id ? 'Signing…' : 'Sign'}
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
