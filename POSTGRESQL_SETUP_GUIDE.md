# PostgreSQL Database Setup Guide

**Date**: October 19, 2025  
**Current Status**: Using SQLite (development)  
**Target**: PostgreSQL (production)

---

## 🎯 Why PostgreSQL?

✅ **Production-ready**: Industry standard for production applications  
✅ **Scalable**: Handles high concurrency and large datasets  
✅ **ACID compliant**: Ensures data integrity  
✅ **Free tier available**: All recommended providers offer free plans  
✅ **Prisma compatible**: Seamless migration from SQLite  

---

## 📊 Hosting Provider Comparison

| Provider | Free Tier | Storage | Connections | Best For |
|----------|-----------|---------|-------------|----------|
| **Supabase** | ✅ Yes | 500 MB | Unlimited | Full-stack apps, auth, real-time |
| **Neon** | ✅ Yes | 3 GB | 1 | Serverless, auto-scaling |
| **Railway** | ✅ Yes ($5 credit) | 1 GB | 20 | Easy deployment, Git integration |
| **ElephantSQL** | ✅ Yes | 20 MB | 5 | Simple setup, quick start |
| **Render** | ✅ Yes | 1 GB | 97 | All-in-one platform |

**Recommendation**: **Supabase** - Best free tier, great features, easy to use

---

## 🚀 Option 1: Supabase (Recommended)

### Step 1: Create Account & Project

1. **Go to**: https://supabase.com
2. **Sign up**: Use GitHub, Google, or email
3. **Create new project**:
   - Organization: Create or select
   - Project Name: `pos-system`
   - Database Password: **SAVE THIS!** (e.g., `YourSecurePass123!`)
   - Region: Choose closest to your users
   - Plan: Free

4. **Wait for setup** (2-3 minutes)

### Step 2: Get Connection String

1. **In Supabase Dashboard**, go to: Settings → Database
2. **Copy Connection String** (Connection pooling → Transaction mode)
3. **Format**:
   ```
   postgresql://postgres.xxxxxxxxxxxx:YourPassword@aws-0-region.pooler.supabase.com:6543/postgres
   ```

### Step 3: Update Your Application

1. **Create `.env` file** in `packages/server/`:
   ```bash
   DATABASE_URL="postgresql://postgres.xxxxxxxxxxxx:YourPassword@aws-0-region.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1"
   DIRECT_URL="postgresql://postgres.xxxxxxxxxxxx:YourPassword@aws-0-region.pooler.supabase.com:5432/postgres"
   JWT_SECRET="your-super-secret-jwt-key-change-in-production"
   PORT=4000
   ```

2. **Update `prisma/schema.prisma`**:
   ```prisma
   datasource db {
     provider  = "postgresql"
     url       = env("DATABASE_URL")
     directUrl = env("DIRECT_URL")
   }
   ```

3. **Run migrations**:
   ```bash
   cd packages/server
   npx prisma migrate dev --name init
   npx prisma generate
   npm run seed
   ```

4. **Test connection**:
   ```bash
   npm run dev
   ```

**✅ Done!** Your app now uses PostgreSQL

---

## 🌐 Option 2: Neon (Serverless)

### Step 1: Create Account & Database

1. **Go to**: https://neon.tech
2. **Sign up** with GitHub or email
3. **Create new project**:
   - Name: `pos-system`
   - Region: Choose closest
   - PostgreSQL version: 16 (latest)

### Step 2: Get Connection String

1. **In Neon Dashboard**, copy connection string
2. **Format**:
   ```
   postgresql://username:password@ep-cool-name-12345.region.aws.neon.tech/neondb?sslmode=require
   ```

### Step 3: Configure Application

1. **Create `.env` in `packages/server/`**:
   ```bash
   DATABASE_URL="postgresql://username:password@ep-cool-name-12345.region.aws.neon.tech/neondb?sslmode=require"
   JWT_SECRET="your-super-secret-jwt-key"
   PORT=4000
   ```

