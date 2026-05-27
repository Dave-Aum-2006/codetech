# GlowChat - Real-Time Glassmorphic Chat Application

GlowChat is a complete, production-ready, full-stack real-time messaging application designed with modern glassmorphism aesthetics. It supports instant messaging, group rooms, online/offline user states, real-time typing indicators, read/seen indicators, file and image sharing, custom profile avatars, and visual theme toggling.

---

## Features

### 1. User Authentication
*   **Secure Accounts**: Registration and Login using JWT authentication tokens.
*   **Password Hashing**: Cryptographic password security using `bcryptjs`.
*   **Profile Details**: Customizable usernames and robot avatar seed generation (via Dicebear API).

### 2. Real-Time Chat System
*   **Instant Updates**: Instant socket message deliveries (via `Socket.IO`).
*   **Online/Offline States**: Active presence tracking showing who is online.
*   **Typing Indicators**: Real-time bouncy bubble indicators when a user is writing.
*   **Seen Receipts**: Double checkmarks indicating if other participants read your message.
*   **Unread Badges**: Red notification counts on chats.

### 3. Conversations & Sharing
*   **Direct & Groups**: Supports 1-to-1 direct chats and multi-user group chat rooms.
*   **Group Controls**: Rename groups, add new participants, remove members, or leave groups.
*   **Attachments**: Shared files (images, audio, PDF, DOCX, text) with inline renders and download paths.
*   **Emoji Integrations**: Clean emoji picker overlay for expressive messages.

### 4. High-Fidelity UI/UX
*   **Glassmorphic Design**: Clean blur backdrops, glass cards, and neon accent glows.
*   **Theme Toggle**: Dark/Light mode switcher syncing interface colors.
*   **Responsive Panels**: Completely mobile responsive sidebar and chat window view toggles.

---

## Tech Stack

### Frontend
*   **Framework**: React.js (Vite compiler)
*   **Styles**: Tailwind CSS (PostCSS)
*   **Animations**: Framer Motion
*   **Sockets**: Socket.IO Client
*   **HTTP client**: Axios (Interceptors for header injections)
*   **Icons**: Lucide React

### Backend
*   **Runtime**: Node.js
*   **Server framework**: Express.js
*   **Database**: MongoDB (Mongoose schemas)
*   **Sockets**: Socket.IO Server
*   **Uploads**: Multer file system storage
*   **Security**: JSON Web Tokens & bcryptjs

---

## Project Structure

```
realtime-chat-app/
├── backend/
│   ├── config/              # MongoDB connection
│   ├── controllers/         # Logic handlers (Auth, Chat, User, Message)
│   ├── middleware/          # JWT Auth validation
│   ├── models/              # Mongoose DB schemas (User, Chat, Message)
│   ├── routes/              # Express API endpoints
│   ├── uploads/             # Shared file attachments folder
│   ├── .env.example         # Template config
│   ├── Dockerfile           # Backend container setup
│   └── server.js            # Node startup entrypoint
├── frontend/
│   ├── src/
│   │   ├── components/      # Modals (Profile, Group, GroupInfo)
│   │   ├── context/         # React Contexts (Auth, Socket, Theme)
│   │   ├── pages/           # Pages (AuthPage, ChatPage)
│   │   ├── utils/           # Axios API instance
│   │   ├── App.jsx          # Route router & bindings
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

### Step 1: Run MongoDB
Ensure MongoDB is running locally on your computer.

### Step 2: Configure & Start Backend
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
    PORT=5000
    MONGO_URI=mongodb://127.0.0.1:27017/realtime_chat
    JWT_SECRET=supersecretjwtkey12345
    FRONTEND_URL=http://localhost:5173
    ```
4.  Start the development server:
    ```bash
    npm run dev
    ```
    The server will boot on `http://localhost:5000`.

### Step 3: Configure & Start Frontend
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
    The frontend will boot on `http://localhost:5173`. Open your browser and access it there!

---

## Run with Docker

To spin up MongoDB, the Backend server, and the Frontend Nginx webapp in containerized isolation, simply run:

```bash
docker-compose up --build
```

Access the application at `http://localhost`.

---

## API Endpoints Reference

### Auth
*   `POST /api/auth/register` - Create user
*   `POST /api/auth/login` - Login
*   `GET /api/auth/me` - Profile retrieve

### Users
*   `GET /api/users?search=keyword` - Query directory users list
*   `PUT /api/users/profile` - Update display profiles

### Chats
*   `POST /api/chat` - Fetch or create direct chat
*   `GET /api/chat` - Fetch user's chat logs
*   `POST /api/chat/group` - Create group chat
*   `PUT /api/chat/rename` - Rename group
*   `PUT /api/chat/groupadd` - Add group member
*   `PUT /api/chat/groupremove` - Remove member / Leave group

### Messages
*   `GET /api/messages/:chatId` - Get chat logs messages history
*   `POST /api/messages` - Send message (text/attachments)
*   `POST /api/messages/upload` - Upload attachments files
