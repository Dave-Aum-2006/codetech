// Date & Time formatting
export const formatDate = (dateStr) => {
  const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  return new Date(dateStr).toLocaleDateString('en-US', options);
};

export const formatTime = (dateStr) => {
  return new Date(dateStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

// Unit conversions
export const kelvinToCelsius = (k) => Math.round(k - 273.15);
export const kelvinToFahrenheit = (k) => Math.round(((k - 273.15) * 9) / 5 + 32);

// LocalStorage helpers
export const getFavorites = () => {
  const favs = localStorage.getItem('weather_favorites');
  return favs ? JSON.parse(favs) : ['London', 'New York', 'Tokyo', 'Paris'];
};

export const saveFavorite = (city) => {
  const favs = getFavorites();
  if (!favs.includes(city)) {
    const updated = [...favs, city];
    localStorage.setItem('weather_favorites', JSON.stringify(updated));
    return updated;
  }
  return favs;
};

export const removeFavorite = (city) => {
  const favs = getFavorites();
  const updated = favs.filter((c) => c.toLowerCase() !== city.toLowerCase());
  localStorage.setItem('weather_favorites', JSON.stringify(updated));
  return updated;
};

export const getRecents = () => {
  const recs = localStorage.getItem('weather_recents');
  return recs ? JSON.parse(recs) : [];
};

export const saveRecent = (city) => {
  let recs = getRecents();
  recs = recs.filter((c) => c.toLowerCase() !== city.toLowerCase());
  recs.unshift(city);
  if (recs.length > 5) recs.pop(); // Keep only last 5
  localStorage.setItem('weather_recents', JSON.stringify(recs));
  return recs;
};
