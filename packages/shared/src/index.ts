export type UUID = string;

export type Category = {
  id: UUID;
  name: string;
};

export type Product = {
  id: UUID;
  name: string;
  description?: string;
  price: number; // in INR
  taxRate?: number; // percent
  categoryId: UUID;
  sku?: string;
  image?: string;
};

export type Customer = {
  id: UUID;
  firstName: string;
  lastName?: string;
  phone: string;
  email?: string;
  isMember?: boolean;
};

export type CartItem = {
  productId: UUID;
  quantity: number;
  price: number;
};

export type Order = {
  id: UUID;
  customerId?: UUID;
  items: CartItem[];
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  paymentMethod: 'cash' | 'card' | 'upi';
  createdAt: string;
};
