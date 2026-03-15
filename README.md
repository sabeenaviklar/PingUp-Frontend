# 🌿 Pingup — Real-Time Community Chat Platform

> A Discord-inspired, full-stack real-time chat platform built for modern communities.
> Features voice/music lounges, role-based permissions, direct messaging, and a full admin panel.

![Verdant Banner](https://img.shields.io/badge/Verdant-Chat%20Platform-4a9e8e?style=for-the-badge&logo=data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCI+PHBhdGggZmlsbD0id2hpdGUiIGQ9Ik0yMCA2SDRjLTEuMSAwLTIgLjktMiAydjhsMiAyaDJ2MmwyIDItMi0yVjhoMTR2OGgydi0yaDJ2LTJsMi0yVjhjMC0xLjEtLjktMi0yLTJ6Ii8+PC9zdmc+)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react)](https://react.dev)
[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=flat-square&logo=node.js)](https://nodejs.org)
[![Socket.io](https://img.shields.io/badge/Socket.io-4.x-010101?style=flat-square&logo=socket.io)](https://socket.io)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=flat-square&logo=mongodb)](https://mongodb.com)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)

---

## 📸 Screenshots

| Channel Chat | Music Lounge | Admin Panel |
|---|---|---|
| Real-time messaging with role badges | Stranger Things music player | Full user & channel management |

---

## ✨ Features

### 💬 Real-Time Messaging
- Instant messaging via **WebSocket (Socket.IO)**
- **Typing indicators** — live "user is typing…" with animated dots
- **Message pinning** — moderators can pin/unpin messages
- **Message deletion** — soft-delete with `[message deleted]` tombstone
- Auto-scroll to latest message

### 🗂️ Channel & Category System
- Organized **categories** containing **channels** (Discord-style)
- Per-channel settings: **Read-only**, **Locked**, **Private**
- Owner can create/delete/rename channels and categories in real-time
- Channels support custom **emojis** and **descriptions**

### 🎵 Music Lounge (Voice Channel)
- **Stranger Things themed** music lounge
- Playlist: Main Theme · Running Up That Hill · Should I Stay · Every Breath You Take · Master of Puppets
- Beautiful **Discord-style lobby** — join screen with live member count
- Spinning **album art** with per-track colour theming
- **YouTube-powered** embedded audio — no API key needed
- Real-time **listening members** panel with sound wave animations
- Previous / Stop / Next controls + volume slider

### 👥 User Management
- **3-tier role system**: Owner → Moderator → Member
- Role-coloured avatars, badges, and usernames throughout the UI
- First registered user automatically becomes **Owner**
- Owner can promote, demote, kick, or ban users instantly
- Live **online/offline** status with coloured status dots

### 📨 Direct Messages
- **Private 1-on-1 DMs** between any users
- DM conversation list with **unread badges**
- **Toast notifications** for incoming DMs
- Typing indicators in DMs
- Persistent message history

### 🛡️ Admin Panel
- Full **server statistics** (users, messages, channels)
- User management table: role changes, kick, ban
- Channel management: create, delete, toggle settings
- Live updates — changes reflect instantly across all clients

### ⌨️ Slash Commands
Type `/help` in any channel to see all commands:

| Command | Permission | Description |
|---|---|---|
| `/help` | All | Show command list |
| `/online` | All | List online users |
| `/whoami` | All | Your profile info |
| `/rooms` | All | List all channels |
| `/kick <user>` | Mod+ | Kick a user |
| `/pin <msgId>` | Mod+ | Pin/unpin a message |
| `/delete <msgId>` | Mod+ | Delete a message |
| `/promote <user> <role>` | Owner | Change user role |
| `/ban <user>` | Owner | Ban a user |
| `/newchannel <cat> <name>` | Owner | Create channel |
| `/readonly <channel>` | Owner | Toggle read-only |
| `/lock <channel>` | Owner | Toggle lock |
| `/private <channel>` | Owner | Toggle private |
| `/clear` | Owner | Wipe room messages |
| `/stats` | Owner | Server statistics |

---

## 🏗️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18, Vite, CSS3 |
| **Backend** | Node.js, Express.js |
| **Real-time** | Socket.IO 4.x |
| **Database** | MongoDB + Mongoose |
| **Auth** | JWT (JSON Web Tokens) |
| **Audio** | YouTube Embed API (no key) |
| **Deployment** | Vercel (frontend) + Railway/Render (backend) |

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- MongoDB Atlas account (or local MongoDB)
- Git

### 1. Clone the repository
```bash
git clone https://github.com/yourusername/verdant-chat.git
cd verdant-chat
