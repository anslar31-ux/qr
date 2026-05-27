import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext';
import { ArrowLeft, Minus, Plus, ShoppingBag, Sparkles } from 'lucide-react';

const ItemDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { db, addToCart, t } = useAppContext();
  
  const [item, setItem] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedCustomizations, setSelectedCustomizations] = useState({});
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [toastMessage, setToastMessage] = useState('');

  useEffect(() => {
    const found = db.menuItems.find(m => m.id === id);
    if(found) setItem(found);
    else navigate('/app/menu');
  }, [id, db, navigate]);

  if(!item) return null;

  const handleCustomizationToggle = (option) => {
    setSelectedCustomizations(prev => ({
      ...prev, [option]: !prev[option]
    }));
  };

  const handleAddToCart = () => {
    const customizations = Object.keys(selectedCustomizations).filter(k => selectedCustomizations[k]);
    addToCart(item, quantity, customizations, specialInstructions);
    setToastMessage(`${item.name} ${t('itemAdded')}`);
    setTimeout(() => {
      setToastMessage('');
      navigate('/app/menu');
    }, 1500);
  };

  const handleAddUpsell = (upsellItem) => {
    addToCart(upsellItem, 1, [], '');
    setToastMessage(`${upsellItem.name} ${t('itemAdded')}`);
    setTimeout(() => setToastMessage(''), 1500);
  };

  // Get upsell items
  const upsellItems = db.menuItems.filter(m => 
    m.id !== item.id && 
    m.available && 
    (item.upsellIds?.includes(m.id) || 
     (item.categoryId === 'c_starters' && m.categoryId === 'c_beverages') ||
     (item.categoryId === 'c_veg' && m.categoryId === 'c_tandoor') ||
     (item.categoryId === 'c_nonveg' && m.categoryId === 'c_tandoor') ||
     (item.categoryId === 'c_biryani' && m.categoryId === 'c_beverages'))
  ).slice(0, 3); // limit to 3 recommendations

  // Veg Indicator
  const renderVegIndicator = (isVeg) => {
    const color = isVeg ? 'var(--color-green)' : 'var(--color-red)';
    return (
      <div style={{ 
        width: '14px', 
        height: '14px', 
        border: `2px solid ${color}`, 
        padding: '2px', 
        display: 'inline-flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        marginRight: '6px',
        verticalAlign: 'middle'
      }}>
        {isVeg ? (
          <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: color }} />
        ) : (
          <div style={{ 
            width: 0, 
            height: 0, 
            borderLeft: '3px solid transparent', 
            borderRight: '3px solid transparent', 
            borderBottom: `5px solid ${color}` 
          }} />
        )}
      </div>
    );
  };

  return (
    <div style={{ backgroundColor: 'var(--color-bg)', minHeight: '100vh', paddingBottom: '3rem' }}>
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
          transition: 'all 0.3s ease',
          border: '1px solid var(--color-accent)'
        }}>
          <ShoppingBag size={16} style={{ color: 'var(--color-accent)' }} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Hero Image */}
      <div style={{ position: 'relative' }}>
        <img src={item.imageUrl} alt={item.name} style={{ width: '100%', height: '280px', objectFit: 'cover' }} />
        <button 
          onClick={() => navigate('/app/menu')} 
          style={{ position: 'absolute', top: '1rem', left: '1rem', backgroundColor: 'rgba(255,255,255,0.9)', padding: '0.5rem', borderRadius: '50%', boxShadow: 'var(--shadow-sm)' }}
        >
          <ArrowLeft size={20} color="var(--color-text-primary)" />
        </button>
      </div>
      
      {/* Content */}
      <div className="container" style={{ marginTop: '-40px', position: 'relative', zIndex: 10, padding: '0 1rem' }}>
        <div style={{ backgroundColor: 'var(--color-surface)', borderRadius: 'var(--border-radius-lg)', padding: '1.5rem', boxShadow: 'var(--shadow-md)' }}>
          
          {/* Header */}
          <div className="mb-2">
            <div className="flex items-center mb-1">
              {renderVegIndicator(item.isVeg)}
              <span style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', fontWeight: 600 }}>
                {item.isVeg ? t('veg') : t('nonVeg')} {item.portionInfo ? `• ${item.portionInfo}` : ''}
              </span>
            </div>
            <div className="flex justify-between items-start">
              <h1 style={{ margin: 0, fontFamily: 'var(--font-serif)', fontSize: '1.6rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>{item.name}</h1>
              <h3 style={{ margin: 0, color: 'var(--color-accent)', fontWeight: 700, fontSize: '1.35rem', fontFamily: 'var(--font-sans)', whiteSpace: 'nowrap' }}>₹{item.price}</h3>
            </div>
          </div>

          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.85rem', marginBottom: '1.5rem', lineHeight: 1.5 }}>
            {item.description}
          </p>

          {/* Customization Options */}
          {item.customizationOptions?.length > 0 && (
            <div className="mb-4" style={{ borderTop: '1px solid #F0EFEA', paddingTop: '1rem' }}>
              <h4 style={{ marginBottom: '0.75rem', fontSize: '0.9rem', letterSpacing: '0.05em', textTransform: 'uppercase', color: 'var(--color-text-primary)' }}>
                {t('customizations')}
              </h4>
              {item.customizationOptions.map(opt => (
                <label key={opt} className="flex items-center gap-3 mb-3" style={{ cursor: 'pointer' }}>
                  <input 
                    type="checkbox" 
                    checked={!!selectedCustomizations[opt]} 
                    onChange={() => handleCustomizationToggle(opt)} 
                    style={{ width: '1.15rem', height: '1.15rem', accentColor: 'var(--color-accent)', border: '1px solid #CCC' }}
                  />
                  <span style={{ fontSize: '0.9rem', color: 'var(--color-text-primary)' }}>{opt}</span>
                </label>
              ))}
            </div>
          )}

          {/* Special Instructions */}
          <div className="mb-4" style={{ borderTop: '1px solid #F0EFEA', paddingTop: '1rem' }}>
            <h4 style={{ marginBottom: '0.75rem', fontSize: '0.9rem', letterSpacing: '0.05em', textTransform: 'uppercase', color: 'var(--color-text-primary)' }}>
              {t('specialInstructions')}
            </h4>
            <textarea 
              className="textarea" 
              placeholder={language === 'hi' ? 'कोई विशेष निर्देश?' : language === 'te' ? 'ఏదైనా ప్రత్యేక సూచన?' : 'Spice level preferences, allergies, etc.'}
              rows="2"
              style={{ backgroundColor: 'var(--color-bg)', fontSize: '0.85rem', marginBottom: 0 }}
              value={specialInstructions}
              onChange={(e) => setSpecialInstructions(e.target.value)}
            />
          </div>

          {/* Upsells Recommendations */}
          {upsellItems.length > 0 && (
            <div className="mb-4" style={{ borderTop: '1px solid #F0EFEA', paddingTop: '1.25rem' }}>
              <div className="flex items-center gap-1 mb-3" style={{ color: 'var(--color-accent)' }}>
                <Sparkles size={16} />
                <h4 style={{ margin: 0, fontSize: '0.9rem', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                  {t('recommendedWithDish')}
                </h4>
              </div>
              <div className="flex-col gap-2">
                {upsellItems.map(upItem => (
                  <div key={upItem.id} className="flex justify-between items-center" style={{ backgroundColor: '#F9F8F4', padding: '0.5rem 0.75rem', borderRadius: 'var(--border-radius-md)', border: '1px solid rgba(0,0,0,0.02)' }}>
                    <div className="flex items-center gap-2" onClick={() => { setQuantity(1); navigate(`/app/item/${upItem.id}`); }} style={{ cursor: 'pointer', flex: 1 }}>
                      <img src={upItem.imageUrl} alt={upItem.name} style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px' }} />
                      <div>
                        <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>{upItem.name}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--color-accent)', fontWeight: 700 }}>₹{upItem.price}</div>
                      </div>
                    </div>
                    <button 
                      onClick={() => handleAddUpsell(upItem)}
                      style={{
                        backgroundColor: 'var(--color-surface)',
                        border: '1px solid var(--color-accent)',
                        color: 'var(--color-accent)',
                        padding: '0.25rem 0.75rem',
                        borderRadius: '15px',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        transition: 'all 0.1s ease',
                      }}
                    >
                      + ADD
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Quantity Selector */}
          <div className="mb-4 pb-4 border-b" style={{ borderColor: '#F0EFEA', borderTop: '1px solid #F0EFEA', paddingTop: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'between' }}>
            <h4 style={{ margin: 0, fontSize: '0.9rem', letterSpacing: '0.05em', textTransform: 'uppercase', color: 'var(--color-text-primary)' }}>
              {t('quantity')}
            </h4>
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setQuantity(Math.max(1, quantity - 1))} 
                style={{ backgroundColor: 'var(--color-bg)', padding: '0.4rem', borderRadius: '50%', color: 'var(--color-text-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <Minus size={15} />
              </button>
              <span style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--color-text-primary)', minWidth: '15px', textAlign: 'center' }}>{quantity}</span>
              <button 
                onClick={() => setQuantity(quantity + 1)} 
                style={{ backgroundColor: 'var(--color-bg)', padding: '0.4rem', borderRadius: '50%', color: 'var(--color-text-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <Plus size={15} />
              </button>
            </div>
          </div>

          {/* Primary Action Button */}
          <button className="btn-success flex justify-between items-center" onClick={handleAddToCart} style={{ padding: '0.9rem 1.5rem' }}>
            <span>{t('addToBag')}</span>
            <span style={{ fontFamily: 'var(--font-sans)', fontWeight: 700 }}>₹{item.price * quantity}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ItemDetail;
