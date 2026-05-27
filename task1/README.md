# GlowDashboard - Live Weather & News Dashboard

GlowDashboard is a complete, modern, responsive frontend web application that fetches and displays live data from public APIs. It incorporates glassmorphic layouts, dynamic temperature area trend lines, weekly forecasts, geolocation tracking, news portals with topic filters, and automatic mock-data fallbacks when API keys are missing.

---

## Features

### 1. Weather Dashboard
*   **Auto-Location Detection**: Uses browser geolocation APIs to fetch coordinates and automatically retrieve local weather details.
*   **Global Search**: Search any city by name (e.g. New York, Tokyo, Sydney).
*   **Live Metrics**: Displays temperature, conditions, humidity, wind speed, pressure, and UV index.
*   **Temperature Area Chart**: Dynamic 24h temperature trend curves utilizing `recharts`.
*   **5-Day Forecast**: Vertical weekly outlook displaying condition symbols and max/min bounds.
*   **Favorites & Recents**: Saves favorite locations and logs recent searches using local storage.
*   **Weather Conditions Backdrops**: Background gradient transitions automatically based on conditions (Sunny, Rainy, Snowy, Cloudy).

### 2. News Portal
*   **Trending Highlights**: Highlights a top article card as the featured headline.
*   **Category Filters**: Grid of pills (Technology, Business, Science, Sports, General) to query targeted topics.
*   **Article Searches**: Find headlines containing specific keywords.
*   **Read Full Article**: Direct external links to read full stories.
*   **Pagination Navigation**: Clean pagination controls to browse pages of results.

### 3. High-Fidelity UI/UX
*   **Glassmorphic Design**: Modern transparent layout elements, borders, and backdrop blurs.
*   **Theme Toggle**: Syncs light/dark colors across all dashboard panels.
*   **Skeleton Loaders**: Bouncing loading skeletons to improve performance perception.

---

## Tech Stack
*   **Compiler/Bundler**: React.js (Vite compiler)
*   **Styles**: Tailwind CSS (PostCSS)
*   **Animations**: Framer Motion
*   **Charts**: Recharts (responsive SVG charts)
*   **HTTP client**: Axios
*   **Icons**: Lucide React

---

## Setup & Run Instructions

### Prerequisites
*   Node.js (v18+)
*   npm

### Step 1: Install Dependencies
Navigate to the `task1` folder and install packages:
```bash
cd task1
npm install
```

### Step 2: Configure Keys (Optional)
GlowDashboard has a built-in **Offline Mock Mode**. If you do not have API keys, **leave the `.env` parameters blank**; the application will automatically mock highly realistic, dynamic weather and news updates so you can test it immediately.

If you have keys:
1.  Open the [task1/.env](file:///C:/Users/Aumda/.gemini/antigravity-ide/scratch/codetech/task1/.env) file.
2.  Input your keys:
    ```env
    VITE_OPENWEATHER_KEY=your_openweathermap_key_here
    VITE_NEWS_KEY=your_newsapi_key_here
    ```

### Step 3: Run the App
Launch the developer server:
```bash
npm run dev
```
Open **`http://localhost:3000`** in your web browser.
