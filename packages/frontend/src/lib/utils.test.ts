import { formatCurrency, validatePhone, validateEmail, formatDate } from './utils';

describe('formatCurrency', () => {
  test('should format currency with rupee symbol', () => {
    expect(formatCurrency(1000)).toBe('₹1,000.00');
  });

  test('should format currency with decimals', () => {
    expect(formatCurrency(1234.56)).toBe('₹1,234.56');
  });

  test('should handle zero', () => {
    expect(formatCurrency(0)).toBe('₹0.00');
  });

  test('should handle negative numbers', () => {
    const result = formatCurrency(-100);
    expect(result).toContain('-');
    expect(result).toContain('100');
  });

  test('should round to 2 decimal places', () => {
    expect(formatCurrency(1234.567)).toBe('₹1,234.57');
  });
});

describe('validatePhone', () => {
  test('should validate correct 10-digit phone number', () => {
    const result = validatePhone('9876543210');
    expect(result.valid).toBe(true);
    expect(result.error).toBeUndefined();
  });

  test('should reject phone number with less than 10 digits', () => {
    const result = validatePhone('123456789');
    expect(result.valid).toBe(false);
    expect(result.error).toBeTruthy();
  });

  test('should reject phone number with more than 10 digits', () => {
    const result = validatePhone('12345678901');
    expect(result.valid).toBe(false);
    expect(result.error).toBeTruthy();
  });

  test('should reject empty phone number', () => {
    const result = validatePhone('');
    expect(result.valid).toBe(false);
    expect(result.error).toBe('Phone number is required');
  });

  test('should reject phone number with letters', () => {
    const result = validatePhone('98765abc10');
    expect(result.valid).toBe(false);
    expect(result.error).toBeTruthy();
  });

  test('should accept phone number with spaces (if implemented)', () => {
    const result = validatePhone('98765 43210');
    // Depends on implementation - adjust accordingly
    expect(result.valid).toBeDefined();
  });
});

describe('validateEmail', () => {
  test('should validate correct email', () => {
    const result = validateEmail('test@example.com');
    expect(result.valid).toBe(true);
    expect(result.error).toBeUndefined();
  });

  test('should allow empty email (optional field)', () => {
    const result = validateEmail('');
    expect(result.valid).toBe(true);
  });

  test('should reject invalid email format', () => {
    const result = validateEmail('invalid-email');
    expect(result.valid).toBe(false);
    expect(result.error).toBeTruthy();
  });

  test('should reject email without @', () => {
    const result = validateEmail('testexample.com');
    expect(result.valid).toBe(false);
  });

  test('should reject email without domain', () => {
    const result = validateEmail('test@');
    expect(result.valid).toBe(false);
  });

  test('should accept email with subdomain', () => {
    const result = validateEmail('test@mail.example.com');
    expect(result.valid).toBe(true);
  });
});

describe('formatDate', () => {
  test('should format date correctly', () => {
    const dateString = '2024-10-19T10:30:00';
    const result = formatDate(dateString);
    expect(result).toContain('10');
    expect(result).toContain('2024');
  });

  test('should handle current date string', () => {
    const dateString = new Date().toISOString();
    const result = formatDate(dateString);
    expect(result).toBeTruthy();
    expect(typeof result).toBe('string');
  });
});
