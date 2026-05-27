import React from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Menu as MenuIcon, User, ShoppingBag, BookOpen, Globe } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

export default function CustomerLayout() {
  const { cart, language, setLanguage, t, settings } = useAppContext();
  const navigate = useNavigate();
  const location = useLocation();

  const isRoute = (path) => location.pathname.includes(path);

  return (
    <div style={{ backgroundColor: 'var(--color-bg)', minHeight: '100vh', paddingBottom: '70px', position: 'relative', display: 'flex', flexDirection: 'column' }}>
      {/* Top Header */}
      <header className="flex justify-between items-center" style={{ padding: '1rem', position: 'sticky', top: 0, backgroundColor: 'var(--color-bg)', zIndex: 50, borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
        <div className="flex items-center gap-2" style={{ cursor: 'pointer' }} onClick={() => navigate('/app/menu')}>
          <img src="/logo.png" alt="Logo" style={{ height: '32px', width: 'auto', objectFit: 'contain' }} />
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.1rem', letterSpacing: '0.05em', margin: 0, fontWeight: 700, color: 'var(--color-text-primary)' }}>
            {settings.restaurantName.toUpperCase()}
          </h1>
        </div>

        <div className="flex items-center gap-3">
          {/* Language Selector Dropdown */}
          <div className="flex items-center gap-1" style={{ backgroundColor: 'var(--color-surface)', padding: '4px 8px', borderRadius: '20px', border: '1px solid #EAEAEA' }}>
            <Globe size={14} style={{ color: 'var(--color-accent)' }} />
            <select 
              value={language} 
              onChange={(e) => setLanguage(e.target.value)} 
              style={{ 
                border: 'none', 
                fontSize: '0.75rem', 
                backgroundColor: 'transparent',
                fontFamily: 'var(--font-sans)',
                fontWeight: 600,
                color: 'var(--color-text-primary)',
                outline: 'none',
                cursor: 'pointer',
                paddingRight: '2px'
              }}
            >
              <option value="en">EN</option>
              <option value="hi">हिन्दी</option>
              <option value="te">తెలుగు</option>
            </select>
          </div>

          {/* Cart Icon */}
          <div style={{ position: 'relative', cursor: 'pointer', padding: '4px' }} onClick={() => navigate('/app/cart')}>
            <ShoppingBag size={22} style={{ color: 'var(--color-text-primary)' }} />
            {cart.length > 0 && (
              <span style={{ position: 'absolute', top: '-2px', right: '-2px', backgroundColor: 'var(--color-accent)', color: 'white', borderRadius: '50%', width: '16px', height: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '9px', fontWeight: 'bold' }}>
                {cart.reduce((sum, item) => sum + item.quantity, 0)}
              </span>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main style={{ flex: 1 }}>
        <Outlet />
      </main>

      {/* Branded Footer */}
      <footer style={{ 
        padding: '2.5rem 1.5rem 6rem 1.5rem', 
        backgroundColor: '#FFFFFF', 
        borderTop: '1px solid #E0DCD3',
        textAlign: 'center',
        marginTop: '3rem'
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
          <img src="/logo.png" alt="Logo" style={{ height: '40px', width: 'auto', marginBottom: '0.25rem', objectFit: 'contain' }} />
          <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.25rem', margin: 0, color: 'var(--color-text-primary)' }}>{settings.restaurantName}</h3>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.8rem', lineHeight: 1.5, margin: '0 max(1rem, 10%)' }}>
            {settings.restaurantAddress}<br/>
            Phone: {settings.restaurantPhone}
          </p>
          
          {settings.showReviewCTA && (
            <a 
              href={settings.googleReviewLink} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="flex items-center justify-center gap-2"
              style={{
                backgroundColor: 'var(--color-accent)',
                color: 'white',
                padding: '0.65rem 1.5rem',
                borderRadius: '25px',
                fontSize: '0.8rem',
                fontWeight: 600,
                marginTop: '0.5rem',
                boxShadow: 'var(--shadow-sm)',
                textDecoration: 'none',
                letterSpacing: '0.03em'
              }}
            >
              ⭐ {t('leaveReview')}
            </a>
          )}
          
          <div style={{ fontSize: '0.7rem', color: 'var(--color-text-secondary)', marginTop: '1rem' }}>
            © {new Date().getFullYear()} {settings.restaurantName}. GSTIN: {settings.gstin}
          </div>
        </div>
      </footer>

      {/* Bottom Nav */}
      <nav style={{ position: 'fixed', bottom: 0, left: 0, right: 0, backgroundColor: 'var(--color-bg)', borderTop: '1px solid #E0DCD3', display: 'flex', justifyItems: 'center', alignItems: 'center', zIndex: 50, height: '60px' }}>
        <div className="flex-1 flex flex-col justify-center items-center py-2" onClick={() => navigate('/app/menu')} style={{ cursor: 'pointer', color: isRoute('/menu') ? 'var(--color-accent)' : 'var(--color-text-secondary)', position: 'relative' }}>
          <BookOpen size={20} />
          <span style={{ fontSize: '0.65rem', marginTop: '4px', letterSpacing: '0.05em', fontWeight: 600 }}>{t('menu').toUpperCase()}</span>
          {isRoute('/menu') && <div style={{width: '30px', height: '2px', backgroundColor: 'var(--color-accent)', position: 'absolute', top: 0}}></div>}
        </div>
        <div className="flex-1 flex flex-col justify-center items-center py-2" onClick={() => navigate('/app/auth')} style={{ cursor: 'pointer', color: 'var(--color-text-secondary)' }}>
          <User size={20} />
          <span style={{ fontSize: '0.65rem', marginTop: '4px', letterSpacing: '0.05em', fontWeight: 600 }}>{t('reserve').toUpperCase()}</span>
        </div>
        <div className="flex-1 flex flex-col justify-center items-center py-2" onClick={() => navigate('/app/cart')} style={{ cursor: 'pointer', color: isRoute('/cart') ? 'var(--color-accent)' : 'var(--color-text-secondary)', position: 'relative' }}>
          <ShoppingBag size={20} />
          <span style={{ fontSize: '0.65rem', marginTop: '4px', letterSpacing: '0.05em', fontWeight: 600 }}>{t('bag').toUpperCase()}</span>
          {isRoute('/cart') && <div style={{width: '30px', height: '2px', backgroundColor: 'var(--color-accent)', position: 'absolute', top: 0}}></div>}
        </div>
        <div className="flex-1 flex flex-col justify-center items-center py-2" onClick={() => navigate('/app/auth')} style={{ cursor: 'pointer', color: isRoute('/auth') || isRoute('/t/') ? 'var(--color-accent)' : 'var(--color-text-secondary)', position: 'relative' }}>
          <User size={20} />
          <span style={{ fontSize: '0.65rem', marginTop: '4px', letterSpacing: '0.05em', fontWeight: 600 }}>{t('account').toUpperCase()}</span>
          {(isRoute('/auth') || isRoute('/t/')) && <div style={{width: '30px', height: '2px', backgroundColor: 'var(--color-accent)', position: 'absolute', top: 0}}></div>}
        </div>
      </nav>
    </div>
  );
}
