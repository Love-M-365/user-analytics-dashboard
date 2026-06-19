import React from 'react';

const KPIWidget = ({ title, value, icon: Icon, colorClass, trend }) => {
  return (
    <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm hover:shadow-md hover:scale-[1.02] transition-all duration-300 group flex items-start justify-between">
      <div className="space-y-2">
        <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">{title}</span>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {value.toLocaleString()}
          </span>
          {trend && (
            <span className="text-xs font-semibold text-emerald-500 bg-emerald-50 dark:bg-emerald-950/30 px-1.5 py-0.5 rounded-md">
              {trend}
            </span>
          )}
        </div>
      </div>

      <div className={`p-3 rounded-xl ${colorClass} bg-opacity-10 dark:bg-opacity-20 flex items-center justify-center text-current transition-colors duration-300`}>
        <Icon className="w-6 h-6" />
      </div>
    </div>
  );
};

export default KPIWidget;
