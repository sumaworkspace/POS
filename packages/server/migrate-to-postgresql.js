#!/usr/bin/env node

/**
 * PostgreSQL Migration Helper Script
 * 
 * This script helps migrate from SQLite to PostgreSQL
 * Run with: node migrate-to-postgresql.js
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

const PROVIDERS = {
  '1': {
    name: 'Supabase',
    example: 'postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1',
    needsDirect: true,
    directExample: 'postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:5432/postgres'
  },
  '2': {
    name: 'Neon',
    example: 'postgresql://[USER]:[PASSWORD]@[HOST].neon.tech/neondb?sslmode=require',
    needsDirect: false
  },
  '3': {
    name: 'Railway',
    example: 'postgresql://postgres:[PASSWORD]@[HOST].railway.app:5432/railway',
    needsDirect: false
  },
  '4': {
    name: 'ElephantSQL',
    example: 'postgres://[USER]:[PASSWORD]@[HOST].db.elephantsql.com/[DATABASE]',
    needsDirect: false
  },
  '5': {
    name: 'Other/Custom',
    example: 'postgresql://[USER]:[PASSWORD]@[HOST]:[PORT]/[DATABASE]',
    needsDirect: false
  }
};

async function main() {
  console.log('\n🔄 PostgreSQL Migration Helper\n');
  console.log('This script will help you migrate from SQLite to PostgreSQL\n');
  
  // Step 1: Choose provider
  console.log('Choose your PostgreSQL provider:');
  console.log('1. Supabase (Recommended)');
  console.log('2. Neon');
  console.log('3. Railway');
  console.log('4. ElephantSQL');
  console.log('5. Other/Custom\n');
  
  const choice = await question('Enter your choice (1-5): ');
  const provider = PROVIDERS[choice];
  
  if (!provider) {
    console.error('❌ Invalid choice. Exiting.');
    rl.close();
    return;
  }
  
  console.log(`\n✅ Selected: ${provider.name}\n`);
  
  // Step 2: Get connection string
  console.log('📋 Connection String Example:');
  console.log(`   ${provider.example}\n`);
  
  const connectionString = await question('Enter your DATABASE_URL: ');
  
  if (!connectionString || connectionString.trim() === '') {
    console.error('❌ Connection string cannot be empty. Exiting.');
    rl.close();
    return;
  }
  
  let directUrl = '';
  if (provider.needsDirect) {
    console.log('\n📋 Direct Connection String Example:');
    console.log(`   ${provider.directExample}\n`);
    directUrl = await question('Enter your DIRECT_URL: ');
  }
  
  // Step 3: Get JWT secret
  console.log('\n🔐 JWT Secret (minimum 32 characters recommended)');
  const jwtSecret = await question('Enter JWT_SECRET (or press Enter for random): ');
  
  const finalJwtSecret = jwtSecret.trim() || generateRandomSecret();
  
  // Step 4: Backup confirmation
  console.log('\n⚠️  Before proceeding:');
  console.log('   1. Ensure you have backed up your SQLite database');
  console.log('   2. Ensure your PostgreSQL database is accessible');
  console.log('   3. Ensure you have the correct connection string\n');
  
  const confirm = await question('Continue with migration? (yes/no): ');
  
  if (confirm.toLowerCase() !== 'yes' && confirm.toLowerCase() !== 'y') {
    console.log('❌ Migration cancelled.');
    rl.close();
    return;
  }
  
  // Step 5: Create .env file
  console.log('\n📝 Creating .env file...');
  
  const envContent = `# Database Configuration
DATABASE_URL="${connectionString}"
${directUrl ? `DIRECT_URL="${directUrl}"\n` : ''}
# Application Configuration
JWT_SECRET="${finalJwtSecret}"
PORT=4000
NODE_ENV=development

# Frontend URL (for CORS)
FRONTEND_URL="http://localhost:5173"
`;
  
  const envPath = path.join(__dirname, '.env');
  fs.writeFileSync(envPath, envContent);
  console.log('✅ .env file created');
  
  // Step 6: Update schema.prisma
  console.log('\n📝 Updating prisma/schema.prisma...');
  
  const schemaPath = path.join(__dirname, 'prisma', 'schema.prisma');
  let schemaContent = fs.readFileSync(schemaPath, 'utf-8');
  
  // Replace datasource
  if (directUrl) {
    schemaContent = schemaContent.replace(
      /datasource db \{[^}]+\}/s,
      `datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}`
    );
  } else {
    schemaContent = schemaContent.replace(
      /datasource db \{[^}]+\}/s,
      `datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}`
    );
  }
  
  fs.writeFileSync(schemaPath, schemaContent);
  console.log('✅ schema.prisma updated');
  
  // Step 7: Next steps
  console.log('\n✅ Configuration complete!\n');
  console.log('📋 Next steps:\n');
  console.log('1. Delete old migrations:');
  console.log('   rmdir /s /q prisma\\migrations  (Windows)');
  console.log('   rm -rf prisma/migrations        (Linux/Mac)\n');
  console.log('2. Create new migration:');
  console.log('   npx prisma migrate dev --name postgresql_init\n');
  console.log('3. Generate Prisma Client:');
  console.log('   npx prisma generate\n');
  console.log('4. Seed database:');
  console.log('   npm run seed\n');
  console.log('5. Start server:');
  console.log('   npm run dev\n');
  console.log('6. Verify in Prisma Studio:');
  console.log('   npx prisma studio\n');
  
  rl.close();
}

function generateRandomSecret() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
  let secret = '';
  for (let i = 0; i < 48; i++) {
    secret += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return secret;
}

// Handle errors
process.on('unhandledRejection', (error) => {
  console.error('\n❌ Error:', error.message);
  rl.close();
  process.exit(1);
});

// Run
main().catch(console.error);
