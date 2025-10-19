# PostgreSQL Migration Guide

## Overview
This guide covers migrating the POS application from SQLite (development) to PostgreSQL (production).

## Why PostgreSQL?

### SQLite Limitations in Production
- ❌ No concurrent write operations
- ❌ Limited scalability
- ❌ No built-in replication
- ❌ File-based (single point of failure)
- ❌ Limited data types

### PostgreSQL Advantages
- ✅ Excellent concurrency support
- ✅ Horizontal scaling capabilities
- ✅ Built-in replication and backup
- ✅ Rich data types and indexing
- ✅ Industry-standard for web apps

## Migration Checklist

- [ ] Set up PostgreSQL database (local or cloud)
- [ ] Update Prisma schema datasource
- [ ] Install PostgreSQL dependencies
- [ ] Update environment variables
- [ ] Run database migrations
- [ ] Seed production database
- [ ] Test database connection
- [ ] Update deployment configuration
- [ ] Set up connection pooling
- [ ] Configure backup strategy

## 1. PostgreSQL Setup Options

### Option A: Local PostgreSQL (Development)

**Install PostgreSQL:**
```powershell
# Download from: https://www.postgresql.org/download/windows/
# Or use Chocolatey:
choco install postgresql

# Or use Docker:
docker run --name pos-postgres -e POSTGRES_PASSWORD=mysecretpassword -p 5432:5432 -d postgres
```

**Create Database:**
```sql
CREATE DATABASE pos_development;
CREATE USER pos_user WITH ENCRYPTED PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE pos_development TO pos_user;
```

### Option B: Cloud PostgreSQL (Production)

**Recommended Providers:**

1. **Supabase** (Free tier available)
   - URL: https://supabase.com/
   - Features: PostgreSQL, Auth, Storage, Real-time
   - Free: 500MB database, 2GB bandwidth

2. **Neon** (Serverless PostgreSQL)
   - URL: https://neon.tech/
   - Features: Serverless, auto-scaling, branching
   - Free: 3GB storage, 1 compute

3. **Railway** (Simple deployment)
   - URL: https://railway.app/
   - Features: PostgreSQL + app hosting
   - Free: $5 credit/month

4. **AWS RDS** (Enterprise)
   - URL: https://aws.amazon.com/rds/
   - Features: Managed PostgreSQL, backups, scaling
   - Pricing: Pay-as-you-go

5. **Azure Database for PostgreSQL**
   - URL: https://azure.microsoft.com/en-us/products/postgresql/
   - Features: Fully managed, security, scaling

## 2. Update Prisma Schema

### Current Schema (SQLite)
```prisma
datasource db {
  provider = "sqlite"
  url      = "file:./dev.db"
}
```

### Updated Schema (PostgreSQL)
Edit `packages/server/prisma/schema.prisma`:

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

