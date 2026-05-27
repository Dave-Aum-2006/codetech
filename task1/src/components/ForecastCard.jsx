import React from 'react';
import { Droplets } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ForecastCard({ forecastData }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
      className="glass-card rounded-3xl p-6 flex flex-col justify-between h-[340px]"
    >
      <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">5-Day Forecast</h3>
      
      <div className="flex-1 flex flex-col justify-between divide-y divide-slate-100 dark:divide-white/5">
        {forecastData.map((item, idx) => {
          const iconUrl = `https://openweathermap.org/img/wn/${item.icon}.png`;
          return (
            <div key={idx} className="flex justify-between items-center py-2 text-sm first:pt-0 last:pb-0">
              {/* Day info */}
              <div className="w-24">
                <p className="font-bold text-slate-800 dark:text-white">{item.day}</p>
                <p className="text-[10px] text-slate-400 font-medium">{item.date}</p>
              </div>

              {/* Icon & condition */}
              <div className="flex items-center gap-1">
                <img
                  src={iconUrl}
                  alt={item.condition}
                  className="w-8 h-8 object-contain"
                  onError={(e) => {
                    e.target.src = 'https://api.dicebear.com/7.x/shapes/svg?seed=cloudy';
                  }}
                />
                <div className="flex items-center gap-0.5 text-[10px] font-bold text-sky-500">
                  <Droplets className="h-3 w-3 shrink-0" />
                  <span>{item.humidity}%</span>
                </div>
              </div>

              {/* Temp Min / Max bar */}
              <div className="text-right flex items-center gap-2">
                <span className="font-black text-slate-800 dark:text-white">{item.tempMax}°</span>
                <span className="text-slate-400 font-medium">{item.tempMin}°</span>
              </div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}
