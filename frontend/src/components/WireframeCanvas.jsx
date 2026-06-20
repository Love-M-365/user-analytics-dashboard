import React, { useRef, useState } from 'react';
import { ZoomIn, ZoomOut, Maximize2, MousePointer, Info } from 'lucide-react';

// Definitions for mock layouts to simulate the tracked pages visually
const PAGE_LAYOUTS = {
  '/home': (
    <div className="w-full h-full bg-slate-900 text-slate-100 flex flex-col font-sans relative overflow-hidden select-none">
      {/* Header */}
      <div className="h-16 px-8 border-b border-slate-800 flex items-center justify-between bg-slate-950/60 backdrop-blur">
        <span className="font-extrabold text-indigo-400">InsightFlow</span>
        <div className="flex gap-6 text-sm text-slate-400">
          <span>Features</span>
          <span className="text-white border-b-2 border-indigo-500 pb-1">Pricing</span>
          <span>Docs</span>
        </div>
        <button className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-xs font-semibold">Sign In</button>
      </div>
      {/* Hero Body */}
      <div className="flex-1 flex flex-col items-center justify-center text-center px-4 relative">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.15)_0,transparent_60%)] pointer-events-none" />
        <span className="text-[10px] uppercase font-bold tracking-widest text-indigo-400 bg-indigo-950/50 px-3 py-1 rounded-full border border-indigo-800/50 mb-4">
          Now in Public Beta
        </span>
        <h1 className="text-4xl font-extrabold tracking-tight max-w-2xl bg-gradient-to-r from-white via-slate-200 to-slate-500 bg-clip-text text-transparent">
          Understand Your User Journey in Real-Time
        </h1>
        <p className="text-slate-400 text-sm mt-3 max-w-lg">
          Track visitor behaviors, map visual heatmaps, and optimize conversion funnels without slowing down your site.
        </p>
        <button className="mt-8 px-6 py-3 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-sm font-bold shadow-lg shadow-indigo-500/20">
          Get Started for Free
        </button>
      </div>
      {/* Footer banner */}
      <div className="h-16 bg-slate-950 border-t border-slate-850 text-slate-500 text-[10px] flex items-center justify-center">
        © 2026 InsightFlow. All rights reserved.
      </div>
    </div>
  ),
  '/features': (
    <div className="w-full h-full bg-slate-950 text-slate-100 flex flex-col font-sans select-none">
      <div className="h-16 px-8 border-b border-slate-800 flex items-center justify-between">
        <span className="font-extrabold text-indigo-400">InsightFlow</span>
        <span className="text-xs text-slate-500">Features Page</span>
      </div>
      <div className="flex-1 p-8 grid grid-cols-3 gap-6 items-center">
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl h-48 flex flex-col justify-between">
          <div className="w-10 h-10 rounded-lg bg-indigo-600/20 text-indigo-400 flex items-center justify-center font-bold">1</div>
          <h3 className="font-bold text-sm">Security Vault</h3>
          <p className="text-xs text-slate-400">GDPR and CCPA compliant client-side data hashing.</p>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl h-48 flex flex-col justify-between">
          <div className="w-10 h-10 rounded-lg bg-emerald-650/20 text-emerald-450 flex items-center justify-center font-bold">2</div>
          <h3 className="font-bold text-sm">Speed Optimization</h3>
          <p className="text-xs text-slate-400">Ultra-lightweight 1.2KB tracking script. No main-thread blocking.</p>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl h-48 flex flex-col justify-between">
          <div className="w-10 h-10 rounded-lg bg-purple-600/20 text-purple-400 flex items-center justify-center font-bold">3</div>
          <h3 className="font-bold text-sm">Heatmap Overlays</h3>
          <p className="text-xs text-slate-400">Aggregate mouse events and view device-scaled canvas reports.</p>
        </div>
      </div>
    </div>
  ),
  '/pricing': (
    <div className="w-full h-full bg-slate-900 text-slate-100 flex flex-col font-sans select-none">
      <div className="h-16 px-8 border-b border-slate-800 flex items-center justify-between">
        <span className="font-extrabold text-indigo-400">InsightFlow</span>
        <span className="text-xs text-slate-500">Flexible Plans</span>
      </div>
      <div className="flex-grow flex flex-col items-center justify-center p-8">
        <div className="flex items-center gap-3 bg-slate-950 p-1.5 rounded-lg border border-slate-800 mb-8">
          <span className="px-3 py-1 bg-indigo-600 rounded-md text-xs font-semibold">Annual Billing</span>
          <span className="px-3 py-1 text-slate-400 text-xs font-medium">Monthly Billing</span>
        </div>
        <div className="grid grid-cols-2 gap-8 w-full max-w-3xl">
          <div className="bg-slate-950 border border-slate-800 p-8 rounded-2xl flex flex-col justify-between h-[320px]">
            <div>
              <h3 className="text-lg font-bold">Pro Plan</h3>
              <p className="text-xs text-slate-400 mt-1">For growing startups & scale-ups.</p>
              <div className="mt-4 text-3xl font-extrabold">$49<span className="text-sm font-normal text-slate-500">/mo</span></div>
            </div>
            <button className="w-full py-2.5 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-xs font-bold transition-all">Subscribe to Pro Plan</button>
          </div>
          <div className="bg-slate-950 border border-slate-800 p-8 rounded-2xl flex flex-col justify-between h-[320px]">
            <div>
              <h3 className="text-lg font-bold">Enterprise</h3>
              <p className="text-xs text-slate-400 mt-1">For custom volume & high SLAs.</p>
              <div className="mt-4 text-3xl font-extrabold">Custom</div>
            </div>
            <button className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 border border-slate-700 text-xs font-bold transition-all">Contact Sales</button>
          </div>
        </div>
      </div>
    </div>
  ),
  '/docs': (
    <div className="w-full h-full bg-slate-950 text-slate-100 flex font-sans select-none">
      <div className="w-48 border-r border-slate-800 bg-slate-950 flex flex-col p-4 space-y-3 text-xs text-slate-400">
        <span className="font-extrabold text-indigo-400 text-sm mb-4">Documentation</span>
        <span className="text-indigo-400 font-semibold bg-slate-900 p-2 rounded-lg">Introduction Guide</span>
        <span className="p-2">Installation</span>
        <span className="p-2">API Enpoints</span>
        <span className="p-2">Client SDK</span>
      </div>
      <div className="flex-1 p-8 flex flex-col justify-between">
        <div>
          <h2 className="text-xl font-bold">Quick Start Guide</h2>
          <p className="text-xs text-slate-400 mt-2 leading-relaxed">
            Copy the tracking snippet and paste it right before the closing body tag of your website.
          </p>
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl font-mono text-[10px] text-indigo-350 mt-6 relative">
            <span>{`<script src="tracker.js" data-host="api"></script>`}</span>
            <button className="absolute right-3 top-3 bg-slate-800 hover:bg-slate-750 text-[9px] px-2 py-1 rounded">Copy SDK script</button>
          </div>
        </div>
      </div>
    </div>
  ),
  '/dashboard': (
    <div className="w-full h-full bg-slate-950 text-slate-100 flex font-sans select-none">
      <div className="w-16 border-r border-slate-800 flex flex-col items-center py-6 space-y-6 bg-slate-950">
        <div className="w-8 h-8 rounded bg-indigo-600 flex items-center justify-center font-bold text-xs">IF</div>
        <div className="w-8 h-8 rounded hover:bg-slate-900 flex items-center justify-center text-slate-500">⚙️</div>
      </div>
      <div className="flex-1 p-6 flex flex-col">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-lg font-bold">Analytics Panel</h2>
            <span className="text-[10px] text-slate-500">Live operational data flow</span>
          </div>
          <button className="px-3 py-1.5 bg-indigo-500 text-xs font-semibold rounded-lg">Export PDF Report</button>
        </div>
        <div className="grid grid-cols-2 gap-4 flex-grow">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
            <span className="text-[10px] text-slate-500 font-bold uppercase">Average Session Time</span>
            <span className="text-2xl font-bold">4m 12s</span>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
            <span className="text-[10px] text-slate-500 font-bold uppercase">Conversion Rate</span>
            <span className="text-2xl font-bold">3.24%</span>
          </div>
        </div>
      </div>
    </div>
  ),
  '/settings': (
    <div className="w-full h-full bg-slate-950 text-slate-100 flex flex-col font-sans select-none">
      <div className="h-14 px-6 border-b border-slate-800 flex items-center justify-between">
        <span className="font-bold text-indigo-400">Settings</span>
        <button className="bg-indigo-600 text-xs px-3 py-1 rounded font-semibold">Save Preferences</button>
      </div>
      <div className="flex-grow p-6 flex gap-6">
        <div className="w-1/3 space-y-4">
          <div className="text-[10px] text-slate-500 font-bold">OPTIONS</div>
          <div className="text-xs bg-slate-900 p-2.5 rounded border border-slate-850">Toggle Dark Mode</div>
          <div className="text-xs p-2.5 text-slate-400">Profile Details</div>
        </div>
        <div className="flex-grow bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
          <div className="text-xs text-slate-400">Username</div>
          <div className="h-9 bg-slate-950 border border-slate-800 rounded px-3 flex items-center text-xs text-slate-300">User Field</div>
        </div>
      </div>
    </div>
  ),
  '/checkout': (
    <div className="w-full h-full bg-slate-900 text-slate-100 flex flex-col font-sans select-none items-center justify-center">
      <div className="bg-slate-950 border border-slate-800 p-8 rounded-2xl w-80 space-y-6">
        <h3 className="font-bold text-sm text-center">Complete Payment</h3>
        <div className="space-y-2">
          <label className="text-[10px] text-slate-500 font-semibold">Card Details</label>
          <div className="h-9 bg-slate-900 border border-slate-800 rounded px-3 flex items-center text-xs text-slate-400">Credit Card</div>
        </div>
        <button className="w-full py-2 bg-indigo-500 text-xs font-bold rounded-lg mt-4 shadow-lg shadow-indigo-500/20">Complete Purchase</button>
      </div>
    </div>
  )
};

