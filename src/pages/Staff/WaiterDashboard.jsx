import React, { useEffect, useRef } from 'react';
import { useAppContext } from '../../context/AppContext';
import { LogOut, BellRing } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const WaiterDashboard = () => {
  const { db, updateOrderStatus, updateOrderPayment, dismissCall, logout } = useAppContext();
  const navigate = useNavigate();

  const orders = db.orders
    .filter(o => o.status === 'Ready' || (o.status === 'Served' && o.paymentStatus === 'Unpaid'))
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const calls = db.waiterCalls || [];
  const prevCallsRef = useRef(calls.length);

  const playSound = () => {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = 'sine';
    // Play a distinct high pitch alert beep
    osc.frequency.setValueAtTime(880, ctx.currentTime);
    gain.gain.setValueAtTime(1, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
    
    // Play another beep shortly after for extreme attention
    const osc2 = ctx.createOscillator();
    osc2.connect(gain);
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(1046, ctx.currentTime + 0.2); // C6
    
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.5);
    osc2.start(ctx.currentTime + 0.2);
    osc2.stop(ctx.currentTime + 0.7);
  };

  useEffect(() => {
    if (calls.length > prevCallsRef.current) {
      playSound();
    }
    prevCallsRef.current = calls.length;
  }, [calls]);

  const handleLogout = () => {
    logout();
    navigate('/app/auth');
  };

  return (
    <div style={{ backgroundColor: 'var(--color-bg)', minHeight: '100vh', padding: '2rem', position: 'relative' }}>
      <header className="flex justify-between items-center mb-6 border-b pb-4" style={{ borderColor: '#EAEAEA' }}>
        <h1 style={{ margin: 0, fontFamily: 'var(--font-serif)', letterSpacing: '0.05em' }}>Service Team</h1>
        <button className="flex items-center gap-2" style={{ color: 'var(--color-text-secondary)' }} onClick={handleLogout}>
          <LogOut size={18} /> Exit
        </button>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
        {orders.length === 0 && <p style={{ fontStyle: 'italic', color: 'var(--color-text-secondary)' }}>No active ready/unpaid orders.</p>}
        {orders.map(order => (
          <div key={order.id} className="card" style={{ 
            borderRadius: 'var(--border-radius-lg)', 
            borderTop: order.paymentStatus === 'Unpaid' ? '4px solid var(--color-red)' : '4px solid var(--color-green)',
            boxShadow: 'var(--shadow-sm)'
          }}>
            <div className="flex justify-between items-center mb-2">
              <h2 style={{ margin: 0, fontFamily: 'var(--font-sans)', fontSize: '1.25rem' }}>Table {order.tableId}</h2>
              <span style={{ 
                backgroundColor: order.status === 'Ready' ? 'rgba(183, 137, 79, 0.1)' : 'rgba(0,0,0,0.05)', 
                color: order.status === 'Ready' ? 'var(--color-accent)' : 'var(--color-text-secondary)',
                padding: '0.25rem 0.75rem', borderRadius: '4px', fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em'
              }}>
                {order.status}
              </span>
            </div>

            <div className="flex justify-between mb-3 pb-3 border-b" style={{ borderColor: '#EAEAEA' }}>
              <span style={{ color: 'var(--color-text-secondary)', fontSize: '0.85rem' }}>{new Date(order.createdAt).toLocaleTimeString()}</span>
              <span style={{ 
                color: order.paymentStatus === 'Paid' ? 'var(--color-green)' : 'var(--color-red)', 
                fontWeight: 600 
              }}>
                {order.paymentStatus} <span style={{ color: 'var(--color-text-primary)' }}>| ${order.totalAmount.toFixed(2)}</span>
              </span>
            </div>

            <ul style={{ listStyle: 'none', padding: 0, marginBottom: '1.5rem', minHeight: '80px', color: 'var(--color-text-primary)' }}>
              {order.items.map(item => (
                <li key={item.cartId} style={{ marginBottom: '0.25rem' }}>
                  {item.quantity}x {item.name}
                </li>
              ))}
            </ul>

            <div className="flex-col gap-2 relative z-10">
              {order.status === 'Ready' && (
                <button 
                  className="btn-primary" 
                  style={{ width: '100%', backgroundColor: 'var(--color-accent)' }}
                  onClick={() => updateOrderStatus(order.id, 'Served')}
                >
                  Confirm Served
                </button>
              )}
              {order.status === 'Served' && order.paymentStatus === 'Unpaid' && (
                <button 
                  className="btn-success" 
                  style={{ width: '100%', backgroundColor: 'var(--color-green)' }}
                  onClick={() => updateOrderPayment(order.id, 'Paid')}
                >
                  Collect Payment (Offline)
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Active Assistance Requests Pop-up Overlay */}
      {calls.length > 0 && (
        <div style={{ position: 'fixed', bottom: '2rem', right: '2rem', zIndex: 100, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {calls.map(call => (
             <div key={call.id} className="card" style={{ backgroundColor: 'var(--color-text-primary)', color: 'white', padding: '1.5rem', boxShadow: 'var(--shadow-md)', borderRadius: 'var(--border-radius-lg)', minWidth: '300px', borderLeft: '6px solid var(--color-accent)' }}>
                <div className="flex items-center gap-2 mb-2" style={{ color: 'var(--color-accent)' }}>
                  <BellRing size={20} />
                  <h3 style={{ margin: 0, fontFamily: 'var(--font-serif)', color: 'var(--color-accent)' }}>Assistance Required</h3>
                </div>
                <p style={{ marginTop: '0', fontSize: '1.1rem' }}>Customer at <strong>Table {call.tableId}</strong> has requested a waiter.</p>
                <div className="flex justify-between" style={{ marginTop: '1rem' }}>
                   <span style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', alignSelf: 'flex-end' }}>
                     {new Date(call.timestamp).toLocaleTimeString()}
                   </span>
                   <button className="btn-primary" style={{ width: 'auto', backgroundColor: '#FFFFFF', color: 'var(--color-text-primary)', padding: '0.5rem 1rem' }} onClick={() => dismissCall(call.id)}>
                     Acknowledge
                   </button>
                </div>
             </div>
          ))}
        </div>
      )}

    </div>
  );
};

export default WaiterDashboard;
