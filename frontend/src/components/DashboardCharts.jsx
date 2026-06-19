import React from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell, PieChart, Pie, Legend
} from 'recharts';

const CHART_THEMES = {
  light: {
    grid: '#f1f5f9',
    text: '#64748b',
    tooltipBg: '#ffffff',
    tooltipBorder: '#e2e8f0',
  },
  dark: {
    grid: '#1e293b',
    text: '#94a3b8',
    tooltipBg: '#1e293b',
    tooltipBorder: '#334155',
  }
};

const CustomTooltip = ({ active, payload, label, theme }) => {
  if (active && payload && payload.length) {
    const isDark = theme === 'dark';
    return (
      <div className={`p-3 rounded-xl shadow-lg border text-xs font-semibold ${
        isDark ? 'bg-slate-800 border-slate-700 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
      }`}>
        <p className="mb-1 text-slate-400 font-medium">{label}</p>
        {payload.map((item, index) => (
          <div key={index} className="flex items-center gap-2 mt-0.5">
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
            <span>{item.name}: <span className="font-extrabold">{item.value}</span></span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export const EventsOverTimeChart = ({ data, theme = 'dark' }) => {
  const currentTheme = CHART_THEMES[theme];

  return (
    <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 h-[400px] flex flex-col">
      <div className="mb-4">
        <h3 className="font-bold text-slate-900 dark:text-white">Activity Over Time</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400">Total events split by category</p>
      </div>

      <div className="flex-1 w-full min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorPageViews" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.2}/>
                <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorClicks" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.2}/>
                <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={currentTheme.grid} />
            <XAxis 
              dataKey="date" 
              stroke={currentTheme.text} 
              fontSize={11}
              tickLine={false}
              axisLine={false}
            />
            <YAxis 
              stroke={currentTheme.text} 
              fontSize={11}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip content={<CustomTooltip theme={theme} />} />
            <Area 
              type="monotone" 
              dataKey="pageViews" 
              name="Page Views" 
              stroke="#4f46e5" 
              strokeWidth={2}
              fillOpacity={1} 
              fill="url(#colorPageViews)" 
            />
            <Area 
              type="monotone" 
              dataKey="clicks" 
              name="Clicks" 
              stroke="#f43f5e" 
              strokeWidth={2}
              fillOpacity={1} 
              fill="url(#colorClicks)" 
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export const TopPagesChart = ({ data, theme = 'dark' }) => {
  const currentTheme = CHART_THEMES[theme];
  
  return (
    <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 h-[400px] flex flex-col">
      <div className="mb-4">
        <h3 className="font-bold text-slate-900 dark:text-white">Top Pages</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400">Most active urls by event volume</p>
      </div>

      <div className="flex-1 w-full min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke={currentTheme.grid} />
            <XAxis 
              type="number" 
              stroke={currentTheme.text} 
              fontSize={11}
              tickLine={false}
              axisLine={false}
            />
            <YAxis 
              type="category" 
              dataKey="pageUrl" 
              stroke={currentTheme.text} 
              fontSize={11}
              tickLine={false}
              axisLine={false}
              width={80}
            />
            <Tooltip content={<CustomTooltip theme={theme} />} />
            <Bar dataKey="count" name="Total Actions" radius={[0, 8, 8, 0]}>
              {data.map((entry, index) => {
                // Indigo/purple shade distribution
                const opacity = Math.max(0.4, 1 - index * 0.1);
                return <Cell key={`cell-${index}`} fill="#6366f1" fillOpacity={opacity} />;
              })}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export const DistributionChart = ({ data, theme = 'dark' }) => {
  const COLORS = ['#4f46e5', '#f43f5e'];

  return (
    <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 h-[400px] flex flex-col justify-between">
      <div>
        <h3 className="font-bold text-slate-900 dark:text-white">Action Mix</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400">Share of page views vs clicks</p>
      </div>

      <div className="flex-1 flex items-center justify-center min-h-0">
        <ResponsiveContainer width="100%" height={220}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={85}
              paddingAngle={5}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="space-y-2 mt-4">
        {data.map((entry, index) => (
          <div key={entry.name} className="flex items-center justify-between text-xs font-semibold">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
              <span className="text-slate-600 dark:text-slate-400">{entry.name}</span>
            </div>
            <span className="text-slate-900 dark:text-white font-extrabold">
              {entry.value.toLocaleString()}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
