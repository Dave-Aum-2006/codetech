# GlowTask SaaS - Full-Stack Team Collaboration & Task Analytics

GlowTask is a complete, production-ready, full-stack project and task management SaaS application designed with modern glassmorphism aesthetics. It incorporates user authentication (JWT + bcrypt), custom workspaces, active charts analytics (using Recharts), full CRUD operations on tasks, support for file attachments uploads, dark/light mode toggles, and responsive designs.

---

## Features

### 1. User Authentication System
*   **Secure Registrations**: Register user account and choose profile designs.
*   **JWT Handshakes**: Secure login credentials exchanges returning JSON Web Tokens.
*   **Encrypted Passwords**: Cryptographic passwords hashing using `bcryptjs`.
*   **Route Protections**: Route middleware checking headers Bearer tokens before parsing requests.

### 2. Workspace Analytics Hub
*   **Stats Grid**: Quick visibility counters showing Total, Completed, Pending, and Completion Rates.
*   **Monthly Completed Trend**: Area chart (using Recharts) representing historical completions.
*   **Priority Load**: Bar chart representing Low, Medium, and High workload counts.

### 3. Full CRUD Task Boards
*   **Creation Forms**: Modal form setting Title, Description, Priority (Low/Medium/High), Status (Todo/In Progress/Done), Due Dates, and Uploading attachments.
*   **Board Grids**: Column layouts displaying active task details.
*   **Revisions Modal**: Direct edit overlay to modify any field.
*   **Deletions**: Remove cards with instant grid refreshes.
*   **Search & Filters**: Multi-stage filters to search text or filter by status/priority.
*   **File Attachments**: Upload local files using **Multer** and list them on the cards.

---

## Tech Stack

### Backend
*   **Runtime**: Node.js
*   **Server**: Express.js
*   **Database**: MongoDB (Mongoose schemas)
*   **Security**: JWT & bcryptjs
*   **Uploads**: Multer file system storage

### Frontend
*   **Framework**: React.js (Vite compiler)
*   **Styles**: Tailwind CSS
*   **Animations**: Framer Motion
*   **Charts**: Recharts (responsive SVGs)
*   **HTTP Client**: Axios (Interceptors for header injections)
*   **Icons**: Lucide React

---

## Project Structure

```
task3/
├── backend/
│   ├── config/              # MongoDB connection with Mock fallback
│   ├── controllers/         # Logic handlers (Auth, CRUD Data, Stats)
│   ├── middleware/          # JWT validation middleware
│   ├── models/              # Schemas (User, Task)
│   ├── routes/              # API endpoints
│   ├── uploads/             # Shared file attachments folder
│   ├── .env.example         # Template config
│   ├── Dockerfile           # Backend container setup
│   └── server.js            # Node startup entrypoint
├── frontend/
│   ├── src/
│   │   ├── components/      # Shared components
│   │   ├── context/         # React Contexts (Auth, Theme)
│   │   ├── pages/           # Pages (AuthPage, DashboardHub)
│   │   ├── utils/           # Axios API configurations
│   │   ├── App.jsx          # Route bindings
│   │   ├── index.css        # Main stylesheet & custom classes
│   │   └── main.jsx         # React DOM mount point
│   ├── Dockerfile           # Frontend container setup
│   ├── index.html           # HTML template
│   ├── tailwind.config.js   # Style config
│   └── vite.config.js       # Vite development proxy configs
└── docker-compose.yml       # Entire stack orchestra (DB, Backend, Frontend)
```

---

## Getting Started (Local Development)

### Prerequisites
*   Node.js (v18+)
*   npm
*   MongoDB (Running locally on `mongodb://127.0.0.1:27017` or a MongoDB Atlas URI)

### Zero-Setup Database Fallback
GlowTask has an **automatic Offline Mock Mode**. If you do not have MongoDB running locally, the server will detect the connection error, launch in **Mock Mode**, and manage users and tasks in memory. This means **the project is fully functional out of the box with zero installations!**

### Step 1: Configure & Start Backend
1.  Navigate to the backend directory:
    ```bash
    cd backend
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Configure `.env` file (A template is already created with default local values):
    ```env
    PORT=6000
    MONGO_URI=mongodb://127.0.0.1:27017/glowtask
    JWT_SECRET=saas_super_secret_jwt_key_12345
    FRONTEND_URL=http://localhost:4000
    ```
4.  Start the development server:
    ```bash
    npm run dev
    ```
    The server will boot on `http://localhost:6000`.

### Step 2: Configure & Start Frontend
1.  Navigate to the frontend directory:
    ```bash
    cd ../frontend
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Start the Vite developer server:
    ```bash
    npm run dev
    ```
    The frontend will boot on `http://localhost:4000`. Open your browser and access it there!

---

## Run with Docker

To spin up MongoDB, the Backend server, and the Frontend Nginx webapp in containerized isolation, simply run:

```bash
docker-compose up --build
```

Access the application at `http://localhost`.
