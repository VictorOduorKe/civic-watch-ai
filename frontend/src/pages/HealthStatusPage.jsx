import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getHealthStatus } from '../services/api';

export default function HealthStatusPage() {
  const [loading, setLoading] = useState(true);
  const [backendStatus, setBackendStatus] = useState('Checking...');
  const [databaseStatus, setDatabaseStatus] = useState('Checking...');
  const [message, setMessage] = useState('');
  const [lastChecked, setLastChecked] = useState(null);

  async function checkHealth() {
    setLoading(true);
    try {
      const result = await getHealthStatus();
      if (result.connected && result.data?.success) {
        setBackendStatus('Connected');
        setDatabaseStatus(result.data.database === 'connected' ? 'Connected' : 'Disconnected');
        setMessage(result.data.message || 'CivicWatch AI Kenya API is running');
      } else {
        setBackendStatus(result.status === 503 ? 'Connected' : 'Disconnected');
        setDatabaseStatus(result.data?.database || 'Disconnected');
        setMessage(result.data?.message || 'Backend API unreachable');
      }
    } catch (err) {
      setBackendStatus('Disconnected');
      setDatabaseStatus('Disconnected');
      setMessage('Unable to contact backend API');
    } finally {
      setLoading(false);
      setLastChecked(new Date().toLocaleTimeString());
    }
  }

  useEffect(() => {
    checkHealth();
  }, []);

  return (
    <main className="min-h-screen bg-neutral-100 flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-lg bg-white border border-neutral-300 rounded p-6 sm:p-8">
        {/* Header */}
        <header className="border-b border-neutral-200 pb-4 mb-6">
          <h1 className="text-xl sm:text-2xl font-bold text-neutral-900 tracking-tight">
            CivicWatch AI Kenya
          </h1>
          <p className="text-sm font-medium text-neutral-600 mt-1">
            Development Environment — Milestone 0
          </p>
        </header>

        {/* Status List */}
        <section aria-label="System Status" className="space-y-4">
          {/* Frontend */}
          <div className="flex items-center justify-between py-2 border-b border-neutral-100">
            <span className="font-semibold text-neutral-800">Frontend:</span>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded text-sm font-semibold bg-green-100 text-green-800">
              Running
            </span>
          </div>

          {/* Backend API */}
          <div className="flex items-center justify-between py-2 border-b border-neutral-100">
            <span className="font-semibold text-neutral-800">Backend API:</span>
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded text-sm font-semibold ${
                backendStatus === 'Connected'
                  ? 'bg-green-100 text-green-800'
                  : backendStatus === 'Checking...'
                  ? 'bg-neutral-100 text-neutral-700'
                  : 'bg-rose-100 text-rose-800'
              }`}
            >
              {backendStatus}
            </span>
          </div>

          {/* Database */}
          <div className="flex items-center justify-between py-2 border-b border-neutral-100">
            <span className="font-semibold text-neutral-800">Database:</span>
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded text-sm font-semibold ${
                databaseStatus === 'Connected'
                  ? 'bg-green-100 text-green-800'
                  : databaseStatus === 'Checking...'
                  ? 'bg-neutral-100 text-neutral-700'
                  : 'bg-rose-100 text-rose-800'
              }`}
            >
              {databaseStatus}
            </span>
          </div>
        </section>

        {/* Message / Details */}
        {message && (
          <div className="mt-4 p-3 bg-neutral-50 border border-neutral-200 rounded text-xs text-neutral-700 font-mono break-all">
            {message}
          </div>
        )}

        {/* Actions & Metadata */}
        <footer className="mt-6 pt-4 border-t border-neutral-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-neutral-500">
          <Link to="/" className="text-navy-900 font-bold hover:text-gold-600 hover:underline">
            ← Return to Landing Page
          </Link>
          <div className="flex items-center gap-3">
            <span>Last checked: {lastChecked || 'Never'}</span>
            <button
              type="button"
              onClick={checkHealth}
              disabled={loading}
              className="px-4 py-1.5 bg-navy-900 text-white font-medium rounded hover:bg-navy-950 border-b-2 border-gold-500 disabled:opacity-50 text-sm focus:outline-none focus:ring-2 focus:ring-navy-800"
            >
              {loading ? 'Checking...' : 'Refresh Status'}
            </button>
          </div>
        </footer>
      </div>
    </main>
  );
}
