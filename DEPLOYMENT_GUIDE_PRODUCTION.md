# Production Deployment Guide

**Last Updated**: October 19, 2025  
**Current Status**: Development (SQLite + Local)  
**Target**: Production (PostgreSQL + Cloud Hosting)

---

## 🎯 Deployment Overview

This guide covers deploying the POS system to production with:
- **Frontend**: Vercel / Netlify / Railway
- **Backend**: Railway / Render / Fly.io
- **Database**: Supabase / Neon / Railway PostgreSQL

---

## 📋 Pre-Deployment Checklist

### Code Preparation
- [ ] All tests passing (47/47)
- [ ] Manual testing completed
- [ ] Environment variables documented
- [ ] Database migrated to PostgreSQL
- [ ] Seed data tested
- [ ] Production build tested locally
- [ ] Security review completed
- [ ] CORS configured properly

### Accounts Required
- [ ] GitHub account (code repository)
- [ ] Database hosting account (Supabase/Neon)
- [ ] Frontend hosting account (Vercel/Netlify)
- [ ] Backend hosting account (Railway/Render)

---

## 🗄️ Step 1: Database Setup (PostgreSQL)

### Option A: Supabase (Recommended)

1. **Create Account**: https://supabase.com
2. **Create Project**:
   - Name: `pos-production`
   - Password: Save securely!
   - Region: Closest to users
   
3. **Get Connection Strings**:
   ```bash
   # Connection pooling (for backend)
   DATABASE_URL="postgresql://postgres.[REF]:[PASS]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1"
   
   # Direct connection (for migrations)
   DIRECT_URL="postgresql://postgres.[REF]:[PASS]@aws-0-[REGION].pooler.supabase.com:5432/postgres"
   ```

4. **Run Migrations**:
   ```bash
   # On your local machine
   cd packages/server
   
   # Create .env.production
   echo DATABASE_URL="your-connection-string" > .env.production
   echo DIRECT_URL="your-direct-url" >> .env.production
   
   # Run migration
   npx prisma migrate deploy --schema=prisma/schema.prisma
   
   # Seed production data
   npm run seed
   ```

---

## 🖥️ Step 2: Backend Deployment

### Option A: Railway (Easiest)

1. **Create Account**: https://railway.app
2. **New Project** → "Deploy from GitHub repo"
3. **Connect Repository**: Select your POS repo
4. **Configure**:
   - Root Directory: `packages/server`
   - Build Command: `npm install && npx prisma generate && npm run build`
   - Start Command: `npm start`
   
5. **Add Environment Variables**:
   ```bash
   DATABASE_URL=your-supabase-connection-string
   DIRECT_URL=your-supabase-direct-url
   JWT_SECRET=your-production-jwt-secret-min-48-chars
   PORT=4000
   NODE_ENV=production
   FRONTEND_URL=https://your-frontend-url.vercel.app
   ```

6. **Deploy**: Click "Deploy"

7. **Get URL**: Copy Railway URL (e.g., `https://pos-backend.up.railway.app`)

### Option B: Render

1. **Create Account**: https://render.com
2. **New** → **Web Service**
3. **Connect GitHub** → Select repo
4. **Configure**:
   - Name: `pos-backend`
   - Runtime: Node
   - Build Command: `cd packages/server && npm install && npx prisma generate && npm run build`
   - Start Command: `cd packages/server && npm start`
   
5. **Environment Variables**: (Same as Railway)

6. **Deploy**: Click "Create Web Service"

### Option C: Fly.io

1. **Install CLI**: https://fly.io/docs/hands-on/install-flyctl/
2. **Login**: `flyctl auth login`
3. **Create `fly.toml`** in `packages/server/`:
   ```toml
   app = "pos-backend"
   primary_region = "iad"
   
   [build]
     dockerfile = "Dockerfile"
   
   [env]
     PORT = "8080"
     NODE_ENV = "production"
   
   [[services]]
     internal_port = 8080
     protocol = "tcp"
   
     [[services.ports]]
       port = 80
       handlers = ["http"]
   
     [[services.ports]]
       port = 443
       handlers = ["tls", "http"]
   ```

4. **Create Dockerfile** in `packages/server/`:
   ```dockerfile
   FROM node:18-alpine
   
   WORKDIR /app
   
   COPY package*.json ./
   COPY prisma ./prisma/
   
   RUN npm ci --only=production
   RUN npx prisma generate
   
   COPY . .
   RUN npm run build
   
   EXPOSE 8080
   
   CMD ["npm", "start"]
   ```

