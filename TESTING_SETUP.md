# Testing Setup Guide

## Overview
This guide covers the complete setup of automated testing for the POS application using Jest and React Testing Library.

## Testing Strategy

### Test Pyramid
```
       /\
      /E2E\          - End-to-End (Playwright/Cypress) - Future
     /------\
    /Integration\    - API Integration Tests
   /------------\
  /  Unit Tests  \   - Component & Function Tests
 /----------------\
```

## 1. Backend Testing Setup (Jest)

### Install Dependencies

```powershell
cd packages/server
npm install --save-dev jest @types/jest ts-jest supertest @types/supertest
```

### Jest Configuration

Create `packages/server/jest.config.js`:

```javascript
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src', '<rootDir>/tests'],
  testMatch: ['**/__tests__/**/*.ts', '**/*.test.ts', '**/*.spec.ts'],
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/index.ts', // Exclude entry point
  ],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },
  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
};
```

### Test Setup File

Create `packages/server/tests/setup.ts`:

```typescript
// Setup for all tests
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
process.env.JWT_SECRET = 'test-secret-key';
process.env.PORT = '4001';
```

### Example Backend Tests

**Unit Test: Tax Calculation**
Create `packages/server/src/utils/tax.test.ts`:

```typescript
describe('Tax Calculation', () => {
  const TAX_RATE = 0.12;

  test('should calculate tax correctly', () => {
    const amount = 1000;
    const tax = amount * TAX_RATE;
    expect(tax).toBe(120);
  });

  test('should calculate total with tax', () => {
    const subtotal = 1000;
    const tax = subtotal * TAX_RATE;
    const total = subtotal + tax;
    expect(total).toBe(1120);
  });

  test('should handle discount before tax', () => {
    const subtotal = 1000;
    const discount = 0.1; // 10%
    const afterDiscount = subtotal * (1 - discount);
    const tax = afterDiscount * TAX_RATE;
    const total = afterDiscount + tax;
    
    expect(afterDiscount).toBe(900);
    expect(tax).toBe(108);
    expect(total).toBe(1008);
  });
});
```

**Integration Test: Auth Routes**
Create `packages/server/tests/routes/auth.test.ts`:

```typescript
import request from 'supertest';
import express from 'express';
import authRouter from '../../src/routes/auth';

const app = express();
app.use(express.json());
app.use('/api/auth', authRouter);

describe('POST /api/auth/login', () => {
  test('should login with valid credentials', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        username: 'admin',
        password: 'password',
      });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data).toHaveProperty('token');
    expect(response.body.data).toHaveProperty('user');
  });

  test('should reject invalid credentials', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        username: 'admin',
        password: 'wrongpassword',
      });

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
  });

  test('should reject missing credentials', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({});

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
  });
});
```

### Update package.json Scripts

Add to `packages/server/package.json`:

```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:ci": "jest --ci --coverage --maxWorkers=2"
  }
}
```

## 2. Frontend Testing Setup (React Testing Library)

### Install Dependencies

```powershell
cd packages/frontend
npm install --save-dev jest @types/jest ts-jest @testing-library/react @testing-library/jest-dom @testing-library/user-event jest-environment-jsdom
```

### Jest Configuration

Create `packages/frontend/jest.config.js`:

```javascript
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.tsx', '**/*.test.tsx', '**/*.test.ts'],
  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
  },
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts'],
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/main.tsx',
    '!src/vite-env.d.ts',
  ],
  coverageThreshold: {
    global: {
      branches: 60,
      functions: 60,
      lines: 60,
      statements: 60,
    },
  },
};
```

### Test Setup File

Create `packages/frontend/src/setupTests.ts`:

```typescript
import '@testing-library/jest-dom';

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.localStorage = localStorageMock as any;

// Mock fetch
global.fetch = jest.fn();
```

### Example Frontend Tests

**Unit Test: Utility Functions**
Create `packages/frontend/src/lib/utils.test.ts`:

```typescript
import { formatCurrency, validatePhone, validateEmail } from './utils';

describe('formatCurrency', () => {
  test('should format currency with rupee symbol', () => {
    expect(formatCurrency(1000)).toBe('₹1,000.00');
    expect(formatCurrency(1234.56)).toBe('₹1,234.56');
  });

  test('should handle zero', () => {
    expect(formatCurrency(0)).toBe('₹0.00');
  });
});

describe('validatePhone', () => {
  test('should validate correct phone number', () => {
    const result = validatePhone('9876543210');
    expect(result.valid).toBe(true);
    expect(result.error).toBe('');
  });

  test('should reject invalid phone number', () => {
    const result = validatePhone('123');
    expect(result.valid).toBe(false);
    expect(result.error).toBeTruthy();
  });

  test('should reject empty phone number', () => {
    const result = validatePhone('');
    expect(result.valid).toBe(false);
    expect(result.error).toBe('Phone number is required');
  });
});

describe('validateEmail', () => {
  test('should validate correct email', () => {
    const result = validateEmail('test@example.com');
    expect(result.valid).toBe(true);
  });

  test('should allow empty email (optional)', () => {
    const result = validateEmail('');
    expect(result.valid).toBe(true);
  });

  test('should reject invalid email', () => {
    const result = validateEmail('invalid-email');
    expect(result.valid).toBe(false);
  });
});
```

