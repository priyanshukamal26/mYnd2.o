# mYnd2.0 🧠

**mYnd2.0** is a comprehensive productivity and analytics platform designed specifically for students. It goes beyond simple to-do lists by integrating **energy level tracking**, **learning pattern analysis**, and **automated scheduling**.

![Project Status](https://img.shields.io/badge/status-active-success.svg)
![License](https://img.shields.io/badge/license-MIT-blue.svg)

## ✨ Key Features

-   **Smart Task Management**: Categorize tasks (Essay, P-Set, Reading) and assign estimated time & energy levels.
-   **Automated Daily Plan**: Algorithmically generates a daily schedule based on your available hours and energy peaks.
-   **Learning Analytics**: The system "learns" your work patterns. If you consistently underestimate "Problem Sets" by 20%, mYnd will automatically adjust future estimates.
-   **Insights Dashboard**: Visual analytics using Recharts to show weekly focus, category distribution, and estimation accuracy.
-   **Full Privacy**: All data is isolated per user. Secure JWT authentication.

## 🛠️ Tech Stack

**Frontend**
-   **Framework**: React 18 + Vite
-   **UI Library**: shadcn/ui + Tailwind CSS
-   **Animations**: Framer Motion
-   **Charts**: Recharts
-   **State**: TanStack Query + Context API

**Backend**
-   **Server**: Node.js + Express
-   **Database**: SQLite (Local) / PostgreSQL (Production)
-   **ORM**: Prisma 6
-   **Auth**: JWT (JSON Web Tokens) + bcrypt

## 🚀 Quick Start (Local)

**Windows Users:**
Simply double-click the `start.bat` file in the root directory.

**Manual Setup:**
```bash
# 1. Install dependencies
npm install && cd server && npm install && cd ..

# 2. Setup Database
cd server && npx prisma db push && cd ..

# 3. Run
npm run dev:full
```

See [SETUP.md](./SETUP.md) for detailed instructions.

## 📂 Project Structure

```
mYnd2.0/
├── src/                # Frontend React App
│   ├── components/     # Reusable UI components
│   ├── pages/          # Route pages (Dashboard, Auth, Insights)
│   ├── contexts/       # Global state (Auth, Tasks)
│   └── lib/            # Utilities & API client
├── server/             # Backend Express App
│   ├── src/
│   │   ├── routes/     # API Endpoints
│   │   └── middleware/ # Auth middleware
│   └── prisma/         # Database Schema
└── public/             # Static assets
```