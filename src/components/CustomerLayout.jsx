import React from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Menu as MenuIcon, User, ShoppingBag, BookOpen } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

export default function CustomerLayout() {
  const { cart } = useAppContext();
  const navigate = useNavigate();
  const location = useLocation();

  const isRoute = (path) => location.pathname.includes(path);

  return (
    <div style={{ backgroundColor: 'var(--color-bg)', minHeight: '100vh', paddingBottom: '70px', position: 'relative' }}>
      {/* Top Header */}
      <header className="flex justify-between items-center" style={{ padding: '1rem', position: 'sticky', top: 0, backgroundColor: 'var(--color-bg)', zIndex: 50 }}>
        <MenuIcon size={24} style={{ cursor: 'pointer', color: 'var(--color-text-primary)' }} />
        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.5rem', letterSpacing: '0.1em', margin: 0, textTransform: 'uppercase' }}>
          L'ARTISAN
        </h1>
        <div style={{ position: 'relative', cursor: 'pointer' }} onClick={() => navigate('/app/cart')}>
          <ShoppingBag size={24} style={{ color: 'var(--color-text-primary)' }} />
          {cart.length > 0 && (
            <span style={{ position: 'absolute', top: '-4px', right: '-4px', backgroundColor: 'var(--color-accent)', color: 'white', borderRadius: '50%', width: '16px', height: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 'bold' }}>
              {cart.length}
            </span>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main>
        <Outlet />
      </main>

      {/* Bottom Nav */}
      <nav style={{ position: 'fixed', bottom: 0, left: 0, right: 0, backgroundColor: 'var(--color-bg)', borderTop: '1px solid #E0DCD3', display: 'flex', justifyItems: 'center', alignItems: 'center', zIndex: 50 }}>
        <div className="flex-1 flex flex-col justify-center items-center py-3" onClick={() => navigate('/app/menu')} style={{ cursor: 'pointer', color: isRoute('/menu') ? 'var(--color-accent)' : 'var(--color-text-secondary)' }}>
          <BookOpen size={20} />
          <span style={{ fontSize: '0.65rem', marginTop: '6px', letterSpacing: '0.05em', fontWeight: 500 }}>MENU</span>
          {isRoute('/menu') && <div style={{width: '30px', height: '2px', backgroundColor: 'var(--color-accent)', position: 'absolute', top: 0}}></div>}
        </div>
        <div className="flex-1 flex flex-col justify-center items-center py-3" onClick={() => {}} style={{ cursor: 'pointer', color: 'var(--color-text-secondary)' }}>
          <User size={20} />
          <span style={{ fontSize: '0.65rem', marginTop: '6px', letterSpacing: '0.05em', fontWeight: 500 }}>RESERVE</span>
        </div>
        <div className="flex-1 flex flex-col justify-center items-center py-3" onClick={() => navigate('/app/cart')} style={{ cursor: 'pointer', color: isRoute('/cart') ? 'var(--color-accent)' : 'var(--color-text-secondary)' }}>
          <ShoppingBag size={20} />
          <span style={{ fontSize: '0.65rem', marginTop: '6px', letterSpacing: '0.05em', fontWeight: 500 }}>BAG</span>
          {isRoute('/cart') && <div style={{width: '30px', height: '2px', backgroundColor: 'var(--color-accent)', position: 'absolute', top: 0}}></div>}
        </div>
        <div className="flex-1 flex flex-col justify-center items-center py-3" onClick={() => navigate('/app/auth')} style={{ cursor: 'pointer', color: isRoute('/auth') || isRoute('/t/') ? 'var(--color-accent)' : 'var(--color-text-secondary)' }}>
          <User size={20} />
          <span style={{ fontSize: '0.65rem', marginTop: '6px', letterSpacing: '0.05em', fontWeight: 500 }}>ACCOUNT</span>
          {(isRoute('/auth') || isRoute('/t/')) && <div style={{width: '30px', height: '2px', backgroundColor: 'var(--color-accent)', position: 'absolute', top: 0}}></div>}
        </div>
      </nav>
    </div>
  );
}