**Component Test: Modal**
Create `packages/frontend/src/components/Modal.test.tsx`:

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import Modal from './Modal';

describe('Modal Component', () => {
  const mockOnConfirm = jest.fn();
  const mockOnCancel = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should not render when isOpen is false', () => {
    const { container } = render(
      <Modal
        isOpen={false}
        title="Test Modal"
        message="Test message"
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
      />
    );
    expect(container.firstChild).toBeNull();
  });

  test('should render when isOpen is true', () => {
    render(
      <Modal
        isOpen={true}
        title="Test Modal"
        message="Test message"
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
      />
    );
    
    expect(screen.getByText('Test Modal')).toBeInTheDocument();
    expect(screen.getByText('Test message')).toBeInTheDocument();
  });

  test('should call onConfirm when confirm button clicked', () => {
    render(
      <Modal
        isOpen={true}
        title="Test Modal"
        message="Test message"
        confirmText="Yes"
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
      />
    );
    
    fireEvent.click(screen.getByText('Yes'));
    expect(mockOnConfirm).toHaveBeenCalledTimes(1);
  });

  test('should call onCancel when cancel button clicked', () => {
    render(
      <Modal
        isOpen={true}
        title="Test Modal"
        message="Test message"
        cancelText="No"
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
      />
    );
    
    fireEvent.click(screen.getByText('No'));
    expect(mockOnCancel).toHaveBeenCalledTimes(1);
  });
});
```

**Component Test: Cart (Complex)**
Create `packages/frontend/src/components/Cart.test.tsx`:

```typescript
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Cart from './Cart';
import { AppProvider } from '../context/AppContext';
import { ToastProvider } from '../context/ToastContext';

const MockedCart = () => (
  <BrowserRouter>
    <ToastProvider>
      <AppProvider>
        <Cart />
      </AppProvider>
    </ToastProvider>
  </BrowserRouter>
);

describe('Cart Component', () => {
  test('should render empty cart message', () => {
    render(<MockedCart />);
    expect(screen.getByText(/Your cart is empty/i)).toBeInTheDocument();
  });

  test('should display cart items', async () => {
    // This would require mocking the AppContext with cart items
    // Implementation depends on how you structure the context
  });

  test('should allow quantity changes', async () => {
    // Test quantity increment/decrement
  });

  test('should calculate subtotal correctly', async () => {
    // Test calculation logic
  });
});
```

### Update package.json Scripts

Add to `packages/frontend/package.json`:

```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:ci": "jest --ci --coverage --maxWorkers=2"
  }
}
```

## 3. Root-Level Test Scripts

Update `package.json` at root:

```json
{
  "scripts": {
    "test": "npm run test --workspaces",
    "test:coverage": "npm run test:coverage --workspaces",
    "test:ci": "npm run test:ci --workspaces"
  }
}
```

## 4. CI/CD Integration (GitHub Actions)

Create `.github/workflows/test.yml`:

```yaml
name: Test Suite

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  test:
    runs-on: ubuntu-latest

    strategy:
      matrix:
        node-version: [18.x, 20.x]

    steps:
      - uses: actions/checkout@v3
      
      - name: Use Node.js ${{ matrix.node-version }}
        uses: actions/setup-node@v3
        with:
          node-version: ${{ matrix.node-version }}
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run tests
        run: npm run test:ci
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./packages/*/coverage/coverage-final.json
          flags: unittests
```

## 5. Running Tests

### Local Development

```powershell
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run with coverage
npm run test:coverage

# Run specific package tests
npm --workspace=@pos/server run test
npm --workspace=@pos/frontend run test
```

### Continuous Integration

Tests will run automatically on:
- Every push to `main` or `develop` branches
- Every pull request to these branches

## 6. Test Coverage Goals

| Package | Target Coverage |
|---------|----------------|
| Backend | 70% |
| Frontend | 60% |
| Utils | 80% |

## 7. Best Practices

### DO:
- ✅ Write tests for all utility functions
- ✅ Test business logic separately from UI
- ✅ Mock external dependencies (API calls, localStorage)
- ✅ Test edge cases and error conditions
- ✅ Keep tests focused and readable
- ✅ Use descriptive test names

### DON'T:
- ❌ Test implementation details
- ❌ Write tests that depend on each other
- ❌ Mock everything (test real behavior when possible)
- ❌ Ignore failing tests
- ❌ Write tests just for coverage

## 8. Next Steps

1. **Phase 1**: Install all dependencies
2. **Phase 2**: Create configuration files
3. **Phase 3**: Write utility function tests
4. **Phase 4**: Write component tests for Modal, Toast
5. **Phase 5**: Write API integration tests
6. **Phase 6**: Set up CI/CD pipeline
7. **Phase 7**: Achieve target coverage

## Resources

- [Jest Documentation](https://jestjs.io/)
- [React Testing Library](https://testing-library.com/react)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
