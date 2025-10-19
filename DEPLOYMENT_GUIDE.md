# Production Deployment Guide

## Overview
Complete guide for deploying the POS application to production with best practices for security, performance, and reliability.

## Deployment Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     Load Balancer/CDN                    │
│                  (Cloudflare, CloudFront)                │
└────────────────────┬────────────────────────────────────┘
                     │
        ┌────────────┴────────────┐
        │                         │
┌───────▼────────┐      ┌────────▼────────┐
│   Frontend     │      │    Backend      │
│   (Vercel/     │      │   (Railway/     │
│    Netlify)    │      │    Render)      │
└────────────────┘      └────────┬────────┘
                                 │
                        ┌────────▼────────┐
                        │   PostgreSQL    │
                        │   (Supabase/    │
                        │    Neon)        │
                        └─────────────────┘
```

## Deployment Options

### Option 1: Full Stack on Single Platform

**Railway (Recommended for Simplicity)**
- ✅ Deploy frontend + backend + database
- ✅ Automatic HTTPS
- ✅ Easy environment variables
- ✅ GitHub integration
- ✅ $5/month free credit

**Render**
- ✅ Free tier available
- ✅ Auto-deploy from Git
- ✅ Managed PostgreSQL
- ✅ Easy scaling

### Option 2: Separated Services (Recommended for Scale)

**Frontend:**
- Vercel (Recommended)
- Netlify
- AWS S3 + CloudFront
- Azure Static Web Apps

**Backend:**
- Railway
- Render
- Heroku
- AWS EC2/ECS
- Azure App Service
- Google Cloud Run

**Database:**
- Supabase (Recommended)
- Neon
- Railway PostgreSQL
- AWS RDS
- Azure Database

## 1. Pre-Deployment Checklist

### Code Preparation
- [ ] All tests passing
- [ ] No console.errors in production
- [ ] Environment variables documented
- [ ] Security audit completed
- [ ] Performance optimization done
- [ ] Error logging configured
- [ ] Build process verified locally

### Environment Configuration
- [ ] Production .env template created
- [ ] Secrets stored securely
- [ ] API keys rotated for production
- [ ] CORS origins configured
- [ ] Database connection pooling enabled

### Security
- [ ] JWT secret is strong (32+ chars)
- [ ] Passwords hashed (bcrypt)
- [ ] SQL injection prevention (Prisma)
- [ ] XSS protection enabled
- [ ] HTTPS enforced
- [ ] Rate limiting implemented
- [ ] Security headers configured

### Database
- [ ] PostgreSQL instance created
- [ ] Migrations tested
- [ ] Seed data loaded
- [ ] Backups configured
- [ ] Connection pooling setup

## 2. Frontend Deployment (Vercel)

### Step 1: Prepare Frontend Build

Update `packages/frontend/vite.config.ts`:

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    sourcemap: process.env.NODE_ENV !== 'production',
  },
  server: {
    proxy: {
      '/api': {
        target: process.env.VITE_API_URL || 'http://localhost:4000',
        changeOrigin: true,
      },
    },
  },
});
```

Create `packages/frontend/.env.production`:

```env
VITE_API_URL=https://your-backend.railway.app
```

### Step 2: Deploy to Vercel

**Option A: Vercel CLI**
```powershell
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy
cd packages/frontend
vercel --prod
```

**Option B: Vercel Dashboard**
1. Go to https://vercel.com/
2. Import repository
3. Set root directory: `packages/frontend`
4. Set build command: `npm run build`
5. Set output directory: `dist`
6. Add environment variable: `VITE_API_URL`
7. Deploy

### Step 3: Configure Domain
- Add custom domain in Vercel dashboard
- Update DNS records (A/CNAME)
- Enable automatic HTTPS

## 3. Backend Deployment (Railway)

### Step 1: Prepare Backend

Create `packages/server/Dockerfile` (optional):

```dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY packages/server/package*.json ./packages/server/
COPY packages/shared/package*.json ./packages/shared/

# Install dependencies
RUN npm ci --only=production

# Copy application code
COPY packages/server ./packages/server
COPY packages/shared ./packages/shared

# Generate Prisma client
WORKDIR /app/packages/server
RUN npx prisma generate

# Build TypeScript
RUN npm run build

# Expose port
EXPOSE 4000

# Start application
CMD ["npm", "start"]
```

