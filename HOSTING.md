# Deploying mYnd2.0 to Production (Render) ☁️

This document is a comprehensive guide for deploying the **mYnd2.0** application to [Render.com](https://render.com). It covers setting up a PostgreSQL database, deploying the backend API, and hosting the frontend.

**Prerequisites:**
1.  **GitHub Account**: You need a GitHub account to host your code.
2.  **Render Account**: You need a free account on [Render.com](https://render.com).

---

## Part 1: Prepare Your Code (GitHub)

The first step is to get your code onto GitHub.

1.  **Check Local Git Status**:
    Open your terminal in the project folder and run:
    ```bash
    git status
    ```
    Ensure you have committed all your changes. If not, run:
    ```bash
    git add .
    git commit -m "Prepare for deployment"
    ```

2.  **Create a New Repository on GitHub**:
    -   Go to [github.com/new](https://github.com/new).
    -   Name your repository (e.g., `mynd`).
    -   Make it **Public** or **Private** (Private is recommended for personal projects).
    -   Click **Create repository**.

3.  **Push Your Code**:
    Follow the instructions shown on GitHub under "…or push an existing repository from the command line":
    ```bash
    git remote add origin https://github.com/YOUR_USERNAME/mynd.git
    git branch -M main
    git push -u origin main
    ```

---

## Part 2: Create the Database (PostgreSQL)

mYnd2.0 uses SQLite locally but requires PostgreSQL for production. Render provides a free PostgreSQL database.

1.  Log in to your [Render Dashboard](https://dashboard.render.com/).
2.  Click the **"New +"** button and select **"PostgreSQL"**.
3.  **Configure the Database**:
    -   **Name**: `mynd-db`
    -   **Region**: Choose the region closest to you (e.g., Oregon, Frankfurt).
    -   **PostgreSQL Version**: 15 or 16 (default is fine).
    -   **Instance Type**: Select **"Free"**.
4.  Click **"Create Database"**.
5.  **Wait for Initialization**: It may take a minute or two.
6.  **Copy the Connection String**:
    -   Find the **"External Database URL"** section.
    -   Click the copy icon. **Save this URL securely**; you will need it in the next step.

---

## Part 3: Deploy the Backend (Web Service)

Now we deploy the Express server.

1.  Click **"New +"** and select **"Web Service"**.
2.  **Connect GitHub**:
    -   If prompted, connect your GitHub account and grant access to the `mynd` repository.
    -   Select `mynd` from the list.
3.  **Configure the Web Service**:
    -   **Name**: `mynd-api`
    -   **Region**: Same as your database.
    -   **Branch**: `main`
    -   **Root Directory**: `server` (Critical: This tells Render the backend code lives in the `server` folder).
    -   **Runtime**: **Node**
    -   **Build Command**: `npm install && npx prisma generate`
    -   **Start Command**: `npm start` (Ensure `package.json` has `start`: `tsx src/index.ts` or `node dist/index.js`).
    -   **Instance Type**: **Free**.
4.  **Environment Variables**:
    -   Scroll down to "Environment Variables" and click "Add Environment Variable".
    -   Add the following keys and values:
        -   **Key**: `DATABASE_URL`
            -   **Value**: Paste the *External Database URL* you copied in Part 2.
        -   **Key**: `JWT_SECRET`
            -   **Value**: Input a long, random string (e.g., `my_secret_key_12345`).
        -   **Key**: `PORT`
            -   **Value**: `10000` (Render defaults to port 10000).
5.  Click **"Create Web Service"**.

**Wait for Deployment**: Render will clone your repo, install dependencies, and start the server. Watch the logs. When you see "Server running on port 10000", it's live!

**Copy the Backend URL**: It will look like `https://mynd-api.onrender.com`. Save this.

---

## Part 4: Initialize the Production Database

Your production database is empty. You need to push the schema to it.

1.  **Local Sync**: Open your local terminal.
2.  **Update Local Config**: Temporarily edit your `server/.env` file. Replace `DATABASE_URL` with your **Render External Database URL**.
3.  **Push Schema**:
    ```bash
    cd server
    npx prisma db push
    ```
    This creates the tables in your production database.
4.  **Revert Local Config**: Change `DATABASE_URL` back to your local SQLite path in `server/.env`.

---

## Part 5: Deploy the Frontend (Static Site)

Finally, deploy the React frontend.

1.  Click **"New +"** and select **"Static Site"**.
2.  Select your `mynd` repository again.
3.  **Configure the Static Site**:
    -   **Name**: `mynd-site`
    -   **Branch**: `main`
    -   **Root Directory**: Leave blank (default is root).
    -   **Build Command**: `npm install && npm run build`
    -   **Publish Directory**: `dist`
4.  **Environment Variables**:
    -   **Key**: `VITE_API_URL`
        -   **Value**: Paste your **Backend URL** from Part 3 (e.g., `https://mynd-api.onrender.com`).
        -   *Note: Do not include a trailing slash.*
5.  Click **"Create Static Site"**.

**Wait for Deployment**: Render will build your React app.

**Copy the Frontend URL**: It will look like `https://mynd-site.onrender.com`.

---

## Part 6: Final Connection (CORS)

For security, the backend usually blocks requests from unknown domains. We need to tell the backend to allow requests from your new frontend URL.

1.  Go to your **Backend Web Service (`mynd-api`)** dashboard on Render.
2.  Click **"Environment"**.
3.  Add a new variable:
    -   **Key**: `CORS_ORIGIN`
    -   **Value**: Paste your **Frontend URL** (e.g., `https://mynd-site.onrender.com`).
4.  Click **"Save Changes"**.
5.  Render may automatically redeploy. If not, go to the top right and click **"Manual Deploy"** -> **"Deploy latest commit"**.

---

## 🎉 Done!

Your mYnd2.0 application is now live on the internet! Visit your frontend URL to start using it.
