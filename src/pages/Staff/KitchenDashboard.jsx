import React from 'react';
import { useAppContext } from '../../context/AppContext';
import { LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const KitchenDashboard = () => {
  const { db, updateOrderStatus, logout } = useAppContext();
  const navigate = useNavigate();

  const orders = db.orders
    .filter(o => o.status === 'Pending' || o.status === 'Preparing')
    .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

  const handleLogout = () => {
    logout();
    navigate('/app/auth');
  };

  return (
    <div style={{ backgroundColor: 'var(--color-bg)', minHeight: '100vh', padding: '2rem' }}>
      <header className="flex justify-between items-center mb-6 border-b pb-4" style={{ borderColor: '#EAEAEA' }}>
        <h1 style={{ margin: 0, fontFamily: 'var(--font-serif)', letterSpacing: '0.05em' }}>Kitchen Staff</h1>
        <button className="flex items-center gap-2" style={{ color: 'var(--color-text-secondary)' }} onClick={handleLogout}>
          <LogOut size={18} /> Exit
        </button>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
        {orders.length === 0 && <p style={{ fontStyle: 'italic', color: 'var(--color-text-secondary)' }}>No active orders.</p>}
        {orders.map(order => (
          <div key={order.id} className="card" style={{ 
            borderRadius: 'var(--border-radius-lg)', 
            borderTop: order.status === 'Pending' ? '4px solid var(--color-accent)' : '4px solid var(--color-green)',
            boxShadow: 'var(--shadow-md)'
          }}>
            <div className="flex justify-between items-center mb-3">
              <h2 style={{ margin: 0, fontFamily: 'var(--font-sans)', fontSize: '1.25rem' }}>Table {order.tableId}</h2>
              <span style={{ 
                backgroundColor: order.status === 'Pending' ? 'rgba(183, 137, 79, 0.1)' : 'rgba(46, 139, 87, 0.1)', 
                color: order.status === 'Pending' ? 'var(--color-accent)' : 'var(--color-green)',
                padding: '0.25rem 0.75rem', borderRadius: '4px', fontSize: '0.85rem', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase'
              }}>
                {order.status}
              </span>
            </div>

            <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
              Ordered at {new Date(order.createdAt).toLocaleTimeString()}
            </p>

            <div style={{ minHeight: '120px', marginBottom: '1.5rem' }}>
              {order.items.map(item => (
                <div key={item.cartId} style={{ marginBottom: '0.75rem' }}>
                  <div className="flex justify-between" style={{ color: 'var(--color-text-primary)' }}>
                    <strong style={{ fontWeight: 500 }}>{item.quantity}x {item.name}</strong>
                  </div>
                  {item.customizations?.length > 0 && <div style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', fontStyle: 'italic' }}>+ {item.customizations.join(', ')}</div>}
                  {item.specialInstructions && <div style={{ fontSize: '0.85rem', color: 'var(--color-red)' }}>Note: {item.specialInstructions}</div>}
                </div>
              ))}
            </div>

            <div className="flex gap-2 justify-end pt-3 border-t" style={{ borderColor: '#EAEAEA' }}>
              {order.status === 'Pending' && (
                <button 
                  className="btn-success" 
                  style={{ width: '100%', backgroundColor: 'var(--color-accent)' }}
                  onClick={() => updateOrderStatus(order.id, 'Preparing')}
                >
                  Start Preparing
                </button>
              )}
              {order.status === 'Preparing' && (
                <button 
                  className="btn-success" 
                  style={{ width: '100%', backgroundColor: 'var(--color-green)' }}
                  onClick={() => updateOrderStatus(order.id, 'Ready')}
                >
                  Mark Ready
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default KitchenDashboard;
