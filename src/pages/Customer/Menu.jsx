import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext';
import { Search, Wifi, Check, Sparkles, Flame, ThumbsUp, HelpCircle } from 'lucide-react';

const Menu = () => {
  const { db, settings, t, language } = useAppContext();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterVeg, setFilterVeg] = useState(false);
  const [filterNonVeg, setFilterNonVeg] = useState(false);
  const [filterBestseller, setFilterBestseller] = useState(false);
  const [filterChefSpecial, setFilterChefSpecial] = useState(false);
  const [filterSpicy, setFilterSpicy] = useState('all'); // 'all', 'none', 'mild', 'hot'
  const [priceRange, setPriceRange] = useState('all'); // 'all', 'under_150', '150_350', 'above_350'

  const categories = db.categories.sort((a, b) => a.order - b.order);
  const items = db.menuItems.filter(m => m.available);

  // WiFi login string format
  const wifiString = `WIFI:S:${settings.wifiSSID};T:${settings.wifiEncryption};P:${settings.wifiPassword};;`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(wifiString)}`;

  // Filter Items
  const filteredItems = items.filter(item => {
    // Search query match (name, description, category)
    const matchesSearch = 
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      item.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Veg/Non-Veg match
    const matchesVeg = !filterVeg || item.isVeg;
    const matchesNonVeg = !filterNonVeg || !item.isVeg;
    
    // Badge matches
    const matchesBestseller = !filterBestseller || item.isBestseller;
    const matchesChefSpecial = !filterChefSpecial || item.isChefSpecial;

    // Spicy match
    let matchesSpicy = true;
    if (filterSpicy === 'none') matchesSpicy = item.isSpicy === 0;
    else if (filterSpicy === 'mild') matchesSpicy = item.isSpicy === 1;
    else if (filterSpicy === 'hot') matchesSpicy = item.isSpicy >= 2;

    // Price range match
    let matchesPrice = true;
    if (priceRange === 'under_150') matchesPrice = item.price <= 150;
    else if (priceRange === '150_350') matchesPrice = item.price > 150 && item.price <= 350;
    else if (priceRange === 'above_350') matchesPrice = item.price > 350;

    return matchesSearch && matchesVeg && matchesNonVeg && matchesBestseller && matchesChefSpecial && matchesSpicy && matchesPrice;
  });

  // Green Dot for Veg, Red Triangle for Non-Veg
  const renderVegIndicator = (isVeg) => {
    const color = isVeg ? 'var(--color-green)' : 'var(--color-red)';
    return (
      <div style={{ 
        width: '15px', 
        height: '15px', 
        border: `2px solid ${color}`, 
        padding: '2px', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        flexShrink: 0,
        backgroundColor: 'white'
      }}>
        {isVeg ? (
          <div style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: color }} />
        ) : (
          <div style={{ 
            width: 0, 
            height: 0, 
            borderLeft: '4px solid transparent', 
            borderRight: '4px solid transparent', 
            borderBottom: `7px solid ${color}` 
          }} />
        )}
      </div>
    );
  };

  // Emojis for spiciness
  const renderSpiciness = (spicyLevel) => {
    if (!spicyLevel || spicyLevel === 0) return null;
    return (
      <span style={{ fontSize: '0.85rem', marginLeft: '4px' }}>
        {'🌶️'.repeat(spicyLevel)}
      </span>
    );
  };

  return (
    <div style={{ backgroundColor: 'var(--color-bg)', minHeight: '100vh' }}>
      {/* Hero Banner Section */}
      <div style={{ position: 'relative', width: '100%', height: '240px', backgroundImage: 'url("https://images.unsplash.com/photo-1585238342024-78d387f4a707?auto=format&fit=crop&q=80&w=1200")', backgroundSize: 'cover', backgroundPosition: 'center' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(249, 247, 242, 1) 0%, rgba(249, 247, 242, 0.2) 60%, rgba(0,0,0,0.6) 100%)' }}></div>
        <div style={{ position: 'absolute', bottom: '1.5rem', left: '1.5rem', paddingRight: '1.5rem' }}>
          <h5 style={{ color: 'var(--color-accent)', textTransform: 'uppercase', letterSpacing: '0.15em', fontSize: '0.75rem', marginBottom: '0.5rem', fontWeight: 600 }}>
            {settings.restaurantName}
          </h5>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2rem', lineHeight: 1.1, color: 'var(--color-text-primary)', fontWeight: 700 }}>
            {language === 'hi' ? 'भारतीय स्वाद और परंपरा' : language === 'te' ? 'భారతీయ రుచులు & సంప్రదాయం' : 'Indian Flavours & Tradition'}
          </h1>
        </div>
      </div>

      <div className="container" style={{ padding: '0 1rem', marginTop: '1rem' }}>
        {/* WiFi Auto-Login QR Code Card */}
        {settings.showWifiQR && (
          <div className="card" style={{ 
            borderRadius: 'var(--border-radius-lg)', 
            border: '2px dashed var(--color-accent)',
            backgroundColor: 'var(--color-surface)',
            padding: '1rem',
            marginBottom: '2rem',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            boxShadow: 'var(--shadow-sm)'
          }}>
            <div style={{ 
              backgroundColor: '#FFF', 
              padding: '0.25rem', 
              border: '1px solid #EAEAEA', 
              borderRadius: 'var(--border-radius-sm)',
              flexShrink: 0
            }}>
              <img src={qrCodeUrl} alt="WiFi QR" style={{ width: '80px', height: '80px', display: 'block' }} />
            </div>
            <div style={{ flex: 1 }}>
              <div className="flex items-center gap-1" style={{ color: 'var(--color-accent)', fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.25rem' }}>
                <Wifi size={16} />
                <span>{t('connectWifi')}</span>
              </div>
              <p style={{ margin: 0, fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                SSID: {settings.wifiSSID}
              </p>
              <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>
                Pwd: {settings.wifiPassword}
              </p>
              <p style={{ margin: '4px 0 0 0', fontSize: '0.7rem', color: 'var(--color-text-secondary)', fontStyle: 'italic' }}>
                💡 {t('scanToConnect')}
              </p>
            </div>
          </div>
        )}

        {/* Smart Search Bar */}
        <div style={{ position: 'relative', marginBottom: '1.5rem' }}>
          <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-secondary)' }}>
            <Search size={18} />
          </span>
          <input 
            type="text" 
            placeholder={t('searchPlaceholder')}
            style={{ 
              width: '100%', 
              padding: '0.85rem 1rem 0.85rem 2.5rem', 
              borderRadius: '25px', 
              border: '1px solid #E3DFD5', 
              fontSize: '0.95rem',
              backgroundColor: 'var(--color-surface)',
              outline: 'none',
              fontFamily: 'inherit',
              boxShadow: 'var(--shadow-sm)'
            }}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Horizontal Filters Section */}
        <div style={{ marginBottom: '2rem' }}>
          {/* Quick Filters */}
          <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.5rem', scrollbarWidth: 'none' }}>
            <button 
              onClick={() => { setFilterVeg(!filterVeg); if(filterNonVeg) setFilterNonVeg(false); }}
              style={{
                padding: '0.45rem 1rem',
                borderRadius: '20px',
                fontSize: '0.8rem',
                fontWeight: 600,
                border: `1px solid ${filterVeg ? 'var(--color-green)' : '#E3DFD5'}`,
                backgroundColor: filterVeg ? 'rgba(46, 139, 87, 0.1)' : 'var(--color-surface)',
                color: filterVeg ? 'var(--color-green)' : 'var(--color-text-secondary)',
                whiteSpace: 'nowrap',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--color-green)' }} />
              {t('veg')}
            </button>
            <button 
              onClick={() => { setFilterNonVeg(!filterNonVeg); if(filterVeg) setFilterVeg(false); }}
              style={{
                padding: '0.45rem 1rem',
                borderRadius: '20px',
                fontSize: '0.8rem',
                fontWeight: 600,
                border: `1px solid ${filterNonVeg ? 'var(--color-red)' : '#E3DFD5'}`,
                backgroundColor: filterNonVeg ? 'rgba(211, 47, 47, 0.1)' : 'var(--color-surface)',
                color: filterNonVeg ? 'var(--color-red)' : 'var(--color-text-secondary)',
                whiteSpace: 'nowrap',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <div style={{ width: 0, height: 0, borderLeft: '4px solid transparent', borderRight: '4px solid transparent', borderBottom: '7px solid var(--color-red)' }} />
              {t('nonVeg')}
            </button>
            <button 
              onClick={() => setFilterBestseller(!filterBestseller)}
              style={{
                padding: '0.45rem 1rem',
                borderRadius: '20px',
                fontSize: '0.8rem',
                fontWeight: 600,
                border: `1px solid ${filterBestseller ? 'var(--color-accent)' : '#E3DFD5'}`,
                backgroundColor: filterBestseller ? 'rgba(183, 137, 79, 0.1)' : 'var(--color-surface)',
                color: filterBestseller ? 'var(--color-accent)' : 'var(--color-text-secondary)',
                whiteSpace: 'nowrap',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <ThumbsUp size={12} />
              {t('bestseller')}
            </button>
            <button 
              onClick={() => setFilterChefSpecial(!filterChefSpecial)}
              style={{
                padding: '0.45rem 1rem',
                borderRadius: '20px',
                fontSize: '0.8rem',
                fontWeight: 600,
                border: `1px solid ${filterChefSpecial ? 'var(--color-accent)' : '#E3DFD5'}`,
                backgroundColor: filterChefSpecial ? 'rgba(183, 137, 79, 0.1)' : 'var(--color-surface)',
                color: filterChefSpecial ? 'var(--color-accent)' : 'var(--color-text-secondary)',
                whiteSpace: 'nowrap',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <Sparkles size={12} />
              {t('chefSpecial')}
            </button>
          </div>

          {/* Spicy Levels */}
          <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.5rem', marginTop: '0.5rem', scrollbarWidth: 'none' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-secondary)', alignSelf: 'center', paddingRight: '4px' }}>
              {t('spicy')}:
            </span>
            {[
              { id: 'all', label: 'All' },
              { id: 'none', label: 'Mild (No Chilli)' },
              { id: 'mild', label: 'Medium 🌶️' },
              { id: 'hot', label: 'Spicy 🌶️🌶️+' }
            ].map(lvl => (
              <button 
                key={lvl.id}
                onClick={() => setFilterSpicy(lvl.id)}
                style={{
                  padding: '0.35rem 0.85rem',
                  borderRadius: '15px',
                  fontSize: '0.75rem',
                  fontWeight: 500,
                  border: `1px solid ${filterSpicy === lvl.id ? 'var(--color-text-primary)' : '#E3DFD5'}`,
                  backgroundColor: filterSpicy === lvl.id ? 'var(--color-text-primary)' : 'var(--color-surface)',
                  color: filterSpicy === lvl.id ? 'white' : 'var(--color-text-secondary)',
                  whiteSpace: 'nowrap'
                }}
              >
                {lvl.label}
              </button>
            ))}
          </div>

          {/* Price Range */}
          <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.5rem', marginTop: '0.5rem', scrollbarWidth: 'none' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-secondary)', alignSelf: 'center', paddingRight: '4px' }}>
              {t('priceRange')}:
            </span>
            {[
              { id: 'all', label: 'All' },
              { id: 'under_150', label: 'Under ₹150' },
              { id: '150_350', label: '₹150 - ₹350' },
              { id: 'above_350', label: 'Above ₹350' }
            ].map(prc => (
              <button 
                key={prc.id}
                onClick={() => setPriceRange(prc.id)}
                style={{
                  padding: '0.35rem 0.85rem',
                  borderRadius: '15px',
                  fontSize: '0.75rem',
                  fontWeight: 500,
                  border: `1px solid ${priceRange === prc.id ? 'var(--color-text-primary)' : '#E3DFD5'}`,
                  backgroundColor: priceRange === prc.id ? 'var(--color-text-primary)' : 'var(--color-surface)',
                  color: priceRange === prc.id ? 'white' : 'var(--color-text-secondary)',
                  whiteSpace: 'nowrap'
                }}
              >
                {prc.label}
              </button>
            ))}
          </div>
        </div>

        {/* Menu Listings */}
        {filteredItems.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem 1.5rem', color: 'var(--color-text-secondary)' }}>
            <HelpCircle size={48} style={{ color: 'var(--color-accent)', marginBottom: '1rem', strokeWidth: 1.5 }} />
            <h3 style={{ fontFamily: 'var(--font-serif)', marginBottom: '0.5rem' }}>No Dishes Found</h3>
            <p style={{ fontStyle: 'italic', fontSize: '0.9rem' }}>Try adjusting your search query or filters.</p>
          </div>
        ) : (
          categories.map(cat => {
            const catItems = filteredItems.filter(item => item.categoryId === cat.id);
            if (catItems.length === 0) return null;
            return (
              <div key={cat.id} style={{ marginBottom: '2.5rem' }}>
                <div className="section-header" style={{ margin: '1.5rem 0 1rem 0' }}>
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
                        cursor: 'pointer',
                        boxShadow: 'var(--shadow-sm)',
                        border: '1px solid rgba(0,0,0,0.02)'
                      }}
                      onClick={() => navigate(`/app/item/${item.id}`)}
                    >
                      {/* Left: Image & Badge overlays */}
                      <div style={{ padding: '0.5rem', position: 'relative', display: 'flex', alignItems: 'center' }}>
                        <img 
                          src={item.imageUrl} 
                          alt={item.name} 
                          style={{ width: '100px', height: '100px', objectFit: 'cover', borderRadius: 'var(--border-radius-md)' }} 
                        />
                        {/* Veg / Non-Veg Indicator Absolute on Image corner */}
                        <div style={{ position: 'absolute', top: '0.75rem', left: '0.75rem', zIndex: 10, boxShadow: '0 2px 5px rgba(0,0,0,0.1)', borderRadius: '2px' }}>
                          {renderVegIndicator(item.isVeg)}
                        </div>
                      </div>

                      {/* Right: Content details */}
                      <div style={{ flex: 1, padding: '1rem 1rem 1rem 0.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                        <div>
                          {/* Badges row */}
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '3px', marginBottom: '4px' }}>
                            {item.isBestseller && (
                              <span style={{ fontSize: '0.65rem', backgroundColor: 'rgba(183, 137, 79, 0.1)', color: 'var(--color-accent)', padding: '1px 5px', borderRadius: '4px', fontWeight: 700, textTransform: 'uppercase' }}>
                                ★ Bestseller
                              </span>
                            )}
                            {item.isChefSpecial && (
                              <span style={{ fontSize: '0.65rem', backgroundColor: 'rgba(46, 139, 87, 0.1)', color: 'var(--color-green)', padding: '1px 5px', borderRadius: '4px', fontWeight: 700, textTransform: 'uppercase' }}>
                                👨‍🍳 Special
                              </span>
                            )}
                            {item.isNew && (
                              <span style={{ fontSize: '0.65rem', backgroundColor: '#333', color: '#FFF', padding: '1px 5px', borderRadius: '4px', fontWeight: 700, textTransform: 'uppercase' }}>
                                New
                              </span>
                            )}
                          </div>

                          <div className="flex justify-between items-start">
                            <h4 style={{ margin: 0, fontSize: '1.05rem', color: 'var(--color-text-primary)', fontWeight: 600 }}>
                              {item.name}
                            </h4>
                          </div>

                          <p style={{ color: 'var(--color-text-secondary)', margin: '0.25rem 0 0.5rem 0', fontSize: '0.8rem', lineHeight: 1.4 }}>
                            {item.description}
                          </p>
                        </div>

                        <div className="flex justify-between items-center" style={{ marginTop: '0.25rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span style={{ fontFamily: 'var(--font-sans)', fontWeight: 700, color: 'var(--color-accent)', fontSize: '1.05rem' }}>
                              ₹{item.price}
                            </span>
                            {item.portionInfo && (
                              <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', backgroundColor: '#F0EFEA', padding: '2px 6px', borderRadius: '10px' }}>
                                {item.portionInfo}
                              </span>
                            )}
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center' }}>
                            {renderSpiciness(item.isSpicy)}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default Menu;
