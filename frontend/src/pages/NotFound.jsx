import React from 'react';
import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
      <div className="text-6xl mb-4">🏛️</div>
      <h2 className="text-4xl font-bold text-gray-800 mb-2">404</h2>
      <p className="text-lg text-gray-500 mb-6">Page not found</p>
      <p className="text-sm text-gray-400 mb-8 max-w-sm">
        The page you are looking for does not exist or has been moved.
      </p>
      <Link
        to="/"
        className="rounded-lg bg-indigo-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-indigo-700"
      >
        Back to Dashboard
      </Link>
    </div>
  );
}
