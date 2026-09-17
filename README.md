# Real-Time Collaborative Workspace

A production-style full-stack web application designed for real-time team collaboration, live document editing, presence tracking, Kanban task management, and document comments.

Built with **React, Vite, Node.js, Express, PostgreSQL, Redis, Socket.IO, and Docker Compose**.

---

## 🏗️ System Architecture

```text
                               +----------------------------------+
                               |     React 18 Client (Vite)       |
                               | React Router / Tailwind / Axios  |
                               +----------------+-----------------+
                                                |
                                      REST API  |  WebSockets (Socket.IO)
                                                v
                               +----------------+-----------------+
                               |    Node.js / Express Backend     |
                               | REST Controllers | Socket Manager|
                               +--------+----------------+--------+
                                        |                |
                          PostgreSQL    |                | Redis Cache & Presence
                       (Parameterized)  v                v
                              +---------+---+      +-----+---------+
                              | PostgreSQL  |      |  Redis Store  |
                              |  Database   |      | Sessions/Cache|
                              +-------------+      +---------------+
```

---

## ✨ Features

- 🔐 **Authentication & Sessions**: Email/Password login, bcrypt hashing, JWT issuance, and Redis-backed session token invalidation.
- 👥 **Real-Time Online Presence**: Live online user indicator powered by Redis SETs (`workspace:<id>:online-users`) and WebSocket events.
- 📄 **Real-Time Collaborative Document Editor**: Synchronized document text editing without full-page refreshes.
- ⚡ **Debounced Auto-Save & Versioning**: Auto-saves document content to PostgreSQL after 750ms of inactivity and records version snapshots (`document_versions`).
- ✍️ **Live Typing Indicators**: Displays active typing statuses (*"Aditya is typing..."*) over Socket.IO without database write overhead.
- 📋 **Kanban Task Board**: Drag/move tasks between `TODO`, `IN_PROGRESS`, and `DONE` columns with instant real-time broadcasts to all team members.
- 💬 **Document Comments**: Real-time commenting feed per document with instant socket broadcasts.
- 🔔 **Push Notifications**: Live toast popups and notification list for task assignments and comment updates.
- 🔍 **Workspace Search**: Parameterized SQL search querying documents, tasks, and members simultaneously.
- ⚡ **Redis Cache Layer**: Caches workspace metadata with automatic eviction/invalidation on write operations.
- 🐳 **Dockerized Setup**: Containerized with multi-stage Dockerfiles and `docker-compose.yml`.

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18, Vite, JavaScript, Tailwind CSS, React Router v6, Axios, Socket.IO Client, Lucide Icons |
| **Backend** | Node.js, Express.js, Socket.IO, `pg` (PostgreSQL client pool), `ioredis`, bcryptjs, jsonwebtoken, helmet |
| **Database** | PostgreSQL 16 (Parameterized SQL, Migrations, Foreign Key Cascades) |
| **Caching / Sessions** | Redis 7 (Hash/Set data structures for online presence & cached workspace details) |
| **Containerization** | Docker, Docker Compose |

---

## 🔑 Demo Credentials

The database comes pre-seeded with 4 demo accounts:

| User | Email | Password | Role in Demo Workspace |
|---|---|---|---|
| **Aditya Sharma** | `aditya@example.com` | `password123` | Owner (Engineering Team) |
| **Rahul Verma** | `rahul@example.com` | `password123` | Admin (Engineering Team) |
| **Priya Patel** | `priya@example.com` | `password123` | Member (Engineering Team) / Owner (Product) |
| **Neha Gupta** | `neha@example.com` | `password123` | Admin (Product & Design) |

> 💡 **Quick Test**: Open two separate browser windows (or an Incognito window) and log in as **User A (Aditya)** and **User B (Rahul)** to test multi-user real-time document editing, live typing indicators, and instant task updates!

---

## 🚀 Quick Start with Docker Compose

Ensure Docker Desktop is running, then execute:

```bash
# Clone the repository
cd real-time-collaborative-workspace

# Build and start all 4 services (PostgreSQL, Redis, Backend, Frontend)
docker compose up --build
```