5. **Deploy**:
   ```bash
   cd packages/server
   flyctl launch
   flyctl secrets set DATABASE_URL="your-connection-string"
   flyctl secrets set JWT_SECRET="your-secret"
   flyctl deploy
   ```

---

## 🌐 Step 3: Frontend Deployment

### Option A: Vercel (Recommended)

1. **Create Account**: https://vercel.com
2. **Import Project** → GitHub → Select repo
3. **Configure**:
   - Framework Preset: Vite
   - Root Directory: `packages/frontend`
   - Build Command: `npm run build`
   - Output Directory: `dist`
   
4. **Environment Variables**:
   ```bash
   VITE_API_URL=https://your-backend-url.railway.app/api
   ```

5. **Deploy**: Click "Deploy"

6. **Custom Domain** (Optional):
   - Add domain in Vercel dashboard
   - Update DNS records

### Option B: Netlify

1. **Create Account**: https://netlify.com
2. **New Site** → Import from Git
3. **Configure**:
   - Build command: `cd packages/frontend && npm install && npm run build`
   - Publish directory: `packages/frontend/dist`
   
4. **Environment Variables**:
   ```bash
   VITE_API_URL=https://your-backend-url.railway.app/api
   ```

5. **Deploy**: Click "Deploy site"

### Option C: Railway (Monorepo)

1. **Add Service** in same Railway project
2. **Configure**:
   - Root Directory: `packages/frontend`
   - Build Command: `npm install && npm run build`
   - Start Command: `npx serve -s dist -l 3000`
   
3. **Add Environment Variables**: (Same as Vercel)

4. **Deploy**

---

## 🔧 Step 4: Backend Configuration Updates

### Update CORS

**File**: `packages/server/src/index.ts`

```typescript
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
```

### Update API Base URL

**File**: `packages/frontend/src/lib/api.ts`

```typescript
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';
```

---

## 🔐 Step 5: Environment Variables Setup

### Backend Environment Variables

```bash
# Required
DATABASE_URL=postgresql://...
JWT_SECRET=your-super-secure-random-string-min-48-chars
PORT=4000
NODE_ENV=production
FRONTEND_URL=https://your-frontend.vercel.app

# Optional
DIRECT_URL=postgresql://... # For Supabase
LOG_LEVEL=info
RATE_LIMIT_MAX=100
RATE_LIMIT_WINDOW=900000
```

### Frontend Environment Variables

```bash
# Required
VITE_API_URL=https://your-backend.railway.app/api

# Optional
VITE_APP_NAME=POS System
VITE_ENABLE_ANALYTICS=false
```

---

## 🧪 Step 6: Test Production Deployment

### Backend Health Check

```bash
# Test API
curl https://your-backend-url/api/products

# Should return JSON with products
```

### Frontend Access

1. Visit: `https://your-frontend-url.vercel.app`
2. Test login: `admin` / `admin123`
3. Test catalog browsing
4. Test adding to cart
5. Test checkout flow

### Database Verification

```bash
# Connect to Prisma Studio
npx prisma studio --schema=packages/server/prisma/schema.prisma
```

---

## 📊 Step 7: Monitoring & Logging

### Railway Monitoring

1. **Logs**: View in Railway dashboard
2. **Metrics**: CPU, Memory, Network
3. **Alerts**: Set up in Settings

### Vercel Monitoring

1. **Analytics**: Enable in project settings
2. **Logs**: View deployment logs
3. **Performance**: Real User Monitoring (RUM)

### Supabase Monitoring

1. **Database**: View query performance
2. **Logs**: API logs and database logs
3. **Backups**: Automatic daily backups

### Error Tracking (Optional)

**Add Sentry**:

```bash
# Install
npm install @sentry/node @sentry/browser

# Configure backend
# packages/server/src/index.ts
import * as Sentry from '@sentry/node';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
});

# Configure frontend
# packages/frontend/src/main.tsx
import * as Sentry from '@sentry/browser';

Sentry.init({
  dsn: process.env.VITE_SENTRY_DSN,
  environment: import.meta.env.MODE,
});
```

---

## 🔒 Step 8: Security Hardening

### Backend Security

