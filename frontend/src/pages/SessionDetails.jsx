import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import Navbar from '../components/Navbar';
import { ChevronLeft, Copy, Check, MousePointer, Eye, Clock, Activity, Monitor, Trash } from 'lucide-react';

const SessionDetails = () => {
  const { sessionId } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sessionData, setSessionData] = useState({ events: [] });
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchSessionDetails = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await api.get(`/api/sessions/${sessionId}`);
        setSessionData(response.data);
      } catch (err) {
        console.error('Failed to load session details:', err);
        setError('Session details could not be found or connection failed.');
      } finally {
        setLoading(false);
      }
    };

    fetchSessionDetails();
  }, [sessionId]);

  const handleCopy = () => {
    navigator.clipboard.writeText(sessionId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getSessionMetrics = () => {
    const events = sessionData.events;
    if (events.length === 0) return { duration: 0, first: null, last: null, total: 0 };
    
    const first = new Date(events[0].timestamp);
    const last = new Date(events[events.length - 1].timestamp);
    const duration = Math.round((last.getTime() - first.getTime()) / 1000);

    return {
      duration,
      first: first.toLocaleString(),
      last: last.toLocaleString(),
      total: events.length,
      pageViews: events.filter(e => e.eventType === 'page_view').length,
      clicks: events.filter(e => e.eventType === 'click').length
    };
  };

  const formatDuration = (seconds) => {
    if (seconds < 60) return `${seconds}s`;
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const metrics = getSessionMetrics();

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-slate-50 dark:bg-[#0b0f19]">
      <Navbar title="User Journey Inspector" />

      <main className="flex-grow p-8 space-y-6 max-w-4xl w-full mx-auto">
        {/* Back Link */}
        <Link 
          to="/sessions" 
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
        >
          <ChevronLeft className="w-4.5 h-4.5" />
          Back to Sessions
        </Link>

        {/* Error State */}
        {error && (
          <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-800/50 text-rose-650 font-semibold">
            {error}
          </div>
        )}

        {loading ? (
          <div className="space-y-6 animate-pulse">
            <div className="bg-white dark:bg-[#111827] h-32 rounded-2xl border border-slate-200 dark:border-slate-800"></div>
            <div className="bg-white dark:bg-[#111827] h-96 rounded-2xl border border-slate-200 dark:border-slate-800"></div>
          </div>
        ) : !error && (
          <>
            {/* Session KPI Summary Card */}
            <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800/80 pb-4">
                <div className="space-y-1 overflow-hidden">
                  <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block">Session ID</span>
                  <div className="flex items-center gap-2">
                    <h3 className="font-mono text-sm text-indigo-600 dark:text-indigo-400 font-semibold truncate">{sessionId}</h3>
                    <button
                      onClick={handleCopy}
                      className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-350 transition"
                      title="Copy Session ID"
                    >
                      {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex gap-4 flex-shrink-0 text-xs">
                  <div className="bg-slate-50 dark:bg-slate-900/60 p-2.5 rounded-xl border border-slate-150 dark:border-slate-850 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-slate-400" />
                    <div>
                      <span className="text-slate-400 block text-[9px] font-bold uppercase">Duration</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">{formatDuration(metrics.duration)}</span>
                    </div>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-900/60 p-2.5 rounded-xl border border-slate-150 dark:border-slate-850 flex items-center gap-2">
                    <Activity className="w-4 h-4 text-slate-400" />
                    <div>
                      <span className="text-slate-400 block text-[9px] font-bold uppercase">Total Events</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">{metrics.total}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom statistics sub row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs font-semibold">
                <div>
                  <span className="text-slate-400 block text-[10px] mb-0.5">First Activity</span>
                  <span className="text-slate-700 dark:text-slate-300 font-bold">{metrics.first}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] mb-0.5">Last Activity</span>
                  <span className="text-slate-700 dark:text-slate-300 font-bold">{metrics.last}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] mb-0.5">Page Views</span>
                  <span className="text-emerald-500 font-bold">{metrics.pageViews}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] mb-0.5">Clicks Recorded</span>
                  <span className="text-rose-500 font-bold">{metrics.clicks}</span>
                </div>
              </div>
            </div>

            {/* Session timeline user journey */}
            <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-2xl p-8 shadow-sm">
              <h3 className="font-bold text-slate-900 dark:text-white mb-8">Timeline Journey</h3>

              <div className="relative pl-8 border-l-2 border-slate-100 dark:border-slate-800 space-y-8">
                {sessionData.events.map((event, index) => {
                  const isClick = event.eventType === 'click';
                  
                  return (
                    <div key={event._id || index} className="relative group">
                      {/* Timeline icon pointer */}
                      <span className={`absolute -left-[45px] top-1.5 w-[26px] h-[26px] rounded-full border-4 border-white dark:border-[#111827] flex items-center justify-center text-white shadow transition-all duration-300 ${
                        isClick 
                          ? 'bg-rose-500 group-hover:bg-rose-600' 
                          : 'bg-indigo-500 group-hover:bg-indigo-650'
                      }`}>
                        {isClick ? (
                          <MousePointer className="w-2.5 h-2.5 fill-current" />
                        ) : (
                          <Eye className="w-3 h-3" />
                        )}
                      </span>

                      {/* Timeline box layout */}
                      <div className="p-4 rounded-xl border border-slate-100 dark:border-slate-800/80 bg-slate-50/40 dark:bg-slate-900/35 flex flex-col md:flex-row justify-between gap-4 transition hover:bg-slate-50 dark:hover:bg-slate-900/60 hover:shadow-sm">
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-mono font-extrabold px-2 py-0.5 rounded bg-slate-150 dark:bg-slate-800 text-slate-600 dark:text-slate-350">
                              {event.pageUrl}
                            </span>
                            <span className={`text-[10px] font-bold uppercase tracking-wider ${
                              isClick ? 'text-rose-500' : 'text-indigo-500'
                            }`}>
                              {isClick ? 'Click Event' : 'Page Visited'}
                            </span>
                          </div>

                          {/* Render specifics for click actions */}
                          {isClick && (
                            <div className="space-y-1">
                              <p className="text-xs text-slate-800 dark:text-slate-300">
                                Target element: <span className="font-mono font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/20 px-1.5 py-0.5 rounded">{event.element || 'Anonymous Element'}</span>
                              </p>
                              <p className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center gap-3">
                                <span className="font-mono">Coordinates: X: {event.x}px, Y: {event.y}px</span>
                                <span className="flex items-center gap-1">
                                  <Monitor className="w-3 h-3" />
                                  {event.vw}x{event.vh} viewport
                                </span>
                              </p>
                            </div>
                          )}
                        </div>

                        {/* Timestamp */}
                        <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 self-start md:self-center">
                          {new Date(event.timestamp).toLocaleTimeString()} ({new Date(event.timestamp).toLocaleDateString()})
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default SessionDetails;
