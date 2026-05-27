import React, { useEffect, useRef, useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { LogOut, BellRing, Check, IndianRupee, FileText, X, Printer } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const WaiterDashboard = () => {
  const { db, updateOrderStatus, updateOrderPayment, dismissCall, logout, settings } = useAppContext();
  const navigate = useNavigate();
  
  const [selectedInvoiceOrder, setSelectedInvoiceOrder] = useState(null); // For viewing and printing invoice slips

  const orders = db.orders
    .filter(o => o.status === 'Ready' || (o.status === 'Served' && o.paymentStatus === 'Unpaid'))
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const calls = db.waiterCalls || [];
  const prevCallsRef = useRef(calls.length);

  const playSound = () => {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      gain.gain.setValueAtTime(1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
      
      const osc2 = ctx.createOscillator();
      osc2.connect(gain);
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(1046, ctx.currentTime + 0.2); // C6
      
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.5);
      osc2.start(ctx.currentTime + 0.2);
      osc2.stop(ctx.currentTime + 0.7);
    } catch (err) {
      console.warn("Audio Context beep error:", err);
    }
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

  // Helper for Veg/Non-Veg indicators
  const renderVegIndicator = (itemId) => {
    const item = db.menuItems.find(m => m.id === itemId);
    if (!item) return null;
    const color = item.isVeg ? 'var(--color-green)' : 'var(--color-red)';
    return (
      <div style={{ 
        width: '10px', 
        height: '10px', 
        border: `1.5px solid ${color}`, 
        padding: '1px', 
        display: 'inline-flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        marginRight: '6px',
        verticalAlign: 'middle',
        backgroundColor: 'white'
      }}>
        {item.isVeg ? (
          <div style={{ width: '3px', height: '3px', borderRadius: '50%', backgroundColor: color }} />
        ) : (
          <div style={{ 
            width: 0, 
            height: 0, 
            borderLeft: '2.5px solid transparent', 
            borderRight: '2.5px solid transparent', 
            borderBottom: `4.5px solid ${color}` 
          }} />
        )}
      </div>
    );
  };

  // Helper to show spice levels
  const renderSpiciness = (itemId) => {
    const item = db.menuItems.find(m => m.id === itemId);
    if (!item || !item.isSpicy) return null;
    return <span style={{ fontSize: '0.75rem', marginLeft: '4px' }}>{'🌶️'.repeat(item.isSpicy)}</span>;
  };

  return (
    <div style={{ backgroundColor: 'var(--color-bg)', minHeight: '100vh', padding: '2rem', position: 'relative' }}>
      <header className="flex justify-between items-center mb-6 border-b pb-4" style={{ borderColor: '#EAEAEA' }}>
        <div className="flex items-center gap-3">
          <img src="/logo.png" alt="Logo" style={{ height: '40px', width: 'auto' }} />
          <div>
            <h1 style={{ margin: 0, fontFamily: 'var(--font-serif)', letterSpacing: '0.05em', fontSize: '1.5rem', fontWeight: 800 }}>
              {settings.restaurantName}
            </h1>
            <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--color-text-secondary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Service Team Dashboard
            </p>
          </div>
        </div>
        <button className="flex items-center gap-2" style={{ color: 'var(--color-text-secondary)', fontWeight: 600 }} onClick={handleLogout}>
          <LogOut size={18} /> Exit
        </button>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
        {orders.length === 0 && <p style={{ fontStyle: 'italic', color: 'var(--color-text-secondary)' }}>No active ready/unpaid orders.</p>}
        {orders.map(order => (
          <div key={order.id} className="card" style={{ 
            borderRadius: 'var(--border-radius-lg)', 
            borderTop: order.paymentStatus === 'Unpaid' && order.status === 'Served' ? '4px solid var(--color-red)' : '4px solid var(--color-green)',
            boxShadow: 'var(--shadow-sm)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}>
            <div>
              <div className="flex justify-between items-center mb-2">
                <h2 style={{ margin: 0, fontFamily: 'var(--font-sans)', fontSize: '1.25rem', fontWeight: 700 }}>Table {order.tableId}</h2>
                <span style={{ 
                  backgroundColor: order.status === 'Ready' ? 'rgba(183, 137, 79, 0.1)' : 'rgba(0,0,0,0.05)', 
                  color: order.status === 'Ready' ? 'var(--color-accent)' : 'var(--color-text-secondary)',
                  padding: '0.25rem 0.75rem', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em'
                }}>
                  {order.status}
                </span>
              </div>

              <div className="flex justify-between mb-3 pb-3 border-b" style={{ borderColor: '#EAEAEA' }}>
                <span style={{ color: 'var(--color-text-secondary)', fontSize: '0.8rem', fontWeight: 500 }}>
                  {new Date(order.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                </span>
                <span style={{ 
                  color: order.paymentStatus === 'Paid' ? 'var(--color-green)' : 'var(--color-red)', 
                  fontWeight: 700,
                  fontSize: '0.9rem'
                }}>
                  {order.paymentStatus} <span style={{ color: 'var(--color-text-primary)' }}>| ₹{order.totalAmount}</span>
                </span>
              </div>

              <ul style={{ listStyle: 'none', padding: 0, marginBottom: '1.5rem', minHeight: '80px', color: 'var(--color-text-primary)', fontSize: '0.9rem' }}>
                {order.items.map(item => (
                  <li key={item.cartId} style={{ marginBottom: '0.4rem', borderBottom: '1px solid #FAF9F6', paddingBottom: '2px' }}>
                    {renderVegIndicator(item.id)}
                    <strong>{item.quantity}x {item.name}</strong>
                    {renderSpiciness(item.id)}
                    {item.customizations?.length > 0 && (
                      <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', marginLeft: '6px' }}>({item.customizations.join(', ')})</span>
                    )}
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex-col gap-2 relative z-10" style={{ display: 'flex', gap: '0.5rem' }}>
              <button 
                className="btn-primary flex items-center justify-center gap-1"
                style={{ width: '100%', backgroundColor: 'var(--color-accent)', padding: '0.55rem', fontSize: '0.85rem' }}
                onClick={() => setSelectedInvoiceOrder(order)}
              >
                <FileText size={14} /> View GST Bill
              </button>
              
              {order.status === 'Ready' && (
                <button 
                  className="btn-success" 
                  style={{ width: '100%', backgroundColor: 'var(--color-green)', padding: '0.55rem', fontSize: '0.85rem' }}
                  onClick={() => updateOrderStatus(order.id, 'Served')}
                >
                  Confirm Served
                </button>
              )}
              {order.status === 'Served' && order.paymentStatus === 'Unpaid' && (
                <button 
                  className="btn-success" 
                  style={{ width: '100%', backgroundColor: 'var(--color-green)', padding: '0.55rem', fontSize: '0.85rem' }}
                  onClick={() => updateOrderPayment(order.id, 'Paid')}
                >
                  Collect Cash/UPI (Paid)
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
                     {new Date(call.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                   </span>
                   <button className="btn-primary" style={{ width: 'auto', backgroundColor: '#FFFFFF', color: 'var(--color-text-primary)', padding: '0.5rem 1rem' }} onClick={() => dismissCall(call.id)}>
                     Acknowledge
                   </button>
                </div>
             </div>
          ))}
        </div>
      )}

      {/* MODAL: View and Print GST Tax Invoice */}
      {selectedInvoiceOrder && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="card" style={{ width: '400px', padding: '1.5rem', borderRadius: 'var(--border-radius-lg)', backgroundColor: '#FFFFFF', maxHeight: '90vh', overflowY: 'auto', position: 'relative' }}>
            <button 
              onClick={() => setSelectedInvoiceOrder(null)} 
              style={{ position: 'absolute', top: '1rem', right: '1rem', color: 'var(--color-text-secondary)', cursor: 'pointer' }}
            >
              <X size={20} />
            </button>
            
            {/* Printable Frame wrapper */}
            <div id="waiter-receipt-view" style={{ padding: '0.25rem' }}>
              <div style={{ textAlign: 'center', marginBottom: '1.25rem', borderBottom: '1px dashed #CCC', paddingBottom: '0.75rem' }}>
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
                  <img src="/logo.png" alt="Logo" style={{ height: '28px', width: 'auto' }} />
                  <h3 style={{ fontFamily: 'var(--font-serif)', margin: 0, fontSize: '1.2rem', fontWeight: 800 }}>
                    {selectedInvoiceOrder.restaurantName || settings.restaurantName}
                  </h3>
                </div>
                <p style={{ margin: 0, fontSize: '0.7rem', color: 'var(--color-text-secondary)', lineHeight: 1.3 }}>
                  {selectedInvoiceOrder.restaurantAddress || settings.restaurantAddress}<br/>
                  Phone: {selectedInvoiceOrder.restaurantPhone || settings.restaurantPhone}
                </p>
                <h4 style={{ margin: '6px 0 0 0', color: 'var(--color-text-primary)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700 }}>
                  GST Tax Invoice
                </h4>
              </div>

              {/* Meta */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.25rem', fontSize: '0.75rem', marginBottom: '1rem' }}>
                <div>
                  <strong>Invoice No:</strong> {selectedInvoiceOrder.invoiceNumber || 'N/A'}<br/>
                  <strong>Date:</strong> {new Date(selectedInvoiceOrder.createdAt).toLocaleDateString()} {new Date(selectedInvoiceOrder.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                </div>
                <div style={{ textAlign: 'right' }}>
                  <strong>Table:</strong> T{selectedInvoiceOrder.tableId.replace('T', '')}<br/>
                  <strong>GSTIN:</strong> {selectedInvoiceOrder.gstin || settings.gstin}<br/>
                  <strong>Cust Name:</strong> {selectedInvoiceOrder.customerName || 'Guest'}
                </div>
              </div>

              {/* Items */}
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem', marginBottom: '0.75rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #CCC', borderTop: '1px solid #CCC', textTransform: 'uppercase', fontSize: '0.7rem', fontWeight: 700 }}>
                    <th style={{ textAlign: 'left', padding: '4px 0' }}>Item</th>
                    <th style={{ textAlign: 'center', padding: '4px 0', width: '40px' }}>Qty</th>
                    <th style={{ textAlign: 'right', padding: '4px 0', width: '60px' }}>Rate</th>
                    <th style={{ textAlign: 'right', padding: '4px 0', width: '60px' }}>Amt</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedInvoiceOrder.items?.map(item => (
                    <tr key={item.cartId} style={{ borderBottom: '1px solid #F2F1EC' }}>
                      <td style={{ padding: '6px 0' }}>
                        <span style={{ fontWeight: 600 }}>{item.name}</span>
                      </td>
                      <td style={{ textAlign: 'center', padding: '6px 0' }}>{item.quantity}</td>
                      <td style={{ textAlign: 'right', padding: '6px 0' }}>₹{item.price}</td>
                      <td style={{ textAlign: 'right', padding: '6px 0', fontWeight: 600 }}>₹{item.price * item.quantity}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Summary */}
              <div style={{ borderTop: '1px dashed #CCC', paddingTop: '0.5rem', fontSize: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.3rem', borderBottom: '1px solid #000', paddingBottom: '0.5rem' }}>
                <div style={{ display: 'flex', justifyItems: 'space-between', justifyContent: 'space-between' }}>
                  <span>Subtotal</span>
                  <span>₹{selectedInvoiceOrder.subtotal !== undefined ? selectedInvoiceOrder.subtotal : selectedInvoiceOrder.totalAmount}</span>
                </div>
                {selectedInvoiceOrder.discount > 0 && (
                  <div style={{ display: 'flex', justifyItems: 'space-between', justifyContent: 'space-between', color: 'var(--color-green)' }}>
                    <span>Discount</span>
                    <span>-₹{selectedInvoiceOrder.discount}</span>
                  </div>
                )}
                <div style={{ display: 'flex', justifyItems: 'space-between', justifyContent: 'space-between', color: 'var(--color-text-secondary)' }}>
                  <span>CGST ({selectedInvoiceOrder.cgstRate !== undefined ? selectedInvoiceOrder.cgstRate : 2.5}%)</span>
                  <span>₹{(selectedInvoiceOrder.cgstAmount !== undefined ? selectedInvoiceOrder.cgstAmount : 0).toFixed(2)}</span>
                </div>
                <div style={{ display: 'flex', justifyItems: 'space-between', justifyContent: 'space-between', color: 'var(--color-text-secondary)' }}>
                  <span>SGST ({selectedInvoiceOrder.sgstRate !== undefined ? selectedInvoiceOrder.sgstRate : 2.5}%)</span>
                  <span>₹{(selectedInvoiceOrder.sgstAmount !== undefined ? selectedInvoiceOrder.sgstAmount : 0).toFixed(2)}</span>
                </div>
                {selectedInvoiceOrder.serviceChargeRate > 0 && (
                  <div style={{ display: 'flex', justifyItems: 'space-between', justifyContent: 'space-between', color: 'var(--color-text-secondary)' }}>
                    <span>Service Charge ({selectedInvoiceOrder.serviceChargeRate !== undefined ? selectedInvoiceOrder.serviceChargeRate : 5.0}%)</span>
                    <span>₹{(selectedInvoiceOrder.serviceChargeAmount !== undefined ? selectedInvoiceOrder.serviceChargeAmount : 0).toFixed(2)}</span>
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.5rem', fontSize: '1.05rem', fontWeight: 800 }}>
                <span>GRAND TOTAL</span>
                <span style={{ color: 'var(--color-accent)' }}>₹{selectedInvoiceOrder.totalAmount}</span>
              </div>
              
              <div style={{ marginTop: '0.5rem', fontSize: '0.7rem', color: 'var(--color-text-secondary)', display: 'flex', justifyContent: 'space-between' }}>
                <span>Mode: {selectedInvoiceOrder.paymentMode || 'Cash'}</span>
                <span>Payment: {selectedInvoiceOrder.paymentStatus.toUpperCase()}</span>
              </div>
            </div>

            {/* Print trigger */}
            <div className="flex gap-4 mt-6">
              <button 
                type="button" 
                className="btn-success flex items-center justify-center gap-2" 
                style={{ flex: 1, backgroundColor: 'var(--color-accent)' }}
                onClick={() => {
                  const printContents = document.getElementById('waiter-receipt-view').innerHTML;
                  const originalContents = document.body.innerHTML;
                  document.body.innerHTML = `<div style="padding:2rem; background:white;">${printContents}</div>`;
                  window.print();
                  window.location.reload();
                }}
              >
                <Printer size={16} />
                Print Bill
              </button>
              <button type="button" className="btn-secondary" style={{ flex: 1 }} onClick={() => setSelectedInvoiceOrder(null)}>
                Close
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default WaiterDashboard;
