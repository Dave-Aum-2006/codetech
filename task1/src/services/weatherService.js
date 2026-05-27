import axios from 'axios';

const API_KEY = import.meta.env.VITE_OPENWEATHER_KEY;
const BASE_URL = 'https://api.openweathermap.org/data/2.5';

// Pre-defined realistic weather presets for mock mode
const MOCK_WEATHER_PRESETS = {
  london: { temp: 15, condition: 'Rainy', icon: '09d', humidity: 82, wind: 5.5, pressure: 1012, uv: 3 },
  'new york': { temp: 22, condition: 'Sunny', icon: '01d', humidity: 55, wind: 4.1, pressure: 1016, uv: 7 },
  tokyo: { temp: 18, condition: 'Cloudy', icon: '03d', humidity: 60, wind: 3.2, pressure: 1015, uv: 4 },
  paris: { temp: 17, condition: 'Cloudy', icon: '04d', humidity: 70, wind: 2.8, pressure: 1013, uv: 5 },
  sydney: { temp: 24, condition: 'Sunny', icon: '01d', humidity: 48, wind: 6.2, pressure: 1018, uv: 8 },
  cairo: { temp: 34, condition: 'Sunny', icon: '01d', humidity: 25, wind: 4.8, pressure: 1010, uv: 10 },
  mumbai: { temp: 31, condition: 'Rainy', icon: '10d', humidity: 90, wind: 7.4, pressure: 1008, uv: 2 }
};

// Helper to generate dynamic weather mock based on city name string hash
const generateMockWeather = (cityName) => {
  const normalized = cityName.trim().toLowerCase();
  
  if (MOCK_WEATHER_PRESETS[normalized]) {
    return createWeatherResponse(cityName, MOCK_WEATHER_PRESETS[normalized]);
  }

  // Generate deterministic weather from city name string length and characters
  let hash = 0;
  for (let i = 0; i < normalized.length; i++) {
    hash = normalized.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  const temp = Math.round(15 + (Math.abs(hash) % 25)); // 15 to 40
  const humidity = Math.round(30 + (Math.abs(hash) % 60)); // 30 to 90
  const wind = parseFloat((2 + (Math.abs(hash) % 12) * 0.8).toFixed(1)); // 2 to 11.6
  const pressure = Math.round(1005 + (Math.abs(hash) % 20)); // 1005 to 1025
  const uv = Math.round(1 + (Math.abs(hash) % 9)); // 1 to 10

  const conditions = ['Sunny', 'Cloudy', 'Rainy', 'Snowy', 'Drizzle'];
  const icons = ['01d', '03d', '09d', '13d', '10d'];
  const index = Math.abs(hash) % conditions.length;

  return createWeatherResponse(cityName, {
    temp,
    condition: conditions[index],
    icon: icons[index],
    humidity,
    wind,
    pressure,
    uv
  });
};

const createWeatherResponse = (city, data) => {
  // Generate hourly data (24 hours)
  const hourly = [];
  const now = new Date();
  for (let i = 0; i < 8; i++) {
    const time = new Date(now.getTime() + i * 3 * 60 * 60 * 1000);
    hourly.push({
      time: time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      temp: data.temp + Math.round((Math.sin(i) * 3)),
      condition: data.condition
    });
  }

  // Generate 5-day forecast
  const forecast = [];
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  for (let i = 1; i <= 5; i++) {
    const futureDate = new Date();
    futureDate.setDate(now.getDate() + i);
    const dayName = days[futureDate.getDay()];
    
    // Add variations
    let tempMax = data.temp + Math.round(Math.random() * 4 - 1);
    let tempMin = data.temp - Math.round(Math.random() * 4 + 2);

    forecast.push({
      day: dayName,
      date: futureDate.toLocaleDateString([], { month: 'short', day: 'numeric' }),
      tempMax,
      tempMin,
      condition: data.condition,
      icon: data.icon,
      humidity: Math.min(100, data.humidity + Math.round(Math.random() * 10 - 5))
    });
  }

  return {
    city: city.charAt(0).toUpperCase() + city.slice(1),
    temp: data.temp,
    condition: data.condition,
    icon: data.icon,
    humidity: data.humidity,
    wind: data.wind,
    pressure: data.pressure,
    uv: data.uv,
    hourly,
    forecast
  };
};

export const fetchWeatherByCity = async (city) => {
  if (!API_KEY) {
    // Return mock data after brief network delay simulation
    return new Promise((resolve) => {
      setTimeout(() => resolve(generateMockWeather(city)), 500);
    });
  }

  try {
    const currentRes = await axios.get(`${BASE_URL}/weather`, {
      params: { q: city, appid: API_KEY, units: 'metric' },
    });
    
    const forecastRes = await axios.get(`${BASE_URL}/forecast`, {
      params: { q: city, appid: API_KEY, units: 'metric' },
    });

    return formatLiveResponse(currentRes.data, forecastRes.data);
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch weather data.');
  }
};

export const fetchWeatherByCoords = async (lat, lon) => {
  if (!API_KEY) {
    // Return mock data for location Sydney if offline
    return new Promise((resolve) => {
      setTimeout(() => resolve(generateMockWeather('Sydney')), 500);
    });
  }

  try {
    const currentRes = await axios.get(`${BASE_URL}/weather`, {
      params: { lat, lon, appid: API_KEY, units: 'metric' },
    });
    
    const forecastRes = await axios.get(`${BASE_URL}/forecast`, {
      params: { lat, lon, appid: API_KEY, units: 'metric' },
    });

    return formatLiveResponse(currentRes.data, forecastRes.data);
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch weather data.');
  }
};

const formatLiveResponse = (current, forecast) => {
  // Convert live OpenWeatherMap forecast data to our standard structure
  // Hourly: extract the first 8 slots (24 hours in 3-hour blocks)
  const hourly = forecast.list.slice(0, 8).map((item) => ({
    time: new Date(item.dt_txt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    temp: Math.round(item.main.temp),
    condition: item.weather[0].main
  }));

  // Daily: group list entries by day (taking index 0, 8, 16, 24, 32)
  const forecastList = [];
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  for (let i = 0; i < forecast.list.length; i += 8) {
    const item = forecast.list[i];
    const dateObj = new Date(item.dt_txt);
    forecastList.push({
      day: days[dateObj.getDay()],
      date: dateObj.toLocaleDateString([], { month: 'short', day: 'numeric' }),
      tempMax: Math.round(item.main.temp_max),
      tempMin: Math.round(item.main.temp_min),
      condition: item.weather[0].main,
      icon: item.weather[0].icon,
      humidity: item.main.humidity
    });
  }

  return {
    city: current.name,
    temp: Math.round(current.main.temp),
    condition: current.weather[0].main,
    icon: current.weather[0].icon,
    humidity: current.main.humidity,
    wind: current.wind.speed,
    pressure: current.main.pressure,
    uv: 5, // OpenWeatherMap current API doesn't include UV by default
    hourly,
    forecast: forecastList.slice(0, 5) // exactly 5 days
  };
};
