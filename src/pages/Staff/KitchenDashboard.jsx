import React from 'react';
import { useAppContext } from '../../context/AppContext';
import { LogOut, CheckCircle, Clock, ChefHat, Play, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const KitchenDashboard = () => {
  const { db, updateOrderStatus, logout, settings } = useAppContext();
  const navigate = useNavigate();

  // Active kitchen orders: Placed, Pending, Confirmed, Preparing
  const orders = db.orders
    .filter(o => o.status === 'Placed' || o.status === 'Pending' || o.status === 'Confirmed' || o.status === 'Preparing')
    .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

  const handleLogout = () => {
    logout();
    navigate('/app/auth');
  };

  // Helper for Veg/Non-Veg indicators
  const renderVegIndicator = (itemId) => {
    const item = db.menuItems.find(m => m.id === itemId);
    if (!item) return null;
    const color = item.isVeg ? 'var(--color-green)' : 'var(--color-red)';
    return (
      <div style={{ 
        width: '12px', 
        height: '12px', 
        border: `1.5px solid ${color}`, 
        padding: '1px', 
        display: 'inline-flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        marginRight: '6px',
        verticalAlign: 'middle',
        backgroundColor: 'white'
      }}>
        {item.isVeg ? (
          <div style={{ width: '4px', height: '4px', borderRadius: '50%', backgroundColor: color }} />
        ) : (
          <div style={{ 
            width: 0, 
            height: 0, 
            borderLeft: '3.5px solid transparent', 
            borderRight: '3.5px solid transparent', 
            borderBottom: `5.5px solid ${color}` 
          }} />
        )}
      </div>
    );
  };

  // Helper to show spice levels
  const renderSpiciness = (itemId) => {
    const item = db.menuItems.find(m => m.id === itemId);
    if (!item || !item.isSpicy) return null;
    return <span style={{ fontSize: '0.8rem', marginLeft: '6px' }}>{'🌶️'.repeat(item.isSpicy)}</span>;
  };

  return (
    <div style={{ backgroundColor: 'var(--color-bg)', minHeight: '100vh', padding: '2rem' }}>
      <header className="flex justify-between items-center mb-6 border-b pb-4" style={{ borderColor: '#EAEAEA' }}>
        <div className="flex items-center gap-3">
          <img src="/logo.png" alt="Logo" style={{ height: '40px', width: 'auto' }} />
          <div>
            <h1 style={{ margin: 0, fontFamily: 'var(--font-serif)', letterSpacing: '0.05em', fontSize: '1.5rem', fontWeight: 800 }}>
              {settings.restaurantName}
            </h1>
            <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--color-text-secondary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Kitchen Operations
            </p>
          </div>
        </div>
        <button className="flex items-center gap-2" style={{ color: 'var(--color-text-secondary)', fontWeight: 600 }} onClick={handleLogout}>
          <LogOut size={18} /> Exit
        </button>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
        {orders.length === 0 && (
          <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '4rem 1rem', color: 'var(--color-text-secondary)', backgroundColor: '#FFF', borderRadius: 'var(--border-radius-lg)' }}>
            <ChefHat size={48} style={{ color: 'var(--color-accent)', marginBottom: '1rem', strokeWidth: 1.5 }} />
            <h3 style={{ fontFamily: 'var(--font-serif)', margin: 0 }}>No Active Orders</h3>
            <p style={{ fontStyle: 'italic', fontSize: '0.9rem', marginTop: '0.5rem' }}>Cooks are all caught up!</p>
          </div>
        )}
        {orders.map(order => (
          <div key={order.id} className="card" style={{ 
            borderRadius: 'var(--border-radius-lg)', 
            borderTop: order.status === 'Placed' || order.status === 'Pending' ? '4px solid var(--color-red)' : 
                       order.status === 'Confirmed' ? '4px solid var(--color-accent)' : '4px solid var(--color-green)',
            boxShadow: 'var(--shadow-md)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}>
            <div>
              <div className="flex justify-between items-center mb-3">
                <h2 style={{ margin: 0, fontFamily: 'var(--font-sans)', fontSize: '1.25rem', fontWeight: 700 }}>Table {order.tableId}</h2>
                <span style={{ 
                  backgroundColor: order.status === 'Placed' || order.status === 'Pending' ? 'rgba(211, 47, 47, 0.1)' :
                                  order.status === 'Confirmed' ? 'rgba(183, 137, 79, 0.1)' : 'rgba(46, 139, 87, 0.1)', 
                  color: order.status === 'Placed' || order.status === 'Pending' ? 'var(--color-red)' :
                         order.status === 'Confirmed' ? 'var(--color-accent)' : 'var(--color-green)',
                  padding: '0.25rem 0.75rem', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase'
                }}>
                  {order.status === 'Pending' ? 'Placed' : order.status}
                </span>
              </div>

              <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.8rem', marginBottom: '1.25rem', fontWeight: 500 }}>
                Received: {new Date(order.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', second:'2-digit'})}
              </p>

              <div style={{ minHeight: '120px', marginBottom: '1.5rem', borderTop: '1px solid #F0EFEA', paddingTop: '1rem' }}>
                {order.items.map(item => (
                  <div key={item.cartId} style={{ marginBottom: '0.85rem', borderBottom: '1px solid #FAF9F6', paddingBottom: '0.5rem' }}>
                    <div className="flex justify-between" style={{ color: 'var(--color-text-primary)' }}>
                      <div>
                        {renderVegIndicator(item.id)}
                        <strong style={{ fontWeight: 700, fontSize: '0.95rem' }}>{item.quantity}x {item.name}</strong>
                        {renderSpiciness(item.id)}
                      </div>
                    </div>
                    {item.customizations?.length > 0 && (
                      <div style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', fontStyle: 'italic', marginLeft: '1.25rem', marginTop: '2px' }}>
                        + {item.customizations.join(', ')}
                      </div>
                    )}
                    {item.specialInstructions && (
                      <div style={{ fontSize: '0.8rem', color: 'var(--color-red)', fontWeight: 600, marginLeft: '1.25rem', marginTop: '2px' }}>
                        Note: "{item.specialInstructions}"
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-2 justify-end pt-3 border-t" style={{ borderColor: '#EAEAEA' }}>
              {(order.status === 'Placed' || order.status === 'Pending') && (
                <button 
                  className="btn-success flex items-center justify-center gap-1" 
                  style={{ width: '100%', backgroundColor: 'var(--color-red)' }}
                  onClick={() => updateOrderStatus(order.id, 'Confirmed')}
                >
                  <Check size={16} /> Confirm Order
                </button>
              )}
              {order.status === 'Confirmed' && (
                <button 
                  className="btn-success flex items-center justify-center gap-1" 
                  style={{ width: '100%', backgroundColor: 'var(--color-accent)' }}
                  onClick={() => updateOrderStatus(order.id, 'Preparing')}
                >
                  <Play size={16} /> Start Preparing
                </button>
              )}
              {order.status === 'Preparing' && (
                <button 
                  className="btn-success flex items-center justify-center gap-1" 
                  style={{ width: '100%', backgroundColor: 'var(--color-green)' }}
                  onClick={() => updateOrderStatus(order.id, 'Ready')}
                >
                  <CheckCircle size={16} /> Mark Ready
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
