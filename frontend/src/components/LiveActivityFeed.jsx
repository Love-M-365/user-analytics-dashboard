import React from 'react';
import { useSocket } from '../context/SocketContext';
import { MousePointer, Eye, Clock, Hash } from 'lucide-react';

const LiveActivityFeed = () => {
  const { liveEvents } = useSocket();

  return (
    <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 h-[400px] flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          Live Stream
        </h3>
        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md">
          {liveEvents.length} events buffered
        </span>
      </div>

      <div className="flex-1 overflow-y-auto space-y-3 pr-1">
        {liveEvents.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-400 dark:text-slate-600 gap-2">
            <Clock className="w-8 h-8 stroke-1 animate-pulse" />
            <p className="text-xs font-medium">Waiting for incoming events...</p>
          </div>
        ) : (
          liveEvents.map((event, index) => {
            const isClick = event.eventType === 'click';
            const Icon = isClick ? MousePointer : Eye;
            
            return (
              <div
                key={event._id || index}
                className={`p-3 rounded-xl border border-slate-100 dark:border-slate-800/60 bg-slate-50/50 dark:bg-[#1f2937]/30 flex items-center justify-between gap-3 animate-fade-in-down transition-all duration-300 ${
                  index === 0 ? 'ring-2 ring-indigo-500/20 bg-indigo-50/20 dark:bg-indigo-950/10' : ''
                }`}
              >
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className={`p-2 rounded-lg ${
                    isClick 
                      ? 'bg-rose-50 text-rose-500 dark:bg-rose-950/30' 
                      : 'bg-emerald-50 text-emerald-500 dark:bg-emerald-950/30'
                  }`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="overflow-hidden">
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                      {event.pageUrl}
                    </p>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 font-mono truncate">
                      ID: {event.sessionId.substring(0, 8)}...
                    </p>
                  </div>
                </div>

                <div className="text-right flex-shrink-0">
                  <span className="text-[10px] font-bold uppercase tracking-wider block text-slate-400 dark:text-slate-500">
                    {isClick ? 'Click' : 'Page View'}
                  </span>
                  {isClick && event.x && (
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono flex items-center justify-end gap-1">
                      <Hash className="w-2.5 h-2.5" />
                      {event.x},{event.y}
                    </span>
                  )}
                  <span className="text-[9px] text-slate-400 block mt-0.5">
                    {new Date(event.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default LiveActivityFeed;
