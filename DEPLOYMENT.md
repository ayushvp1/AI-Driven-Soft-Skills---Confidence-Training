# Deploying to Vercel

Since this is a Flask application with a database, you cannot just "upload" it. You must configure a few things first.

## Limitations on Vercel
1.  **Database**: Vercel is "serverless", meaning files (like `app.db`) are **deleted** after every request. You MUST use a cloud database (like Neon or Supabase).
2.  **Audio**: Generative AI / complex audio processing (FFmpeg) might be slow or hit timeouts (10s limit on free tier).

---

## Step 1: Get a Cloud Database (Free)
1.  Go to **[Neon.tech](https://neon.tech)** (easiest for Postgres) or Supabase.
2.  Create a Free Project.
3.  Copy the **Connection String** (it looks like `postgres://user:pass@ep-xyz.us-east-2.aws.neon.tech/neondb`).

## Step 2: Deploy to Vercel

You will deploy two separate project instances (or a single monorepo) to Vercel:

### A. The User App (Flask)
1.  **Repository Root:** The main folder.
2.  **Environment Variables**:
    *   `DATABASE_URL`: Your Postgres connection string.
    *   `SECRET_KEY`: Random string.
    *   `LITEROUTER_API_KEY`: Your OpenRouter API key.

### B. The Admin Panel (Next.js)
1.  **Root Directory**: Set this to `admin-panel` in your Vercel Project Settings.
2.  **Framework Preset**: Next.js.
3.  **Environment Variables**:
    *   `DATABASE_URL`: Same as above (the Postgres DB).
    *   `NEXTAUTH_SECRET`: A random random string for session security.
    *   `NEXTAUTH_URL`: Your deployed admin URL (e.g. `https://your-admin-app.vercel.app`).

---

## Step 3: Initialize Database (Prisma)

Since the Admin Panel uses Prisma, you must initialize the cloud database tables:

1.  Open a terminal in the `admin-panel` folder.
2.  Ensure your `DATABASE_URL` is correct in `.env`.
3.  Run the following commands:
    ```bash
    npx prisma db push
    node scripts/seed-content.js
    ```
This will create the schema and populate the initial challenges, exercises, and GD scenarios.

---

## Step 4: Manage Content

Once deployed, you can log in to the **Admin Panel** to manage all training content dynamically. No more editing Python files!

1.  Naviage to the `/admin` route.
2.  Use the "Manage Content" sidebar to update challenges and scenarios.
3.  Changes are instantly reflected in the main User App.
