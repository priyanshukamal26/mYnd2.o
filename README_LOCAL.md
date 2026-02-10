# Running mYnd2.0 Locally

This guide explains how to run the mYnd2.0 application on your local machine.

## Prerequisites

- **Node.js**: Version 18 or higher (v20+ recommended).
  - Check with: `node --version`

## Quick Start (Windows)

1.  **Double-click `start.bat`** in the project root.
    - This will install dependencies (if needed) and start both the frontend and backend servers.

## Manual Setup & Run

If you prefer using the command line:

### 1. Install Dependencies

You need to install dependencies for both the root project (frontend) and the server (backend).

```bash
# Install root dependencies (frontend)
npm install

# Install server dependencies (backend)
cd server
npm install
cd ..
```

### 2. Set Up Database

The project uses a local SQLite database, so no external database installation is required.
However, you need to ensure the database schema is pushed.

```bash
cd server
npx prisma db push
cd ..
```

### 3. Run the Application

You can run both backend and frontend with a single command:

```bash
npm run dev:full
```

- **Frontend**: http://localhost:8080
- **Backend**: http://localhost:3001

## Troubleshooting

- **Port in use**: If port 8080 or 3001 is already in use, the application might fail to start. Close other applications or change the port in `.env`.
- **Database errors**: If you see database errors, try deleting `server/prisma/dev.db` and running `npx prisma db push` again in the `server` directory.

## Project Structure

- `src/`: Frontend React application (Vite)
- `server/`: Backend Express application
- `server/prisma/`: Database schema and SQLite file
