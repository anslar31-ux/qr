import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext';

const Menu = () => {
  const { db } = useAppContext();
  const navigate = useNavigate();

  const categories = db.categories.sort((a, b) => a.order - b.order);
  const items = db.menuItems.filter(m => m.available);

  return (
    <div style={{ backgroundColor: 'var(--color-bg)' }}>
      {/* Hero Banner Section */}
      <div style={{ position: 'relative', width: '100%', height: '350px', backgroundImage: 'url("https://images.unsplash.com/photo-1541167760496-1628856ab772?auto=format&fit=crop&q=80")', backgroundSize: 'cover', backgroundPosition: 'center' }}>
        {/* Gradient Overlay for text readable */}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(249, 247, 242, 1) 0%, rgba(249, 247, 242, 0) 50%, rgba(0,0,0,0.6) 100%)' }}></div>
        
        <div style={{ position: 'absolute', bottom: '2rem', left: '2rem', paddingRight: '2rem' }}>
          <h5 style={{ color: 'var(--color-accent)', textTransform: 'uppercase', letterSpacing: '0.15em', fontSize: '0.75rem', marginBottom: '0.5rem', fontWeight: 600 }}>
            The Morning Collection
          </h5>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.5rem', lineHeight: 1.1, color: 'var(--color-text-primary)' }}>
            Crafted with<br/>Patience
          </h1>
        </div>
      </div>

      <div className="container" style={{ padding: '0 1.5rem', marginTop: '-1rem' }}>
        {categories.map(cat => {
          const catItems = items.filter(item => item.categoryId === cat.id);
          if (catItems.length === 0) return null;
          return (
            <div key={cat.id} style={{ marginBottom: '2.5rem' }}>
              <div className="section-header">
                <h2 className="section-title">{cat.name}</h2>
              </div>
              
              <div className="flex-col gap-4">
                {catItems.map(item => (
                  <div 
                    key={item.id} 
                    className="flex justify-between" 
                    style={{ 
                      backgroundColor: 'var(--color-surface)', 
                      borderRadius: 'var(--border-radius-lg)',
                      overflow: 'hidden',
                      cursor: 'pointer'
                    }}
                    onClick={() => navigate(`/app/item/${item.id}`)}
                  >
                    <div style={{ padding: '0.5rem' }}>
                      <img 
                        src={item.imageUrl} 
                        alt={item.name} 
                        style={{ width: '90px', height: '90px', objectFit: 'cover', borderRadius: 'var(--border-radius-md)' }} 
                      />
                    </div>
                    <div style={{ flex: 1, padding: '1rem', paddingLeft: '0.5rem' }}>
                      <h4 style={{ margin: 0, fontSize: '1.1rem', marginBottom: '0.25rem' }}>{item.name}</h4>
                      <p style={{ color: 'var(--color-text-secondary)', margin: '0', fontSize: '0.85rem', fontStyle: 'italic', lineHeight: 1.4, marginBottom: '0.5rem' }}>
                        {item.description}
                      </p>
                      <p style={{ fontFamily: 'var(--font-sans)', fontWeight: 500, color: 'var(--color-accent)', margin: 0, fontSize: '0.95rem' }}>
                        ${item.price.toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Menu;
