# Velamini - Virtual Tresor Digital Twin

This is a Next.js application representing the digital twin of Tresor, powered by DeepSeek AI, RAG, and PostgreSQL.

## 🚀 Deployment Guide for Vercel

To host this project on Vercel, follow these steps:

### 1. Database Setup (Cloud)
Since you are using a local PostgreSQL database, you need to switch to a cloud-based provider for production. 
*   **Recommended**: [Vercel Postgres](https://vercel.com/docs/storage/vercel-postgres) (integrated) or [Neon.tech](https://neon.tech/) (serverless Postgres).
*   Create a database and get your **Connection String** (it should look like `postgres://...`).

### 2. Environment Variables
In your Vercel Project Settings > **Environment Variables**, add the following:
*   `DATABASE_URL`: Your cloud PostgreSQL connection string (Use the "Pooled" connection string if using Neon or Vercel Postgres).
*   `DEEPSEEK_API_KEY`: Your DeepSeek API key.

### 3. Deploy to Vercel
1.  Push your code to a GitHub repository.
2.  Go to [Vercel](https://vercel.com/) and click **Add New > Project**.
3.  Import your repository.
4.  The Build Command is already configured in `package.json` to run `prisma generate`.
5.  Click **Deploy**.

### 4. Database Initialization
Once deployed, you need to push your local schema to the cloud database. Run this locally (replace the temporary URL in your `.env` with the cloud one):
```bash
npx prisma db push
```

## Local Development
1. `npm install`
2. Configure `.env.local`
3. `npx prisma db push`
4. `npm run dev`