Create `packages/server/.env.production.template`:

```env
# Database
DATABASE_URL=postgresql://user:pass@host:5432/db?schema=public&connection_limit=10

# Server
PORT=4000
NODE_ENV=production

# JWT
JWT_SECRET=<generate-strong-secret-32chars+>

# CORS
FRONTEND_URL=https://your-app.vercel.app

# Anthropic
ANTHROPIC_API_KEY=<your-key>
ANTHROPIC_MODEL=claude-3-5-sonnet-20241022
```

### Step 2: Deploy to Railway

**Option A: Railway CLI**
```powershell
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Initialize project
railway init

# Link to project
railway link

# Set environment variables
railway variables set DATABASE_URL=postgresql://...
railway variables set JWT_SECRET=your_secret
railway variables set FRONTEND_URL=https://your-app.vercel.app

# Deploy
railway up
```

**Option B: Railway Dashboard**
1. Go to https://railway.app/
2. New Project → Deploy from GitHub
3. Select repository
4. Set root directory: `packages/server`
5. Add PostgreSQL service
6. Configure environment variables
7. Deploy

### Step 3: Configure Backend

Update `packages/server/src/index.ts` for production:

```typescript
import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';

const app = express();
const prisma = new PrismaClient();

// CORS configuration
const allowedOrigins = process.env.FRONTEND_URL 
  ? [process.env.FRONTEND_URL]
  : ['http://localhost:5173'];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));

app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API routes
app.use('/api/auth', authRouter);
app.use('/api/products', productsRouter);
app.use('/api/customers', customersRouter);
app.use('/api/orders', ordersRouter);
app.use('/api/ai', aiRouter);

// Error handling
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ 
    success: false, 
    error: process.env.NODE_ENV === 'production' 
      ? 'Internal server error' 
      : err.message 
  });
});

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, closing server...');
  await prisma.$disconnect();
  process.exit(0);
});
```

## 4. Database Setup (Supabase)

### Step 1: Create Supabase Project
1. Go to https://supabase.com/
2. Create new project
3. Note: Database password (save securely!)
4. Wait for provisioning (~2 minutes)

### Step 2: Get Connection String
1. Settings → Database
2. Copy Connection String (URI)
3. Replace `[YOUR-PASSWORD]` with your password

Example:
```
postgresql://postgres:[YOUR-PASSWORD]@db.xxxxx.supabase.co:5432/postgres
```

### Step 3: Run Migrations
```powershell
cd packages/server

# Set DATABASE_URL temporarily
$env:DATABASE_URL="postgresql://postgres:password@db.xxxxx.supabase.co:5432/postgres"

# Run migrations
npx prisma migrate deploy

# Seed database (optional)
npm run seed
```

## 5. Environment Variables Management

### Development (.env)
```env
DATABASE_URL="file:./dev.db"
PORT=4000
NODE_ENV=development
JWT_SECRET=dev_secret_key
```

### Production
Store in deployment platform (Railway/Vercel):

**Backend (Railway):**
```env
DATABASE_URL=postgresql://...
PORT=4000
NODE_ENV=production
JWT_SECRET=<strong-secret>
FRONTEND_URL=https://pos.vercel.app
ANTHROPIC_API_KEY=sk-ant-...
```

**Frontend (Vercel):**
```env
VITE_API_URL=https://pos-backend.railway.app
```

### Secret Generation
```powershell
# Generate strong JWT secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## 6. CI/CD Pipeline

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm test

  deploy-backend:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to Railway
        run: |
          npm install -g @railway/cli
          railway up --service backend
        env:
          RAILWAY_TOKEN: ${{ secrets.RAILWAY_TOKEN }}

  deploy-frontend:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to Vercel
        run: |
          npm install -g vercel
          vercel --prod --token ${{ secrets.VERCEL_TOKEN }}
```

## 7. Monitoring & Logging

### Application Monitoring

**Option A: Sentry (Error Tracking)**
```powershell
npm install @sentry/node @sentry/react
```

**Backend:**
```typescript
import * as Sentry from '@sentry/node';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
});

app.use(Sentry.Handlers.requestHandler());
app.use(Sentry.Handlers.errorHandler());
```

**Frontend:**
```typescript
import * as Sentry from '@sentry/react';

Sentry.init({
  dsn: process.env.VITE_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
});
```

### Logging

