import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { useTheme } from '../context/ThemeContext.jsx';
import api from '../utils/api.js';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
  PieChart,
  Pie
} from 'recharts';
import {
  Activity,
  BarChart2,
  FileText,
  Settings,
  LogOut,
  Sun,
  Moon,
  Plus,
  Trash2,
  Shield,
  User,
  Clock,
  CheckCircle2,
  Download,
  RefreshCw,
  Layers,
  AlertTriangle,
  ExternalLink
} from 'lucide-react';

export default function DashboardHub() {
  const { user, logout, updateBlockedDomains, updateClassification } = useAuth();
  const { theme, toggleTheme } = useTheme();
  
  const [activeTab, setActiveTab] = useState('dashboard'); // dashboard | reports | settings
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState(null);
  const [report, setReport] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  // Settings states
  const [newBlockedDomain, setNewBlockedDomain] = useState('');
  const [newClassifyDomain, setNewClassifyDomain] = useState('');
  const [newClassifyCategory, setNewClassifyCategory] = useState('productive');
  const [settingsStatus, setSettingsStatus] = useState({ success: null, message: '' });

  const fetchData = async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    setError('');
    try {
      const [statsRes, reportRes] = await Promise.all([
        api.get('/api/activity/stats'),
        api.get('/api/activity/report/weekly')
      ]);
      setStats(statsRes.data);
      setReport(reportRes.data);
    } catch (err) {
      console.error(err);
      setError('Could not connect to the backend server. Make sure it is running.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchData(true);
  };

  const handleAddBlockedDomain = async (e) => {
    e.preventDefault();
    if (!newBlockedDomain.trim()) return;
    
    const domain = newBlockedDomain.trim().toLowerCase();
    const currentList = user?.settings?.blockedDomains || [];
    
    if (currentList.includes(domain)) {
      setSettingsStatus({ success: false, message: 'Domain already in blocklist.' });
      return;
    }

    const updated = [...currentList, domain];
    const res = await updateBlockedDomains(updated);
    if (res.success) {
      setNewBlockedDomain('');
      setSettingsStatus({ success: true, message: 'Blocklist updated successfully.' });
    } else {
      setSettingsStatus({ success: false, message: res.message });
    }
  };

  const handleRemoveBlockedDomain = async (domainToRemove) => {
    const currentList = user?.settings?.blockedDomains || [];
    const updated = currentList.filter(d => d !== domainToRemove);
    const res = await updateBlockedDomains(updated);
    if (res.success) {
      setSettingsStatus({ success: true, message: 'Removed domain from blocklist.' });
    } else {
      setSettingsStatus({ success: false, message: res.message });
    }
  };

  const handleAddClassification = async (e) => {
    e.preventDefault();
    if (!newClassifyDomain.trim()) return;

    const domain = newClassifyDomain.trim().toLowerCase();
    const res = await updateClassification(domain, newClassifyCategory);
    if (res.success) {
      setNewClassifyDomain('');
      setSettingsStatus({ success: true, message: 'Classification saved successfully.' });
      // Refresh statistics since category might affect dashboard calculations
      fetchData(true);
    } else {
      setSettingsStatus({ success: false, message: res.message });
    }
  };

  const formatDuration = (seconds) => {
    if (seconds === 0) return '0m';
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    if (hrs > 0) {
      return `${hrs}h ${mins}m`;
    }
    return `${mins}m`;
  };

  const getFocusDescription = (score) => {
    if (score >= 80) return { title: 'Optimal Focus', desc: 'Incredible! You are highly productive.', color: 'text-indigo-400' };
    if (score >= 60) return { title: 'Good Focus', desc: 'Doing well, keep blocking distractions!', color: 'text-sky-400' };
    if (score >= 40) return { title: 'Moderate Focus', desc: 'Getting sidetracked. Focus up!', color: 'text-amber-400' };
    return { title: 'Highly Distracted', desc: 'Time to restrict unproductive websites.', color: 'text-rose-400' };
  };

  const exportReportPDF = () => {
    // Elegant mock export as styled download
    const reportContent = `
========================================
GLOWTRACKER WEEKLY FOCUS REPORT
Generated on: ${new Date().toLocaleDateString()}
========================================

USER DETAILS:
Username: ${user?.username}
Email: ${user?.email}

PRODUCTIVITY SUMMARY:
Total Focus Score: ${stats?.summary?.focusScore}%
Total Productive Hours: ${report?.totalProductiveHours} hours
Total Distractions Count: ${report?.distractionCount} sites logged

MOST PRODUCTIVE DAY: ${report?.mostProductiveDay}
LEAST PRODUCTIVE DAY: ${report?.leastProductiveDay}

TOP LOGGED DISTRACTIONS:
${(report?.distractions || []).map((d, i) => `${i + 1}. ${d.domain} (${formatDuration(d.duration)})`).join('\n')}

========================================
Stay focused and stay productive!
GlowTracker App - Task 4 Chrome Extension
========================================
`;
    const element = document.createElement("a");
    const file = new Blob([reportContent], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `GlowTracker_Report_${user?.username}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-colors duration-300 font-sans relative overflow-hidden flex">
      {/* Background glow filters */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-br from-indigo-500/10 via-sky-500/5 to-transparent rounded-full blur-[120px] pointer-events-none z-0" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-gradient-to-tr from-purple-500/10 via-pink-500/5 to-transparent rounded-full blur-[120px] pointer-events-none z-0" />

      {/* Sidebar navigation */}
      <aside className="w-64 border-r border-slate-200/50 dark:border-white/5 bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl flex flex-col justify-between p-6 z-10">
        <div>
          {/* Logo */}
          <div className="flex items-center gap-3 mb-10 px-2">
            <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-500 to-sky-500 text-white shadow-lg shadow-indigo-500/20">
              <Activity className="h-5.5 w-5.5 animate-pulse" />
            </div>
            <div>
              <h2 className="text-lg font-black bg-gradient-to-r from-indigo-600 via-purple-600 to-sky-600 dark:from-white dark:via-slate-200 dark:to-slate-400 bg-clip-text text-transparent tracking-tight leading-tight">
                GlowTracker
              </h2>
              <span className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">SaaS Panel</span>
            </div>
          </div>

          {/* Nav Links */}
          <nav className="space-y-1">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition ${
                activeTab === 'dashboard'
                  ? 'bg-gradient-to-r from-indigo-500/10 to-sky-500/10 text-indigo-600 dark:text-indigo-400 border-l-4 border-indigo-500'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100/50 dark:hover:bg-white/5'
              }`}
            >
              <BarChart2 className="h-4.5 w-4.5" />
              <span>Focus Analytics</span>
            </button>

            <button
              onClick={() => setActiveTab('reports')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition ${
                activeTab === 'reports'
                  ? 'bg-gradient-to-r from-indigo-500/10 to-sky-500/10 text-indigo-600 dark:text-indigo-400 border-l-4 border-indigo-500'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100/50 dark:hover:bg-white/5'
              }`}
            >
              <FileText className="h-4.5 w-4.5" />
              <span>Weekly Reports</span>
            </button>

            <button
              onClick={() => setActiveTab('settings')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition ${
                activeTab === 'settings'
                  ? 'bg-gradient-to-r from-indigo-500/10 to-sky-500/10 text-indigo-600 dark:text-indigo-400 border-l-4 border-indigo-500'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100/50 dark:hover:bg-white/5'
              }`}
            >
              <Settings className="h-4.5 w-4.5" />
              <span>Settings & Filter</span>
            </button>
          </nav>
        </div>

        {/* Profile Card & Quick Actions */}
        <div className="space-y-4 pt-4 border-t border-slate-200/50 dark:border-white/5">
          <div className="flex items-center gap-3 px-2">
            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-indigo-400 to-sky-400 flex items-center justify-center text-white font-bold text-sm shadow">
              {user?.username?.substring(0, 2).toUpperCase() || 'US'}
            </div>
            <div className="truncate">
              <h4 className="text-sm font-bold truncate">{user?.username}</h4>
              <p className="text-xs text-slate-400 truncate">{user?.email}</p>
            </div>
          </div>

          <div className="flex gap-2">
            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              className="flex-1 py-2 px-3 rounded-xl border border-slate-200/60 dark:border-white/5 hover:bg-slate-100/50 dark:hover:bg-white/5 text-slate-500 dark:text-slate-400 flex items-center justify-center gap-2 transition text-xs font-semibold"
            >
              {theme === 'dark' ? (
                <>
                  <Sun className="h-4 w-4 text-amber-400" />
                  <span>Light</span>
                </>
              ) : (
                <>
                  <Moon className="h-4 w-4 text-indigo-500" />
                  <span>Dark</span>
                </>
              )}
            </button>

            {/* Logout button */}
            <button
              onClick={logout}
              className="py-2 px-3 rounded-xl border border-red-500/10 dark:border-red-500/20 hover:bg-red-500/10 text-red-500 flex items-center justify-center transition text-xs font-semibold"
              title="Logout"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main dashboard content area */}
      <main className="flex-1 flex flex-col min-h-screen overflow-y-auto px-8 py-8 z-10">
        {/* Upper Dashboard Header Bar */}
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-black tracking-tight">
              {activeTab === 'dashboard' && 'Dashboard Overview'}
              {activeTab === 'reports' && 'Productivity Analysis'}
              {activeTab === 'settings' && 'Tracking Settings'}
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {activeTab === 'dashboard' && 'Monitor website activity logs synced in real-time from extension.'}
              {activeTab === 'reports' && 'Aggregated weekly activity reports and distraction audits.'}
              {activeTab === 'settings' && 'Manage URL filters and classify custom domain productivity rankings.'}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-white/5 transition flex items-center justify-center text-slate-500 dark:text-slate-400 disabled:opacity-50"
              title="Sync Latest Logs"
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin text-indigo-500' : ''}`} />
            </button>
            <div className="px-4 py-2 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm">
              <span className="h-2 w-2 bg-emerald-500 rounded-full animate-ping" />
              <span>Extension Connected</span>
            </div>
          </div>
        </header>

        {/* Dynamic content rendering based on activeTab */}
        <div className="flex-1">
          {error ? (
            <div className="glass-card border border-rose-500/20 p-6 rounded-2xl bg-rose-500/5 max-w-2xl mx-auto text-center flex flex-col items-center gap-3">
              <AlertTriangle className="h-10 w-10 text-rose-500" />
              <h3 className="font-bold text-lg">Server Connection Failed</h3>
              <p className="text-sm text-slate-400">{error}</p>
              <button
                onClick={() => fetchData()}
                className="mt-2 py-2 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-sm transition"
              >
                Retry Connecting
              </button>
            </div>
          ) : loading ? (
            <div className="h-full min-h-[400px] w-full flex items-center justify-center">
              <div className="flex flex-col items-center gap-3">
                <div className="w-10 h-10 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
                <p className="text-sm text-slate-400 font-medium">Crunching usage metrics...</p>
              </div>
            </div>
          ) : (
            <AnimatePresence mode="wait">
              {activeTab === 'dashboard' && (
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  className="space-y-6"
                  key="dashboard"
                >
                  {/* Top Stats Row */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
                    {/* Focus Score speedometer card */}
                    <div className="glass-card rounded-2xl p-6 border border-slate-200/50 dark:border-white/5 flex items-center gap-5 col-span-1 md:col-span-2 relative overflow-hidden">
                      <div className="relative w-28 h-28 flex-shrink-0 flex items-center justify-center">
                        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                          <circle
                            cx="50"
                            cy="50"
                            r="42"
                            className="stroke-slate-200 dark:stroke-white/5 fill-none"
                            strokeWidth="8"
                          />
                          <motion.circle
                            cx="50"
                            cy="50"
                            r="42"
                            className="stroke-indigo-500 fill-none"
                            strokeWidth="8"
                            strokeDasharray={263.8}
                            initial={{ strokeDashoffset: 263.8 }}
                            animate={{ strokeDashoffset: 263.8 - (263.8 * (stats?.summary?.focusScore || 0)) / 100 }}
                            transition={{ duration: 1.2, ease: 'easeOut' }}
                            strokeLinecap="round"
                          />
                        </svg>
                        <div className="absolute flex flex-col items-center">
                          <span className="text-2xl font-black tracking-tight">{stats?.summary?.focusScore}%</span>
                          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Score</span>
                        </div>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Weekly Focus rating</span>
                        <h3 className={`text-lg font-black mt-0.5 ${getFocusDescription(stats?.summary?.focusScore).color}`}>
                          {getFocusDescription(stats?.summary?.focusScore).title}
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                          {getFocusDescription(stats?.summary?.focusScore).desc}
                        </p>
                      </div>
                    </div>

                    {/* Stats Widget: Productive time */}
                    <div className="glass-card rounded-2xl p-6 border border-slate-200/50 dark:border-white/5 flex items-center gap-4">
                      <div className="h-12 w-12 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center flex-shrink-0">
                        <CheckCircle2 className="h-6 w-6" />
                      </div>
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Productive Time</span>
                        <h3 className="text-2xl font-black mt-0.5">{stats?.summary?.productiveHours} hrs</h3>
                        <p className="text-xs text-slate-400 mt-0.5">Core coding & learning</p>
                      </div>
                    </div>

                    {/* Stats Widget: Unproductive time */}
                    <div className="glass-card rounded-2xl p-6 border border-slate-200/50 dark:border-white/5 flex items-center gap-4">
                      <div className="h-12 w-12 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center flex-shrink-0">
                        <AlertTriangle className="h-6 w-6" />
                      </div>
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Unproductive Time</span>
                        <h3 className="text-2xl font-black mt-0.5">{stats?.summary?.unproductiveHours} hrs</h3>
                        <p className="text-xs text-slate-400 mt-0.5">Socials & streaming</p>
                      </div>
                    </div>
                  </div>

                  {/* Core Graphs Grid */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Area Chart: Productivity trends */}
                    <div className="glass-card rounded-2xl p-6 border border-slate-200/50 dark:border-white/5 col-span-1 lg:col-span-2">
                      <div className="flex justify-between items-center mb-6">
                        <div>
                          <h3 className="font-bold text-base">Weekly Log Trend</h3>
                          <p className="text-xs text-slate-400">Time loads in hours across the last 7 days</p>
                        </div>
                        <div className="flex gap-4 text-xs font-semibold">
                          <span className="flex items-center gap-1.5 text-indigo-500">
                            <span className="h-2 w-2 rounded-full bg-indigo-500" />
                            Productive
                          </span>
                          <span className="flex items-center gap-1.5 text-rose-500">
                            <span className="h-2 w-2 rounded-full bg-rose-500" />
                            Unproductive
                          </span>
                        </div>
                      </div>

                      <div className="h-72 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={stats?.trend || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                            <defs>
                              <linearGradient id="colorProd" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2} />
                                <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                              </linearGradient>
                              <linearGradient id="colorUnprod" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.2} />
                                <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'} />
                            <XAxis
                              dataKey="day"
                              tickLine={false}
                              axisLine={false}
                              tick={{ fill: theme === 'dark' ? '#94a3b8' : '#64748b', fontSize: 11 }}
                            />
                            <YAxis
                              tickLine={false}
                              axisLine={false}
                              tick={{ fill: theme === 'dark' ? '#94a3b8' : '#64748b', fontSize: 11 }}
                              label={{ value: 'Hours', angle: -90, position: 'insideLeft', fill: '#94a3b8', fontSize: 11, offset: 0 }}
                            />
                            <Tooltip
                              contentStyle={{
                                backgroundColor: theme === 'dark' ? 'rgba(15, 23, 42, 0.95)' : 'rgba(255,255,255,0.95)',
                                borderColor: theme === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)',
                                borderRadius: '12px',
                                fontSize: '12px',
                                color: theme === 'dark' ? '#fff' : '#000',
                              }}
                            />
                            <Area type="monotone" dataKey="Productive" stroke="#6366f1" strokeWidth={2.5} fillOpacity={1} fill="url(#colorProd)" />
                            <Area type="monotone" dataKey="Unproductive" stroke="#f43f5e" strokeWidth={2.5} fillOpacity={1} fill="url(#colorUnprod)" />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    {/* Bar list / top sites logged */}
                    <div className="glass-card rounded-2xl p-6 border border-slate-200/50 dark:border-white/5 col-span-1 flex flex-col justify-between">
                      <div>
                        <h3 className="font-bold text-base mb-1">Top Logged Domains</h3>
                        <p className="text-xs text-slate-400 mb-6">Highest tracked duration this session</p>

                        <div className="space-y-4.5">
                          {(stats?.topDomains || []).map((item, index) => {
                            const isProductive = item.category === 'productive';
                            const maxDuration = stats.topDomains[0]?.duration || 1;
                            const percentage = Math.round((item.duration / maxDuration) * 100);

                            return (
                              <div key={index} className="space-y-1">
                                <div className="flex justify-between items-center text-xs">
                                  <div className="flex items-center gap-2 font-semibold">
                                    <span className={`h-2 w-2 rounded-full ${isProductive ? 'bg-indigo-500' : item.category === 'unproductive' ? 'bg-rose-500' : 'bg-slate-400'}`} />
                                    <span className="truncate max-w-[140px]" title={item.domain}>{item.domain}</span>
                                  </div>
                                  <span className="text-slate-400 font-medium">{formatDuration(item.duration)}</span>
                                </div>
                                <div className="h-2 w-full bg-slate-100 dark:bg-slate-800/80 rounded-full overflow-hidden">
                                  <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${percentage}%` }}
                                    transition={{ duration: 0.8, ease: 'easeOut' }}
                                    className={`h-full rounded-full ${isProductive ? 'bg-gradient-to-r from-indigo-500 to-sky-500' : item.category === 'unproductive' ? 'bg-gradient-to-r from-rose-500 to-orange-500' : 'bg-slate-400'}`}
                                  />
                                </div>
                              </div>
                            );
                          })}

                          {(!stats?.topDomains || stats.topDomains.length === 0) && (
                            <div className="text-center py-10 text-xs text-slate-400">
                              No domain logs received yet. Start surfing with Chrome to record tracks!
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="pt-4 border-t border-slate-200/50 dark:border-white/5 mt-4 text-[10px] text-slate-400 flex items-center gap-1">
                        <Layers className="h-3 w-3 shrink-0" />
                        <span>Categories dynamically map based on custom filter settings.</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'reports' && (
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  className="space-y-6"
                  key="reports"
                >
                  {/* Highlights Cards Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    <div className="glass-card rounded-2xl p-6 border border-slate-200/50 dark:border-white/5">
                      <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest">Day of Peak Output</span>
                      <h3 className="text-2xl font-black mt-1 text-slate-800 dark:text-slate-100">
                        {report?.mostProductiveDay || 'Wednesday'}
                      </h3>
                      <p className="text-xs text-slate-400 mt-2">
                        You registered the highest productive to unproductive ratio on this day.
                      </p>
                    </div>

                    <div className="glass-card rounded-2xl p-6 border border-slate-200/50 dark:border-white/5">
                      <span className="text-[10px] font-bold text-rose-500 uppercase tracking-widest">Worst Distraction Day</span>
                      <h3 className="text-2xl font-black mt-1 text-slate-800 dark:text-slate-100">
                        {report?.leastProductiveDay || 'Friday'}
                      </h3>
                      <p className="text-xs text-slate-400 mt-2">
                        Distracting browsing durations spiked. Set strict site blockers to limit access.
                      </p>
                    </div>

                    <div className="glass-card rounded-2xl p-6 border border-slate-200/50 dark:border-white/5 flex flex-col justify-between items-start">
                      <div>
                        <span className="text-[10px] font-bold text-sky-500 uppercase tracking-widest">Active Distraction Audits</span>
                        <h3 className="text-2xl font-black mt-1">
                          {report?.distractionCount || 0} Sites Logged
                        </h3>
                      </div>
                      <button
                        onClick={exportReportPDF}
                        className="mt-3 flex items-center gap-1.5 py-2 px-3.5 bg-gradient-to-r from-indigo-500 to-sky-500 hover:from-indigo-600 hover:to-sky-600 text-white rounded-xl text-xs font-semibold shadow shadow-indigo-500/10 transition"
                      >
                        <Download className="h-3.5 w-3.5" />
                        <span>Export Focus Log (.txt)</span>
                      </button>
                    </div>
                  </div>

                  {/* Distractions audit table */}
                  <div className="glass-card rounded-2xl p-6 border border-slate-200/50 dark:border-white/5">
                    <h3 className="font-bold text-base mb-1">Weekly Distraction Log Audits</h3>
                    <p className="text-xs text-slate-400 mb-6">Specific unproductive site durations logged for review</p>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-sm">
                        <thead>
                          <tr className="border-b border-slate-200 dark:border-white/5 text-xs text-slate-400 font-bold uppercase tracking-wider">
                            <th className="pb-3">Domain</th>
                            <th className="pb-3">Classification</th>
                            <th className="pb-3">Tracked Time</th>
                            <th className="pb-3 text-right">Block Recommendation</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                          {(report?.distractions || []).map((d, index) => (
                            <tr key={index} className="hover:bg-slate-500/5 transition">
                              <td className="py-3.5 font-semibold text-slate-700 dark:text-slate-200">{d.domain}</td>
                              <td className="py-3.5">
                                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-rose-500/10 text-rose-500">
                                  Unproductive
                                </span>
                              </td>
                              <td className="py-3.5 font-medium text-slate-500 dark:text-slate-300">{formatDuration(d.duration)}</td>
                              <td className="py-3.5 text-right">
                                <button
                                  onClick={async () => {
                                    const currentList = user?.settings?.blockedDomains || [];
                                    if (!currentList.includes(d.domain)) {
                                      await updateBlockedDomains([...currentList, d.domain]);
                                      setSettingsStatus({ success: true, message: `Added ${d.domain} to blocklist.` });
                                    } else {
                                      setSettingsStatus({ success: false, message: 'Domain already blocked!' });
                                    }
                                  }}
                                  className="text-xs font-semibold text-indigo-500 hover:text-indigo-600 transition"
                                >
                                  Instantly Block Domain
                                </button>
                              </td>
                            </tr>
                          ))}

                          {(!report?.distractions || report.distractions.length === 0) && (
                            <tr>
                              <td colSpan="4" className="text-center py-8 text-xs text-slate-400">
                                Amazing! You logged zero unproductive domains. Excellent tracking habits!
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'settings' && (
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  className="space-y-6"
                  key="settings"
                >
                  {/* Status alert bar */}
                  <AnimatePresence>
                    {settingsStatus.message && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className={`p-3.5 rounded-xl text-xs font-semibold border flex items-center gap-2 ${
                          settingsStatus.success
                            ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                            : 'bg-rose-500/10 border-rose-500/20 text-rose-600 dark:text-rose-400'
                        }`}
                      >
                        <Shield className="h-4.5 w-4.5 shrink-0" />
                        <span className="flex-1">{settingsStatus.message}</span>
                        <button
                          onClick={() => setSettingsStatus({ success: null, message: '' })}
                          className="font-black hover:opacity-80 ml-2"
                        >
                          ✕
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Settings card: Custom Blocklist list & add */}
                    <div className="glass-card rounded-2xl p-6 border border-slate-200/50 dark:border-white/5 space-y-6">
                      <div>
                        <h3 className="font-bold text-base mb-1">Extension Blocklist Controls</h3>
                        <p className="text-xs text-slate-400">
                          These sites will automatically be blocked by the Service Worker and render the custom block page template.
                        </p>
                      </div>

                      <form onSubmit={handleAddBlockedDomain} className="flex gap-2">
                        <input
                          type="text"
                          value={newBlockedDomain}
                          onChange={(e) => setNewBlockedDomain(e.target.value)}
                          placeholder="e.g. facebook.com"
                          className="flex-1 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-xl py-2 px-3 text-sm text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500/50 transition"
                        />
                        <button
                          type="submit"
                          className="py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-sm transition flex items-center gap-1 shadow-md shadow-indigo-600/10"
                        >
                          <Plus className="h-4 w-4" />
                          <span>Add</span>
                        </button>
                      </form>

                      <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                        {(user?.settings?.blockedDomains || []).map((domain, index) => (
                          <div
                            key={index}
                            className="flex justify-between items-center py-2 px-3 bg-slate-500/5 hover:bg-slate-500/8 border border-slate-200/10 dark:border-white/5 rounded-xl text-sm transition"
                          >
                            <span className="font-semibold text-slate-600 dark:text-slate-300">{domain}</span>
                            <button
                              onClick={() => handleRemoveBlockedDomain(domain)}
                              className="text-rose-500 hover:text-rose-600 p-1 hover:bg-rose-500/10 rounded-lg transition"
                              title="Delete filter rule"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        ))}

                        {(!user?.settings?.blockedDomains || user.settings.blockedDomains.length === 0) && (
                          <div className="text-center py-8 text-xs text-slate-400 border border-dashed border-slate-200 dark:border-white/5 rounded-xl">
                            No domains currently blocked. Click block recommendation inside reports or add one above!
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Settings card: custom classifications config */}
                    <div className="glass-card rounded-2xl p-6 border border-slate-200/50 dark:border-white/5 space-y-6">
                      <div>
                        <h3 className="font-bold text-base mb-1">Domain Classifications</h3>
                        <p className="text-xs text-slate-400">
                          Classify domains as productive or unproductive to customize your weekly Focus Score calculations.
                        </p>
                      </div>

                      <form onSubmit={handleAddClassification} className="space-y-4">
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={newClassifyDomain}
                            onChange={(e) => setNewClassifyDomain(e.target.value)}
                            placeholder="e.g. reddit.com"
                            className="flex-1 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-xl py-2 px-3 text-sm text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500/50 transition"
                          />
                          <select
                            value={newClassifyCategory}
                            onChange={(e) => setNewClassifyCategory(e.target.value)}
                            className="bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-xl py-2 px-3 text-sm font-semibold focus:outline-none focus:border-indigo-500/50 transition"
                          >
                            <option value="productive">Productive</option>
                            <option value="unproductive">Unproductive</option>
                            <option value="neutral">Neutral</option>
                          </select>
                        </div>
                        <button
                          type="submit"
                          className="w-full py-2.5 bg-gradient-to-r from-indigo-500 to-sky-500 hover:from-indigo-600 hover:to-sky-600 text-white font-semibold rounded-xl text-sm transition flex items-center justify-center gap-1 shadow-md shadow-indigo-600/10"
                        >
                          <Plus className="h-4 w-4" />
                          <span>Save Classification Rule</span>
                        </button>
                      </form>

                      {/* Display custom classifications */}
                      <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                        {user?.settings?.customClassifications &&
                          Object.keys(user.settings.customClassifications).length > 0 &&
                          Object.entries(user.settings.customClassifications).map(([domain, cat], index) => (
                            <div
                              key={index}
                              className="flex justify-between items-center py-2 px-3 bg-slate-500/5 rounded-xl text-xs"
                            >
                              <span className="font-semibold text-slate-600 dark:text-slate-300">{domain}</span>
                              <span
                                className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                                  cat === 'productive'
                                    ? 'bg-emerald-500/10 text-emerald-500'
                                    : cat === 'unproductive'
                                    ? 'bg-rose-500/10 text-rose-500'
                                    : 'bg-slate-500/10 text-slate-400'
                                }`}
                              >
                                {cat}
                              </span>
                            </div>
                          ))}

                        {(!user?.settings?.customClassifications ||
                          Object.keys(user.settings.customClassifications).length === 0) && (
                          <div className="text-center py-8 text-xs text-slate-400 border border-dashed border-slate-200 dark:border-white/5 rounded-xl">
                            Default global classifications active. Add an override above!
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          )}
        </div>
      </main>
    </div>
  );
}