1. **Rate Limiting**:
   ```bash
   npm install express-rate-limit
   ```
   
   ```typescript
   import rateLimit from 'express-rate-limit';
   
   const limiter = rateLimit({
     windowMs: 15 * 60 * 1000, // 15 minutes
     max: 100 // limit each IP to 100 requests per windowMs
   });
   
   app.use('/api/', limiter);
   ```

2. **Helmet** (Security headers):
   ```bash
   npm install helmet
   ```
   
   ```typescript
   import helmet from 'helmet';
   app.use(helmet());
   ```

3. **Input Validation**:
   - Already using Prisma (SQL injection protection)
   - Validate all user inputs
   - Sanitize data before processing

### Frontend Security

1. **HTTPS Only**: Vercel/Netlify automatically provides
2. **CSP Headers**: Configure in hosting platform
3. **Secure Cookies**: Use `httpOnly` and `secure` flags

### Database Security

1. **Connection Limits**: Already configured in connection string
2. **SSL**: Enabled by default on Supabase/Neon
3. **Access Control**: Use database roles and permissions

---

## 🔄 Step 9: CI/CD Setup (Optional)

### GitHub Actions

**Create**: `.github/workflows/deploy.yml`

```yaml
name: Deploy to Production

on:
  push:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm install
      
      - name: Run tests
        run: npm test
  
  deploy-backend:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to Railway
        run: |
          curl -X POST ${{ secrets.RAILWAY_DEPLOY_WEBHOOK }}
  
  deploy-frontend:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to Vercel
        run: |
          curl -X POST ${{ secrets.VERCEL_DEPLOY_WEBHOOK }}
```

---

## 📝 Step 10: Post-Deployment Checklist

### Functional Testing
- [ ] Login works
- [ ] Products display
- [ ] Cart functionality
- [ ] Customer search
- [ ] Checkout process
- [ ] Order history
- [ ] All API endpoints responding

### Performance Testing
- [ ] Page load times < 3s
- [ ] API response times < 500ms
- [ ] Database queries optimized
- [ ] Images optimized

### Security Testing
- [ ] HTTPS enabled
- [ ] CORS configured
- [ ] JWT authentication working
- [ ] Environment variables secured
- [ ] No sensitive data in logs

### Monitoring
- [ ] Error tracking enabled
- [ ] Performance monitoring active
- [ ] Database backups running
- [ ] Alerts configured

---

## 🆘 Troubleshooting

### Issue: "Database connection failed"

**Solutions**:
1. Check connection string format
2. Verify database is running
3. Check IP whitelist (if applicable)
4. Test with `npx prisma studio`

### Issue: "CORS error"

**Solutions**:
1. Check `FRONTEND_URL` matches actual frontend URL
2. Ensure CORS middleware configured
3. Check browser console for exact error

### Issue: "Build failed"

**Solutions**:
1. Check build logs
2. Ensure all dependencies in `package.json`
3. Verify Node version compatibility
4. Test build locally first

### Issue: "Environment variables not loading"

**Solutions**:
1. Check variable names (exact match)
2. Restart service after adding variables
3. Verify syntax (no quotes needed in dashboard)

---

## 📊 Deployment Costs (Free Tier)

| Service | Free Tier | Limits |
|---------|-----------|--------|
| Supabase | ✅ Free | 500MB DB, Unlimited API |
| Railway | ✅ $5 credit | ~500 hours/month |
| Vercel | ✅ Free | 100GB bandwidth |
| Netlify | ✅ Free | 100GB bandwidth |

**Estimated Monthly Cost**: $0 - $5 (within free tiers)

---

## 🎯 Production URLs

After deployment, update these in your documentation:

- **Frontend**: https://your-app.vercel.app
- **Backend API**: https://your-backend.railway.app/api
- **Database**: Supabase Dashboard
- **Monitoring**: Railway/Vercel Dashboards

---

## 🚀 Deployment Summary

**Time to Deploy**: ~30-45 minutes (first time)  
**Difficulty**: Medium  
**Cost**: $0-$5/month (free tiers)  
**Maintenance**: Low (automatic deployments)

**Recommended Stack**:
- Database: Supabase (PostgreSQL)
- Backend: Railway
- Frontend: Vercel

This stack provides:
✅ Zero configuration  
✅ Automatic HTTPS  
✅ Auto-scaling  
✅ Built-in monitoring  
✅ Free tier available  

---

**Next Steps**: Follow this guide section by section, testing after each step!
