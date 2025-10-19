// Sample utility test - demonstrates testing approach
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

  test('should handle zero amount', () => {
    const amount = 0;
    const tax = amount * TAX_RATE;
    expect(tax).toBe(0);
  });

  test('should handle large amounts', () => {
    const amount = 1000000;
    const tax = amount * TAX_RATE;
    expect(tax).toBe(120000);
  });
});

describe('Discount Calculation', () => {
  const MEMBER_DISCOUNT = 0.1;
  const EXISTING_CUSTOMER_DISCOUNT = 0.05;

  test('should calculate member discount', () => {
    const subtotal = 1000;
    const discount = subtotal * MEMBER_DISCOUNT;
    expect(discount).toBe(100);
  });

  test('should calculate existing customer discount', () => {
    const subtotal = 1000;
    const discount = subtotal * EXISTING_CUSTOMER_DISCOUNT;
    expect(discount).toBe(50);
  });

  test('should not apply discount to zero', () => {
    const subtotal = 0;
    const discount = subtotal * MEMBER_DISCOUNT;
    expect(discount).toBe(0);
  });
});
