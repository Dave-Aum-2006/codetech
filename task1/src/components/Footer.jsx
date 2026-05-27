import React from 'react';

export default function Footer() {
  return (
    <footer className="w-full py-6 mt-12 border-t border-slate-200 dark:border-white/5 text-center text-xs text-slate-500 dark:text-slate-400 bg-white/5 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <p>© 2026 GlowDashboard. Made for CodeTech IT Solutions Internship Task 1.</p>
        <div className="flex gap-4">
          <a href="#" className="hover:text-indigo-500 transition">Privacy Policy</a>
          <a href="#" className="hover:text-indigo-500 transition">Terms of Service</a>
          <a href="https://openweathermap.org" target="_blank" rel="noreferrer" className="hover:text-indigo-500 transition">OpenWeather API</a>
          <a href="https://newsapi.org" target="_blank" rel="noreferrer" className="hover:text-indigo-500 transition">News API</a>
        </div>
      </div>
    </footer>
  );
}
