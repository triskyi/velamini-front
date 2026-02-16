# Velamini Deployment Guide

## 📋 Pre-Deployment Checklist

Before deploying to production, ensure you have:

- [ ] PostgreSQL database set up (e.g., Vercel Postgres, Supabase, or Railway)
- [ ] Twilio account with verified phone number
- [ ] DeepSeek API key
- [ ] Google OAuth credentials (if using Google sign-in)
- [ ] Domain name (optional but recommended)
- [ ] SSL certificate (handled by Vercel automatically)

---

## 🚀 Deployment Options

### Option 1: Vercel (Recommended)

Vercel is the easiest and recommended way to deploy Next.js applications.

#### Step 1: Prepare Repository

```bash
# Ensure code is committed
git add .
git commit -m "Ready for deployment"
git push origin main
```

#### Step 2: Import to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Click **"Import Project"**
3. Select your GitHub repository
4. Click **"Import"**

#### Step 3: Configure Environment Variables

In Vercel dashboard, go to **Settings → Environment Variables** and add:

```env
# Database
DATABASE_URL=postgresql://user:password@host:5432/database?sslmode=require
DIRECT_URL=postgresql://user:password@host:5432/database

# NextAuth
NEXTAUTH_URL=https://yourdomain.com
NEXTAUTH_SECRET=generate-a-secure-random-string

# Google OAuth (optional)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Twilio
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your-twilio-auth-token
TWILIO_PHONE_NUMBER=whatsapp:+14155238886

# AI
DEEPSEEK_API_KEY=your-deepseek-api-key

# App
NEXT_PUBLIC_APP_URL=https://yourdomain.com
NODE_ENV=production
```

**Generating NEXTAUTH_SECRET:**
```bash
openssl rand -base64 32
```

#### Step 4: Deploy

1. Click **"Deploy"**
2. Wait for build to complete (2-5 minutes)
3. Your app will be live at `your-project.vercel.app`

#### Step 5: Run Database Migrations

After first deployment:

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Link to your project
vercel link

# Run migrations
vercel env pull .env.production
npx prisma migrate deploy
```

#### Step 6: Configure Custom Domain (Optional)

1. In Vercel dashboard, go to **Settings → Domains**
2. Click **"Add Domain"**
3. Enter your domain (e.g., velamini.com)
4. Follow DNS configuration instructions
5. Wait for DNS propagation (can take up to 48 hours)
6. Update `NEXTAUTH_URL` and `NEXT_PUBLIC_APP_URL` to use custom domain

#### Step 7: Configure Twilio Webhook

1. Go to [Twilio Console](https://console.twilio.com)
2. Navigate to **Phone Numbers → Manage → Active Numbers**
3. Click on your WhatsApp number
4. Scroll to **Messaging Configuration**
5. Set **"A message comes in"** webhook to:
   ```
   https://yourdomain.com/api/whatsapp/webhook
   ```
6. Set HTTP method to **POST**
7. Save

---

### Option 2: Railway

Railway is another excellent option with built-in PostgreSQL.

#### Step 1: Create Railway Project

1. Go to [railway.app](https://railway.app)
2. Click **"Start a New Project"**
3. Select **"Deploy from GitHub repo"**
4. Choose your repository

#### Step 2: Add PostgreSQL

1. Click **"New"** → **"Database"** → **"PostgreSQL"**
2. Railway will provision a database
3. Copy the `DATABASE_URL` from database settings

#### Step 3: Configure Environment Variables

Add all environment variables similar to Vercel setup.

#### Step 4: Deploy

Railway will automatically deploy on every push to main branch.

#### Step 5: Run Migrations

```bash
# Install Railway CLI
npm i -g @railway/cli

# Login
railway login

# Link project
railway link

# Run migrations
railway run npx prisma migrate deploy
```

---

### Option 3: Self-Hosted (VPS)

For full control, deploy to your own server.

#### Requirements

- Ubuntu 22.04 LTS or similar
- Node.js 18+ installed
- PostgreSQL 14+ installed
- Nginx or Apache
- SSL certificate (Let's Encrypt)

#### Step 1: Set Up Server

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install PostgreSQL
sudo apt install postgresql postgresql-contrib

# Install Nginx
sudo apt install nginx

# Install Certbot for SSL
sudo apt install certbot python3-certbot-nginx
```

#### Step 2: Set Up Database

```bash
# Create database and user
sudo -u postgres psql

CREATE DATABASE velamini;
CREATE USER velamini_user WITH PASSWORD 'secure_password';
GRANT ALL PRIVILEGES ON DATABASE velamini TO velamini_user;
\q
```

#### Step 3: Clone and Build

```bash
# Clone repository
git clone https://github.com/yourusername/velamini.git
cd velamini/velamini-front

# Install dependencies
npm install

# Create .env.production
nano .env.production
# Add all environment variables

# Run migrations
npx prisma migrate deploy

# Build application
npm run build
```

#### Step 4: Set Up PM2 (Process Manager)

```bash
# Install PM2
npm install -g pm2

# Start application
pm2 start npm --name "velamini" -- start

# Save PM2 configuration
pm2 save

# Set PM2 to start on boot
pm2 startup
```

#### Step 5: Configure Nginx