Access the application in your browser:
- **Frontend**: [http://localhost:5173](http://localhost:5173)
- **Backend API**: [http://localhost:5000/api/health](http://localhost:5000/api/health)

---

## 💻 Manual Local Development Setup

If running without Docker:

### 1. Prerequisites
- Node.js (v18+)
- PostgreSQL server running locally on port `5432`
- Redis server running locally on port `6379`

### 2. Environment Variables
Copy `.env.example` to root `.env`:
```bash
cp .env.example .env
```

### 3. Backend Setup
```bash
cd server
npm install
npm run dev
```
*(The backend automatically creates tables and seeds demo data on first startup via `src/db/initDb.js`)*

### 4. Frontend Setup
```bash
cd client
npm install
npm run dev
```

---

## 🗄️ Database Schema

```text
users (id, name, email, password_hash, created_at)
  │
  ├──< workspaces (id, name, description, owner_id)
  │      │
  │      ├──< workspace_members (id, workspace_id, user_id, role)
  │      ├──< documents (id, workspace_id, title, content, created_by, updated_by)
  │      │       │
  │      │       ├──< document_versions (id, document_id, content, edited_by, created_at)
  │      │       └──< comments (id, document_id, user_id, content, created_at)
  │      │
  │      └──< tasks (id, workspace_id, title, description, status, priority, assigned_to)
  │
  └──< notifications (id, user_id, workspace_id, type, message, read, created_at)
```

---

## 📡 WebSocket Architecture

```text
Client A (Aditya)                                Server (Socket.IO)                              Client B (Rahul)
    │                                                     │                                             │
    │ ─── join_workspace { workspaceId } ───────────────> │ ─── Add to Redis Set `online-users`           │
    │ <── online_users_list ───────────────────────────── │ ─── user_joined broadcast ────────────────> │
    │                                                     │                                             │
    │ ─── typing_start { documentId } ──────────────────> │ ─── Broadcast typing_start ───────────────> │
    │                                                     │                                 ("Aditya is typing...")
    │ ─── document_update { title, content } ───────────> │ ─── Broadcast document_updated ───────────> │
    │                                                     │                           (Editor text syncs live)
```

---

## 🧠 Redis Usage Breakdown

1. **Session Storage**: Active JWT sessions are stored in `session:<token>`. Logging out evicts token from Redis for immediate revocation.
2. **Online User Presence**: Tracked in Redis hashes (`workspace:<workspaceId>:online-users`). Updated on socket connection and disconnection.
3. **Workspace Metadata Caching**: Workspace details queries check `cache:workspace:<id>` first. Avoids database roundtrips for frequent reads; invalidated on workspace update/delete operations.

---

## 🎤 How I Would Explain This Project in an Interview

> *"For my project, I built a production-style Real-Time Collaborative Workspace application—similar to a hybrid of Notion and Trello. The core challenge was handling multi-user real-time state synchronization efficiently while maintaining persistent durability.*
> 
> *For the stack, I chose **React and Vite** on the frontend, **Node.js and Express** on the backend, **PostgreSQL** for relational data persistence, **Redis** for caching and session presence, and **Socket.IO** for real-time WebSocket communication.*
> 
> *I used **WebSockets** for high-frequency events like live document text updates, debounced typing indicators ('Aditya is typing...'), and Kanban board task moves so users get instant feedback without refreshing. For data durability, document edits auto-save to PostgreSQL after a 750ms debounce window and create version history snapshots.*
> 
> ***Redis plays three crucial roles**: storing active user session tokens for instant invalidation on logout, holding workspace presence sets (`workspace:123:online-users`) so online user badges reflect real socket connections, and caching workspace details to minimize database load.*
> 
> *The entire application is fully containerized using **Docker and Docker Compose**, making it reproducible with a single `docker compose up` command."*

---

## 🔮 Future Improvements

- Implementation of CRDTs (Yjs / Automerge) for conflict-free concurrent editing.
- Horizontal scaling of WebSocket servers using Redis Pub/Sub Adapter.
- S3/Cloudinary integration for workspace file attachments.
- Rich-text editor integrations (Slate / TipTap).
