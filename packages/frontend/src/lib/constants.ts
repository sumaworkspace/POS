// Application Constants

export const TAX_RATE = 0.12; // 12% GST
export const EXISTING_CUSTOMER_DISCOUNT = 0.05; // 5%
export const MEMBER_DISCOUNT = 0.1; // 10%

export const PAYMENT_METHODS = {
  CASH: 'cash',
  CARD: 'card',
  UPI: 'upi',
} as const;

export const PHONE_NUMBER_LENGTH = 10;
export const MAX_CART_BADGE_COUNT = 99;

export const API_ENDPOINTS = {
  AUTH: '/auth',
  CATEGORIES: '/categories',
  PRODUCTS: '/products',
  CUSTOMERS: '/customers',
  ORDERS: '/orders',
  AI: '/ai',
} as const;

export const STORAGE_KEYS = {
  TOKEN: 'token',
  USER: 'user',
  CART: 'cart',
} as const;

export const COLORS = {
  PRIMARY: '#667eea',
  PRIMARY_DARK: '#5568d3',
  SECONDARY: '#764ba2',
  SUCCESS: '#10b981',
  ERROR: '#dc2626',
  WARNING: '#f59e0b',
  BACKGROUND: '#f8f9fa',
  BORDER: '#e0e0e0',
  TEXT_PRIMARY: '#333',
  TEXT_SECONDARY: '#666',
  TEXT_MUTED: '#999',
} as const;

export const MESSAGES = {
  LOGIN_SUCCESS: 'Login successful!',
  LOGIN_FAILED: 'Login failed. Please check your credentials.',
  LOGOUT_CONFIRM: 'Are you sure you want to logout?',
  CLEAR_CART_CONFIRM: 'Are you sure you want to clear the cart?',
  REMOVE_ITEM_CONFIRM: 'Remove this item from cart?',
  ORDER_SUCCESS: 'Order placed successfully!',
  ORDER_FAILED: 'Failed to place order. Please try again.',
  PAYMENT_PROCESSING: 'Processing payment...',
  INVALID_PHONE: 'Please enter a valid 10-digit phone number',
  INVALID_EMAIL: 'Please enter a valid email address',
  REQUIRED_FIELD: 'This field is required',
  NETWORK_ERROR: 'Network error. Please check your connection.',
} as const;
