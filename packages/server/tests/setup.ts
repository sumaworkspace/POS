// Setup for all backend tests
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

beforeAll(async () => {
  // Connect to test database
  await prisma.$connect();
});

afterAll(async () => {
  // Cleanup and disconnect
  await prisma.$disconnect();
});

// Mock environment variables
process.env.JWT_SECRET = 'test-secret-key-for-testing-only';
process.env.PORT = '4001';
process.env.NODE_ENV = 'test';
