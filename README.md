# 🚀 Collaborative Code Editor

A **real-time collaborative code editor** that enables multiple developers to code together seamlessly with WebSocket-based synchronization, live cursor tracking, and integrated code execution capabilities.

![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Key Features](#-key-features)
- [Technology Stack](#-technology-stack)
- [Project Structure](#-project-structure)
- [Installation & Setup](#-installation--setup)
- [Architecture](#-architecture)
- [API Documentation](#-api-documentation)
- [Usage Guide](#-usage-guide)
- [Code Execution](#-code-execution)
- [Database Schema](#-database-schema)
- [Deployment](#-deployment)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🎯 Overview

The **Collaborative Code Editor** is a modern web application designed for real-time collaborative programming. It leverages cutting-edge technologies like **Yjs** for CRDT-based data synchronization, **Monaco Editor** for professional code editing, and **WebSockets** for instant communication between clients and the server.

Perfect for:
- **Pair Programming** - Two developers coding together in real-time
- **Code Reviews** - Live code review sessions with multiple participants
- **Educational Coding** - Students and instructors collaborating on assignments
- **Remote Interviews** - Technical interview platforms
- **Team Coding Sessions** - Distributed team development

---

## ✨ Key Features

### 🔄 Real-Time Collaboration
- **Instant Code Synchronization** - Changes propagate across all connected clients in milliseconds
- **Multi-User Support** - Multiple developers can work on the same file simultaneously
- **Conflict Resolution** - CRDT (Conflict-free Replicated Data Types) ensures consistency without conflicts
- **User Awareness** - See who's connected and editing in real-time

### 💻 Professional Code Editing
- **Monaco Editor Integration** - Industry-standard code editor from VS Code
- **Multi-Language Support** - JavaScript, TypeScript, Python, Java, Rust, and more
- **Syntax Highlighting** - Beautiful, language-specific syntax coloring
- **Code Formatting** - Auto-formatting and code intelligence
- **Dark/Light Themes** - Customizable editor themes

### ⚡ Code Execution
- **Built-in Terminal** - Execute code directly from the editor
- **Multiple Language Support** - Run code in various programming languages
- **Real-Time Output** - See execution results instantly
- **Error Handling** - Detailed error messages and debugging information
- **Powered by Code-Executor** - Integrated with [Code-Executor](https://github.com/saishmungase/Code-Executor) for secure, sandboxed code execution

### 📚 History & Persistence
- **Coding History** - Save and retrieve past coding sessions
- **LocalStorage Support** - Client-side history tracking
- **Session Management** - Automatically save coding progress
- **History Browser** - Review and restore previous code versions

### 📊 Room Management
- **Dynamic Room Creation** - Create isolated collaborative spaces
- **Room Persistence** - Track active rooms and participant counts
- **Database Integration** - PostgreSQL backend for persistent storage
- **Room Statistics** - Monitor room activity and user engagement

### 🎨 Modern UI/UX
- **Responsive Design** - Works seamlessly on desktop and tablet
- **Tailwind CSS** - Beautiful, utility-first styling
- **Framer Motion** - Smooth animations and transitions
- **Lucide Icons** - Clean, modern icon set
- **Accessibility** - WCAG-compliant interface

---

## 🛠️ Technology Stack

### Backend
| Technology | Version | Purpose |
|------------|---------|---------|
| **Node.js** | v18+ | JavaScript runtime environment |
| **Express.js** | ^5.1.0 | HTTP server framework |
| **TypeScript** | ^5.8.3 | Type-safe JavaScript |
| **WebSocket (ws)** | ^8.18.1 | Real-time bidirectional communication |
| **Yjs** | ^13.6.26 | CRDT library for conflict-free sync |
| **Prisma** | ^6.11.1 | ORM for database management |
| **MediaSoup** | ^3.19.12 | Media server for peer-to-peer media |
| **PostgreSQL** | - | Relational database |

### Frontend
| Technology | Version | Purpose |
|------------|---------|---------|
| **React** | ^19.0.0 | UI library |
| **TypeScript** | ~5.7.2 | Type-safe development |
| **Vite** | ^6.3.3 | Fast build tool & dev server |
| **Monaco Editor** | ^0.52.2 | Professional code editor |
| **y-monaco** | ^0.1.6 | Yjs binding for Monaco Editor |
| **React Router** | ^7.6.2 | Client-side routing |
| **Tailwind CSS** | ^3.4.17 | Utility-first CSS framework |
| **Framer Motion** | ^12.18.1 | Animation library |
| **y-websocket** | ^3.0.0 | Yjs WebSocket provider |
| **react-syntax-highlighter** | ^15.6.1 | Code highlighting component |
| **Vercel Analytics** | ^1.5.0 | Usage analytics |

---

## 📁 Project Structure

```
COLLAB/
├── README.md                          # This file
├── backend/                           # Node.js/Express server
│   ├── src/
│   │   ├── index.ts                  # Main server entry point
│   │   ├── roomManager.ts            # Room management logic
│   │   ├── room.ts                   # Room and File classes
│   │   ├── count.ts                  # Room counting utilities
│   │   └── generated/
│   │       └── prisma/               # Prisma client (auto-generated)
│   ├── prisma/
│   │   ├── schema.prisma             # Database schema
│   │   └── migrations/               # Database migration files
│   ├── package.json                  # Backend dependencies
│   ├── tsconfig.json                 # TypeScript configuration
│   └── dist/                         # Compiled JavaScript (generated)
│
└── frontend/                          # React/Vite SPA
    ├── src/
    │   ├── App.tsx                   # Root component with routing
    │   ├── main.tsx                  # Application entry point
    │   ├── index.css                 # Global styles
    │   ├── component/
    │   │   ├── room.tsx              # Main collaborative editor
    │   │   ├── landing.tsx           # Landing/home page
    │   │   ├── navbar.tsx            # Navigation component
    │   │   ├── history.tsx           # History/past sessions page
    │   │   └── code-block.tsx        # Code display component
    │   ├── types/
    │   │   └── react-syntax-highlight.d.ts  # Type definitions
    │   ├── public/                   # Static assets
    │   └── assets/                   # Images and media
    ├── package.json                  # Frontend dependencies
    ├── tsconfig.json                 # TypeScript configuration
    ├── vite.config.ts                # Vite build configuration
    ├── tailwind.config.js            # Tailwind CSS configuration
    ├── postcss.config.js             # PostCSS configuration
    ├── eslint.config.js              # ESLint rules
    ├── vercel.json                   # Vercel deployment config
    └── index.html                    # HTML entry point
```

---

## 🚀 Installation & Setup

### Prerequisites

Ensure you have the following installed:
- **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
- **npm** or **yarn** - Comes with Node.js
- **PostgreSQL** (v12 or higher) - [Download](https://www.postgresql.org/)
- **Git** - [Download](https://git-scm.com/)

### Step 1: Clone the Repository

```bash
git clone <repository-url>
cd COLLAB
```

### Step 2: Setup Backend

```bash
cd backend

# Install dependencies
npm install

# Configure environment variables
# Copy the example environment file
cp .env.example .env

# Edit .env with your actual database credentials and user ID

# Setup Prisma (create database and tables)
npx prisma migrate dev --name initial

# Generate Prisma Client
npx prisma generate

# Build TypeScript
npm run build

# Start the server
npm run dev
```

**Server will run on**: `http://localhost:8080`

### Step 3: Setup Frontend

```bash
cd ../frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

**Frontend will run on**: `http://localhost:5173` (or as shown in terminal)

### Step 4: Connect Frontend to Backend

Update the WebSocket connection URL in `frontend/src/component/room.tsx`:

```typescript
// Change the WebSocket connection string if needed
const ws = new WebSocket('ws://localhost:8080');
```

---

## 🏗️ Architecture

### System Design

```
┌─────────────────────────────────────────────────────────────┐
│                    Collaborative Code Editor                │
└─────────────────────────────────────────────────────────────┘
                           │
           ┌───────────────┼───────────────┐
           │               │               │
      ┌────▼────┐   ┌─────▼──────┐   ┌───▼─────┐
      │ Frontend │   │  WebSocket │   │ Analytics
      │  (React) │   │   Server   │   │(Vercel)
      └────┬────┘   └─────┬──────┘   └─────────┘
           │              │
           └──────┬───────┘
                  │
        ┌─────────▼─────────┐
        │   RoomManager     │
        │  (Room + File)    │
        └─────────┬─────────┘
                  │
      ┌───────────▼───────────┐
      │  Yjs (CRDT)           │
      │  Synchronization      │
      └───────────┬───────────┘
                  │
        ┌─────────▼──────────┐
        │   PostgreSQL DB    │
        │  (Room Statistics) │
        └────────────────────┘
```

### Data Flow

1. **User Joins Room**: 
   - Client connects via WebSocket
   - Server creates/retrieves room
   - Sends initial document state (Yjs snapshot)

2. **User Edits Code**:
   - Monaco Editor captures changes
   - Yjs creates CRDT update
   - WebSocket sends update to server
   - Server broadcasts to all other users

3. **Code Execution**:
   - User clicks "Run" button
   - Code sent to Code-Executor
   - Results returned and displayed

4. **History Saving**:
   - Code saved to localStorage every 20 seconds
   - User can browse history anytime

---

## 🌐 API Documentation

### WebSocket Messages

#### Client → Server

**Message Format:**
```json
{
  "userName": "string",
  "type": "init|update",
  "fileName": "string",
  "fileExtension": "string",
  "update": "Uint8Array"
}
```

**Types:**

| Type | Description | Required Fields |
|------|-------------|-----------------|
| `init` | Initialize room connection | `userName`, `fileName`, `fileExtension` |
| `update` | Send document update (CRDT) | `userName`, `update` |

#### Server → Client

```json
{
  "type": "init|update|error|welcome",
  "file": "string",
  "extension": "string",
  "update": "number[]",
  "message": "string"
}
```

**Types:**

| Type | Description | Fields |
|------|-------------|--------|
| `welcome` | Connection established | `message` |
| `init` | Initial document state | `file`, `extension`, `update` |
| `update` | Document update from peer | `update` |
| `error` | Error occurred | `message` |

### HTTP Endpoints

#### Health Check

```bash
GET /health
```

**Response:**
```json
{
  "count": 42
}
```

**Description**: Returns the total number of active rooms/sessions.

---

## 💡 Usage Guide

### Starting a Collaborative Session

1. **Open the application** in your browser
2. **Go to the Landing page** (home)
3. **Click "Create Room"** or **"Join Room"**
4. **Enter your username** and choose a programming language
5. **Start coding** - Your changes sync in real-time!

### Editing Code

- **Editor Features**:
  - Syntax highlighting for 50+ languages
  - Code completion and intelligence
  - Multi-cursor support
  - Find & Replace
  - Indentation guides
  - Line numbers

### Running Code

1. **Click the "Play" button** in the toolbar
2. **See real-time execution output** in the terminal
3. **Handle errors gracefully** with detailed error messages

### Managing History

1. **Enable history** in settings
2. **Code is auto-saved** every 20 seconds
3. **Visit History page** to review past sessions
4. **Click to restore** any previous code

---

## ⚙️ Code Execution

This project integrates with **[Code-Executor](https://github.com/saishmungase/Code-Executor)** for secure, sandboxed code execution.

### Supported Languages

- JavaScript / TypeScript
- Python
- Java
- Rust
- C / C++

### How It Works

1. User clicks "Run" button in the editor
2. Code is sent to the Code-Executor backend
3. Code runs in an isolated sandbox environment
4. Output is captured and returned
5. Results displayed in the terminal panel
6. Errors and exceptions are properly handled

### Integration

The Code-Executor is integrated through the frontend's room component. The execution endpoint can be configured in environment variables.

---

## 🗄️ Database Schema

### Prisma Schema

```prisma
model RoomCount {
  id     String  @unique
  name   String
  rooms  Int
}
```

### Table Description

| Field | Type | Purpose |
|-------|------|---------|
| `id` | String | Unique identifier |
| `name` | String | User/Account name |
| `rooms` | Int | Total count of sessions created |

### Database Migrations

All schema changes are tracked in `backend/prisma/migrations/`. Each migration is versioned with a timestamp.

```bash
# View migration status
npx prisma migrate status

# Create new migration
npx prisma migrate dev --name description

# Reset database (development only!)
npx prisma migrate reset
```
---

## 👥 Contributing

We welcome contributions! Here's how to get started:

### Development Workflow

1. **Fork the repository**
   ```bash
   git clone https://github.com/yourusername/COLLAB.git
   ```

2. **Create a feature branch**
   ```bash
   git checkout -b feature/awesome-feature
   ```

3. **Make your changes**
   - Follow the existing code style
   - Write clear commit messages
   - Add tests for new features

4. **Test thoroughly**
   ```bash
   # Backend
   cd backend && npm run build

   # Frontend
   cd frontend && npm run lint && npm run build
   ```

5. **Submit a Pull Request**
   - Describe your changes clearly
   - Link any related issues
   - Ensure all tests pass

### Code Style

- **TypeScript**: Use strict mode, proper types
- **React**: Functional components, hooks
- **CSS**: Use Tailwind utilities
- **Commits**: Follow conventional commit format

### Issues & Bug Reports

- Check existing issues first
- Provide detailed reproduction steps
- Include error messages and screenshots
- Suggest potential solutions

---

## 📝 License

This project is licensed under the **ISC License** - see the LICENSE file for details.

---

## 🔗 External Resources

### Key Dependencies
- **[Yjs Documentation](https://docs.yjs.dev/)** - CRDT Framework
- **[Monaco Editor](https://microsoft.github.io/monaco-editor/)** - Code Editor
- **[Prisma](https://www.prisma.io/docs/)** - ORM
- **[Express.js](https://expressjs.com/)** - Web Framework
- **[React](https://react.dev/)** - UI Library
- **[WebSocket](https://developer.mozilla.org/en-US/docs/Web/API/WebSocket)** - Real-time Communication

### Related Projects
- **[Code-Executor](https://github.com/saishmungase/Code-Executor)** - Code execution engine (integrated)
- **[Collaborative Editing Patterns](https://blog.kevinjahns.de/are-crdts-suitable-for-shared-editing/)** - Architecture insights

---

## 📧 Contact & Support

- **GitHub Issues**: [Report bugs or request features](../../issues)
- **Email**: saish@example.com
- **Author**: [Saish Mungase](https://github.com/saishmungase)

---

## 🎉 Acknowledgments

- Thanks to the Yjs team for the amazing CRDT library
- Microsoft for Monaco Editor
- The open-source community for excellent tools and libraries
- All contributors and users supporting this project

---

**Made with ❤️ by the [Saish](https://x.com/saishmungase)**

**Last Updated**: January 2026

---

## Quick Reference

| Command | Purpose |
|---------|---------|
| `npm install` | Install dependencies |
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npx prisma studio` | Open database GUI |
| `npx prisma migrate dev` | Create database migration |

---

**Happy Coding! 🚀**
