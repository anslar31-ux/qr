import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext';
import { Trash2, CreditCard } from 'lucide-react';

const Cart = () => {
  const { cart, removeFromCart, placeOrder } = useAppContext();
  const navigate = useNavigate();

  const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const tableId = sessionStorage.getItem('currentTable') || 'T1';

  const handlePlaceOrder = async () => {
    if (cart.length === 0) return;
    const orderId = await placeOrder(tableId);
    if (orderId) navigate(`/app/tracking/${orderId}`);
  };

  return (
    <div style={{ padding: '1rem' }}>
      <div className="section-header">
        <h2 className="section-title">Your Bag</h2>
      </div>

      <div className="container" style={{ padding: 0 }}>
        {cart.length === 0 ? (
          <div className="text-center" style={{ marginTop: '3rem' }}>
            <p style={{ color: 'var(--color-text-secondary)', fontStyle: 'italic', marginBottom: '2rem' }}>Your bag is currently empty.</p>
            <button className="btn-primary" onClick={() => navigate('/app/menu')}>Return to Menu</button>
          </div>
        ) : (
          <div className="flex-col gap-4">
            {cart.map(item => (
              <div key={item.cartId} className="card relative" style={{ borderRadius: 'var(--border-radius-lg)' }}>
                <div className="flex justify-between">
                  <h4 style={{ margin: 0, fontFamily: 'var(--font-serif)', fontSize: '1.2rem' }}>{item.quantity}x {item.name}</h4>
                  <p style={{ margin: 0, fontWeight: 500, color: 'var(--color-accent)' }}>${(item.price * item.quantity).toFixed(2)}</p>
                </div>
                {item.customizations?.length > 0 && (
                  <p style={{ margin: '0.4rem 0 0 0', fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
                    + {item.customizations.join(', ')}
                  </p>
                )}
                {item.specialInstructions && (
                  <p style={{ margin: '0.4rem 0 0 0', fontSize: '0.85rem', color: 'var(--color-accent-light)', fontStyle: 'italic' }}>
                    Note: {item.specialInstructions}
                  </p>
                )}
                <button 
                  onClick={() => removeFromCart(item.cartId)} 
                  style={{ position: 'absolute', bottom: '1rem', right: '1rem', color: 'var(--color-red)' }}
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
            
            <div style={{ marginTop: '2rem', padding: '1.5rem', backgroundColor: 'var(--color-surface)', borderRadius: 'var(--border-radius-lg)', boxShadow: 'var(--shadow-sm)' }}>
              <div className="flex justify-between items-center mb-4 pb-4 border-b" style={{ borderColor: '#EAEAEA' }}>
                <h3 style={{ margin: 0, fontFamily: 'var(--font-sans)', fontSize: '1.1rem', letterSpacing: '0.05em' }}>Order Total</h3>
                <h2 style={{ margin: 0, color: 'var(--color-accent)', fontFamily: 'var(--font-serif)' }}>${total.toFixed(2)}</h2>
              </div>
              <button className="btn-primary flex items-center justify-center gap-2" onClick={handlePlaceOrder}>
                <CreditCard size={18} />
                <span>Place Order to Table {tableId}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;
