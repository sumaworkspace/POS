# Quick Start: Testing Setup

## Install All Testing Dependencies

Run this script to install all testing dependencies for both frontend and backend:

```powershell
# Backend testing dependencies
Write-Host "Installing backend testing dependencies..." -ForegroundColor Green
cd packages/server
npm install --save-dev jest @types/jest ts-jest supertest @types/supertest

# Frontend testing dependencies  
Write-Host "Installing frontend testing dependencies..." -ForegroundColor Green
cd ../frontend
npm install --save-dev jest @types/jest ts-jest @testing-library/react @testing-library/jest-dom @testing-library/user-event jest-environment-jsdom identity-obj-proxy

Write-Host "Installation complete!" -ForegroundColor Green
```

Or run individually:

### Backend
```powershell
cd packages/server
npm install --save-dev jest @types/jest ts-jest supertest @types/supertest
```

### Frontend
```powershell
cd packages/frontend
npm install --save-dev jest @types/jest ts-jest @testing-library/react @testing-library/jest-dom @testing-library/user-event jest-environment-jsdom identity-obj-proxy
```

## Next Steps

1. **Create Jest configs** (see TESTING_SETUP.md)
2. **Create setup files** (setupTests.ts)
3. **Write your first test** (utils.test.ts)
4. **Run tests**: `npm test`

## Quick Test Example

Create `packages/frontend/src/lib/utils.test.ts`:

```typescript
import { formatCurrency } from './utils';

test('formatCurrency works', () => {
  expect(formatCurrency(1000)).toBe('₹1,000.00');
});
```

Run:
```powershell
cd packages/frontend
npm test
```

## Documentation

- Full guide: `TESTING_SETUP.md`
- PostgreSQL: `POSTGRESQL_MIGRATION.md`
- Deployment: `DEPLOYMENT_GUIDE.md`
