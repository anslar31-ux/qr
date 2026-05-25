import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext';

const Landing = () => {
  const { tableId } = useParams();
  const navigate = useNavigate();
  const { db, user, loading } = useAppContext();
  const [error, setError] = useState('');

  useEffect(() => {
    if (loading) return; // Wait until RxDB is fully initialized and seeded

    const table = db.tables.find(t => t.id === tableId);
    if (!table) {
      setError('Invalid Table Code Scanned.');
      return;
    }
    
    setError(''); // Clear error if table is valid
    sessionStorage.setItem('currentTable', tableId);

    const timer = setTimeout(() => {
      if (user) navigate('/app/menu');
      else navigate('/app/auth');
    }, 2000);

    return () => clearTimeout(timer);
  }, [tableId, db, user, navigate, loading]);

  return (
    <div className="container flex-col items-center justify-center text-center" style={{ minHeight: 'calc(100vh - 150px)', display: 'flex' }}>
      <img src="/logo.png" alt="L'Artisan" width="120" style={{ marginBottom: '2rem' }} />
      <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.5rem', letterSpacing: '0.05em', lineHeight: 1.2 }}>
        L'ARTISAN
      </h1>
      <h2 style={{ fontSize: '1.1rem', fontWeight: 400, color: 'var(--color-text-secondary)', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '1.5rem', marginTop: '0.5rem' }}>
        The Cafe
      </h2>
      
      {loading ? (
        <p style={{ fontStyle: 'italic', color: 'var(--color-text-secondary)' }}>Connecting to L'Artisan...</p>
      ) : error ? (
        <p style={{ color: 'var(--color-red)' }}>{error}</p>
      ) : (
        <p style={{ fontStyle: 'italic', color: 'var(--color-accent)' }}>Preparing your seat at Table {tableId}...</p>
      )}
    </div>
  );
};

export default Landing;
