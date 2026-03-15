# 🟢 PingUp — Real-Time Community Chat Platform

> A Discord-inspired, full-stack real-time chat platform for modern communities.
> Channels, direct messaging, voice/music lounges, role-based moderation, and a full admin panel — all in one app.

[![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react)](https://react.dev)
[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=flat-square&logo=node.js)](https://nodejs.org)
[![Socket.io](https://img.shields.io/badge/Socket.io-4.x-010101?style=flat-square&logo=socket.io)](https://socket.io)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=flat-square&logo=mongodb)](https://mongodb.com)
[![Express](https://img.shields.io/badge/Express-4.x-000000?style=flat-square&logo=express)](https://expressjs.com)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)

---

## 🔗 Repositories

| Part | Repository |
|---|---|
| 🖥️ Frontend | [github.com/sabeenaviklar/PingUp-Frontend](https://github.com/sabeenaviklar/PingUp-Frontend) |
| ⚙️ Backend | [github.com/sabeenaviklar/PingUp-Backend](https://github.com/sabeenaviklar/PingUp-Backend) |

---

## 💡 What is PingUp?

**PingUp** is a real-time community chat platform that brings people together through organized channels, direct messaging, and shared music experiences. It was built from scratch for a hackathon in under 48 hours using React, Node.js, Socket.IO, and MongoDB.

Think of it as a lightweight, self-hostable Discord — with a clean forest-green aesthetic, a Stranger Things music lounge, and a powerful owner panel to manage your community in real time.

---

## ✨ Feature Overview

### 💬 Real-Time Messaging
- Instant messages delivered via **WebSockets (Socket.IO)** — zero page refreshes
- **Live typing indicators** with animated bouncing dots
- **Message pinning** — moderators can pin important messages, visible at the top of every channel
- **Soft message deletion** — deleted messages show `[message deleted]` rather than disappearing
- Auto-scroll to latest message on new activity

### 🗂️ Channel & Category System
- Channels are organized inside **collapsible categories** (exactly like Discord)
- Owners can create, delete, and rename channels and categories **live** — all users see updates instantly
- Each channel supports a custom **emoji** and **description**
- Per-channel toggleable settings:
  - 🔇 **Read-only** — only owners can send messages
  - 🔒 **Locked** — no one can send messages
  - 👁️ **Private** — only specific users can see and join
- Channel status badges displayed in the header and sidebar

### 🎵 Music Lounge (Voice Channel)
- A special **Stranger Things themed music lounge** channel
- Built-in **YouTube-powered audio player** — no API key required
- **Playlist of 5 tracks**:
  - 🌀 Stranger Things — Main Theme *(Kyle Dixon & Michael Stein)*
  - 🔴 Running Up That Hill *(Kate Bush)*
  - ⚡ Should I Stay or Should I Go *(The Clash)*
  - 🌊 Every Breath You Take *(The Police)*
  - 🔥 Master of Puppets *(Metallica)*
- Discord-style **lobby screen** before joining — shows who's listening
- Animated **spinning album art** with per-track colour theming
- Real-time **listening members** panel with sound wave animations
- Previous / Stop / Next controls + volume slider + mute toggle

### 👤 Role-Based Permissions
PingUp has a strict **3-tier role system**:

| Role | Badge | Capabilities |
|---|---|---|
| 👑 **Owner** | Gold | Everything — full server control |
| 🛡️ **Moderator** | Teal | Delete/pin messages, kick members |
| 👤 **Member** | Grey | Send messages, read channels |

- The **first user to register** is automatically made Owner
- Roles are enforced **server-side** — the client UI only reflects server decisions
- Role-coloured avatars, username colours, and pills throughout the entire UI

### 📨 Direct Messages (DMs)
- Private **1-on-1 conversations** between any users
- Persistent message history stored in MongoDB
- **Unread message badges** on the DM list
- **Toast pop-up notifications** for incoming DMs while in a channel
- Live typing indicators in DM conversations
- Click any username in the member panel to open a DM

### 🛡️ Admin Panel
- Full **server statistics**: total users, online count, messages, channels
- **User management table**: see all users, change roles, kick, or ban
- **Channel management**: create/delete channels, toggle read-only/lock/private
- All changes take effect **instantly** across all connected clients

### ⌨️ Slash Commands
Type `/help` in any channel for a full command list:

| Command | Who | What it does |
|---|---|---|
| `/help` | All | Show all commands |
| `/online` | All | List currently online users |
| `/whoami` | All | Show your profile details |
| `/rooms` | All | List all channels and their status |
| `/kick <username>` | Mod+ | Kick a user from the server |
| `/pin <messageId>` | Mod+ | Pin or unpin a message |
| `/delete <messageId>` | Mod+ | Delete a message |
| `/promote <user> <role>` | Owner | Set a user's role |
| `/ban <username>` | Owner | Permanently ban a user |
| `/reroll <username>` | Owner | Randomly re-assign a user's role |
| `/newchannel <cat> <name>` | Owner | Create a new channel in a category |
| `/delchannel <name>` | Owner | Delete a channel |
| `/renamechannel <old> <new>` | Owner | Rename a channel |
| `/newcategory <name>` | Owner | Create a new category |
| `/readonly <channel>` | Owner | Toggle read-only on a channel |
| `/lock <channel>` | Owner | Toggle lock on a channel |
| `/private <channel>` | Owner | Toggle private on a channel |
| `/clear` | Owner | Wipe all messages in the current channel |
| `/stats` | Owner | View server statistics |

---

## 🏗️ Tech Stack

| Layer | Technology | Why |
|---|---|---|
| **Frontend** | React 18 + Vite | Fast, component-based UI with HMR |
| **Styling** | Pure CSS3 (custom design system) | Full control, no utility class bloat |
| **Backend** | Node.js + Express.js | Lightweight, fast REST API |
| **Real-time** | Socket.IO 4.x | Bi-directional WebSocket events |
| **Database** | MongoDB + Mongoose | Flexible schema for messages/users |
| **Auth** | JWT (JSON Web Tokens) | Stateless, scalable authentication |
| **Audio** | YouTube iFrame embed | No API key, browser-native playback |

---

## 🗂️ Project Structure

```
PingUp/
│
├── PingUp-Frontend/               # React + Vite client
│   ├── public/
│   └── src/
│       ├── components/
│       │   ├── DMSidebar.jsx      # Left sidebar — channels, categories, user bar
│       │   ├── MessageList.jsx    # Chat message feed with pinning/deletion
│       │   ├── MessageInput.jsx   # Message compose bar with typing events
│       │   ├── UserPanel.jsx      # Right sidebar — member list with roles
│       │   ├── VoiceChannel.jsx   # Stranger Things music lounge player
│       │   ├── DMChat.jsx         # Direct message chat window
│       │   ├── DMList.jsx         # DM conversation list panel
│       │   ├── AdminPanel.jsx     # Owner admin dashboard
│       │   ├── FriendsPanel.jsx   # Friends & online users view
│       │   ├── ProfileModal.jsx   # User profile edit modal
│       │   ├── Login.jsx          # Login page
│       │   └── Register.jsx       # Registration page
│       ├── App.jsx                # Root component — socket wiring, routing logic
│       ├── socket.js              # Socket.IO client singleton
│       ├── index.css              # Full design system (CSS variables + all styles)
│       └── main.jsx               # React entry point
│
└── PingUp-Backend/                # Node.js + Express server
    ├── models/
    │   ├── User.js                # User schema: role, banned, online, loginCount
    │   ├── Room.js                # Channel schema: isPrivate, isReadOnly, isLocked, isVoice
    │   ├── Message.js             # Message schema: pinned, deleted, roomName
    │   └── DirectMessage.js       # DM schema: conversationId, read, participants
    ├── middleware/
    │   └── auth.js                # JWT sign/verify + socket auth middleware
    ├── server.js                  # Main file: Express routes + Socket.IO handlers
    ├── .env                       # Environment variables (not committed)
    └── package.json
```

---

## ⚡ Setup & Installation

### Prerequisites
Make sure you have the following installed:
- **Node.js** v18 or higher — [download here](https://nodejs.org)
- **npm** v9+ (comes with Node.js)
- **MongoDB Atlas** account (free tier works) — [sign up here](https://mongodb.com/atlas)
- **Git** — [download here](https://git-scm.com)

---

### Step 1 — Clone Both Repositories

Open your terminal and run:

```bash
# Clone the frontend
git clone https://github.com/sabeenaviklar/PingUp-Frontend.git

# Clone the backend
git clone https://github.com/sabeenaviklar/PingUp-Backend.git
```

You'll now have two folders: `PingUp-Frontend/` and `PingUp-Backend/`

---

### Step 2 — Set Up MongoDB Atlas

1. Go to [mongodb.com/atlas](https://mongodb.com/atlas) and sign in
2. Create a **free cluster** (M0 tier)
3. Under **Database Access** → Add a new database user with username & password
4. Under **Network Access** → Add `0.0.0.0/0` (allow all IPs) for development
5. Click **Connect** → **Connect your application** → Copy the connection string

It will look like:
```
mongodb+srv://youruser:yourpassword@cluster0.xxxxx.mongodb.net/pingup
```

---

### Step 3 — Configure the Backend

```bash
cd PingUp-Backend
npm install
```

Create a `.env` file in the `PingUp-Backend/` folder:

```bash
# PingUp-Backend/.env

MONGO_URI=mongodb+srv://youruser:yourpassword@cluster0.xxxxx.mongodb.net/pingup
JWT_SECRET=pingup_super_secret_jwt_key_change_this_in_production
PORT=3001
```

> ⚠️ **Never commit `.env` to GitHub.** Make sure it's in your `.gitignore`.

Start the backend server:

```bash
npm run dev
```

You should see:
```
✅ MongoDB connected
✅ Default rooms seeded
🚀 Server on http://localhost:3001
```

---

### Step 4 — Configure the Frontend

Open a **new terminal window**, then:

```bash
cd PingUp-Frontend
npm install
```

Create a `.env` file in the `PingUp-Frontend/` folder:

```bash
# PingUp-Frontend/.env

VITE_API_URL=http://localhost:3001
VITE_SOCKET_URL=http://localhost:3001
```

Start the frontend:

```bash
npm run dev
```

You should see:
```
  VITE v5.x.x  ready in xxx ms
  ➜  Local:   http://localhost:5173/
```

---

### Step 5 — Open PingUp

1. Open **[http://localhost:5173](http://localhost:5173)** in your browser
2. Click **Register** and create your first account
   - ✅ The **first user to register** is automatically made **Owner**
3. Open a **second browser tab or incognito window** and register another user
   - This user will be a **Member**
4. You can now chat between the two accounts in real time!

---

### Step 6 — Test All Features

| Feature | How to test |
|---|---|
| Real-time chat | Send messages from two different browser windows |
| Typing indicator | Start typing in one window — see it appear in the other |
| Owner panel | Log in as the first user → click **Admin Panel** in the sidebar |
| Music lounge | Click `#music-lounge` in the sidebar → Join Lounge → pick a track |
| Direct messages | Click any online user in the right panel → start a DM |
| Slash commands | Type `/help` in any channel |
| Channel settings | As owner, click the 🔇 🔒 👁️ buttons in the channel header |
| Role management | Admin Panel → Users → change a user's role |

---

## 🔌 API Reference

### REST Endpoints

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/api/register` | ❌ | Register new user |
| `POST` | `/api/login` | ❌ | Login, receive JWT token |
| `GET` | `/api/structure` | ✅ JWT | Get categories + channels |
| `GET` | `/api/rooms` | ❌ | Get all rooms (legacy) |
| `GET` | `/api/users` | ✅ Mod+ | Get all users |
| `PUT` | `/api/profile` | ✅ JWT | Update profile info |
| `GET` | `/api/dm/:otherUserId` | ✅ JWT | Get DM history |
| `GET` | `/api/dm` | ✅ JWT | Get all DM conversations |

### Key Socket.IO Events

**Client → Server:**

```
channel:join          { channelId }
message:send          { channelId, text }
typing:start          { channelId }
typing:stop           { channelId }
message:pin           { channelId, messageId }
message:delete        { channelId, messageId }
channel:create        { categoryId, name, emoji, description }
channel:delete        { channelId }
channel:toggleReadOnly { channelId }
channel:toggleLock    { channelId }
channel:togglePrivate { channelId }
category:create       { name }
category:delete       { categoryId }
user:setrole          { targetId, role }
user:kick             { targetId }
user:ban              { targetId }
voice:join            { channelId }
voice:leave           { channelId }
dm:join               { otherUserId }
dm:send               { toUserId, text }
```

**Server → Client:**

```
structure:update      → full category/channel tree refreshed
users:update          → online users list changed
channel:history       → message history for joined channel
message:new           → new message arrived
message:deleted       → message was deleted
message:pinned        → message was pinned
message:unpinned      → message was unpinned
room:settings         → channel settings changed
room:notification     → system message (join/leave/kick/etc.)
typing:update         → typing status changed
role:updated          → your own role was changed
kicked                → you were kicked or banned
voice:joined          → someone joined the voice channel
voice:left            → someone left the voice channel
voice:members         → current voice members list
dm:message            → new direct message received
dm:notification       → toast notification for new DM
```

---

## 🔐 Security

- Passwords hashed with **bcrypt** (10 salt rounds) — never stored in plain text
- All protected routes require a valid **JWT Bearer token** in the `Authorization` header
- Every Socket.IO connection is authenticated via **JWT middleware** at connection time
- Banned users are rejected at **both** the REST API and WebSocket level
- All permission checks (kick, ban, promote, toggle channel settings) are enforced **server-side only** — the client UI is cosmetic and cannot bypass server rules
- Private channel access verified on every `channel:join` event

---

## 🎨 Design System

PingUp uses a custom **forest/sage green** dark theme built entirely in CSS variables:

```css
--bg-primary:    #1a2a22   /* Deep forest background */
--bg-secondary:  #1e2f26   /* Sidebar backgrounds */
--bg-elevated:   #243322   /* Cards, inputs, elevated surfaces */
--accent:        #4a9e8e   /* Teal green — buttons, active states */
--accent-hover:  #5ab5a4   /* Accent on hover */
--accent-muted:  rgba(74,158,142,0.12)  /* Soft accent backgrounds */
--urgent:        #bc6c25   /* Warm amber — warnings, danger */
--text-primary:  #e8f0ec   /* Main text — soft white */
--text-muted:    #7a9e8a   /* Secondary text — muted sage */
```

The Music Lounge overrides these with **per-track dynamic gradients** based on the currently playing song.



## 👨‍💻 Built By

| Name | Role |
|---|---|
| **Sabeena, Anvita and kirti


---

## 📄 License

This project is licensed under the **MIT License**.
Feel free to fork, modify, and build upon it.

---

##  Acknowledgements

- [Discord](https://discord.com) — UI/UX inspiration
- [Socket.IO](https://socket.io) — Real-time WebSocket engine
- [MongoDB Atlas](https://mongodb.com) — Cloud database
- [Vite](https://vitejs.dev) — Blazing fast frontend tooling
- [Kate Bush](https://www.youtube.com/watch?v=HYwNM1t9ltI) — *Running Up That Hill* 🎵
- [Kyle Dixon & Michael Stein](https://www.youtube.com/watch?v=01qStKYB7ts) — *Stranger Things Theme* 🌀

---

<p align="center">
  <strong>🟢 PingUp</strong> — Ping your people, build your community.<br/>
  <a href="https://github.com/sabeenaviklar/PingUp-Frontend">Frontend</a> ·
  <a href="https://github.com/sabeenaviklar/PingUp-Backend">Backend</a>
</p>
