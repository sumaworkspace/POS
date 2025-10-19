import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { customersAPI } from '../lib/api';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import Modal from './Modal';
import { validatePhone, validateEmail, validateRequired, formatCurrency } from '../lib/utils';
import { MESSAGES, COLORS, MAX_CART_BADGE_COUNT, TAX_RATE, MEMBER_DISCOUNT, EXISTING_CUSTOMER_DISCOUNT } from '../lib/constants';

interface Customer {
  id: string;
  firstName: string;
  lastName?: string;
  phone: string;
  email?: string;
  isMember: boolean;
}

export default function Cart() {
  const { cart, updateQuantity, removeFromCart, getCartTotal, clearCart } = useApp();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [phone, setPhone] = useState('');
  const [searching, setSearching] = useState(false);
  const [showNewCustomerForm, setShowNewCustomerForm] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [showClearCartModal, setShowClearCartModal] = useState(false);
  const [newCustomer, setNewCustomer] = useState({
    firstName: '',
    lastName: '',
    email: '',
    isMember: false
  });
  const navigate = useNavigate();
  const { showToast } = useToast();

  const handleSearchCustomer = async () => {
    // Validate phone
    const phoneValidation = validatePhone(phone);
    if (!phoneValidation.valid) {
      setErrors({ phone: phoneValidation.error || MESSAGES.INVALID_PHONE });
      showToast(phoneValidation.error || MESSAGES.INVALID_PHONE, 'error');
      return;
    }

    setErrors({});
    setSearching(true);
    try {
      const response = await customersAPI.search(phone);
      if (response.success && response.customer) {
        setCustomer(response.customer);
        setShowNewCustomerForm(false);
        showToast('Customer found!', 'success');
      } else {
        // Customer not found - show registration form
        setCustomer(null);
        setShowNewCustomerForm(true);
        showToast('Customer not found. Please register.', 'info');
      }
    } catch (error) {
      console.error('Search failed:', error);
      setShowNewCustomerForm(true);
      showToast('Search failed. Please try again.', 'error');
    } finally {
      setSearching(false);
    }
  };

  const handleCreateCustomer = async () => {
    // Validate inputs
    const newErrors: { [key: string]: string } = {};
    
    const firstNameValidation = validateRequired(newCustomer.firstName, 'First name');
    if (!firstNameValidation.valid) {
      newErrors.firstName = firstNameValidation.error!;
    }
    
    const phoneValidation = validatePhone(phone);
    if (!phoneValidation.valid) {
      newErrors.phone = phoneValidation.error!;
    }
    
    if (newCustomer.email) {
      const emailValidation = validateEmail(newCustomer.email);
      if (!emailValidation.valid) {
        newErrors.email = emailValidation.error!;
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      showToast('Please fix the errors', 'error');
      return;
    }

    setErrors({});
    try {
      const response = await customersAPI.create({
        ...newCustomer,
        phone
      });
      if (response.success) {
        setCustomer(response.customer);
        setShowNewCustomerForm(false);
        setNewCustomer({ firstName: '', lastName: '', email: '', isMember: false });
        showToast('Customer registered successfully!', 'success');
      }
    } catch (error) {
      console.error('Failed to create customer:', error);
      showToast('Failed to create customer', 'error');
    }
  };

  const handleCheckout = () => {
    if (!customer) {
      showToast('Please search and select a customer first', 'warning');
      return;
    }
    if (cart.length === 0) {
      showToast('Cart is empty', 'warning');
      return;
    }
    // Navigate to checkout with customer data
    navigate('/checkout', { state: { customer } });
  };

  const handleClearCart = () => {
    clearCart();
    setShowClearCartModal(false);
    showToast('Cart cleared', 'success');
  };

  const subtotal = getCartTotal();
  
  // Calculate discount, tax, and total for preview
  const discountRate = customer?.isMember ? MEMBER_DISCOUNT : (customer ? EXISTING_CUSTOMER_DISCOUNT : 0);
  const discount = subtotal * discountRate;
  const afterDiscount = subtotal - discount;
  const tax = afterDiscount * TAX_RATE;
  const total = afterDiscount + tax;
  const cartCount = cart.reduce((count, item) => count + item.quantity, 0);
  const displayCount = cartCount > MAX_CART_BADGE_COUNT ? `${MAX_CART_BADGE_COUNT}+` : cartCount;

  return (
    <div style={{
      height: '100%',
      background: 'white',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Cart Header */}
      <div style={{
        padding: '20px',
        borderBottom: '1px solid #e0e0e0',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white'
      }}>
        <h2 style={{ margin: 0, fontSize: '24px' }}>Cart</h2>
        <p style={{ margin: '4px 0 0 0', fontSize: '14px', opacity: 0.9 }}>
          {cart.length} {cart.length === 1 ? 'item' : 'items'}
        </p>
      </div>

      {/* Cart Items */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
        {cart.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: '#999' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>🛒</div>
            <p>Your cart is empty</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {cart.map((item) => (
              <div key={item.productId} style={{
                background: '#f8f9fa',
                padding: '12px',
                borderRadius: '8px',
                display: 'flex',
                gap: '12px',
                alignItems: 'center'
              }}>
                {item.image && (
                  <div style={{
                    width: '60px',
                    height: '60px',
                    background: `url(${item.image})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    borderRadius: '6px',
                    flexShrink: 0
                  }} />
                )}
                <div style={{ flex: 1 }}>
                  <h4 style={{ margin: '0 0 4px 0', fontSize: '14px', color: '#333' }}>
                    {item.name}
                  </h4>
                  <p style={{ margin: '0 0 8px 0', fontSize: '14px', color: '#667eea', fontWeight: '600' }}>
                    ₹{item.price.toFixed(2)}
                  </p>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <button
                      onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                      style={{
                        width: '24px',
                        height: '24px',
                        border: '1px solid #ddd',
                        background: 'white',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '14px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      −
                    </button>
                    <span style={{ fontSize: '14px', fontWeight: '500', minWidth: '20px', textAlign: 'center' }}>
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                      style={{
                        width: '24px',
                        height: '24px',
                        border: '1px solid #ddd',
                        background: 'white',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '14px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      +
                    </button>
                    <button
                      onClick={() => removeFromCart(item.productId)}
                      style={{
                        marginLeft: 'auto',
                        background: 'none',
                        border: 'none',
                        color: '#dc2626',
                        cursor: 'pointer',
                        fontSize: '12px',
                        padding: '4px'
                      }}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Customer Section */}
        <div style={{
          marginTop: '24px',
          paddingTop: '24px',
          borderTop: '1px solid #e0e0e0'
        }}>
          <h3 style={{ margin: '0 0 12px 0', fontSize: '16px', color: '#333' }}>Customer</h3>

          {!customer ? (
            <>
              <div>
                <div style={{ display: 'flex', gap: '8px', marginBottom: errors.phone ? '4px' : '12px' }}>
                  <input
                    type="tel"
                    placeholder="Phone number (10 digits)"
                    value={phone}
                    onChange={(e) => {
                      setPhone(e.target.value);
                      if (errors.phone) {
                        setErrors({ ...errors, phone: '' });
                      }
                    }}
                    style={{
                      flex: 1,
                      padding: '10px',
                      border: `1px solid ${errors.phone ? COLORS.ERROR : COLORS.BORDER}`,
                      borderRadius: '6px',
                      fontSize: '14px'
                    }}
                    maxLength={10}
                  />
                  <button
                    onClick={handleSearchCustomer}
                    disabled={searching}
                    style={{
                      background: searching ? '#ccc' : COLORS.PRIMARY,
                      color: 'white',
                      border: 'none',
                      padding: '10px 16px',
                      borderRadius: '6px',
                      cursor: searching ? 'not-allowed' : 'pointer',
                      fontSize: '14px',
                      fontWeight: '500'
                    }}
                  >
                    {searching ? 'Searching...' : 'Search'}
                  </button>
                </div>
                {errors.phone && (
                  <p style={{ margin: '0 0 12px 0', fontSize: '12px', color: COLORS.ERROR }}>
                    {errors.phone}
                  </p>
                )}
              </div>

              {showNewCustomerForm && (
                <div style={{
                  background: '#f8f9fa',
                  padding: '12px',
                  borderRadius: '8px',
                  marginTop: '12px'
                }}>
                  <p style={{ margin: '0 0 12px 0', fontSize: '14px', color: COLORS.TEXT_SECONDARY }}>
                    Customer not found. Register new:
                  </p>
                  <div style={{ marginBottom: '8px' }}>
                    <input
                      type="text"
                      placeholder="First Name *"
                      value={newCustomer.firstName}
                      onChange={(e) => {
                        setNewCustomer({ ...newCustomer, firstName: e.target.value });
                        if (errors.firstName) {
                          setErrors({ ...errors, firstName: '' });
                        }
                      }}
                      style={{
                        width: '100%',
                        padding: '8px',
                        border: `1px solid ${errors.firstName ? COLORS.ERROR : COLORS.BORDER}`,
                        borderRadius: '6px',
                        fontSize: '14px',
                        boxSizing: 'border-box'
                      }}
                    />
                    {errors.firstName && (
                      <p style={{ margin: '4px 0 0 0', fontSize: '11px', color: COLORS.ERROR }}>
                        {errors.firstName}
                      </p>
                    )}
                  </div>
                  <input
                    type="text"
                    placeholder="Last Name"
                    value={newCustomer.lastName}
                    onChange={(e) => setNewCustomer({ ...newCustomer, lastName: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '8px',
                      border: `1px solid ${COLORS.BORDER}`,
                      borderRadius: '6px',
                      fontSize: '14px',
                      marginBottom: '8px',
                      boxSizing: 'border-box'
                    }}
                  />
                  <div style={{ marginBottom: '8px' }}>
                    <input
                      type="email"
                      placeholder="Email (optional)"
                      value={newCustomer.email}
                      onChange={(e) => {
                        setNewCustomer({ ...newCustomer, email: e.target.value });
                        if (errors.email) {
                          setErrors({ ...errors, email: '' });
                        }
                      }}
                      style={{
                        width: '100%',
                        padding: '8px',
                        border: `1px solid ${errors.email ? COLORS.ERROR : COLORS.BORDER}`,
                        borderRadius: '6px',
                        fontSize: '14px',
                        boxSizing: 'border-box'
                      }}
                    />
                    {errors.email && (
                      <p style={{ margin: '4px 0 0 0', fontSize: '11px', color: COLORS.ERROR }}>
                        {errors.email}
                      </p>
                    )}
                  </div>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', marginBottom: '12px' }}>
                    <input
                      type="checkbox"
                      checked={newCustomer.isMember}
                      onChange={(e) => setNewCustomer({ ...newCustomer, isMember: e.target.checked })}
                    />
                    <span>Member (10% discount)</span>
                  </label>
                  <button
                    onClick={handleCreateCustomer}
                    style={{
                      width: '100%',
                      background: '#10b981',
                      color: 'white',
                      border: 'none',
                      padding: '10px',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: '500'
                    }}
                  >
                    Register Customer
                  </button>
                </div>
              )}
            </>
          ) : (
            <div style={{
              background: '#f0f4ff',
              padding: '12px',
              borderRadius: '8px',
              marginBottom: '12px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                <div>
                  <h4 style={{ margin: '0 0 4px 0', fontSize: '14px', color: '#333' }}>
                    {customer.firstName} {customer.lastName}
                  </h4>
                  <p style={{ margin: '0 0 4px 0', fontSize: '12px', color: '#666' }}>
                    {customer.phone}
                  </p>
                  {customer.isMember && (
                    <span style={{
                      display: 'inline-block',
                      background: '#667eea',
                      color: 'white',
                      padding: '2px 8px',
                      borderRadius: '12px',
                      fontSize: '10px',
                      fontWeight: '500'
                    }}>
                      MEMBER
                    </span>
                  )}
                </div>
                <button
                  onClick={() => {
                    setCustomer(null);
                    setPhone('');
                    setShowNewCustomerForm(false);
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#dc2626',
                    cursor: 'pointer',
                    fontSize: '12px',
                    padding: '4px'
                  }}
                >
                  Change
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Cart Footer */}
      <div style={{
        padding: '20px',
        borderTop: '1px solid #e0e0e0',
        background: '#f8f9fa'
      }}>
        <div style={{ marginBottom: '16px' }}>
          {/* Subtotal */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '14px', color: COLORS.TEXT_SECONDARY }}>Subtotal:</span>
            <span style={{ fontSize: '16px', fontWeight: '500', color: COLORS.TEXT_PRIMARY }}>
              {formatCurrency(subtotal)}
            </span>
          </div>
          
          {/* Discount (if customer exists) */}
          {customer && discount > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontSize: '14px', color: COLORS.SUCCESS }}>
                Discount ({(discountRate * 100).toFixed(0)}%):
              </span>
              <span style={{ fontSize: '14px', fontWeight: '500', color: COLORS.SUCCESS }}>
                -{formatCurrency(discount)}
              </span>
            </div>
          )}
          
          {/* Tax */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '14px', color: COLORS.TEXT_SECONDARY }}>
              Tax (GST {(TAX_RATE * 100).toFixed(0)}%):
            </span>
            <span style={{ fontSize: '14px', fontWeight: '500', color: COLORS.TEXT_PRIMARY }}>
              {formatCurrency(tax)}
            </span>
          </div>
          
          {/* Total */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            paddingTop: '12px',
            marginTop: '8px',
            borderTop: `1px solid ${COLORS.BORDER}`
          }}>
            <span style={{ fontSize: '16px', fontWeight: '600', color: COLORS.TEXT_PRIMARY }}>Total:</span>
            <span style={{ fontSize: '18px', fontWeight: '700', color: COLORS.PRIMARY }}>
              {formatCurrency(total)}
            </span>
          </div>
          
          {/* Member discount hint */}
          {customer && !customer.isMember && (
            <p style={{ margin: '8px 0 0 0', fontSize: '12px', color: COLORS.TEXT_SECONDARY, fontStyle: 'italic' }}>
              💡 Members get {(MEMBER_DISCOUNT * 100)}% discount
            </p>
          )}
        </div>

        <button
          onClick={handleCheckout}
          disabled={cart.length === 0 || !customer}
          style={{
            width: '100%',
            background: cart.length === 0 || !customer ? '#ccc' : '#667eea',
            color: 'white',
            border: 'none',
            padding: '14px',
            borderRadius: '8px',
            cursor: cart.length === 0 || !customer ? 'not-allowed' : 'pointer',
            fontSize: '16px',
            fontWeight: '600',
            marginBottom: '8px'
          }}
        >
          Proceed to Checkout
        </button>

        {cart.length > 0 && (
          <button
            onClick={() => setShowClearCartModal(true)}
            style={{
              width: '100%',
              background: 'white',
              color: COLORS.ERROR,
              border: `1px solid ${COLORS.ERROR}`,
              padding: '10px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500'
            }}
          >
            Clear Cart
          </button>
        )}
      </div>

      {/* Clear Cart Confirmation Modal */}
      <Modal
        isOpen={showClearCartModal}
        onClose={() => setShowClearCartModal(false)}
        onConfirm={handleClearCart}
        title="Clear Cart"
        message={MESSAGES.CLEAR_CART_CONFIRM}
        confirmText="Clear"
        cancelText="Cancel"
        type="danger"
      />
    </div>
  );
}
