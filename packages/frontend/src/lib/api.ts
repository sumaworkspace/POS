import axios from 'axios';

const API_URL = 'http://localhost:4000/api';

// Set up axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth API
export const authAPI = {
  login: async (username: string, password: string) => {
    const response = await api.post('/auth/login', { username, password });
    return response.data;
  },
};

// Products API
export const productsAPI = {
  getCategories: async () => {
    const response = await api.get('/categories');
    return response.data;
  },
  getProducts: async (categoryId?: string) => {
    const response = await api.get('/products', {
      params: categoryId ? { categoryId } : undefined,
    });
    return response.data;
  },
  getProduct: async (id: string) => {
    const response = await api.get(`/products/${id}`);
    return response.data;
  },
};

// Customers API
export const customersAPI = {
  search: async (phone: string) => {
    const response = await api.get('/customers', { params: { phone } });
    return response.data;
  },
  create: async (data: {
    firstName: string;
    lastName?: string;
    phone: string;
    email?: string;
    isMember?: boolean;
  }) => {
    const response = await api.post('/customers', data);
    return response.data;
  },
};

// Orders API
export const ordersAPI = {
  create: async (data: {
    customerId?: string;
    items: Array<{ productId: string; quantity: number; price: number }>;
    paymentMethod: string;
    customerEmail?: string;
  }) => {
    const response = await api.post('/orders', data);
    return response.data;
  },
  getAll: async () => {
    const response = await api.get('/orders');
    return response.data;
  },
  getOne: async (id: string) => {
    const response = await api.get(`/orders/${id}`);
    return response.data;
  },
};

export default api;