2. **Update `prisma/schema.prisma`**:
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```

3. **Run migrations & seed**:
   ```bash
   cd packages/server
   npx prisma migrate dev --name init
   npx prisma generate
   npm run seed
   ```

---

## 🚂 Option 3: Railway

### Step 1: Create Account & Deploy

1. **Go to**: https://railway.app
2. **Sign up** with GitHub
3. **Create new project**:
   - Click "New Project"
   - Select "Provision PostgreSQL"
   - Project deploys automatically

### Step 2: Get Connection String

1. **Click on PostgreSQL service**
2. **Go to Variables tab**
3. **Copy `DATABASE_URL`**

### Step 3: Configure Application

1. **Create `.env` in `packages/server/`**:
   ```bash
   DATABASE_URL="postgresql://postgres:password@containers-region.railway.app:5432/railway"
   JWT_SECRET="your-super-secret-jwt-key"
   PORT=4000
   ```

2. **Update schema and migrate** (same as above)

---

## 🐘 Option 4: ElephantSQL (Simple)

### Step 1: Create Account & Instance

1. **Go to**: https://www.elephantsql.com
2. **Sign up** (free account)
3. **Create new instance**:
   - Name: `pos-system`
   - Plan: Tiny Turtle (free)
   - Region: Choose closest
   - Click "Create instance"

### Step 2: Get Connection Details

1. **Click on your instance**
2. **Copy URL** from Details page
3. **Format**:
   ```
   postgres://username:password@host.db.elephantsql.com/database
   ```

### Step 3: Configure Application

Same as other options - update `.env` and run migrations.

---

## 📝 Migration Checklist

### Before Migration

- [ ] Backup current SQLite database
- [ ] Save current `dev.db` file
- [ ] Note down test data

### During Migration

- [ ] Choose hosting provider
- [ ] Create database instance
- [ ] Get connection string
- [ ] Create `.env` file
- [ ] Update `schema.prisma`
- [ ] Run `prisma migrate dev`
- [ ] Run `prisma generate`
- [ ] Run seed script

### After Migration

- [ ] Test database connection
- [ ] Verify all tables created
- [ ] Check seed data
- [ ] Test API endpoints
- [ ] Test frontend connectivity
- [ ] Update `.gitignore` (exclude `.env`)

---

## 🛠️ Detailed Migration Steps

### Step 1: Backup Current Data (Optional)

```bash
# Navigate to server directory
cd packages/server

# Backup SQLite database
copy prisma\dev.db prisma\dev.db.backup
```

### Step 2: Update Prisma Schema

**File**: `packages/server/prisma/schema.prisma`

**Change from**:
```prisma
datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}
```

**Change to** (for Supabase with connection pooling):
```prisma
datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}
```

**OR** (for other providers without pooling):
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

### Step 3: Update Data Types (PostgreSQL Specific)

PostgreSQL uses different syntax for some features. Update if needed:

**DateTime with auto-update**:
```prisma
// Keep as is - Prisma handles this
updatedAt DateTime @updatedAt
```

**Auto-increment IDs**:
```prisma
// Change from:
id String @id @default(cuid())

// To (if you want sequential IDs):
id Int @id @default(autoincrement())

// OR keep cuid() for UUID-like IDs
```

### Step 4: Create `.env` File

**Create**: `packages/server/.env`

```bash
# Database
DATABASE_URL="your-postgresql-connection-string-here"
DIRECT_URL="your-direct-connection-string-here"  # Only for Supabase

# Application
JWT_SECRET="your-super-secret-jwt-key-min-32-chars"
PORT=4000
NODE_ENV=development

# Optional: For production
# FRONTEND_URL="https://your-frontend-domain.com"
# CORS_ORIGIN="https://your-frontend-domain.com"
```

### Step 5: Update `.gitignore`

**Ensure `.env` is ignored**:

```gitignore
# Environment variables
.env
.env.local
.env.*.local

# Database
*.db
*.db-journal
```

### Step 6: Install PostgreSQL Client (if needed)

```bash
# Already installed with Prisma, but verify:
npm list @prisma/client
```

### Step 7: Run Migrations

```bash
cd packages/server

# Delete old SQLite migrations
rmdir /s /q prisma\migrations

# Create new PostgreSQL migration
npx prisma migrate dev --name postgresql_init

# This will:
# - Create migration files
# - Apply migrations to PostgreSQL
# - Generate Prisma Client
```

**Expected output**:
```
Environment variables loaded from .env
Prisma schema loaded from prisma\schema.prisma
Datasource "db": PostgreSQL database "postgres"

Applying migration `20251019_postgresql_init`

Database is now in sync with your Prisma schema.

