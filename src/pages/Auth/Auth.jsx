import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext';

const Auth = () => {
  const { login, user } = useAppContext();
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  if (user) {
    navigate('/app/menu');
    return null;
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isLogin) {
      const success = login(email, password);
      if (success) {
        const dbStr = localStorage.getItem('qr_cafe_db');
        if (dbStr) {
           const currentUser = JSON.parse(dbStr).users.find(u => u.email === email);
           if(currentUser.role === 'customer' || !currentUser.role) navigate('/app/menu');
           else if(currentUser.role === 'kitchen') navigate('/staff/kitchen');
           else if(currentUser.role === 'waiter') navigate('/staff/waiter');
           else if(currentUser.role === 'owner') navigate('/admin/dashboard');
        }
      } else {
        setError('Invalid credentials');
      }
    } else {
      const dbStr = localStorage.getItem('qr_cafe_db');
      if (dbStr) {
        const db = JSON.parse(dbStr);
        const newUser = { id: `u_${Date.now()}`, name: email.split('@')[0], email, password, role: 'customer' };
        db.users.push(newUser);
        localStorage.setItem('qr_cafe_db', JSON.stringify(db));
        login(email, password);
        navigate('/app/menu');
      }
    }
  };

  return (
    <div className="container flex-col items-center justify-center" style={{ minHeight: 'calc(100vh - 150px)', display: 'flex' }}>
      <div className="card" style={{ width: '100%', maxWidth: '400px', padding: '2rem', textAlign: 'center' }}>
        <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '2rem', marginBottom: '1.5rem', fontWeight: 600 }}>
          {isLogin ? 'Welcome Back' : 'Create Account'}
        </h2>
        {error && <p style={{ color: 'var(--color-red)', marginBottom: '1rem' }}>{error}</p>}
        <form onSubmit={handleSubmit} className="flex-col" style={{ gap: '1rem' }}>
          <input 
            type="email" 
            className="input" 
            placeholder="Email address" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required 
            style={{ marginBottom: 0 }}
          />
          <input 
            type="password" 
            className="input" 
            placeholder="Password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required 
            style={{ marginBottom: 0 }}
          />
          <button type="submit" className="btn-primary" style={{ marginTop: '0.5rem', backgroundColor: 'var(--color-text-primary)' }}>
            {isLogin ? 'Sign In' : 'Sign Up'}
          </button>
        </form>
        <p className="mt-4" style={{ cursor: 'pointer', color: 'var(--color-accent)', fontSize: '0.9rem', fontWeight: 500, letterSpacing: '0.05em' }} onClick={() => setIsLogin(!isLogin)}>
          {isLogin ? "DON'T HAVE AN ACCOUNT? SIGN UP" : "ALREADY HAVE AN ACCOUNT? LOG IN"}
        </p>
      </div>
    </div>
  );
};

export default Auth;
