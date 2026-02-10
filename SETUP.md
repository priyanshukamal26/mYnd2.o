# Local Setup Guide for mYnd2.0 💻

This guide provides step-by-step instructions to get the **mYnd2.0** full-stack application running on your Windows machine.

---

## 1. Prerequisites ⚡

-   **Node.js**: You need Version 18 or higher (v20+ recommended).
    -   Check if installed: Open Command Prompt and run `node --version`.
    -   [Download Node.js](https://nodejs.org/) if needed.

## 2. Using the Automated Script (Recommended) 🚀

I have created a simple script to automate everything.

1.  Open the project folder in File Explorer.
2.  Find the file **`start.bat`**.
3.  **Double-click it.**

This script will automatically:
-   Checking & installing dependencies for the Frontend.
-   Checking & installing dependencies for the Backend.
-   Pushing the latest database schema (SQLite).
-   Starting both servers.

Once running, open your browser to: **http://localhost:8080**

---

## 3. Manual Setup (For Advanced Users) 🛠️

If you prefer using the terminal, here are the commands:

### Step 1: Install Dependencies
```bash
# Install root dependencies (Frontend)
npm install

# Install server dependencies (Backend)
cd server
npm install
cd ..
```

### Step 2: Initialize Database
```bash
# Push the schema to local SQLite database
cd server
npx prisma db push
cd ..
```

### Step 3: Run the App
```bash
# Start both frontend and backend concurrently
npm run dev:full
```

- **Frontend**: http://localhost:8080
- **Backend API**: http://localhost:3001
- **Health Check**: http://localhost:3001/api/health

---

## 4. Troubleshooting 🔍

**Issue: `EADDRINUSE` (Port already in use)**
-   **Cause**: Another application is using port 3001 or 8080.
-   **Fix**: Close the other application or edit the `.env` file to change the port.

**Issue: Database errors / Missing tables**
-   **Cause**: The database schema isn't synced.
-   **Fix**: Run `cd server && npx prisma db push`. If that fails, delete `server/prisma/dev.db` and run the command again.

**Issue: Login fails / "Network Error"**
-   **Cause**: Backend server is not running.
-   **Fix**: Check the terminal where you ran `npm run dev:full`. It should say "🚀 mYnd API server running on http://localhost:3001".
