import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext';
import { Clock, CheckCircle, BellRing, Utensils } from 'lucide-react';

const Tracking = () => {
  const { orderId } = useParams();
  const { db, callWaiter } = useAppContext();
  
  const [order, setOrder] = useState(null);
  const [waiterCalled, setWaiterCalled] = useState(false);

  useEffect(() => {
    const found = db.orders.find(o => o.id === orderId);
    if(found) setOrder(found);
  }, [orderId, db]);

  if (!order) return <div className="p-4 text-center">Loading order details...</div>;

  const handleCallWaiter = () => {
    setWaiterCalled(true);
    callWaiter(order.tableId, order.id);
    setTimeout(() => setWaiterCalled(false), 30000); // 30s cooldown
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'Pending': return <Clock size={40} color="var(--color-text-secondary)" />;
      case 'Preparing': return <Utensils size={40} color="var(--color-accent)" />;
      case 'Ready': return <CheckCircle size={40} color="var(--color-green)" />;
      case 'Served': return <CheckCircle size={40} color="var(--color-green)" />;
      default: return <Clock size={40} color="var(--color-text-secondary)" />;
    }
  };

  const getStatusMessage = (status) => {
    switch(status) {
      case 'Pending': return "Order received, waiting for kitchen.";
      case 'Preparing': return "Kitchen is crafting your order.";
      case 'Ready': return "Your order is ready to be served.";
      case 'Served': return "Served! Please enjoy.";
      default: return "";
    }
  };

  return (
    <div style={{ padding: '1rem' }}>
      <div className="section-header">
        <h2 className="section-title">Order Status</h2>
      </div>

      <div className="container" style={{ padding: 0 }}>
        <div className="card text-center flex-col items-center justify-center p-8 mb-4 border" style={{ borderColor: '#EAEAEA', borderRadius: 'var(--border-radius-lg)', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ marginBottom: '1.5rem' }}>
            {getStatusIcon(order.status)}
          </div>
          <h2 style={{ margin: 0, fontFamily: 'var(--font-serif)', color: order.status === 'Ready' || order.status === 'Served' ? 'var(--color-green)' : 'var(--color-accent)' }}>
            {order.status.toUpperCase()}
          </h2>
          <p style={{ color: 'var(--color-text-secondary)', marginTop: '0.75rem', fontStyle: 'italic' }}>
            {getStatusMessage(order.status)}
          </p>
        </div>

        <div className="card mb-4" style={{ borderRadius: 'var(--border-radius-lg)' }}>
          <h3 style={{ borderBottom: '1px solid #EAEAEA', paddingBottom: '0.75rem', marginBottom: '1rem', fontFamily: 'var(--font-serif)' }}>Order Details</h3>
          {order.items.map(item => (
            <div key={item.cartId} className="flex justify-between mb-3">
              <span style={{ color: 'var(--color-text-primary)' }}>{item.quantity}x {item.name}</span>
              <span style={{ fontWeight: 500 }}>${(item.price * item.quantity).toFixed(2)}</span>
            </div>
          ))}
          <div className="flex justify-between mt-4 border-t pt-4" style={{ borderTop: '1px dashed #CCC' }}>
            <strong style={{ letterSpacing: '0.05em' }}>TOTAL</strong>
            <strong style={{ color: 'var(--color-accent)', fontSize: '1.1rem' }}>${order.totalAmount.toFixed(2)}</strong>
          </div>
        </div>

        <button 
          className="btn-primary flex items-center justify-center gap-2 mt-4" 
          style={{ backgroundColor: waiterCalled ? 'var(--color-green)' : 'var(--color-text-primary)' }}
          onClick={handleCallWaiter}
          disabled={waiterCalled}
        >
          <BellRing size={18} />
          <span>{waiterCalled ? 'Waiter Notified' : 'Request Assistance'}</span>
        </button>

        {order.status === 'Served' && order.paymentStatus === 'Unpaid' && (
          <div className="text-center mt-6">
            <p style={{ color: 'var(--color-text-secondary)', fontStyle: 'italic', fontSize: '0.9rem' }}>Please complete your payment before leaving.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Tracking;
