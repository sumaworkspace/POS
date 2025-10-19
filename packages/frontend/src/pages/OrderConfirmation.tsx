import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

interface Order {
  id: string;
  total: number;
  paymentMethod: string;
  customerName: string;
  createdAt: string;
}

export default function OrderConfirmation() {
  const location = useLocation();
  const navigate = useNavigate();
  const { order, transactionId } = location.state || {};

  React.useEffect(() => {
    if (!order) {
      navigate('/');
    }
  }, [order, navigate]);

  if (!order) {
    return null;
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div style={{
        background: 'white',
        borderRadius: '12px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
        maxWidth: '500px',
        width: '100%',
        overflow: 'hidden'
      }}>
        {/* Success Header */}
        <div style={{
          background: '#10b981',
          color: 'white',
          padding: '32px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '64px', marginBottom: '16px' }}>✓</div>
          <h1 style={{ margin: '0 0 8px 0', fontSize: '28px' }}>Payment Successful!</h1>
          <p style={{ margin: 0, fontSize: '14px', opacity: 0.9 }}>
            Your order has been confirmed
          </p>
        </div>

        <div style={{ padding: '32px' }}>
          {/* Order Details */}
          <div style={{
            background: '#f8f9fa',
            padding: '20px',
            borderRadius: '8px',
            marginBottom: '24px'
          }}>
            <div style={{ marginBottom: '16px', paddingBottom: '16px', borderBottom: '1px solid #e0e0e0' }}>
              <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>Order ID</div>
              <div style={{ fontSize: '16px', fontWeight: '600', color: '#333', fontFamily: 'monospace' }}>
                {order.id}
              </div>
            </div>

            {transactionId && (
              <div style={{ marginBottom: '16px', paddingBottom: '16px', borderBottom: '1px solid #e0e0e0' }}>
                <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>Transaction ID</div>
                <div style={{ fontSize: '16px', fontWeight: '600', color: '#333', fontFamily: 'monospace' }}>
                  {transactionId}
                </div>
              </div>
            )}

            <div style={{ marginBottom: '16px', paddingBottom: '16px', borderBottom: '1px solid #e0e0e0' }}>
              <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>Customer</div>
              <div style={{ fontSize: '16px', fontWeight: '500', color: '#333' }}>
                {order.customerName}
              </div>
            </div>

            <div style={{ marginBottom: '16px', paddingBottom: '16px', borderBottom: '1px solid #e0e0e0' }}>
              <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>Payment Method</div>
              <div style={{ fontSize: '16px', fontWeight: '500', color: '#333', textTransform: 'uppercase' }}>
                {order.paymentMethod}
              </div>
            </div>

            <div>
              <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>Total Paid</div>
              <div style={{ fontSize: '28px', fontWeight: '700', color: '#667eea' }}>
                ₹{order.total.toFixed(2)}
              </div>
            </div>
          </div>

          {/* Info Message */}
          <div style={{
            background: '#f0f4ff',
            border: '1px solid #d0d9ff',
            padding: '16px',
            borderRadius: '8px',
            marginBottom: '24px'
          }}>
            <p style={{ margin: 0, fontSize: '14px', color: '#667eea', lineHeight: '1.6' }}>
              📧 A confirmation email will be sent to the customer shortly.
            </p>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={() => navigate('/')}
              style={{
                flex: 1,
                background: '#667eea',
                color: 'white',
                border: 'none',
                padding: '14px',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '16px',
                fontWeight: '600'
              }}
            >
              Continue Shopping
            </button>
            <button
              onClick={() => {
                navigate('/');
                // Could add print functionality here
                window.print();
              }}
              style={{
                flex: 1,
                background: 'white',
                color: '#667eea',
                border: '2px solid #667eea',
                padding: '14px',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '16px',
                fontWeight: '600'
              }}
            >
              Print Receipt
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
