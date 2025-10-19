import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { ordersAPI } from '../lib/api';
import { TAX_RATE, MEMBER_DISCOUNT, EXISTING_CUSTOMER_DISCOUNT, PAYMENT_METHODS, COLORS } from '../lib/constants';
import { formatCurrency } from '../lib/utils';

interface Customer {
  id: string;
  firstName: string;
  lastName?: string;
  phone: string;
  isMember: boolean;
}

export default function Checkout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { cart, getCartTotal, clearCart } = useApp();
  const customer = location.state?.customer as Customer | undefined;

  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'upi'>('cash');
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');

  // Redirect if no customer or empty cart
  React.useEffect(() => {
    if (!customer || cart.length === 0) {
      navigate('/');
    }
  }, [customer, cart, navigate]);

  if (!customer) {
    return null;
  }

  const subtotal = getCartTotal();
  const discountRate = customer.isMember ? MEMBER_DISCOUNT : EXISTING_CUSTOMER_DISCOUNT;
  const discount = subtotal * discountRate;
  const afterDiscount = subtotal - discount;
  const tax = afterDiscount * TAX_RATE;
  const total = afterDiscount + tax;

  const handleCheckout = async () => {
    setProcessing(true);
    setError('');

    try {
      const orderData = {
        customerId: customer.id,
        items: cart.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
          price: item.price
        })),
        paymentMethod,
        customerEmail: '' // Could be added if needed
      };

      const response = await ordersAPI.create(orderData);

      if (response.success) {
        clearCart();
        navigate('/order-confirmation', {
          state: {
            order: response.order,
            transactionId: response.transactionId
          }
        });
      } else {
        setError(response.error || 'Order creation failed');
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to process order. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '40px 20px'
    }}>
      <div style={{
        maxWidth: '600px',
        margin: '0 auto',
        background: 'white',
        borderRadius: '12px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
        overflow: 'hidden'
      }}>
        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          padding: '24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <h1 style={{ margin: 0, fontSize: '24px' }}>Checkout</h1>
          <button
            onClick={() => navigate('/')}
            style={{
              background: 'rgba(255,255,255,0.2)',
              color: 'white',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            Back
          </button>
        </div>

        <div style={{ padding: '24px' }}>
          {/* Customer Info */}
          <div style={{
            background: '#f8f9fa',
            padding: '16px',
            borderRadius: '8px',
            marginBottom: '24px'
          }}>
            <h3 style={{ margin: '0 0 8px 0', fontSize: '16px', color: '#333' }}>Customer</h3>
            <p style={{ margin: '0 0 4px 0', fontSize: '14px', color: '#666' }}>
              {customer.firstName} {customer.lastName}
            </p>
            <p style={{ margin: '0 0 8px 0', fontSize: '14px', color: '#666' }}>
              {customer.phone}
            </p>
            {customer.isMember && (
              <span style={{
                display: 'inline-block',
                background: '#667eea',
                color: 'white',
                padding: '4px 12px',
                borderRadius: '12px',
                fontSize: '12px',
                fontWeight: '500'
              }}>
                MEMBER - 10% Discount
              </span>
            )}
          </div>

          {/* Cart Items */}
          <div style={{ marginBottom: '24px' }}>
            <h3 style={{ margin: '0 0 12px 0', fontSize: '16px', color: '#333' }}>Order Items</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {cart.map((item) => (
                <div
                  key={item.productId}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    padding: '12px',
                    background: '#f8f9fa',
                    borderRadius: '6px'
                  }}
                >
                  <div>
                    <div style={{ fontSize: '14px', color: '#333', marginBottom: '4px' }}>
                      {item.name}
                    </div>
                    <div style={{ fontSize: '12px', color: COLORS.TEXT_SECONDARY }}>
                      Qty: {item.quantity} × {formatCurrency(item.price)}
                    </div>
                  </div>
                  <div style={{ fontSize: '14px', fontWeight: '600', color: COLORS.TEXT_PRIMARY }}>
                    {formatCurrency(item.price * item.quantity)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Payment Method */}
          <div style={{ marginBottom: '24px' }}>
            <h3 style={{ margin: '0 0 12px 0', fontSize: '16px', color: '#333' }}>Payment Method</h3>
            <div style={{ display: 'flex', gap: '12px' }}>
              {(Object.values(PAYMENT_METHODS) as Array<'cash' | 'card' | 'upi'>).map((method) => (
                <button
                  key={method}
                  onClick={() => setPaymentMethod(method)}
                  style={{
                    flex: 1,
                    padding: '12px',
                    background: paymentMethod === method ? COLORS.PRIMARY : 'white',
                    color: paymentMethod === method ? 'white' : COLORS.TEXT_PRIMARY,
                    border: `2px solid ${paymentMethod === method ? COLORS.PRIMARY : COLORS.BORDER}`,
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '500',
                    textTransform: 'uppercase'
                  }}
                >
                  {method}
                </button>
              ))}
            </div>
          </div>

          {/* Price Summary */}
          <div style={{
            background: '#f8f9fa',
            padding: '16px',
            borderRadius: '8px',
            marginBottom: '24px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontSize: '14px', color: COLORS.TEXT_SECONDARY }}>Subtotal:</span>
              <span style={{ fontSize: '14px', color: COLORS.TEXT_PRIMARY }}>{formatCurrency(subtotal)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontSize: '14px', color: COLORS.SUCCESS }}>
                Discount ({(discountRate * 100).toFixed(0)}%):
              </span>
              <span style={{ fontSize: '14px', color: COLORS.SUCCESS }}>-{formatCurrency(discount)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
              <span style={{ fontSize: '14px', color: COLORS.TEXT_SECONDARY }}>Tax (GST {(TAX_RATE * 100).toFixed(0)}%):</span>
              <span style={{ fontSize: '14px', color: COLORS.TEXT_PRIMARY }}>{formatCurrency(tax)}</span>
            </div>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              paddingTop: '12px',
              borderTop: `2px solid ${COLORS.BORDER}`
            }}>
              <span style={{ fontSize: '18px', fontWeight: '600', color: COLORS.TEXT_PRIMARY }}>Total:</span>
              <span style={{ fontSize: '20px', fontWeight: '600', color: COLORS.PRIMARY }}>
                {formatCurrency(total)}
              </span>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div style={{
              background: '#fee',
              border: '1px solid #fcc',
              color: '#c33',
              padding: '12px',
              borderRadius: '6px',
              marginBottom: '16px',
              fontSize: '14px'
            }}>
              {error}
            </div>
          )}

          {/* Complete Payment Button */}
          <button
            onClick={handleCheckout}
            disabled={processing}
            style={{
              width: '100%',
              background: processing ? '#ccc' : COLORS.PRIMARY,
              color: 'white',
              border: 'none',
              padding: '16px',
              borderRadius: '8px',
              cursor: processing ? 'not-allowed' : 'pointer',
              fontSize: '16px',
              fontWeight: '600'
            }}
          >
            {processing ? 'Processing...' : `Complete Payment - ${formatCurrency(total)}`}
          </button>
        </div>
      </div>
    </div>
  );
}
