import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { useSocket } from '../context/SocketContext';
import { useTheme } from '../context/ThemeContext';
import Navbar from '../components/Navbar';
import KPIWidget from '../components/KPIWidget';
import LiveActivityFeed from '../components/LiveActivityFeed';
import { CardSkeleton, ChartSkeleton } from '../components/SkeletonLoader';
import { EventsOverTimeChart, TopPagesChart, DistributionChart } from '../components/DashboardCharts';
import { Users, BarChart2, Eye, MousePointer, Calendar, RefreshCcw } from 'lucide-react';

const Dashboard = () => {
  const { darkMode } = useTheme();
  const { liveEvents } = useSocket();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    kpis: { totalSessions: 0, totalEvents: 0, pageViews: 0, clicks: 0 },
    topPages: [],
    eventsOverTime: [],
    distribution: []
  });

  // Date Filters
  const [dateRange, setDateRange] = useState('7d'); // '7d', '14d', '30d', 'custom'
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const fetchOverview = async () => {
    try {
      setLoading(true);
      setError(null);

      // Determine date ranges based on selection
      let startStr = '';
      let endStr = new Date().toISOString();

      if (dateRange !== 'custom') {
        const start = new Date();
        const days = dateRange === '7d' ? 7 : dateRange === '14d' ? 14 : 30;
        start.setDate(start.getDate() - days);
        startStr = start.toISOString();
      } else {
        startStr = startDate ? new Date(startDate).toISOString() : '';
        endStr = endDate ? new Date(endDate).toISOString() : '';
      }

      const params = {};
      if (startStr) params.startDate = startStr;
      if (endStr) params.endDate = endStr;

      const response = await api.get('/api/analytics/overview', { params });
      setStats(response.data);
    } catch (err) {
      console.error('Failed to load dashboard overview data:', err);
      setError('Could not fetch analytics. Ensure backend server and MongoDB are running.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOverview();
  }, [dateRange, startDate, endDate]);

  // Hook into real-time socket events to update counts live!
  useEffect(() => {
    if (liveEvents.length > 0) {
      const latestEvent = liveEvents[0];
      const isClick = latestEvent.eventType === 'click';

      setStats(prev => {
        // 1. Update KPIs
        const updatedKpis = { ...prev.kpis };
        updatedKpis.totalEvents += 1;
        if (isClick) {
          updatedKpis.clicks += 1;
        } else {
          updatedKpis.pageViews += 1;
        }

        // 2. Event type distribution updates
        const updatedDistribution = prev.distribution.map(d => {
          if (isClick && d.name === 'Clicks') {
            return { ...d, value: d.value + 1 };
          }
          if (!isClick && d.name === 'Page Views') {
            return { ...d, value: d.value + 1 };
          }
          return d;
        });

        // 3. Top pages updates
        let pageFound = false;
        const updatedTopPages = prev.topPages.map(p => {
          if (p.pageUrl === latestEvent.pageUrl) {
            pageFound = true;
            return {
              ...p,
              count: p.count + 1,
              clicks: isClick ? p.clicks + 1 : p.clicks,
              pageViews: !isClick ? p.pageViews + 1 : p.pageViews
            };
          }
          return p;
        });

        if (!pageFound) {
          updatedTopPages.push({
            pageUrl: latestEvent.pageUrl,
            count: 1,
            clicks: isClick ? 1 : 0,
            pageViews: !isClick ? 1 : 0
          });
        }
        updatedTopPages.sort((a, b) => b.count - a.count);

        // 4. Over time updates
        const eventDateStr = new Date(latestEvent.timestamp).toISOString().split('T')[0];
        let dateFound = false;
        const updatedOverTime = prev.eventsOverTime.map(item => {
          if (item.date === eventDateStr) {
            dateFound = true;
            return {
              ...item,
              clicks: isClick ? item.clicks + 1 : item.clicks,
              pageViews: !isClick ? item.pageViews + 1 : item.pageViews
            };
          }
          return item;
        });

        if (!dateFound) {
          updatedOverTime.push({
            date: eventDateStr,
            clicks: isClick ? 1 : 0,
            pageViews: !isClick ? 1 : 0
          });
        }
        updatedOverTime.sort((a, b) => new Date(a.date) - new Date(b.date));

        return {
          ...prev,
          kpis: updatedKpis,
          distribution: updatedDistribution,
          topPages: updatedTopPages.slice(0, 10),
          eventsOverTime: updatedOverTime
        };
      });
    }
  }, [liveEvents]);

  const themeMode = darkMode ? 'dark' : 'light';

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-slate-50 dark:bg-[#0b0f19]">
      <Navbar title="Analytics Dashboard" />

      <main className="flex-grow p-8 space-y-8 max-w-7xl w-full mx-auto">
        {/* Toolbar & Filters */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex flex-wrap items-center gap-2">
            {['7d', '14d', '30d', 'custom'].map((range) => (
              <button
                key={range}
                onClick={() => setDateRange(range)}
                className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
                  dateRange === range
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20'
                    : 'bg-white dark:bg-[#111827] text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                {range === '7d' ? 'Last 7 Days' : range === '14d' ? 'Last 14 Days' : range === '30d' ? 'Last 30 Days' : 'Custom Range'}
              </button>
            ))}
          </div>

          {dateRange === 'custom' && (
            <div className="flex items-center gap-2 bg-white dark:bg-[#111827] p-2 rounded-xl border border-slate-200 dark:border-slate-800">
              <Calendar className="w-4 h-4 text-slate-400" />
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="text-xs bg-transparent text-slate-700 dark:text-slate-350 focus:outline-none"
              />
              <span className="text-slate-400 text-xs">-</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="text-xs bg-transparent text-slate-700 dark:text-slate-350 focus:outline-none"
              />
            </div>
          )}

          <button
            onClick={fetchOverview}
            className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-all flex items-center gap-2"
            title="Refresh Data"
          >
            <RefreshCcw className="w-4 h-4" />
          </button>
        </div>

        {/* Error State */}
        {error && (
          <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-800/50 text-rose-600 dark:text-rose-450 text-sm font-semibold flex items-center justify-between">
            <span>{error}</span>
            <button onClick={fetchOverview} className="underline text-xs">Retry</button>
          </div>
        )}

        {/* KPI Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => <CardSkeleton key={i} />)
          ) : (
            <>
              <KPIWidget
                title="Total Sessions"
                value={stats.kpis.totalSessions}
                icon={Users}
                colorClass="bg-indigo-500 text-indigo-500"
                trend="+8.2%"
              />
              <KPIWidget
                title="Total Events"
                value={stats.kpis.totalEvents}
                icon={BarChart2}
                colorClass="bg-purple-500 text-purple-500"
                trend="+12.4%"
              />
              <KPIWidget
                title="Page Views"
                value={stats.kpis.pageViews}
                icon={Eye}
                colorClass="bg-emerald-500 text-emerald-500"
                trend="+10.1%"
              />
              <KPIWidget
                title="Total Clicks"
                value={stats.kpis.clicks}
                icon={MousePointer}
                colorClass="bg-rose-500 text-rose-500"
                trend="+15.8%"
              />
            </>
          )}
        </div>

        {/* Visual Charts & Logs Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Events Time Series Chart */}
          <div className="lg:col-span-2">
            {loading ? (
              <ChartSkeleton />
            ) : (
              <EventsOverTimeChart data={stats.eventsOverTime} theme={themeMode} />
            )}
          </div>

          {/* Live Action Ticker Stream */}
          <div>
            <LiveActivityFeed />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Top page rank bar diagram */}
          <div className="lg:col-span-2">
            {loading ? (
              <ChartSkeleton />
            ) : (
              <TopPagesChart data={stats.topPages} theme={themeMode} />
            )}
          </div>

          {/* Action Mix distribution pie diagram */}
          <div>
            {loading ? (
              <ChartSkeleton />
            ) : (
              <DistributionChart data={stats.distribution} theme={themeMode} />
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
