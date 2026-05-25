import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext';
import { ArrowLeft, Minus, Plus } from 'lucide-react';

const ItemDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { db, addToCart } = useAppContext();
  
  const [item, setItem] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedCustomizations, setSelectedCustomizations] = useState({});
  const [specialInstructions, setSpecialInstructions] = useState('');

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
    navigate('/app/menu');
  };

  return (
    <div style={{ backgroundColor: 'var(--color-bg)', minHeight: '100%' }}>
      <div style={{ position: 'relative' }}>
        <img src={item.imageUrl} alt={item.name} style={{ width: '100%', height: '300px', objectFit: 'cover' }} />
        <button 
          onClick={() => navigate('/app/menu')} 
          style={{ position: 'absolute', top: '1rem', left: '1rem', backgroundColor: 'rgba(255,255,255,0.9)', padding: '0.5rem', borderRadius: '50%', boxShadow: 'var(--shadow-sm)' }}
        >
          <ArrowLeft size={20} color="var(--color-text-primary)" />
        </button>
      </div>
      
      <div className="container" style={{ marginTop: '-40px', position: 'relative', zIndex: 10, padding: '0 1rem' }}>
        <div style={{ backgroundColor: 'var(--color-surface)', borderRadius: 'var(--border-radius-lg)', padding: '1.5rem', boxShadow: 'var(--shadow-md)' }}>
          <div className="flex justify-between items-center mb-2">
            <h1 style={{ margin: 0, fontFamily: 'var(--font-serif)', fontSize: '1.75rem' }}>{item.name}</h1>
            <h3 style={{ margin: 0, color: 'var(--color-accent)', fontWeight: 500, fontSize: '1.25rem' }}>${item.price.toFixed(2)}</h3>
          </div>
          <p style={{ color: 'var(--color-text-secondary)', fontStyle: 'italic', fontSize: '0.95rem', marginBottom: '1.5rem', lineHeight: 1.5 }}>
            {item.description}
          </p>

          {item.customizationOptions?.length > 0 && (
            <div className="mb-4">
              <h4 style={{ marginBottom: '0.75rem', fontSize: '1rem', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Customizations</h4>
              {item.customizationOptions.map(opt => (
                <label key={opt} className="flex items-center gap-3 mb-3" style={{ cursor: 'pointer' }}>
                  <input 
                    type="checkbox" 
                    checked={!!selectedCustomizations[opt]} 
                    onChange={() => handleCustomizationToggle(opt)} 
                    style={{ width: '1.2rem', height: '1.2rem', accentColor: 'var(--color-accent)' }}
                  />
                  <span style={{ fontSize: '0.95rem' }}>{opt}</span>
                </label>
              ))}
            </div>
          )}

          <div className="mb-4">
            <h4 style={{ marginBottom: '0.75rem', fontSize: '1rem', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Special Instructions</h4>
            <textarea 
              className="textarea" 
              placeholder="Any specific requests?" 
              rows="3"
              style={{ backgroundColor: 'var(--color-bg)' }}
              value={specialInstructions}
              onChange={(e) => setSpecialInstructions(e.target.value)}
            />
          </div>

          <div className="flex items-center justify-between mb-4 pb-4 border-b" style={{ borderColor: '#EAEAEA' }}>
            <h4 style={{ margin: 0, fontSize: '1rem', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Quantity</h4>
            <div className="flex items-center gap-4">
              <button onClick={() => setQuantity(Math.max(1, quantity - 1))} style={{ backgroundColor: 'var(--color-bg)', padding: '0.5rem', borderRadius: '50%', color: 'var(--color-text-primary)' }}>
                <Minus size={16} />
              </button>
              <span style={{ fontSize: '1.2rem', fontWeight: 600 }}>{quantity}</span>
              <button onClick={() => setQuantity(quantity + 1)} style={{ backgroundColor: 'var(--color-bg)', padding: '0.5rem', borderRadius: '50%', color: 'var(--color-text-primary)' }}>
                <Plus size={16} />
              </button>
            </div>
          </div>

          <button className="btn-success flex justify-between items-center" onClick={handleAddToCart}>
            <span>Add to Bag</span>
            <span>${(item.price * quantity).toFixed(2)}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ItemDetail;
