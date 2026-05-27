import React, { useState, useEffect } from 'react';
import { fetchWeatherByCity, fetchWeatherByCoords } from '../services/weatherService.js';
import useGeolocation from '../hooks/useGeolocation.js';
import WeatherCard from '../components/WeatherCard.jsx';
import ForecastCard from '../components/ForecastCard.jsx';
import WeatherChart from '../components/WeatherChart.jsx';
import SkeletonLoader from '../components/SkeletonLoader.jsx';
import { getFavorites, saveFavorite, removeFavorite, getRecents, saveRecent } from '../utils/helpers.js';
import { Search, RotateCw, Sparkles, Star, AlertCircle, History } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function WeatherDashboard() {
  const [query, setQuery] = useState('');
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [favorites, setFavorites] = useState([]);
  const [recents, setRecents] = useState([]);
  
  const { coordinates, error: geoError, loading: geoLoading } = useGeolocation();

  // Load favorites & recents on mount
  useEffect(() => {
    setFavorites(getFavorites());
    setRecents(getRecents());
  }, []);

  // Fetch weather by coordinates if geolocation is available
  useEffect(() => {
    if (coordinates) {
      handleFetchByCoords(coordinates.lat, coordinates.lon);
    } else if (!geoLoading) {
      // Fallback default city
      handleFetchByCity('London');
    }
  }, [coordinates, geoLoading]);

  const handleFetchByCity = async (cityName) => {
    setLoading(true);
    setError('');
    try {
      const data = await fetchWeatherByCity(cityName);
      setWeather(data);
      const updatedRecents = saveRecent(data.city);
      setRecents(updatedRecents);
    } catch (err) {
      setError(err.message || 'City not found.');
    }
    setLoading(false);
  };

  const handleFetchByCoords = async (lat, lon) => {
    setLoading(true);
    setError('');
    try {
      const data = await fetchWeatherByCoords(lat, lon);
      setWeather(data);
      const updatedRecents = saveRecent(data.city);
      setRecents(updatedRecents);
    } catch (err) {
      setError('Could not retrieve local weather.');
    }
    setLoading(false);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    handleFetchByCity(query);
    setQuery('');
  };

  const handleToggleFavorite = (cityName) => {
    const isFav = favorites.some((f) => f.toLowerCase() === cityName.toLowerCase());
    let updated;
    if (isFav) {
      updated = removeFavorite(cityName);
    } else {
      updated = saveFavorite(cityName);
    }
    setFavorites(updated);
  };

  const triggerLocate = () => {
    if (coordinates) {
      handleFetchByCoords(coordinates.lat, coordinates.lon);
    } else {
      setError('Geolocation permissions denied or unavailable.');
    }
  };

  const isCityFavorite = (cityName) => {
    return favorites.some((f) => f.toLowerCase() === cityName.toLowerCase());
  };

  // Determine dynamic weather backdrop class
  const getBackdropClass = () => {
    if (!weather) return 'bg-slate-50 dark:bg-slate-950';
    const condition = weather.condition.toLowerCase();
    if (condition.includes('sun') || condition.includes('clear')) return 'weather-bg-sunny';
    if (condition.includes('rain') || condition.includes('drizzle') || condition.includes('thunderstorm')) return 'weather-bg-rainy';
    if (condition.includes('snow')) return 'weather-bg-snowy';
    return 'weather-bg-cloudy'; // Cloudy, Fog, Mist, Haze
  };

  return (
    <div className={`min-h-screen transition-all duration-700 px-4 py-8 md:px-8 flex flex-col items-center ${getBackdropClass()}`}>
      <div className="w-full max-w-6xl space-y-6">
        
        {/* Search header container */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 w-full">
          <div>
            <h2 className="text-2xl font-black text-slate-800 dark:text-white flex items-center gap-1.5 tracking-tight">
              <Sparkles className="h-6 w-6 text-indigo-500 animate-pulse" />
              Weather Dashboard
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">Search global forecasts & track your favorite cities</p>
          </div>

          <form onSubmit={handleSearchSubmit} className="flex gap-2 w-full md:w-auto">
            <div className="relative flex-1 md:w-[280px]">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
              <input
                type="text"
                placeholder="Search city... (e.g. Paris)"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full bg-white/70 dark:bg-slate-900/60 border border-white/30 dark:border-white/5 rounded-xl py-2.5 pl-10 pr-4 text-sm text-slate-800 dark:text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition"
              />
            </div>
            <button
              type="submit"
              className="py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-sm transition shadow-lg shadow-indigo-600/10"
            >
              Search
            </button>
            <button
              type="button"
              onClick={() => weather && handleFetchByCity(weather.city)}
              disabled={loading}
              className="p-2.5 rounded-xl bg-white/30 dark:bg-white/5 hover:bg-white/40 border border-white/20 dark:border-white/5 text-slate-700 dark:text-slate-200 transition disabled:opacity-50"
              title="Refresh"
            >
              <RotateCw className={`h-4.5 w-4.5 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </form>
        </div>

        {/* Favorites Horizontal List */}
        {favorites.length > 0 && (
          <div className="flex items-center gap-2 overflow-x-auto py-1 scrollbar-hide">
            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider shrink-0 mr-1 flex items-center gap-1">
              <Star className="h-3.5 w-3.5 text-amber-500 shrink-0" fill="currentColor" />
              Favorites:
            </span>
            {favorites.map((fav) => (
              <button
                key={fav}
                onClick={() => handleFetchByCity(fav)}
                className="px-3.5 py-1.5 rounded-full bg-white/45 dark:bg-white/5 border border-white/30 dark:border-white/5 hover:bg-white/60 dark:hover:bg-white/10 text-xs font-semibold text-slate-700 dark:text-slate-200 transition capitalize shrink-0"
              >
                {fav}
              </button>
            ))}
          </div>
        )}

        {/* Alert for Error messages */}
        <AnimatePresence mode="wait">
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex items-center gap-2 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-700 dark:text-red-200 text-sm"
            >
              <AlertCircle className="h-4.5 w-4.5 shrink-0" />
              <span>{error}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Dashboard Layout */}
        {loading ? (
          <SkeletonLoader type="weather" />
        ) : weather ? (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Primary Current Card */}
              <div className="lg:col-span-2">
                <WeatherCard
                  weatherData={weather}
                  isFavorite={isCityFavorite(weather.city)}
                  onToggleFavorite={handleToggleFavorite}
                  onLocate={triggerLocate}
                />
              </div>

              {/* Weekly forecast column */}
              <div>
                <ForecastCard forecastData={weather.forecast} />
              </div>

            </div>

            {/* Recharts Curve block */}
            <WeatherChart hourlyData={weather.hourly} />
          </div>
        ) : (
          <div className="text-center py-20 text-slate-500">Search for a city or turn on location services to view the weather.</div>
        )}

        {/* Recent Searches */}
        {recents.length > 0 && (
          <div className="flex items-center gap-2 overflow-x-auto py-2 border-t border-slate-200 dark:border-white/5 mt-4">
            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider shrink-0 mr-1 flex items-center gap-1">
              <History className="h-3.5 w-3.5 text-slate-500 shrink-0" />
              Recents:
            </span>
            {recents.map((rec) => (
              <button
                key={rec}
                onClick={() => handleFetchByCity(rec)}
                className="px-3 py-1 rounded-lg bg-white/20 dark:bg-white/2 border border-white/10 text-xs text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition capitalize shrink-0"
              >
                {rec}
              </button>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