```bash
# Create Nginx config
sudo nano /etc/nginx/sites-available/velamini

# Add configuration:
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}

# Enable site
sudo ln -s /etc/nginx/sites-available/velamini /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

#### Step 6: Set Up SSL

```bash
# Get SSL certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Auto-renewal is set up automatically
```

---

## 🔒 Production Best Practices

### Security

1. **Environment Variables**
   - Never commit `.env` files
   - Use different secrets for production
   - Rotate API keys regularly

2. **Database**
   - Enable SSL connections
   - Use connection pooling
   - Regular backups (daily recommended)
   - Enable point-in-time recovery

3. **API Keys**
   - Restrict API key permissions
   - Monitor usage for anomalies
   - Set up billing alerts

4. **Rate Limiting**
   - Implement rate limiting on API routes
   - Use Vercel's built-in DDoS protection
   - Monitor for abuse

### Performance

1. **Caching**
   - Enable Next.js caching
   - Use CDN for static assets
   - Implement Redis for session storage (optional)

2. **Database Optimization**
   - Add indexes on frequently queried fields
   - Use Prisma query optimization
   - Monitor slow queries

3. **Monitoring**
   - Set up error tracking (Sentry recommended)
   - Monitor API response times
   - Track database performance
   - Set up uptime monitoring

### Monitoring Setup

#### Sentry (Error Tracking)

```bash
npm install @sentry/nextjs
npx @sentry/wizard@latest -i nextjs
```

Add to `sentry.client.config.ts`:
```typescript
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
});
```

#### Vercel Analytics

In `app/layout.tsx`:
```typescript
import { Analytics } from '@vercel/analytics/react';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
```

### Backup Strategy

#### Database Backups

**Automated Backups (Vercel Postgres)**
- Automatic daily backups
- 7-day retention
- Point-in-time recovery

**Manual Backups**
```bash
# Create backup
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d).sql

# Restore backup
psql $DATABASE_URL < backup_20240216.sql
```

#### Code Backups
- Use Git for version control
- Push to GitHub regularly
- Tag releases: `git tag v1.0.0`

---

## 📊 Post-Deployment Checklist

After deployment, verify:

- [ ] Application loads correctly
- [ ] Authentication works (sign up/sign in)
- [ ] Database connections work
- [ ] Twilio webhook receives messages
- [ ] AI responses are generated
- [ ] Personal account features work
- [ ] Organization account features work
- [ ] WhatsApp messaging works end-to-end
- [ ] Email notifications work (if implemented)
- [ ] Analytics tracking is active
- [ ] Error monitoring is active
- [ ] SSL certificate is valid
- [ ] Custom domain resolves correctly
- [ ] All environment variables are set
- [ ] Database migrations are applied

---

## 🔄 Continuous Deployment

### GitHub Actions (Optional)

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: 18
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run tests
        run: npm test
      
      - name: Build
        run: npm run build
      
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
```

---

## 🚨 Troubleshooting

### Build Failures

**Issue**: Prisma client not generated

**Solution**:
```bash
# Add to package.json scripts
"postinstall": "prisma generate"
```

**Issue**: Environment variables not found

**Solution**: Ensure all variables are set in Vercel/Railway dashboard

### Runtime Errors

**Issue**: 500 errors on API routes

**Solution**:
1. Check Vercel/Railway logs
2. Verify database connection
3. Check API key validity
4. Review error tracking (Sentry)

**Issue**: Database connection timeout

**Solution**:
1. Use connection pooling
2. Increase timeout in Prisma
3. Check database server status

### Webhook Issues

**Issue**: Twilio webhook not working

**Solution**:
1. Verify webhook URL is correct
2. Check HTTPS is enabled
3. Review webhook logs in Twilio console
4. Test webhook with Postman

---

## 📈 Scaling

### When to Scale

Monitor these metrics:
- Response time > 2 seconds
- Database CPU > 80%
- RAM usage > 80%
- Error rate > 1%

### Scaling Strategies

1. **Vertical Scaling**
   - Upgrade Vercel plan
   - Increase database resources
   - Add more compute

2. **Horizontal Scaling**
   - Vercel auto-scales
   - Add read replicas for database
   - Use Redis for caching

3. **Optimization**
   - Implement caching
   - Optimize database queries
   - Use CDN for assets
   - Lazy load components

---

## 💰 Cost Estimation

### Vercel (Hobby - Free)
- Hosting: Free
- Bandwidth: 100GB/month
- Builds: Unlimited
- Team: 1 user

### Vercel (Pro - $20/month)
- Everything in Hobby
- Bandwidth: 1TB/month
- Analytics
- Password protection
- Team size: Unlimited

### Database (Vercel Postgres)
- Hobby: Free (256MB)
- Pro: $20/month (10GB)
- Scaled: Custom pricing

### Twilio Costs
- Phone number: $1/month
- Messages: $0.005/message
- WhatsApp: $0.005/message

**Example Monthly Cost for Small Org:**
- Vercel Pro: $20
- Database: $20
- 1 Phone Number: $1
- 1,000 messages: $5
- **Total: ~$46/month**

---

## 📞 Support

For deployment help:
- Email: devops@velamini.com
- Discord: #deployment channel
- Documentation: docs.velamini.com/deployment

---

**Happy Deploying! 🚀**
