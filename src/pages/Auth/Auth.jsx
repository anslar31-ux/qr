import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext';

const Auth = () => {
  const { login, signup, user } = useAppContext();
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [error, setError] = useState('');

  if (user) {
    navigate('/app/menu');
    return null;
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!agreed) {
      setError('You must agree to the Privacy Policy to continue.');
      return;
    }

    if (isLogin) {
      const u = login(email, password);
      if (u) {
        if(u.role === 'customer' || !u.role) navigate('/app/menu');
        else if(u.role === 'kitchen') navigate('/staff/kitchen');
        else if(u.role === 'waiter') navigate('/staff/waiter');
        else if(u.role === 'owner') navigate('/admin/dashboard');
      } else {
        setError('Invalid credentials');
      }
    } else {
      const result = signup(name || email.split('@')[0], email, password);
      if (result.error) {
        setError(result.error);
      } else {
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
        {error && <p style={{ color: 'var(--color-red)', marginBottom: '1rem', fontSize: '0.9rem' }}>{error}</p>}
        <form onSubmit={handleSubmit} className="flex-col" style={{ gap: '1rem', textAlign: 'left' }}>
          {!isLogin && (
            <input 
              type="text" 
              className="input" 
              placeholder="Full Name" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              required={!isLogin} 
              style={{ marginBottom: 0 }}
            />
          )}
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
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--color-text-secondary)', cursor: 'pointer' }}>
            <input 
              type="checkbox" 
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              required
              style={{ accentColor: 'var(--color-accent)', width: '16px', height: '16px' }}
            />
            <span>I agree to the Privacy & Policy</span>
          </label>
          <button type="submit" className="btn-primary" style={{ marginTop: '0.5rem', backgroundColor: 'var(--color-text-primary)' }}>
            {isLogin ? 'Sign In' : 'Sign Up'}
          </button>
        </form>
        <p className="mt-4" style={{ cursor: 'pointer', color: 'var(--color-accent)', fontSize: '0.9rem', fontWeight: 500, letterSpacing: '0.05em' }} onClick={() => { setIsLogin(!isLogin); setError(''); }}>
          {isLogin ? "DON'T HAVE AN ACCOUNT? SIGN UP" : "ALREADY HAVE AN ACCOUNT? LOG IN"}
        </p>
      </div>
    </div>
  );
};

export default Auth;
