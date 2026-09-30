# Collabify – Real-Time Team Collaboration & Project Management Platform

[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)](https://nodejs.org/)
[![React Version](https://img.shields.io/badge/react-18.2.0-blue.svg)](https://reactjs.org/)
[![License: ISC](https://img.shields.io/badge/License-ISC-yellow.svg)](https://opensource.org/licenses/ISC)
[![Architecture: Full-Stack MERN](https://img.shields.io/badge/Stack-MERN%20%2B%20Socket.IO-indigo.svg)](https://expressjs.com/)

> A modern, production-grade full-stack team collaboration and project management SaaS platform designed with **React.js, Node.js, Express.js, MongoDB, Mongoose, and Socket.IO**. Features real-time team messaging, interactive Kanban boards, role-based access control, project analytics, and a unified enterprise validation system.

---

## 🌟 Table of Contents
1. [Project Overview](#-project-overview)
2. [Key Features](#-key-features)
3. [Technology Stack & Justification](#-technology-stack--justification)
4. [Architecture & Workflow](#-architecture--workflow)
5. [System Directory Structure](#-system-directory-structure)
6. [Global Enterprise Validation System](#-global-enterprise-validation-system)
7. [Installation & Setup](#-installation--setup)
8. [Environment Configuration](#-environment-configuration)
9. [REST API Documentation](#-rest-api-documentation)
10. [Real-Time WebSocket Events](#-real-time-websocket-events)
11. [How to Explain Collabify in an Interview](#-how-to-explain-collabify-in-an-interview)

---

## 🚀 Project Overview

**Collabify** solves the communication gap in team workflows by consolidating project management, Kanban task tracking, team communication, and activity audit logs into a unified SaaS experience.

Built with freshers and hiring managers in mind, the codebase is modular, readable, fully typed with modern JavaScript, and strictly adheres to modern separation of concerns without convoluted abstractions.

---

## ✨ Key Features

- **🔐 Robust Authentication & Session Management**:
  - Secure registration and login using JSON Web Tokens (JWT) and bcryptjs salted password hashing.
  - Automatic token expiration handling, protected client routes, and authorization headers.
  - Profile management, bio character counters, and password update with verification.

- **🛡️ Enterprise Real-Time Validation System**:
  - **Strict Gmail Policy**: Validates and accepts only valid addresses ending with `@gmail.com`.
  - **Name & Username Constraints**: 2–50 character bounds for names (letters & spaces only); 3–20 character limits for usernames (alphanumeric & underscore only, no spaces).
  - **Password Strength Checker**: Real-time interactive criteria checklist (min 8 chars, uppercase, lowercase, number, special symbol) with Show/Hide toggle.
  - **Live Character Counters**: Counters on project names, task titles, descriptions, bios, and comments with threshold warnings.
  - **Date Validation**: Ensures project/task end dates are never scheduled earlier than start dates.
  - **Mirrored Express Middleware**: Matching validation at both client and server layers.

- **📁 Project Management & RBAC (Role-Based Access Control)**:
  - Complete CRUD: Create, read, update, and delete projects with start/end dates, priorities, and statuses.
  - Role hierarchy: **Owner**, **Admin**, **Member**, **Viewer** with fine-grained action authorization.
  - Member invitation engine with notifications and Accept/Reject workflow.

- **📋 Task Management & Kanban Board**:
  - Task states: `TODO`, `IN PROGRESS`, `REVIEW`, `COMPLETED`.
  - Drag-and-drop or 1-click status transitions with immediate database synchronization.
  - Priorities: `Low`, `Medium`, `High`, `Urgent` with color-coded badge indicators.
  - Overdue detection based on due dates.

- **💬 Real-Time Collaboration & Chat**:
  - Instant project chat channels powered by Socket.IO rooms.
  - Live typing indicators, message timestamps, and real-time online member counters.
  - Persistent MongoDB chat history.

- **🔔 Notifications & Audit Trail (Activity Timeline)**:
  - Notifications for project invites, task assignments, status transitions, and comments.
  - Unread notification counter, mark individual/all as read, and direct navigation links.
  - Comprehensive chronological activity feed logging all actions in the workspace.

- **📊 SaaS Dashboard & Project Analytics**:
  - Metrics cards: Total Projects, Active Projects, Completed Projects, Total Tasks, Completed Tasks, Pending Tasks, and Overdue Tasks.
  - Completion progress bars and recent project/task summaries.

- **🌓 Dark Mode & Modern SaaS UI**:
  - Clean light and dark modes with preference stored in `localStorage`.
  - Responsive layouts optimized for Desktop, Tablet, and Mobile devices.

---

## 🛠 Technology Stack & Justification

| Technology | Purpose | Why We Use It |
| :--- | :--- | :--- |
| **React.js 18** | Frontend Framework | Declarative component model, virtual DOM for instant UI updates, and native hook ecosystem (`useState`, `useEffect`, `useContext`, `useRef`). |
| **Vite** | Build Tool | Lightning-fast Hot Module Replacement (HMR) and optimized Rollup-based production bundling. |
| **React Router v6** | Client Routing | Declarative routing with protected route guards and nested dashboard layouts. |
| **Axios** | HTTP Client | Centralized request/response interceptors that automatically attach JWT Bearer tokens and handle 401 unauthorization. |
| **Context API** | State Management | Native React state management for Auth, Projects, Notifications, and Toasts without the boilerplate of Redux. |
| **Node.js & Express**| Backend Runtime & REST API | Fast, event-driven, non-blocking I/O with clean middleware pipeline and RESTful conventions. |
| **MongoDB & Mongoose**| Database & ODM | Schema validation, easy references (`populate`), and native JSON document storage. |
| **Socket.IO** | WebSocket Engine | Bidirectional low-latency events for live messaging, typing indicators, and real-time notifications with automatic reconnection. |
| **JWT & bcryptjs** | Authentication & Security | Stateless authentication via signed tokens and industry-standard 10-round salted password hashing. |

---

## 🏛 Architecture & Workflow

```text
                                +-----------------------------+
                                |      React.js (Vite)        |
                                |  Context API + Custom Hooks |
                                +--------------+--------------+
                                               |
                          REST API (Axios)     |     WebSockets (Socket.IO)
                       +-----------------------+-----------------------+
                       |                                               |
                       v                                               v
        +------------------------------+               +-------------------------------+
        |      Express.js Server       |               |       Socket.IO Server        |
        | - Auth Middleware (JWT)      |               | - Room Management (Project ID)|
        | - Validation Middleware      |               | - Typing Indicators           |
        | - Centralized Error Handler  |               | - Real-Time Message Broadcast |
        +--------------+---------------+               +---------------+---------------+
                       |                                               |
                       +-----------------------+-----------------------+
                                               |
                                               v
                                +------------------------------+
                                |      MongoDB (Mongoose)      |
                                |  Users, Projects, Tasks,     |
                                |  Comments, Messages, Alerts  |
                                +------------------------------+
```

---

## 📂 System Directory Structure

```text
collabify/
├── client/
│   ├── public/
│   │   └── vite.svg
│   ├── src/
│   │   ├── api/
│   │   │   ├── axios.js               # Centralized Axios with JWT interceptors
│   │   │   ├── authApi.js             # Authentication API service
│   │   │   ├── projectApi.js          # Project CRUD & team invitation API
│   │   │   ├── taskApi.js             # Task CRUD & comment API
│   │   │   ├── userApi.js             # Profile & user search API
│   │   │   └── notificationApi.js     # Notification alerts API
│   │   ├── components/
│   │   │   ├── Navbar.jsx             # Top bar with search, theme switch & notifications
│   │   │   ├── Sidebar.jsx            # Left navigation with unread badge
│   │   │   ├── ProjectCard.jsx        # Project card with progress bar
│   │   │   ├── TaskCard.jsx           # Task item with priority badge & due date
│   │   │   ├── TaskModal.jsx          # Task create/edit modal with validation
│   │   │   ├── ProjectModal.jsx       # Project create/edit modal with validation
│   │   │   ├── ConfirmDialog.jsx      # Confirmation modal for destructive actions
│   │   │   ├── Loading.jsx            # Loading spinners and full-screen states
│   │   │   ├── EmptyState.jsx         # Friendly empty state display
│   │   │   ├── NotificationDropdown.jsx # Quick notification bell dropdown
│   │   │   ├── ChatBox.jsx            # Real-time chat with Socket.IO
│   │   │   ├── ActivityFeed.jsx       # Activity timeline component
│   │   │   ├── FormInput.jsx          # Reusable validated input with icons
│   │   │   ├── FormTextarea.jsx       # Reusable textarea with character counter
│   │   │   └── PasswordInput.jsx      # Password input with show/hide & criteria
│   │   ├── context/
│   │   │   ├── AuthContext.jsx        # Authentication and Theme provider
│   │   │   ├── ProjectContext.jsx     # Projects state provider
│   │   │   ├── NotificationContext.jsx# Live notifications provider
│   │   │   └── ToastContext.jsx       # Unified toast notifications provider
│   │   ├── hooks/
│   │   │   └── useAuth.js             # Convenient Auth hook
│   │   ├── layouts/
│   │   │   ├── DashboardLayout.jsx    # Sidebar + Navbar shell
│   │   │   └── AuthLayout.jsx         # Centered card shell for Login/Register
│   │   ├── pages/
│   │   │   ├── Landing.jsx            # Marketing homepage
│   │   │   ├── Login.jsx              # Sign in with Gmail validation
│   │   │   ├── Register.jsx           # Sign up with real-time feedback
│   │   │   ├── Dashboard.jsx          # Analytics & recent activities
│   │   │   ├── Projects.jsx           # Projects grid with filters and pagination
│   │   │   ├── ProjectDetails.jsx     # Project workspace with 6 tabs & Kanban
│   │   │   ├── Tasks.jsx              # Global tasks list with filtering
│   │   │   ├── TaskDetails.jsx        # Task view with discussion & comments
│   │   │   ├── Messages.jsx           # Dedicated team messaging channels
│   │   │   ├── Notifications.jsx      # Notifications center
│   │   │   ├── Profile.jsx            # Profile editing & password change
│   │   │   ├── Settings.jsx           # Application settings & appearance
│   │   │   └── NotFound.jsx           # 404 Error page
│   │   ├── routes/
│   │   │   └── ProtectedRoute.jsx     # Route authentication guard
│   │   ├── utils/
│   │   │   ├── constants.js           # Shared constants (statuses, priorities)
│   │   │   ├── helpers.js             # Date formatting & badge classes
│   │   │   └── validators.js          # Client-side validation suite
│   │   ├── App.jsx                    # Application root & route definitions
│   │   ├── main.jsx                   # Vite entry point
│   │   └── index.css                  # Design system tokens & Light/Dark themes
│   ├── index.html
│   ├── vite.config.js
│   ├── package.json
│   ├── .env
│   └── .env.example
│
├── server/
│   ├── config/
│   │   └── db.js                      # MongoDB Mongoose connection
│   ├── controllers/
│   │   ├── authController.js          # Register, Login, Me, Logout
│   │   ├── userController.js          # Profile, password, user search
│   │   ├── projectController.js       # Project CRUD, members & invitations
│   │   ├── taskController.js          # Task CRUD & Kanban status moves
│   │   ├── commentController.js       # Task comments CRUD
│   │   ├── messageController.js       # Project chat history & fallback POST
│   │   ├── notificationController.js  # Notifications CRUD & mark-read
│   │   └── activityController.js      # Project audit log & recent activities
│   ├── middleware/
│   │   ├── authMiddleware.js          # JWT verification & RBAC access
│   │   ├── errorMiddleware.js         # 404 & Centralized JSON error handler
│   │   └── validationMiddleware.js    # Express validation mirroring client
│   ├── models/
│   │   ├── User.js                    # User schema with bcrypt pre-save
│   │   ├── Project.js                 # Project schema with members array
│   │   ├── Task.js                    # Task schema with status & priority
│   │   ├── Comment.js                 # Task comments schema
│   │   ├── Message.js                 # Project chat messages schema
│   │   ├── Notification.js            # User alerts schema
│   │   ├── Invitation.js              # Project invitations schema
│   │   └── Activity.js                # Audit log schema
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── userRoutes.js
│   │   ├── projectRoutes.js
│   │   ├── taskRoutes.js
│   │   ├── commentRoutes.js
│   │   ├── messageRoutes.js
│   │   ├── notificationRoutes.js
│   │   └── activityRoutes.js
│   ├── sockets/
│   │   └── socket.js                  # Socket.IO connection & rooms logic
│   ├── utils/
│   │   ├── generateToken.js           # JWT generator
│   │   ├── createNotification.js      # Notification helper with socket emit
│   │   └── validators.js              # Server-side validation suite
│   ├── app.js                         # Express configuration
│   ├── server.js                      # HTTP & Socket.IO server startup
│   ├── package.json
│   ├── .env
│   └── .env.example
│
├── postman_collection.json            # Complete Postman API testing suite
├── create_zip.js                      # Pure Node.js ZIP packaging script
├── create_zip.bat                     # Windows 1-click ZIP builder
├── .gitignore
├── README.md
└── package.json                       # Root script orchestrator
```

---

## 🛡️ Global Enterprise Validation System

Collabify implements **two-layer mirrored validation**: Every validation applied in React components is verified again in Express middleware before reaching MongoDB.

1. **Gmail Rule**:
   - Only addresses ending with `@gmail.com` are accepted.
   - Message: `Please enter a valid Gmail address ending with @gmail.com`.
2. **Name Rule**:
   - Letters and spaces only. Between 2 and 50 characters.
   - Error: `Name should contain only letters and spaces.` / `Name must be between 2 and 50 characters.`
3. **Username Rule**:
   - 3 to 20 characters. Letters, numbers, and underscores only. No spaces.
4. **Password Strength Rule**:
   - Minimum 8 characters. Must contain at least 1 uppercase letter, 1 lowercase letter, 1 number, and 1 special character.
   - Includes live interactive checklist and Show/Hide toggle.
5. **Confirm Password Rule**:
   - Must match the password field identically.
6. **Project & Task Bounds**:
   - Titles/Names must be 3–100 characters. Whitespace-only values are rejected.
   - Descriptions capped with live character countdown (e.g., `240 / 500`).
7. **Date Logic Rule**:
   - Project End Date cannot be earlier than Start Date.

---

## ⚡ Installation & Setup

### Prerequisites
- [Node.js](https://nodejs.org/) (v18.0.0 or higher recommended)
- [MongoDB](https://www.mongodb.com/) (Local Community Server running on `mongodb://127.0.0.1:27017` or MongoDB Atlas URI)
- [Git](https://git-scm.com/)

### Step 1: Clone or Navigate to Directory
```bash
cd collabify
```

### Step 2: Install All Dependencies
You can install dependencies for root, server, and client concurrently using:
```bash
npm run install:all
```
*(Or install manually: `npm install && cd server && npm install && cd ../client && npm install`)*

### Step 3: Configure Environment Variables
Create `.env` in `server/`:
```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://127.0.0.1:27017/collabify
JWT_SECRET=collabify_super_secret_jwt_key_2026_production
CLIENT_URL=http://localhost:5173
```

Create `.env` in `client/`:
```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

### Step 4: Run Application in Development Mode
From the root directory:
```bash
npm run dev
```
This starts both:
- **Backend API & WebSockets**: `http://localhost:5000`
- **Frontend Client**: `http://localhost:5173`

---

## 📡 REST API Documentation

All secured endpoints require the header: `Authorization: Bearer <token>`.

### Authentication (`/api/auth`)
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Register new user with Gmail & password | No |
| `POST` | `/api/auth/login` | Login with Gmail and password, receives JWT | No |
| `GET` | `/api/auth/me` | Fetch currently logged in user profile | Yes |
| `POST` | `/api/auth/logout` | Invalidate client session | Yes |

### User Management (`/api/users`)
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/users/profile` | Get user profile with project/task stats | Yes |
| `PUT` | `/api/users/profile` | Update full name, username, bio, avatar | Yes |
| `PUT` | `/api/users/change-password`| Change user password | Yes |
| `GET` | `/api/users/search?q=...` | Search users by name/username/email | Yes |

### Project Management (`/api/projects`)
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/projects` | Create a new project | Yes |
| `GET` | `/api/projects` | List projects (search, filter, sort, page) | Yes |
| `GET` | `/api/projects/:id` | Get project details, team & task stats | Yes |
| `PUT` | `/api/projects/:id` | Update project details (Owner/Admin) | Yes |
| `DELETE`| `/api/projects/:id` | Delete project and related data (Owner only)| Yes |
| `POST` | `/api/projects/:id/invite` | Invite user by Gmail or username | Yes |
| `PUT` | `/api/projects/:id/members/:memberId/role` | Update member role | Yes |
| `DELETE`| `/api/projects/:id/members/:memberId` | Remove member from project | Yes |
| `GET` | `/api/projects/invitations/my` | View my pending project invitations | Yes |
| `PUT` | `/api/projects/invitations/:id/respond` | Accept or reject invitation | Yes |

### Task Management (`/api/tasks`)
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/tasks` | Create task within a project | Yes |
| `GET` | `/api/tasks` | Get all tasks (project, status, priority) | Yes |
| `GET` | `/api/tasks/:id` | Get single task details | Yes |
| `PUT` | `/api/tasks/:id` | Update task (Kanban status, priority, etc.) | Yes |
| `DELETE`| `/api/tasks/:id` | Delete task and its comments | Yes |
| `POST` | `/api/tasks/:taskId/comments` | Post comment on task | Yes |
| `GET` | `/api/tasks/:taskId/comments` | Get all comments for a task | Yes |

### Real-Time Chat & Activities
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/messages/:projectId` | Fetch chat message history for project | Yes |
| `POST` | `/api/messages/:projectId` | Send message via REST (Fallback) | Yes |
| `GET` | `/api/notifications` | Get user notifications & unread count | Yes |
| `PUT` | `/api/notifications/read-all`| Mark all notifications as read | Yes |
| `GET` | `/api/activities/project/:id`| Get activity timeline for project | Yes |
| `GET` | `/api/activities/recent` | Get recent activities for dashboard | Yes |

---

## 🔌 Real-Time WebSocket Events

Using **Socket.IO** for real-time communication:

| Event Name | Direction | Payload | Description |
| :--- | :--- | :--- | :--- |
| `setupUser` | Client → Server | `userId` | Joins private user room for notifications |
| `joinProject` | Client → Server | `{ projectId, user }` | Joins project chat room |
| `leaveProject`| Client → Server | `{ projectId, userId }` | Leaves project chat room |
| `sendMessage` | Client → Server | `{ projectId, senderId, text }` | Persists message in MongoDB & broadcasts |
| `receiveMessage` | Server → Client | `Message object` | Real-time chat message broadcast |
| `typing` | Client → Server | `{ projectId, username, fullName }` | Dispatches live typing indicator |
| `userTyping` | Server → Client | `{ projectId, username, fullName }` | Displays "user is typing..." indicator |
| `stopTyping` | Client → Server | `{ projectId, username }` | Stops typing indicator |
| `projectOnlineUsers` | Server → Client | `{ projectId, onlineCount, onlineUserIds }` | Broadcasts active online user count |
| `newNotification` | Server → Client | `Notification object` | Live alert delivered directly to recipient |

---

## 🎯 How to Explain Collabify in an Interview

When asked: *"Walk me through your most impactful full-stack project."*

### 1. High-Level Elevator Pitch
> *"I built **Collabify**, a real-time team collaboration and project management SaaS platform using the MERN stack (MongoDB, Express, React, Node.js) and Socket.IO. The platform enables distributed teams to manage projects, organize tasks through an interactive Kanban board, communicate in real-time project chat channels, and receive instant notifications. I implemented a strict, mirrored enterprise validation system across both client and server, role-based access control, and complete project analytics."*

### 2. Deep Dive: Key Technical Decisions & Challenges
- **Why Socket.IO over polling?**
  > *"For project messaging and typing indicators, polling creates unnecessary server overhead. Socket.IO provides full-duplex communication with room-based multiplexing (`socket.join(projectId)`), drastically lowering latency and database read requests."*
- **How was Data Integrity ensured?**
  > *"I avoided relying solely on frontend validation. I engineered a centralized validation library that is mirrored on the Express backend as middleware. For example, email inputs enforce strict Gmail structure, names disallow numbers and special symbols, and passwords enforce complexity with bcryptjs 10-round salting."*
- **How was State Managed?**
  > *"Instead of introducing heavy Redux boilerplate, I structured the state into four modular React Contexts: `AuthContext`, `ProjectContext`, `NotificationContext`, and `ToastContext`. This kept re-renders localized and made the codebase easy to maintain and test."*
- **Role-Based Access Control (RBAC)**:
  > *"Projects support four roles: Owner, Admin, Member, and Viewer. Owners have total control including deletion, Admins can manage tasks and members, Members can create tasks and comments, and Viewers have read-only access. Middleware on the backend validates these permissions on every protected endpoint."*

---

## 📦 Creating the ZIP File

To package the entire repository into `collabify.zip`:
```bash
node create_zip.js
```
or on Windows, simply double-click `create_zip.bat`!

---

## 📄 License
This project is licensed under the ISC License.
