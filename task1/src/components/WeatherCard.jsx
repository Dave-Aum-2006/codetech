import React from 'react';
import { Wind, Droplets, Gauge, Sun, Star, Navigation } from 'lucide-react';
import { motion } from 'framer-motion';

export default function WeatherCard({ weatherData, isFavorite, onToggleFavorite, onLocate }) {
  const { city, temp, condition, icon, humidity, wind, pressure, uv } = weatherData;

  // Render weather conditions icons or fallback
  const iconUrl = `https://openweathermap.org/img/wn/${icon}@4x.png`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="glass-card rounded-3xl p-6 relative overflow-hidden flex flex-col justify-between h-[340px]"
    >
      {/* City Title & Favorite Action */}
      <div className="flex justify-between items-start z-10">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-extrabold text-slate-800 dark:text-white tracking-tight">{city}</h2>
            <button
              onClick={() => onToggleFavorite(city)}
              className="text-amber-500 hover:scale-110 transition p-1"
              title={isFavorite ? 'Remove from Favorites' : 'Add to Favorites'}
            >
              <Star className="h-5 w-5" fill={isFavorite ? 'currentColor' : 'none'} />
            </button>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
          </p>
        </div>

        <button
          onClick={onLocate}
          className="p-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 dark:border-white/5 text-slate-700 dark:text-slate-200 transition flex items-center gap-1.5 text-xs font-semibold"
          title="Auto-detect current location"
        >
          <Navigation className="h-3.5 w-3.5" />
          <span>Local Weather</span>
        </button>
      </div>

      {/* Main Temperature Displays */}
      <div className="flex items-center gap-4 my-4 z-10">
        <div className="text-6xl font-black tracking-tighter text-slate-800 dark:text-white">
          {temp}°C
        </div>
        <div className="flex items-center gap-1 bg-white/20 dark:bg-white/5 border border-white/30 dark:border-white/5 py-1 px-3 rounded-full text-xs font-bold text-slate-700 dark:text-slate-300">
          <img
            src={iconUrl}
            alt={condition}
            className="w-8 h-8 shrink-0 object-contain"
            onError={(e) => {
              e.target.src = 'https://api.dicebear.com/7.x/shapes/svg?seed=weather';
            }}
          />
          <span>{condition}</span>
        </div>
      </div>

      {/* Grid of weather metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-slate-200 dark:border-white/5 z-10">
        <div className="flex items-center gap-2.5 p-2 bg-white/15 dark:bg-white/2 rounded-2xl border border-white/20 dark:border-white/5">
          <div className="p-2 bg-indigo-500/10 text-indigo-500 rounded-xl">
            <Droplets className="h-4.5 w-4.5" />
          </div>
          <div>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Humidity</p>
            <p className="text-xs font-bold text-slate-800 dark:text-white">{humidity}%</p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 p-2 bg-white/15 dark:bg-white/2 rounded-2xl border border-white/20 dark:border-white/5">
          <div className="p-2 bg-sky-500/10 text-sky-500 rounded-xl">
            <Wind className="h-4.5 w-4.5" />
          </div>
          <div>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Wind Speed</p>
            <p className="text-xs font-bold text-slate-800 dark:text-white">{wind} m/s</p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 p-2 bg-white/15 dark:bg-white/2 rounded-2xl border border-white/20 dark:border-white/5">
          <div className="p-2 bg-emerald-500/10 text-emerald-500 rounded-xl">
            <Gauge className="h-4.5 w-4.5" />
          </div>
          <div>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Pressure</p>
            <p className="text-xs font-bold text-slate-800 dark:text-white">{pressure} hPa</p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 p-2 bg-white/15 dark:bg-white/2 rounded-2xl border border-white/20 dark:border-white/5">
          <div className="p-2 bg-amber-500/10 text-amber-500 rounded-xl">
            <Sun className="h-4.5 w-4.5" />
          </div>
          <div>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">UV Index</p>
            <p className="text-xs font-bold text-slate-800 dark:text-white">{uv} / 10</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
