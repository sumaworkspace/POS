import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Cart from './Cart';
import { AppProvider } from '../context/AppContext';
import { ToastProvider } from '../context/ToastContext';
import { customersAPI } from '../lib/api';

// Mock the API
jest.mock('../lib/api', () => ({
  customersAPI: {
    search: jest.fn(),
    create: jest.fn()
  },
  productsAPI: {
    getAll: jest.fn(),
  },
  ordersAPI: {
    create: jest.fn(),
  }
}));

// Mock useNavigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate
}));

// Helper to render Cart with all providers
const renderCart = () => {
  return render(
    <BrowserRouter>
      <ToastProvider>
        <AppProvider>
          <Cart />
        </AppProvider>
      </ToastProvider>
    </BrowserRouter>
  );
};

describe('Cart Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  it('should render empty cart message', () => {
    renderCart();
    expect(screen.getByText(/Your cart is empty/i)).toBeInTheDocument();
  });

  it('should render cart items when products are added', () => {
    // Add items to localStorage before rendering
    const cartItems = [
      { id: '1', name: 'Test Product 1', price: 100, quantity: 2, image: 'test.jpg' },
      { id: '2', name: 'Test Product 2', price: 200, quantity: 1, image: 'test2.jpg' }
    ];
    localStorage.setItem('cart', JSON.stringify(cartItems));
    
    renderCart();
    
    expect(screen.getByText('Test Product 1')).toBeInTheDocument();
    expect(screen.getByText('Test Product 2')).toBeInTheDocument();
  });

  it('should display correct subtotal price', () => {
    const cartItems = [
      { id: '1', name: 'Product 1', price: 100, quantity: 2, image: 'test.jpg' },
      { id: '2', name: 'Product 2', price: 50, quantity: 1, image: 'test2.jpg' }
    ];
    localStorage.setItem('cart', JSON.stringify(cartItems));
    
    renderCart();
    
    // Subtotal should be: (100 * 2 + 50 * 1) = 250
    expect(screen.getByText(/₹250\.00/)).toBeInTheDocument();
  });

  it('should display tax calculation for non-member', () => {
    const cartItems = [
      { id: '1', name: 'Product 1', price: 100, quantity: 1, image: 'test.jpg' }
    ];
    localStorage.setItem('cart', JSON.stringify(cartItems));
    
    renderCart();
    
    // Should show subtotal, tax (12% GST), and total
    expect(screen.getByText(/Subtotal/i)).toBeInTheDocument();
    expect(screen.getByText(/Tax \(GST 12%\)/i)).toBeInTheDocument();
    // Tax is 12% of 100 = 12
    expect(screen.getByText(/₹12\.00/)).toBeInTheDocument();
  });

  it('should show customer search section', () => {
    const cartItems = [
      { id: '1', name: 'Product 1', price: 100, quantity: 1, image: 'test.jpg' }
    ];
    localStorage.setItem('cart', JSON.stringify(cartItems));
    
    renderCart();
    
    // Should show customer section
    expect(screen.getByText(/Customer/i)).toBeInTheDocument();
    expect(screen.getByText(/Search/i)).toBeInTheDocument();
  });

  it('should show clear cart button', () => {
    const cartItems = [
      { id: '1', name: 'Product 1', price: 100, quantity: 1, image: 'test.jpg' }
    ];
    localStorage.setItem('cart', JSON.stringify(cartItems));
    
    renderCart();
    
    expect(screen.getByText(/Clear Cart/i)).toBeInTheDocument();
  });

  it('should show proceed to checkout button', () => {
    const cartItems = [
      { id: '1', name: 'Product 1', price: 100, quantity: 1, image: 'test.jpg' }
    ];
    localStorage.setItem('cart', JSON.stringify(cartItems));
    
    renderCart();
    
    expect(screen.getByText(/Proceed to Checkout/i)).toBeInTheDocument();
  });

  it('should render cart component without crashing', () => {
    const { container } = renderCart();
    expect(container).toBeTruthy();
  });
});
