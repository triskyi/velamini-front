# Velamini - Virtual Tresor Digital Twin

This is a Next.js application representing the digital twin of Tresor, powered by DeepSeek AI, RAG, and PostgreSQL.

## 🚀 Deployment Guide for Vercel

To host this project on Vercel, follow these steps:

### 1. Database Setup (Cloud)
This project uses **Prisma Postgres** as its primary database.
*   Go to your [Prisma Dashboard](https://console.prisma.io/).
*   Create a new project and select **Prisma Postgres**.
*   Copy your **Connection String** (it starts with `prisma+postgres://`).

### 2. Environment Variables
In your Vercel Project Settings > **Environment Variables**, add the following:
*   `DATABASE_URL`: Your Prisma Postgres connection string.
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
