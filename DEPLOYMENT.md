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
1.  Install Vercel CLI: `npm i -g vercel` (or just upload to GitHub).
2.  If using GitHub:
    *   Push this code to a new GitHub repository.
    *   Go to **Vercel Dashboard** -> "Add New..." -> "Project".
    *   Import your GitHub repo.
3.  **Environment Variables** (CRITICAL):
    *   In the Vercel Project Settings, add these variables:
        *   `DATABASE_URL`: (Paste your Neon/Supabase connection string here)
        *   `SECRET_KEY`: (Any random string)
        *   `LITEROUTER_API_KEY`: (Your AI API setup key)

## Step 3: Run Database Migrations
Vercel won't automatically create tables in your new Postgres DB.

**Easy Method:**
1.  Run the helper script included in the zip:
    ```bash
    python init_cloud_db.py
    ```
2.  Paste your Neon connection string when prompted.
3.  It will create the necessary tables (`user`, `challenge_submission`, etc.) in your cloud database.

## Step 4: Verify
Once deployed, check the "Logs" tab in Vercel.
