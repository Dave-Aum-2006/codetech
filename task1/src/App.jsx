import React, { useState } from 'react';
import { ThemeProvider } from './context/ThemeContext.jsx';
import Navbar from './components/Navbar.jsx';
import Footer from './components/Footer.jsx';
import WeatherDashboard from './pages/WeatherDashboard.jsx';
import NewsDashboard from './pages/NewsDashboard.jsx';

export default function App() {
  const [activeTab, setActiveTab] = useState('weather');

  return (
    <ThemeProvider>
      <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 transition-colors duration-300">
        
        {/* Navigation Glass Panel */}
        <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

        {/* Content View Panel */}
        <main className="flex-1 w-full max-w-7xl mx-auto z-10">
          {activeTab === 'weather' ? <WeatherDashboard /> : <NewsDashboard />}
        </main>

        {/* Footer info panel */}
        <Footer />
      </div>
    </ThemeProvider>
  );
}
