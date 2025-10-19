import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useToast } from '../context/ToastContext';
import Modal from '../components/Modal';
import Catalog from './Catalog';
import Orders from './Orders';
import Cart from '../components/Cart';
import { MESSAGES, COLORS, MAX_CART_BADGE_COUNT } from '../lib/constants';

export default function Home() {
  const [activeTab, setActiveTab] = useState<'catalog' | 'orders' | 'pending'>('catalog');
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const { user, logout, getCartCount } = useApp();
  const { showToast } = useToast();

  const handleLogout = () => {
    logout();
    showToast('Logged out successfully', 'success');
  };

  const tabs = [
    { id: 'catalog' as const, label: 'Catalog', icon: '🏪' },
    { id: 'orders' as const, label: 'Orders', icon: '📦' },
    { id: 'pending' as const, label: 'Pending', icon: '⏳' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      {/* Header */}
      <header style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        padding: '16px 24px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '24px' }}>POS System</h1>
          <p style={{ margin: 0, fontSize: '14px', opacity: 0.9 }}>
            Welcome, {user?.username}
          </p>
        </div>
        <button
          onClick={() => setShowLogoutModal(true)}
          style={{
            background: 'rgba(255,255,255,0.2)',
            color: 'white',
            border: '1px solid rgba(255,255,255,0.3)',
            padding: '10px 20px',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '500'
          }}
        >
          Logout
        </button>
      </header>

      {/* Logout Confirmation Modal */}
      <Modal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={handleLogout}
        title="Logout"
        message={MESSAGES.LOGOUT_CONFIRM}
        confirmText="Logout"
        cancelText="Cancel"
        type="warning"
      />

      {/* Tab Navigation */}
      <div style={{
        display: 'flex',
        borderBottom: '2px solid #e0e0e0',
        background: '#f8f9fa',
        padding: '0 24px'
      }}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              background: activeTab === tab.id ? 'white' : 'transparent',
              border: 'none',
              borderBottom: activeTab === tab.id ? '3px solid #667eea' : '3px solid transparent',
              padding: '16px 24px',
              marginBottom: '-2px',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: activeTab === tab.id ? '600' : '400',
              color: activeTab === tab.id ? '#667eea' : '#666',
              transition: 'all 0.2s'
            }}
          >
            <span style={{ marginRight: '8px' }}>{tab.icon}</span>
            {tab.label}
          </button>
        ))}

        {/* Cart Badge */}
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', padding: '16px 0' }}>
          <div style={{ position: 'relative' }}>
            <span style={{ fontSize: '24px' }}>🛒</span>
            {getCartCount() > 0 && (
              <span style={{
                position: 'absolute',
                top: '-8px',
                right: '-8px',
                background: COLORS.ERROR,
                color: 'white',
                borderRadius: '50%',
                minWidth: '24px',
                height: '24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '11px',
                fontWeight: '600',
                padding: '0 6px'
              }}>
                {getCartCount() > MAX_CART_BADGE_COUNT ? `${MAX_CART_BADGE_COUNT}+` : getCartCount()}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* Left Panel - Content */}
        <div style={{ flex: 1, overflow: 'auto', padding: '24px' }}>
          {activeTab === 'catalog' && <Catalog />}
          {activeTab === 'orders' && <Orders />}
          {activeTab === 'pending' && (
            <div style={{ textAlign: 'center', padding: '60px', color: '#999' }}>
              <h2>Pending Orders</h2>
              <p>No pending orders</p>
            </div>
          )}
        </div>

        {/* Right Panel - Cart (only show on catalog) */}
        {activeTab === 'catalog' && (
          <div style={{
            width: '400px',
            borderLeft: '1px solid #e0e0e0',
            background: '#f8f9fa',
            overflow: 'auto'
          }}>
            <Cart />
          </div>
        )}
      </div>
    </div>
  );
}
