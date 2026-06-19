import React from 'react';

export const CardSkeleton = () => (
  <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 flex justify-between items-center animate-pulse">
    <div className="space-y-3 w-2/3">
      <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/2"></div>
      <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded w-3/4"></div>
    </div>
    <div className="w-12 h-12 rounded-xl bg-slate-200 dark:bg-slate-800"></div>
  </div>
);

export const ChartSkeleton = () => (
  <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 h-80 flex flex-col justify-between animate-pulse">
    <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/4"></div>
    <div className="flex-1 flex items-end gap-4 mt-6">
      <div className="h-1/3 bg-slate-200 dark:bg-slate-800 rounded w-full"></div>
      <div className="h-2/3 bg-slate-200 dark:bg-slate-800 rounded w-full"></div>
      <div className="h-1/2 bg-slate-200 dark:bg-slate-800 rounded w-full"></div>
      <div className="h-5/6 bg-slate-200 dark:bg-slate-800 rounded w-full"></div>
      <div className="h-2/5 bg-slate-200 dark:bg-slate-800 rounded w-full"></div>
    </div>
  </div>
);

export const TableRowSkeleton = ({ columns = 4 }) => (
  <tr className="animate-pulse border-b border-slate-100 dark:border-slate-800">
    {Array.from({ length: columns }).map((_, i) => (
      <td key={i} className="py-4 px-6">
        <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-3/4"></div>
      </td>
    ))}
  </tr>
);
