import React, { useState, useEffect } from 'react';
import { ordersAPI } from '../lib/api';

interface Order {
  id: string;
  customerName: string;
  customerPhone: string;
  items: Array<{
    productId: string;
    name: string;
    quantity: number;
    price: number;
  }>;
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  paymentMethod: string;
  transactionId?: string;
  createdAt: string;
}

export default function Orders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const response = await ordersAPI.getAll();
      if (response.success) {
        setOrders(response.orders);
      }
    } catch (error) {
      console.error('Failed to load orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div>
      <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ margin: 0, color: '#333' }}>Order History</h2>
        <button
          onClick={loadOrders}
          style={{
            background: '#667eea',
            color: 'white',
            border: 'none',
            padding: '10px 20px',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '500'
          }}
        >
          Refresh
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px', color: '#999' }}>
          Loading orders...
        </div>
      ) : orders.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px', color: '#999' }}>
          No orders found
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '16px' }}>
          {orders.map((order) => (
            <div
              key={order.id}
              onClick={() => setSelectedOrder(selectedOrder?.id === order.id ? null : order)}
              style={{
                background: 'white',
                border: selectedOrder?.id === order.id ? '2px solid #667eea' : '1px solid #e0e0e0',
                borderRadius: '12px',
                padding: '20px',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              {/* Order Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '12px' }}>
                <div>
                  <h3 style={{ margin: '0 0 4px 0', fontSize: '16px', color: '#333' }}>
                    {order.customerName}
                  </h3>
                  <p style={{ margin: 0, fontSize: '14px', color: '#666' }}>
                    {order.customerPhone}
                  </p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '20px', fontWeight: '600', color: '#667eea', marginBottom: '4px' }}>
                    ₹{order.total.toFixed(2)}
                  </div>
                  <div style={{ fontSize: '12px', color: '#999' }}>
                    {formatDate(order.createdAt)}
                  </div>
                </div>
              </div>

              {/* Payment Info */}
              <div style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
                <span style={{
                  display: 'inline-block',
                  background: '#f0f4ff',
                  color: '#667eea',
                  padding: '4px 12px',
                  borderRadius: '16px',
                  fontSize: '12px',
                  fontWeight: '500'
                }}>
                  {order.paymentMethod.toUpperCase()}
                </span>
                {order.transactionId && (
                  <span style={{
                    fontSize: '12px',
                    color: '#999',
                    padding: '4px 0'
                  }}>
                    TXN: {order.transactionId}
                  </span>
                )}
              </div>

              {/* Order Details (Expandable) */}
              {selectedOrder?.id === order.id && (
                <div style={{
                  marginTop: '16px',
                  paddingTop: '16px',
                  borderTop: '1px solid #e0e0e0'
                }}>
                  <h4 style={{ margin: '0 0 12px 0', fontSize: '14px', color: '#666' }}>Items:</h4>
                  <div style={{ marginBottom: '16px' }}>
                    {order.items.map((item, index) => (
                      <div
                        key={index}
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          padding: '8px 0',
                          borderBottom: index < order.items.length - 1 ? '1px solid #f0f0f0' : 'none'
                        }}
                      >
                        <span style={{ fontSize: '14px', color: '#333' }}>
                          {item.name} × {item.quantity}
                        </span>
                        <span style={{ fontSize: '14px', color: '#666' }}>
                          ₹{(item.price * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Pricing Breakdown */}
                  <div style={{ fontSize: '14px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span style={{ color: '#666' }}>Subtotal:</span>
                      <span style={{ color: '#333' }}>₹{order.subtotal.toFixed(2)}</span>
                    </div>
                    {order.discount > 0 && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                        <span style={{ color: '#10b981' }}>Discount:</span>
                        <span style={{ color: '#10b981' }}>-₹{order.discount.toFixed(2)}</span>
                      </div>
                    )}
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span style={{ color: '#666' }}>Tax (GST):</span>
                      <span style={{ color: '#333' }}>₹{order.tax.toFixed(2)}</span>
                    </div>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      paddingTop: '8px',
                      marginTop: '8px',
                      borderTop: '1px solid #e0e0e0',
                      fontWeight: '600',
                      fontSize: '16px'
                    }}>
                      <span style={{ color: '#333' }}>Total:</span>
                      <span style={{ color: '#667eea' }}>₹{order.total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
