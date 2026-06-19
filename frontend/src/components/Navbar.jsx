import React from 'react';
import DarkModeToggle from './DarkModeToggle';
import { useSocket } from '../context/SocketContext';
import { Activity } from 'lucide-react';

const Navbar = ({ title }) => {
  const { socket } = useSocket();
  const isConnected = socket?.connected;

  return (
    <header className="bg-white/80 dark:bg-[#0f172a]/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 h-20 px-8 flex items-center justify-between sticky top-0 z-30">
      <div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">{title}</h2>
      </div>

      <div className="flex items-center gap-4">
        {/* Real-time Indicator */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-xs font-semibold">
          <span className="relative flex h-2 w-2">
            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
              isConnected ? 'bg-emerald-400' : 'bg-rose-400'
            }`}></span>
            <span className={`relative inline-flex rounded-full h-2 w-2 ${
              isConnected ? 'bg-emerald-500' : 'bg-rose-500'
            }`}></span>
          </span>
          <span className="text-slate-600 dark:text-slate-400">
            {isConnected ? 'Real-time Live' : 'Disconnected'}
          </span>
        </div>

        {/* Dark Mode */}
        <DarkModeToggle />
      </div>
    </header>
  );
};

export default Navbar;
