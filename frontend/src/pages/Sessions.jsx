import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import Navbar from '../components/Navbar';
import { TableRowSkeleton } from '../components/SkeletonLoader';
import { Search, ArrowUpDown, Calendar, Download, ChevronLeft, ChevronRight, Copy, Check, ExternalLink } from 'lucide-react';

const Sessions = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Data State
  const [sessions, setSessions] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, pages: 1 });
  
  // Search & Filter state
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [sortBy, setSortBy] = useState('activity'); // 'activity', 'duration', 'events'
  const [order, setOrder] = useState('desc'); // 'asc', 'desc'
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  
  // UX Copy Feedbacks
  const [copiedId, setCopiedId] = useState(null);

  // Debounce search keyword
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setPagination(prev => ({ ...prev, page: 1 }));
    }, 400);

    return () => clearTimeout(handler);
  }, [search]);

  const fetchSessions = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = {
        page: pagination.page,
        limit: pagination.limit,
        sortBy,
        order,
        search: debouncedSearch
      };

      if (startDate) params.startDate = new Date(startDate).toISOString();
      if (endDate) params.endDate = new Date(endDate).toISOString();

      const response = await api.get('/api/sessions', { params });
      setSessions(response.data.sessions);
      setPagination(response.data.pagination);
    } catch (err) {
      console.error('Error fetching sessions:', err);
      setError('Could not load sessions. Please verify the backend API connection.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, [pagination.page, sortBy, order, debouncedSearch, startDate, endDate]);

  const handleSort = (field) => {
    if (sortBy === field) {
      setOrder(o => o === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setOrder('desc');
    }
    setPagination(p => ({ ...p, page: 1 }));
  };

  const handleCopy = (e, id) => {
    e.stopPropagation(); // Avoid triggering row navigation
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const formatDuration = (seconds) => {
    if (seconds < 60) return `${seconds}s`;
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  // CSV Export Utility
  const exportCSV = () => {
    if (sessions.length === 0) return;

    // Header fields
    const headers = ['Session ID', 'Event Count', 'Duration (seconds)', 'First Activity', 'Last Activity'];
    
    // Rows
    const rows = sessions.map(sess => [
      sess.sessionId,
      sess.eventCount,
      sess.sessionDuration,
      new Date(sess.firstActivity).toISOString(),
      new Date(sess.lastActivity).toISOString()
    ]);

    // Create string
    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `sessions_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link); // Required for FF
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-slate-50 dark:bg-[#0b0f19]">
      <Navbar title="Sessions Analyzer" />

      <main className="flex-grow p-8 space-y-6 max-w-7xl w-full mx-auto">
        {/* Search, Sort and Filter Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm">
          {/* Search bar */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by Session ID or page path..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#0f172a]/55 text-sm text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
            />
          </div>

          {/* Date range filters */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 bg-slate-50 dark:bg-[#0f172a]/55 p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-xs text-slate-650 dark:text-slate-400">
              <Calendar className="w-4 h-4 text-slate-400" />
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="bg-transparent focus:outline-none"
              />
              <span className="text-slate-450">-</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="bg-transparent focus:outline-none"
              />
            </div>

            {/* Export CSV button */}
            <button
              onClick={exportCSV}
              disabled={sessions.length === 0}
              className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all disabled:opacity-50 disabled:pointer-events-none shadow-md shadow-indigo-500/10"
            >
              <Download className="w-4 h-4" />
              Export CSV
            </button>
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-800/50 text-rose-600 dark:text-rose-450 text-sm font-semibold">
            {error}
          </div>
        )}

        {/* Session Data Table */}
        <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-850 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider bg-slate-50/50 dark:bg-slate-900/30">
                  <th className="py-4 px-6">Session ID</th>
                  <th className="py-4 px-6 cursor-pointer select-none hover:text-slate-900 dark:hover:text-white transition" onClick={() => handleSort('events')}>
                    <span className="flex items-center gap-1.5">
                      Events Count
                      <ArrowUpDown className="w-3.5 h-3.5" />
                    </span>
                  </th>
                  <th className="py-4 px-6 cursor-pointer select-none hover:text-slate-900 dark:hover:text-white transition" onClick={() => handleSort('duration')}>
                    <span className="flex items-center gap-1.5">
                      Session Duration
                      <ArrowUpDown className="w-3.5 h-3.5" />
                    </span>
                  </th>
                  <th className="py-4 px-6 cursor-pointer select-none hover:text-slate-900 dark:hover:text-white transition" onClick={() => handleSort('activity')}>
                    <span className="flex items-center gap-1.5">
                      Last Activity
                      <ArrowUpDown className="w-3.5 h-3.5" />
                    </span>
                  </th>
                  <th className="py-4 px-6">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-850 text-sm font-medium">
                {loading ? (
                  Array.from({ length: 6 }).map((_, i) => <TableRowSkeleton key={i} columns={5} />)
                ) : sessions.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-16 text-center text-slate-400 dark:text-slate-650">
                      <div className="flex flex-col items-center gap-2">
                        <Search className="w-8 h-8 stroke-1" />
                        <p className="font-semibold text-slate-600 dark:text-slate-400">No sessions match the filter criteria.</p>
                        <p className="text-xs text-slate-450">Try broadening your search term or date range.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  sessions.map((session) => (
                    <tr
                      key={session.sessionId}
                      onClick={() => navigate(`/sessions/${session.sessionId}`)}
                      className="hover:bg-slate-50/70 dark:hover:bg-[#1f2937]/25 cursor-pointer transition-colors duration-150 group"
                    >
                      {/* Session ID Column */}
                      <td className="py-4.5 px-6 font-mono text-xs text-indigo-650 dark:text-indigo-400 flex items-center gap-2">
                        <span className="truncate max-w-[150px] sm:max-w-xs">{session.sessionId}</span>
                        <button
                          onClick={(e) => handleCopy(e, session.sessionId)}
                          className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-all opacity-0 group-hover:opacity-100"
                          title="Copy Full ID"
                        >
                          {copiedId === session.sessionId ? (
                            <Check className="w-3.5 h-3.5 text-emerald-500" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </td>

                      {/* Event Count Column */}
                      <td className="py-4.5 px-6 font-bold text-slate-900 dark:text-white">
                        {session.eventCount}
                      </td>

                      {/* Duration Column */}
                      <td className="py-4.5 px-6 text-slate-600 dark:text-slate-400">
                        {formatDuration(session.sessionDuration)}
                      </td>

                      {/* Last Activity Column */}
                      <td className="py-4.5 px-6 text-slate-600 dark:text-slate-400 font-medium">
                        {new Date(session.lastActivity).toLocaleString()}
                      </td>

                      {/* Actions Column */}
                      <td className="py-4.5 px-6">
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 dark:text-indigo-400 group-hover:translate-x-1 transition-transform">
                          Inspect
                          <ExternalLink className="w-3 h-3" />
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer */}
          {!loading && sessions.length > 0 && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 dark:border-slate-850">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                Page <span className="font-extrabold text-slate-700 dark:text-slate-200">{pagination.page}</span> of {pagination.pages} ({pagination.total} sessions total)
              </span>

              <div className="flex items-center gap-2">
                <button
                  disabled={pagination.page <= 1}
                  onClick={() => setPagination(p => ({ ...p, page: p.page - 1 }))}
                  className="p-1.5 border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] text-slate-600 dark:text-slate-450 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg disabled:opacity-50 disabled:pointer-events-none transition"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  disabled={pagination.page >= pagination.pages}
                  onClick={() => setPagination(p => ({ ...p, page: p.page + 1 }))}
                  className="p-1.5 border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] text-slate-600 dark:text-slate-450 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg disabled:opacity-50 disabled:pointer-events-none transition"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Sessions;