✔ Generated Prisma Client
```

### Step 8: Seed Database

```bash
npm run seed
```

**Expected output**:
```
🌱 Seeding database...
✅ Created 15 products
✅ Created 5 customers
✅ Created 3 sample orders
🎉 Seeding complete!
```

### Step 9: Verify Migration

```bash
# Check database with Prisma Studio
npx prisma studio
```

**This opens**: http://localhost:5555

**Verify**:
- [ ] Products table has data
- [ ] Customers table has data
- [ ] Orders table has data
- [ ] All relationships work

### Step 10: Test Application

```bash
# Start backend
npm run dev
```

**Test endpoints**:
```bash
# Get products (should return 200)
curl http://localhost:4000/api/products

# Get customers (should return 200)
curl http://localhost:4000/api/customers
```

---

## 🔍 Troubleshooting

### Issue: "Can't reach database server"

**Solutions**:
1. Check connection string format
2. Verify database is running (check provider dashboard)
3. Check firewall/network settings
4. Ensure SSL mode is correct (`?sslmode=require`)

### Issue: "Database does not exist"

**Solutions**:
1. Create database manually in provider dashboard
2. Check database name in connection string
3. Ensure you're using correct project/region

### Issue: "Migration failed"

**Solutions**:
1. Delete `prisma/migrations` folder
2. Run `npx prisma db push` (for first-time setup)
3. Then run `npx prisma migrate dev --name init`

### Issue: "SSL connection required"

**Solution**: Add to connection string:
```
?sslmode=require
```

### Issue: "Too many connections"

**Solutions**:
1. Use connection pooling (Supabase provides this)
2. Add to connection string: `?connection_limit=1`
3. Close unused connections in code

---

## 🔒 Security Best Practices

### 1. Environment Variables

✅ **DO**:
- Use `.env` for secrets
- Add `.env` to `.gitignore`
- Use different secrets for dev/prod
- Rotate JWT secrets regularly

❌ **DON'T**:
- Commit `.env` to Git
- Share credentials in chat/email
- Use weak passwords
- Hardcode secrets in code

### 2. Database Security

✅ **DO**:
- Use strong passwords (16+ chars)
- Enable SSL connections
- Limit IP access (if possible)
- Regular backups
- Monitor connections

❌ **DON'T**:
- Expose database publicly
- Use default passwords
- Share connection strings
- Skip backups

### 3. Production Checklist

- [ ] Strong database password
- [ ] Strong JWT secret (32+ characters)
- [ ] SSL/TLS enabled
- [ ] Environment variables secured
- [ ] Regular backups configured
- [ ] Monitoring enabled
- [ ] Rate limiting implemented
- [ ] CORS configured properly

---

## 📊 Connection String Formats

### Supabase
```bash
# Connection pooling (recommended)
DATABASE_URL="postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1"

# Direct connection
DIRECT_URL="postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:5432/postgres"
```

### Neon
```bash
DATABASE_URL="postgresql://[USER]:[PASSWORD]@[HOST].neon.tech/neondb?sslmode=require"
```

### Railway
```bash
DATABASE_URL="postgresql://postgres:[PASSWORD]@[HOST].railway.app:5432/railway"
```

### ElephantSQL
```bash
DATABASE_URL="postgres://[USER]:[PASSWORD]@[HOST].db.elephantsql.com/[DATABASE]"
```

---

## 🎯 Quick Start (TL;DR)

**5-Minute Setup with Supabase**:

1. Go to https://supabase.com → Sign up → Create project
2. Wait 2 minutes for setup
3. Copy connection string from Settings → Database
4. Create `packages/server/.env`:
   ```bash
   DATABASE_URL="[your-connection-string]"
   JWT_SECRET="your-secret-key"
   ```
5. Update `prisma/schema.prisma`:
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```
6. Run commands:
   ```bash
   cd packages/server
   npx prisma migrate dev --name init
   npm run seed
   npm run dev
   ```

**✅ Done!** PostgreSQL is now running.

---

## 📞 Support Resources

- **Supabase Docs**: https://supabase.com/docs/guides/database
- **Neon Docs**: https://neon.tech/docs/introduction
- **Railway Docs**: https://docs.railway.app/databases/postgresql
- **Prisma Docs**: https://www.prisma.io/docs/concepts/database-connectors/postgresql

---

## Next Steps After Setup

1. ✅ Database migrated to PostgreSQL
2. ✅ Seed data loaded
3. ✅ Application tested and working
4. 🔄 Deploy to production hosting
5. 🔄 Configure environment variables in hosting platform
6. 🔄 Set up CI/CD pipeline
7. 🔄 Configure monitoring and logging

**Need help?** Check the troubleshooting section or consult provider documentation.
