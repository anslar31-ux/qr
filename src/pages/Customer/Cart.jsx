import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext';
import { Trash2, CreditCard, Sparkles, ShoppingBag } from 'lucide-react';

const Cart = () => {
  const { cart, removeFromCart, addToCart, placeOrder, settings, t, language } = useAppContext();
  const navigate = useNavigate();
  const [toastMessage, setToastMessage] = useState('');
  const [isPlacing, setIsPlacing] = useState(false);

  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const discount = 0;
  const taxableAmount = subtotal - discount;
  const cgstAmount = Math.round((taxableAmount * (settings.cgstRate / 100)) * 100) / 100;
  const sgstAmount = Math.round((taxableAmount * (settings.sgstRate / 100)) * 100) / 100;
  const serviceChargeAmount = Math.round((taxableAmount * (settings.serviceChargeRate / 100)) * 100) / 100;
  const grandTotal = Math.round(taxableAmount + cgstAmount + sgstAmount + serviceChargeAmount);

  const tableId = sessionStorage.getItem('currentTable') || 'T1';

  const handlePlaceOrder = async () => {
    if (cart.length === 0) return;
    setIsPlacing(true);
    const orderId = await placeOrder(tableId);
    setIsPlacing(false);
    if (orderId) navigate(`/app/tracking/${orderId}`);
  };

  const handleAddUpsell = (upsellItem) => {
    addToCart(upsellItem, 1, [], '');
    setToastMessage(`${upsellItem.name} ${t('itemAdded')}`);
    setTimeout(() => setToastMessage(''), 1500);
  };

  // Get cart item IDs to exclude them from recommendations
  const cartItemIds = cart.map(item => item.id);
  
  // Recommend drinks and desserts that are not in the cart
  const upsellRecommendations = db => {
    return db.menuItems.filter(m => 
      !cartItemIds.includes(m.id) && 
      m.available && 
      (m.categoryId === 'c_beverages' || m.categoryId === 'c_desserts' || m.categoryId === 'c_snacks')
    ).slice(0, 3);
  };

  return (
    <div style={{ padding: '1rem', backgroundColor: 'var(--color-bg)', minHeight: '100vh', paddingBottom: '4rem' }}>
      {/* Toast Notification */}
      {toastMessage && (
        <div style={{
          position: 'fixed',
          top: '4.5rem',
          left: '50%',
          transform: 'translateX(-50%)',
          backgroundColor: 'var(--color-text-primary)',
          color: '#FFF',
          padding: '0.75rem 1.5rem',
          borderRadius: '25px',
          boxShadow: 'var(--shadow-md)',
          zIndex: 1100,
          fontSize: '0.85rem',
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          border: '1px solid var(--color-accent)'
        }}>
          <ShoppingBag size={16} style={{ color: 'var(--color-accent)' }} />
          <span>{toastMessage}</span>
        </div>
      )}

      <div className="section-header" style={{ margin: '1rem 0 1.5rem 0' }}>
        <h2 className="section-title">{t('bag')}</h2>
      </div>

      <div className="container" style={{ padding: 0 }}>
        {cart.length === 0 ? (
          <div className="text-center" style={{ marginTop: '3rem' }}>
            <p style={{ color: 'var(--color-text-secondary)', fontStyle: 'italic', marginBottom: '2rem' }}>{t('emptyBag')}</p>
            <button className="btn-primary" onClick={() => navigate('/app/menu')}>{t('returnToMenu')}</button>
          </div>
        ) : (
          <div className="flex-col gap-4">
            
            {/* Cart Items list */}
            {cart.map(item => (
              <div key={item.cartId} className="card relative" style={{ borderRadius: 'var(--border-radius-lg)', border: '1px solid rgba(0,0,0,0.02)', padding: '1rem 3rem 1rem 1rem' }}>
                <div className="flex justify-between items-start">
                  <div>
                    <h4 style={{ margin: 0, fontFamily: 'var(--font-serif)', fontSize: '1.1rem', color: 'var(--color-text-primary)' }}>
                      {item.quantity}x {item.name}
                    </h4>
                    {item.customizations?.length > 0 && (
                      <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>
                        + {item.customizations.join(', ')}
                      </p>
                    )}
                    {item.specialInstructions && (
                      <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.8rem', color: 'var(--color-accent)', fontStyle: 'italic' }}>
                        Note: {item.specialInstructions}
                      </p>
                    )}
                  </div>
                  <p style={{ margin: 0, fontWeight: 700, color: 'var(--color-text-primary)', fontFamily: 'var(--font-sans)', fontSize: '1rem' }}>
                    ₹{item.price * item.quantity}
                  </p>
                </div>
                <button 
                  onClick={() => removeFromCart(item.cartId)} 
                  style={{ position: 'absolute', top: '1rem', right: '1rem', color: 'var(--color-red)', cursor: 'pointer' }}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}

            {/* "Complete your meal" Upsells panel */}
            {useAppContext().db && upsellRecommendations(useAppContext().db).length > 0 && (
              <div style={{ marginTop: '1.5rem', marginBottom: '1rem' }}>
                <div className="flex items-center gap-1 mb-3" style={{ color: 'var(--color-accent)' }}>
                  <Sparkles size={16} />
                  <h4 style={{ margin: 0, fontSize: '0.9rem', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                    {t('completeYourMeal')}
                  </h4>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem', overflowX: 'auto', paddingBottom: '0.5rem', scrollbarWidth: 'none' }}>
                  {upsellRecommendations(useAppContext().db).map(upItem => (
                    <div 
                      key={upItem.id} 
                      style={{ 
                        backgroundColor: 'var(--color-surface)', 
                        borderRadius: 'var(--border-radius-md)', 
                        padding: '0.5rem', 
                        minWidth: '160px', 
                        boxShadow: 'var(--shadow-sm)',
                        border: '1px solid rgba(0,0,0,0.02)',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        gap: '6px'
                      }}
                    >
                      <img src={upItem.imageUrl} alt={upItem.name} style={{ width: '100%', height: '80px', objectFit: 'cover', borderRadius: '4px' }} />
                      <div>
                        <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{upItem.name}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--color-accent)', fontWeight: 700 }}>₹{upItem.price}</div>
                      </div>
                      <button 
                        onClick={() => handleAddUpsell(upItem)}
                        style={{
                          backgroundColor: 'var(--color-accent)',
                          color: 'white',
                          padding: '0.25rem',
                          borderRadius: '4px',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          textAlign: 'center',
                          cursor: 'pointer'
                        }}
                      >
                        + ADD
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* GST Compliant Bill Breakdown Card */}
            <div style={{ marginTop: '1rem', padding: '1.5rem', backgroundColor: 'var(--color-surface)', borderRadius: 'var(--border-radius-lg)', boxShadow: 'var(--shadow-sm)', border: '1px solid rgba(0,0,0,0.02)' }}>
              
              <h4 style={{ margin: '0 0 1rem 0', fontSize: '0.9rem', letterSpacing: '0.05em', textTransform: 'uppercase', color: 'var(--color-text-secondary)', borderBottom: '1px solid #F0EFEA', paddingBottom: '0.5rem' }}>
                Bill Details
              </h4>

              <div className="flex justify-between items-center mb-2" style={{ fontSize: '0.85rem', color: 'var(--color-text-primary)' }}>
                <span>{t('subtotal')}</span>
                <span>₹{subtotal}</span>
              </div>

              {discount > 0 && (
                <div className="flex justify-between items-center mb-2" style={{ fontSize: '0.85rem', color: 'var(--color-green)' }}>
                  <span>{t('discount')}</span>
                  <span>-₹{discount}</span>
                </div>
              )}

              <div className="flex justify-between items-center mb-2" style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
                <span>{t('cgst')} ({settings.cgstRate}%)</span>
                <span>₹{cgstAmount.toFixed(2)}</span>
              </div>

              <div className="flex justify-between items-center mb-2" style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
                <span>{t('sgst')} ({settings.sgstRate}%)</span>
                <span>₹{sgstAmount.toFixed(2)}</span>
              </div>

              {settings.serviceChargeRate > 0 && (
                <div className="flex justify-between items-center mb-4" style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
                  <span>{t('serviceCharge')} ({settings.serviceChargeRate}%)</span>
                  <span>₹{serviceChargeAmount.toFixed(2)}</span>
                </div>
              )}

              <div className="flex justify-between items-center mb-6 pb-4 border-t pt-4" style={{ borderColor: '#F0EFEA' }}>
                <h3 style={{ margin: 0, fontFamily: 'var(--font-sans)', fontSize: '1rem', letterSpacing: '0.05em', color: 'var(--color-text-primary)', fontWeight: 700 }}>
                  {t('grandTotal')}
                </h3>
                <h2 style={{ margin: 0, color: 'var(--color-accent)', fontFamily: 'var(--font-serif)', fontWeight: 800 }}>
                  ₹{grandTotal}
                </h2>
              </div>

              <button 
                className="btn-primary flex items-center justify-center gap-2" 
                onClick={handlePlaceOrder}
                disabled={isPlacing}
                style={{ padding: '0.9rem 1.5rem' }}
              >
                <CreditCard size={18} />
                <span>{isPlacing ? 'Placing Order...' : `${t('placeOrder')} ${tableId}`}</span>
              </button>
            </div>

          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;
