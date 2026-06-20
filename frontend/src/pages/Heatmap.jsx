import React, { useEffect, useState } from 'react';
import api from '../services/api';
import Navbar from '../components/Navbar';
import WireframeCanvas from '../components/WireframeCanvas';
import { Layout, Sliders, RefreshCw, Eye, MousePointer } from 'lucide-react';

const PAGE_OPTIONS = [
  { value: '/home', label: '/home (Landing Page)' },
  { value: '/features', label: '/features (Features Page)' },
  { value: '/pricing', label: '/pricing (Pricing Plans)' },
  { value: '/docs', label: '/docs (Developer Docs)' },
  { value: '/dashboard', label: '/dashboard (User App Console)' },
  { value: '/settings', label: '/settings (Configuration Panel)' },
  { value: '/checkout', label: '/checkout (Payment Gateway)' }
];

const Heatmap = () => {
  const [selectedPage, setSelectedPage] = useState('/home');
  const [clicks, setClicks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Custom heatmap configurations
  const [dotSize, setDotSize] = useState(18);

  const fetchHeatmapData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.get('/api/heatmap', {
        params: { pageUrl: selectedPage }
      });
      setClicks(response.data.clicks);
    } catch (err) {
      console.error('Error fetching heatmap data:', err);
      setError('Could not retrieve heatmap coordinates. Ensure backend service is reachable.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHeatmapData();
  }, [selectedPage]);

  const handleClearFilters = () => {
    setSelectedPage('/home');
    setDotSize(18);
  };

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-slate-50 dark:bg-[#0b0f19]">
      <Navbar title="Visual Click Heatmaps" />

      <main className="flex-grow p-8 space-y-6 max-w-7xl w-full mx-auto flex flex-col">
        {/* Configurations Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 flex-grow max-w-2xl">
            {/* Page selection dropdown */}
            <div className="flex-1 space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Target Path</label>
              <div className="relative">
                <select
                  value={selectedPage}
                  onChange={(e) => setSelectedPage(e.target.value)}
                  className="w-full pl-3 pr-8 py-2 border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#0f172a]/55 rounded-xl text-sm font-semibold text-slate-850 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 appearance-none transition-all cursor-pointer"
                >
                  {PAGE_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-400">
                  <Layout className="w-4 h-4" />
                </div>
              </div>
            </div>

            {/* Slider to configure dot scale */}
            <div className="w-56 space-y-1.5">
              <div className="flex justify-between items-center text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                <span>Heat Spot Radius</span>
                <span className="font-mono text-indigo-500">{dotSize}px</span>
              </div>
              <div className="flex items-center gap-3.5 h-10">
                <Sliders className="w-4 h-4 text-slate-400 flex-shrink-0" />
                <input
                  type="range"
                  min="10"
                  max="40"
                  value={dotSize}
                  onChange={(e) => setDotSize(parseInt(e.target.value))}
                  className="w-full accent-indigo-650 h-1.5 bg-slate-100 dark:bg-slate-850 rounded-lg appearance-none cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Reset / Controls block */}
          <div className="flex gap-2">
            <button
              onClick={fetchHeatmapData}
              className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
              title="Reload Heatmap Coordinates"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              onClick={handleClearFilters}
              className="px-4 py-2.5 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 bg-white dark:bg-[#111827] hover:bg-slate-50 dark:hover:bg-slate-800 transition"
            >
              Clear Filters
            </button>
          </div>
        </div>

        {/* Info stats details */}
        <div className="flex gap-4 text-xs font-semibold">
          <div className="px-4 py-2 rounded-lg bg-indigo-50/50 dark:bg-indigo-950/20 text-indigo-650 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/30 flex items-center gap-1.5">
            <MousePointer className="w-4 h-4" />
            <span>Total Clicks plotted: <span className="font-extrabold">{clicks.length}</span></span>
          </div>
        </div>

        {/* Error Notification */}
        {error && (
          <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-800/50 text-rose-650 font-semibold">
            {error}
          </div>
        )}

        {/* Interactive canvas visual workspace */}
        <div className="flex-1 min-h-[500px] flex flex-col">
          {loading ? (
            <div className="flex-grow bg-white dark:bg-[#111827] rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center animate-pulse gap-3">
              <RefreshCw className="w-8 h-8 text-indigo-500 stroke-1 animate-spin" />
              <p className="text-xs text-slate-400 font-semibold">Scaling and plotting coordinates...</p>
            </div>
          ) : (
            <WireframeCanvas 
              pageUrl={selectedPage} 
              clicks={clicks} 
              dotSize={dotSize} 
            />
          )}
        </div>
      </main>
    </div>
  );
};

export default Heatmap;