const WireframeCanvas = ({ pageUrl, clicks, dotSize = 18 }) => {
  const containerRef = useRef(null);
  const [zoom, setZoom] = useState(1);
  const [hoveredClick, setHoveredClick] = useState(null);

  // Standard tracking dimensions for this mock canvas
  const canvasWidth = 1440;
  const canvasHeight = 900;

  const handleZoomIn = () => setZoom(z => Math.min(z + 0.15, 2.0));
  const handleZoomOut = () => setZoom(z => Math.max(z - 0.15, 0.4));
  const handleZoomReset = () => setZoom(1);

  // Fallback to home layout if not found
  const pageLayout = PAGE_LAYOUTS[pageUrl] || PAGE_LAYOUTS['/home'];

  return (
    <div className="flex flex-col flex-1 h-full min-h-0 bg-slate-950/30 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden relative">
      {/* Floating Canvas Controls */}
      <div className="absolute top-4 right-4 z-20 flex items-center gap-1.5 bg-white/95 dark:bg-[#111827]/95 border border-slate-200 dark:border-slate-800 shadow-xl rounded-xl p-1.5 backdrop-blur">
        <button 
          onClick={handleZoomOut} 
          className="p-2 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition"
          title="Zoom Out"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <span className="text-[10px] font-extrabold text-slate-600 dark:text-slate-400 min-w-[40px] text-center">
          {Math.round(zoom * 100)}%
        </span>
        <button 
          onClick={handleZoomIn} 
          className="p-2 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition"
          title="Zoom In"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <div className="w-[1px] h-4 bg-slate-200 dark:bg-slate-800 mx-1" />
        <button 
          onClick={handleZoomReset} 
          className="p-2 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition"
          title="Reset Zoom"
        >
          <Maximize2 className="w-4 h-4" />
        </button>
      </div>

      {/* Floating Click Tooltip Info */}
      {hoveredClick && (
        <div className="absolute bottom-4 left-4 z-20 bg-white/95 dark:bg-[#111827]/95 border border-slate-200 dark:border-slate-800 shadow-2xl rounded-2xl p-4 backdrop-blur max-w-sm flex gap-3 animate-fade-in">
          <div className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/20 text-rose-500 flex items-center justify-center self-start">
            <MousePointer className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">
              {hoveredClick.element || 'Unknown Element'}
            </h4>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
              Coordinates: <span className="font-semibold text-slate-700 dark:text-slate-300">{hoveredClick.x}x, {hoveredClick.y}y</span>
            </p>
            <p className="text-[10px] text-slate-500 dark:text-slate-400">
              Recorded on: <span className="font-semibold">{hoveredClick.vw}x{hoveredClick.vh} viewport</span>
            </p>
            <p className="text-[9px] text-slate-400 mt-1">
              {new Date(hoveredClick.timestamp).toLocaleString()}
            </p>
          </div>
        </div>
      )}

      {!hoveredClick && (
        <div className="absolute bottom-4 left-4 z-20 flex items-center gap-1.5 bg-slate-900/60 text-slate-300 text-[10px] px-3 py-1.5 rounded-full backdrop-blur pointer-events-none">
          <Info className="w-3.5 h-3.5" />
          Hover over dots to view element selector paths.
        </div>
      )}

      {/* Canvas Viewport */}
      <div 
        ref={containerRef}
        className="flex-1 overflow-auto bg-slate-950 flex items-start justify-start p-10 cursor-grab active:cursor-grabbing"
      >
        <div 
          className="relative rounded-2xl overflow-hidden shadow-2xl flex-shrink-0 origin-top-left transition-transform duration-100 border border-slate-800"
          style={{ 
            width: `${canvasWidth}px`, 
            height: `${canvasHeight}px`,
            transform: `scale(${zoom})`
          }}
        >
          {/* Base Layout */}
          {pageLayout}

          {/* Clicks Heatmap Overlay */}
          <div className="absolute inset-0 z-10 pointer-events-auto">
            {clicks.map((click, idx) => {
              // Normalize coordinates to standard canvas dimensions
              // Fallback to canvas sizes if vw/vh not recorded
              const origVW = click.vw || canvasWidth;
              const origVH = click.vh || canvasHeight;
              
              const pctX = (click.x / origVW) * 100;
              const pctY = (click.y / origVH) * 100;

              return (
                <div
                  key={idx}
                  className="absolute rounded-full bg-rose-500/60 dark:bg-rose-500/70 border border-white/20 heat-dot cursor-pointer transition hover:scale-150 hover:bg-rose-450 hover:ring-4 hover:ring-rose-400/30 z-20"
                  style={{
                    left: `${pctX}%`,
                    top: `${pctY}%`,
                    width: `${dotSize}px`,
                    height: `${dotSize}px`,
                    transform: 'translate(-50%, -50%)',
                    boxShadow: '0 0 12px rgba(239, 68, 68, 0.9), 0 0 24px rgba(239, 68, 68, 0.4)'
                  }}
                  onMouseEnter={() => setHoveredClick(click)}
                  onMouseLeave={() => setHoveredClick(null)}
                />
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WireframeCanvas;
export { PAGE_LAYOUTS };