model User {
  id        String   @id @default(uuid())
  username  String   @unique
  password  String
  name      String
  role      String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Category {
  id          String    @id @default(uuid())
  name        String    @unique
  description String?
  products    Product[]
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
}

model Product {
  id          String   @id @default(uuid())
  name        String
  description String?
  price       Float
  image       String?
  categoryId  String
  category    Category @relation(fields: [categoryId], references: [id])
  stock       Int      @default(0)
  taxRate     Float    @default(0.12)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@index([categoryId])
}

model Customer {
  id        String   @id @default(uuid())
  firstName String
  lastName  String
  phone     String   @unique
  email     String?
  isMember  Boolean  @default(false)
  orders    Order[]
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([phone])
}

model Order {
  id              String   @id @default(uuid())
  customerId      String
  customer        Customer @relation(fields: [customerId], references: [id])
  items           Json     // Array of {productId, name, quantity, price}
  subtotal        Float
  discount        Float    @default(0)
  tax             Float
  total           Float
  paymentMethod   String   // 'cash' | 'card' | 'upi'
  transactionId   String?
  status          String   @default("completed") // 'pending' | 'completed' | 'cancelled'
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  @@index([customerId])
  @@index([status])
  @@index([createdAt])
}
```

### Key Changes for PostgreSQL
1. ✅ `@default(uuid())` works natively (SQLite needed cuid())
2. ✅ Added `@@index` for performance on foreign keys and frequent queries
3. ✅ Json type fully supported for order items
4. ✅ Better timestamp handling with `@default(now())`

## 3. Install Dependencies

```powershell
cd packages/server

# PostgreSQL client (pg) is automatically used by Prisma
# No additional installation needed!
```

## 4. Environment Variables

### Development (.env.development)
```env
# PostgreSQL Connection
DATABASE_URL="postgresql://pos_user:your_secure_password@localhost:5432/pos_development?schema=public"

# Server
PORT=4000
NODE_ENV=development

# JWT
JWT_SECRET=your_development_secret_key_change_in_production

# Anthropic AI (optional)
ANTHROPIC_API_KEY=
ANTHROPIC_MODEL=claude-3-5-sonnet-20241022
```

### Production (.env.production)
```env
# PostgreSQL Connection (from cloud provider)
DATABASE_URL="postgresql://username:password@host:5432/database?schema=public&connection_limit=10"

# Or with connection pooling (recommended)
DATABASE_URL="postgresql://username:password@host:5432/database?schema=public&pgbouncer=true"

# Server
PORT=4000
NODE_ENV=production

# JWT (use strong key)
JWT_SECRET=use_a_very_strong_random_key_here_at_least_32_chars

# Anthropic AI
ANTHROPIC_API_KEY=sk-ant-your-actual-key
ANTHROPIC_MODEL=claude-3-5-sonnet-20241022
```

### Connection URL Format
```
postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=SCHEMA&options
```

**Components:**
- `USER`: Database username
- `PASSWORD`: Database password (URL-encoded if special characters)
- `HOST`: Database host (localhost or cloud URL)
- `PORT`: Usually 5432 for PostgreSQL
- `DATABASE`: Database name
- `schema`: Usually "public"

## 5. Database Migration

### Step 1: Create Migration
```powershell
cd packages/server

# Generate migration from schema
npx prisma migrate dev --name init_postgresql

# This will:
# 1. Create migration SQL file
# 2. Apply migration to database
# 3. Generate Prisma Client
```

### Step 2: Seed Database
```powershell
# Run seed script
npm run seed
```

### Step 3: Verify Migration
```powershell
# Open Prisma Studio to check data
npx prisma studio
```

## 6. Connection Pooling (Production)

### Why Connection Pooling?
- Reuse database connections
- Reduce connection overhead
- Handle high concurrency
- Prevent connection exhaustion

### Option A: PgBouncer (Recommended)

**Update DATABASE_URL:**
```env
DATABASE_URL="postgresql://user:password@host:6543/database?pgbouncer=true"
```

**PgBouncer Configuration:**
Many cloud providers (Supabase, Neon) include PgBouncer automatically.

### Option B: Prisma Connection Pooling

Update `packages/server/prisma/schema.prisma`:

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
  directUrl = env("DIRECT_DATABASE_URL") // For migrations
}
```

**.env:**
```env
DATABASE_URL="postgresql://user:password@pooler.host:6543/database?pgbouncer=true"
DIRECT_DATABASE_URL="postgresql://user:password@direct.host:5432/database"
```

### Option C: Application-Level Pooling

Update `packages/server/src/index.ts`:

```typescript
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
  // Connection pool configuration
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

// Recommended pool settings
// Add to DATABASE_URL: ?connection_limit=10&pool_timeout=20
```

## 7. Data Migration (SQLite → PostgreSQL)

If you need to migrate existing data:

### Option A: Export/Import via CSV
```powershell
# Export from SQLite
sqlite3 dev.db ".mode csv" ".output users.csv" "SELECT * FROM User;"

# Import to PostgreSQL
psql -U pos_user -d pos_development -c "\copy \"User\" FROM 'users.csv' CSV HEADER;"
```

### Option B: Use Prisma
```typescript
// migration-script.ts
import { PrismaClient as SQLiteClient } from '@prisma/client'; // SQLite
import { PrismaClient as PostgreSQLClient } from '@prisma/client'; // PostgreSQL

const sqliteDb = new SQLiteClient({
  datasource: { db: { url: 'file:./dev.db' } }
});

const postgresDb = new PostgreSQLClient({
  datasource: { db: { url: process.env.DATABASE_URL } }
});

async function migrateData() {
  // Users
  const users = await sqliteDb.user.findMany();
  await postgresDb.user.createMany({ data: users });

  // Categories
  const categories = await sqliteDb.category.findMany();
  await postgresDb.category.createMany({ data: categories });

  // Products
  const products = await sqliteDb.product.findMany();
  await postgresDb.product.createMany({ data: products });

  // Customers
  const customers = await sqliteDb.customer.findMany();
  await postgresDb.customer.createMany({ data: customers });

  // Orders
  const orders = await sqliteDb.order.findMany();
  await postgresDb.order.createMany({ data: orders });

  console.log('Migration complete!');
}

migrateData();
```

## 8. Testing PostgreSQL Connection

Create `packages/server/tests/db-connection.test.ts`:

```typescript
import { PrismaClient } from '@prisma/client';

describe('PostgreSQL Connection', () => {
  let prisma: PrismaClient;

  beforeAll(() => {
    prisma = new PrismaClient();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  test('should connect to database', async () => {
    await expect(prisma.$connect()).resolves.not.toThrow();
  });

  test('should perform basic query', async () => {
    const users = await prisma.user.findMany();
    expect(Array.isArray(users)).toBe(true);
  });

  test('should handle transactions', async () => {
    await expect(
      prisma.$transaction([
        prisma.user.findMany(),
        prisma.category.findMany(),
      ])
    ).resolves.not.toThrow();
  });
});
```

## 9. Backup Strategy

### Automated Backups (Production)

**Option A: Cloud Provider Backups**
- Most cloud providers offer automatic daily backups
- Point-in-time recovery
- Easy restore process

**Option B: Manual pg_dump**
```bash
# Backup
pg_dump -h host -U user -d database -F c -f backup_$(date +%Y%m%d).dump

# Restore
pg_restore -h host -U user -d database -c backup_20241019.dump
```

**Option C: Scheduled Backups**
```bash
# Add to cron (Linux) or Task Scheduler (Windows)
0 2 * * * pg_dump -h host -U user database > backup_$(date +\%Y\%m\%d).sql
```

## 10. Performance Optimization

### Indexes
Already added in schema:
- `@@index([categoryId])` on Product
- `@@index([phone])` on Customer
- `@@index([customerId])` on Order
- `@@index([status])` on Order
- `@@index([createdAt])` on Order

### Query Optimization
```typescript
// Use select to fetch only needed fields
const products = await prisma.product.findMany({
  select: {
    id: true,
    name: true,
    price: true,
  },
});

// Use include for relations
const order = await prisma.order.findUnique({
  where: { id: orderId },
  include: { customer: true },
});
```

### Connection Management
```typescript
// Reuse Prisma Client instance
// Don't create new instance per request
const prisma = new PrismaClient();

// Graceful shutdown
process.on('beforeExit', async () => {
  await prisma.$disconnect();
});
```

## 11. Monitoring

### Database Metrics to Track
- Connection pool usage
- Query execution time
- Slow queries (> 1 second)
- Database size and growth
- Index usage

### Tools
- **pg_stat_statements**: Query performance
- **pgAdmin**: GUI management
- **Datadog/New Relic**: Application monitoring
- **Prisma Studio**: Visual data browser

## 12. Security Checklist

- [ ] Use environment variables for credentials
- [ ] Never commit .env files
- [ ] Use strong passwords (20+ characters)
- [ ] Enable SSL connections in production
- [ ] Limit database user permissions
- [ ] Use connection pooling
- [ ] Implement rate limiting
- [ ] Regular security updates
- [ ] Backup encryption
- [ ] Monitor for suspicious activity

## 13. Troubleshooting

### Common Issues

**Connection Refused:**
```
Error: connect ECONNREFUSED 127.0.0.1:5432
```
Solution: Check PostgreSQL is running and port is correct.

**Authentication Failed:**
```
Error: password authentication failed for user "pos_user"
```
Solution: Verify username/password in DATABASE_URL.

**SSL Required:**
```
Error: no pg_hba.conf entry for host
```
Solution: Add `?sslmode=require` to DATABASE_URL.

**Connection Timeout:**
```
Error: Connection timeout
```
Solution: Check firewall, increase timeout, verify host is reachable.

## 14. Rollback Plan

If migration fails:

1. **Keep SQLite backup**
   ```powershell
   copy packages\server\prisma\dev.db packages\server\prisma\dev.db.backup
   ```

2. **Revert schema.prisma**
   ```prisma
   datasource db {
     provider = "sqlite"
     url      = "file:./dev.db"
   }
   ```

3. **Regenerate client**
   ```powershell
   npx prisma generate
   ```

## 15. Next Steps

1. ✅ Choose PostgreSQL hosting provider
2. ✅ Set up database instance
3. ✅ Update Prisma schema
4. ✅ Configure environment variables
5. ✅ Run migrations
6. ✅ Test connection
7. ✅ Seed database
8. ✅ Configure connection pooling
9. ✅ Set up backups
10. ✅ Deploy application

## Resources

- [Prisma PostgreSQL Guide](https://www.prisma.io/docs/concepts/database-connectors/postgresql)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Supabase Setup](https://supabase.com/docs/guides/database)
- [Connection Pooling](https://www.prisma.io/docs/guides/performance-and-optimization/connection-management)