**Backend Logging:**
```typescript
// Simple logger
const log = {
  info: (msg: string, data?: any) => {
    console.log(JSON.stringify({ 
      level: 'info', 
      message: msg, 
      data, 
      timestamp: new Date().toISOString() 
    }));
  },
  error: (msg: string, error?: any) => {
    console.error(JSON.stringify({ 
      level: 'error', 
      message: msg, 
      error: error?.message, 
      stack: error?.stack,
      timestamp: new Date().toISOString() 
    }));
  },
};
```

### Health Checks

```typescript
app.get('/health', async (req, res) => {
  try {
    // Check database
    await prisma.$queryRaw`SELECT 1`;
    
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      database: 'connected',
    });
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      error: 'Database connection failed',
    });
  }
});
```

## 8. Performance Optimization

### Frontend
```typescript
// Code splitting
const Catalog = lazy(() => import('./pages/Catalog'));
const Checkout = lazy(() => import('./pages/Checkout'));

// Image optimization
<img 
  src={product.image} 
  alt={product.name}
  loading="lazy"
  width="200"
  height="200"
/>

// Bundle analysis
npm run build -- --analyze
```

### Backend
```typescript
// Response compression
import compression from 'compression';
app.use(compression());

// Request caching (if applicable)
import NodeCache from 'node-cache';
const cache = new NodeCache({ stdTTL: 600 }); // 10 minutes
```

## 9. Security Headers

Add to backend:

```typescript
import helmet from 'helmet';

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", 'data:', 'https:'],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
  },
}));
```

## 10. Backup & Disaster Recovery

### Database Backups
```bash
# Automated daily backup script
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
pg_dump $DATABASE_URL > backups/backup_$DATE.sql

# Keep last 7 days
find backups/ -name "backup_*.sql" -mtime +7 -delete
```

### Application Backup
- Code: Git repository (already backed up)
- Database: Daily automated backups
- Environment variables: Secure vault (1Password, AWS Secrets Manager)

## 11. Scaling Strategy

### Horizontal Scaling
```
Load Balancer
     │
     ├─→ Backend Instance 1
     ├─→ Backend Instance 2
     └─→ Backend Instance 3
          │
          └─→ PostgreSQL (with read replicas)
```

### Vertical Scaling
Start with:
- Frontend: Free tier
- Backend: 1 CPU, 512MB RAM
- Database: 500MB storage

Scale up as needed:
- Backend: 2 CPU, 1GB RAM
- Database: 2GB storage, read replicas

## 12. Cost Estimation

### Free Tier (Development)
- Vercel: Free (hobby)
- Railway: $5 credit/month
- Supabase: Free (500MB DB)
- **Total: ~$0-5/month**

### Production (Small)
- Vercel: $20/month (Pro)
- Railway: $20/month (usage)
- Supabase: $25/month (Pro)
- **Total: ~$65/month**

### Production (Medium)
- Vercel: $20/month
- Railway: $50/month
- Supabase/RDS: $50/month
- Monitoring: $29/month (Sentry)
- **Total: ~$150/month**

## 13. Deployment Checklist

### Pre-Deploy
- [ ] Tests passing
- [ ] Build successful locally
- [ ] Environment variables set
- [ ] Database migrated
- [ ] Secrets rotated

### Deploy
- [ ] Backend deployed
- [ ] Frontend deployed
- [ ] Database connected
- [ ] Health checks passing
- [ ] HTTPS working

### Post-Deploy
- [ ] Smoke test critical paths
- [ ] Monitor error rates
- [ ] Check performance metrics
- [ ] Verify backups working
- [ ] Update documentation

## 14. Rollback Procedure

If deployment fails:

```powershell
# Railway rollback
railway rollback

# Vercel rollback
vercel rollback

# Database rollback
npx prisma migrate resolve --rolled-back [migration-name]
```

## 15. Support & Maintenance

### Daily
- Check error logs
- Monitor uptime
- Review performance metrics

### Weekly
- Review backup integrity
- Check disk usage
- Update dependencies

### Monthly
- Security audit
- Performance optimization
- Cost analysis

## Resources

- [Vercel Deployment](https://vercel.com/docs)
- [Railway Deployment](https://docs.railway.app/)
- [Supabase Guide](https://supabase.com/docs)
- [Prisma Production Best Practices](https://www.prisma.io/docs/guides/deployment)
