# Task 4: GlowTracker — Full-Stack Chrome Extension & Productivity SaaS Dashboard

GlowTracker is a complete, production-ready full-stack Chrome Extension (Manifest V3) and responsive web dashboard that tracks active tab surfing duration, classifies domains, blocks distracting pages, and displays rich productivity analysis graphs.

---

## 🚀 Key Features

### 1. Manifest V3 Chrome Extension
*   **Active Tab Tracking**: Computes active focus duration on websites, automatically pausing when the browser is minimized or out of focus.
*   **Domain Classification**: Automatically flags domains as `productive`, `unproductive`, or `neutral`.
*   **Real-time Stopwatch**: Ticks live inside the extension popup to show active session duration.
*   **Instant Block Switch**: A slider to instantly block the current domain. Intercepted tabs are redirected to a beautifully designed local extension block page (`blocked.html`).
*   **Background Synchronization**: Syncs local duration metrics and updates settings from the backend every 15 seconds.

### 2. SaaS React Analytics Dashboard (Port 8080)
*   **Focus Metric Speedometer**: Radial dial displaying a weekly Focus Score.
*   **Productivity Area Chart**: Double-line AreaChart mapping productive vs unproductive hours over the last 7 days.
*   **Distractions Bar Chart**: Visualized progress bars listing distracting sites by duration.
*   **Weekly Reports Audits**: Highlights peak output days, distraction counts, and includes a mock text/PDF exporter.
*   **Control Panel Settings**: Manage the extension blocklist (add/remove domains) and customize classification category overrides.
*   **Glassmorphism & Theme Toggle**: Gorgeous dark and light themes.

### 3. Node/Express Backend Server (Port 8000)
*   **Secure Authentication**: User registration, login, and profile fetching protected by JWT tokens.
*   **REST CRUD APIs**: Endpoints to sync activities (`/api/activity`), get stats (`/api/activity/stats`), retrieve reports (`/api/activity/report/weekly`), and update filters (`/api/settings`).
*   **Zero-Setup Local Database Fallback**: Automatically connects to local MongoDB, but includes a built-in memory-mock database fallback if no connection is found, ensuring `npm run dev` boots instantly.

---

## 🛠️ Tech Stack
*   **Frontend**: React (Vite), Tailwind CSS, Framer Motion, Recharts, Lucide Icons, Axios.
*   **Chrome Extension**: Manifest V3, Service Workers, Chrome Storage/Tabs/Alarms APIs.
*   **Backend**: Node.js, Express.js, MongoDB (Mongoose), JWT, BcryptJS.
*   **Deployment**: Docker, Docker Compose, Nginx.

---

## 📦 Getting Started

### 📋 Prerequisites
*   Node.js (v18 or higher)
*   npm (v9 or higher)
*   *(Optional)* MongoDB running locally on port `27017` or Docker.

---

## 💻 Running Locally

### Step 1: Start the Backend API Server
1. Navigate to the backend directory:
    ```bash
    cd backend
    ```
2. Install dependencies:
    ```bash
    npm install
    ```
3. Copy configuration settings:
    ```bash
    copy .env.example .env
    ```
4. Boot the server:
    ```bash
    npm run dev
    ```
    *The server runs on **port 8000**. If MongoDB isn't running, it will automatically switch to the Offline Mock Database fallback.*

---

### Step 2: Start the SaaS Dashboard Frontend
1. Navigate to the frontend directory:
    ```bash
    cd ../frontend
    ```
2. Install dependencies:
    ```bash
    npm install
    ```
3. Boot the Vite development server:
    ```bash
    npm run dev
    ```
    *The dashboard runs on **port 8080** and proxies `/api` requests to **port 8000**.*

---

### Step 3: Install the Chrome Extension
1. Open Google Chrome and go to `chrome://extensions/`.
2. Enable **Developer mode** (top-right toggle switch).
3. Click **Load unpacked** (top-left button).
4. Select the `extension/` directory inside this project folder:
    `C:\Users\Aumda\.gemini\antigravity-ide\scratch\codetech\task4\extension`
5. Click the Extension pin icon to display the GlowTracker widget. Sign in with your registered dashboard email and password to begin tracking!

---

## 🐳 Running with Docker Compose

To boot the entire full-stack application (Frontend + Backend + MongoDB) in containerized production mode:

1. In the root `task4` directory, run:
    ```bash
    docker-compose up --build
    ```
2. Access the SaaS dashboard at `http://localhost:8080`.
3. Load the `extension/` directory into Chrome (API links will forward correctly to the backend container).

---

## 🧪 Verification Plan

### 1. Build Verification
Ensure the React assets build cleanly without warnings:
```bash
cd frontend
npm run build
```

### 2. Extension Verification
1. Log in to the Chrome extension popup.
2. Visit a productive site like `github.com`. Verify the live timer ticks upwards in the popup.
3. Open the SaaS dashboard (`http://localhost:8080`), log in, and verify the domain appears in the bar chart.
4. Toggle "Block Current Website" for `github.com` in the popup, then reload GitHub. You should instantly be redirected to the warning shield page (`blocked.html`).
