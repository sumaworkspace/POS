// Setup for all frontend tests
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
global.fetch = jest.fn() as jest.Mock;

// Reset mocks after each test
afterEach(() => {
  jest.clearAllMocks();
});
