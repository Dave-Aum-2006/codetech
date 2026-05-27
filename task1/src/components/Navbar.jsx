import React from 'react';
import { useTheme } from '../context/ThemeContext.jsx';
import { CloudSun, Newspaper, Sun, Moon } from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab }) {
  const { theme, toggleTheme } = useTheme();

  return (
    <nav className="sticky top-0 z-40 w-full dashboard-glass border-b border-white/10 px-6 py-4 flex items-center justify-between backdrop-blur-md">
      <div className="flex items-center gap-2.5">
        <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-500 to-violet-600 text-white shadow-lg shadow-indigo-500/20">
          <CloudSun className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-lg font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
            GlowDashboard
          </h1>
          <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Live Weather & News</p>
        </div>
      </div>

      <div className="flex items-center gap-2 md:gap-4">
        <button
          onClick={() => setActiveTab('weather')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition ${
            activeTab === 'weather'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/10'
              : 'text-slate-600 dark:text-slate-300 hover:bg-white/10 hover:text-slate-950 dark:hover:text-white'
          }`}
        >
          <CloudSun className="h-4.5 w-4.5" />
          <span className="hidden sm:inline">Weather</span>
        </button>

        <button
          onClick={() => setActiveTab('news')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition ${
            activeTab === 'news'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/10'
              : 'text-slate-600 dark:text-slate-300 hover:bg-white/10 hover:text-slate-950 dark:hover:text-white'
          }`}
        >
          <Newspaper className="h-4.5 w-4.5" />
          <span className="hidden sm:inline">News Portal</span>
        </button>

        <div className="h-6 w-[1px] bg-slate-300 dark:bg-white/10 mx-1" />

        <button
          onClick={toggleTheme}
          className="p-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-indigo-500/10 text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition"
          title="Toggle Theme"
        >
          {theme === 'dark' ? <Sun className="h-4.5 w-4.5" /> : <Moon className="h-4.5 w-4.5" />}
        </button>
      </div>
    </nav>
  );
}
