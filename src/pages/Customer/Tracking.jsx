import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext';
import { Clock, CheckCircle, BellRing, Utensils, Award, Printer, Star, Heart } from 'lucide-react';

const Tracking = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { db, callWaiter, settings, t, language } = useAppContext();
  
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

  const handlePrint = () => {
    window.print();
  };

  const getStatusStepIndex = (status) => {
    switch(status) {
      case 'Placed':
      case 'Pending': return 0;
      case 'Confirmed': return 1;
      case 'Preparing': return 2;
      case 'Ready': return 3;
      case 'Served': return 4;
      default: return 0;
    }
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'Placed':
      case 'Pending': return <Clock size={36} color="var(--color-text-secondary)" />;
      case 'Confirmed': return <CheckCircle size={36} color="var(--color-accent)" />;
      case 'Preparing': return <Utensils size={36} color="var(--color-accent)" />;
      case 'Ready': return <Award size={36} color="var(--color-green)" />;
      case 'Served': return <CheckCircle size={36} color="var(--color-green)" />;
      default: return <Clock size={36} color="var(--color-text-secondary)" />;
    }
  };

  const getStatusMessage = (status) => {
    switch(status) {
      case 'Placed':
      case 'Pending': return t('orderReceived');
      case 'Confirmed': return language === 'hi' ? 'ऑर्डर की पुष्टि हो गई है, जल्द ही तैयारी शुरू होगी।' : language === 'te' ? 'ఆర్డర్ నిర్ధారించబడింది, త్వరలో తయారీ ప్రారంభమవుతుంది.' : 'Order confirmed, preparing shortly.';
      case 'Preparing': return t('preparing');
      case 'Ready': return t('ready');
      case 'Served': return t('served');
      default: return "";
    }
  };

  const currentStep = getStatusStepIndex(order.status);
  const steps = [
    { label: language === 'hi' ? 'ऑर्डर भेजा' : language === 'te' ? 'ఆర్డర్ చేయబడింది' : 'Placed' },
    { label: language === 'hi' ? 'स्वीकृत' : language === 'te' ? 'నిర్ధారించబడింది' : 'Confirmed' },
    { label: language === 'hi' ? 'तैयारी' : language === 'te' ? 'తయారవుతోంది' : 'Preparing' },
    { label: language === 'hi' ? 'तैयार' : language === 'te' ? 'సిద్ధంగా ఉంది' : 'Ready' },
    { label: language === 'hi' ? 'परोसा गया' : language === 'te' ? 'వడ్డించబడింది' : 'Served' }
  ];

  // GST calculations for fallback if not saved in order document
  const orderSubtotal = order.subtotal !== undefined ? order.subtotal : order.totalAmount;
  const cgstRate = order.cgstRate !== undefined ? order.cgstRate : settings.cgstRate;
  const sgstRate = order.sgstRate !== undefined ? order.sgstRate : settings.sgstRate;
  const serviceChargeRate = order.serviceChargeRate !== undefined ? order.serviceChargeRate : settings.serviceChargeRate;
  const discount = order.discount !== undefined ? order.discount : 0;
  const taxableAmount = order.taxableAmount !== undefined ? order.taxableAmount : orderSubtotal;
  
  const cgstAmount = order.cgstAmount !== undefined ? order.cgstAmount : Math.round((taxableAmount * (cgstRate / 100)) * 100) / 100;
  const sgstAmount = order.sgstAmount !== undefined ? order.sgstAmount : Math.round((taxableAmount * (sgstRate / 100)) * 100) / 100;
  const serviceChargeAmount = order.serviceChargeAmount !== undefined ? order.serviceChargeAmount : Math.round((taxableAmount * (serviceChargeRate / 100)) * 100) / 100;
  const grandTotal = order.totalAmount;

  return (
    <div style={{ padding: '1rem', backgroundColor: 'var(--color-bg)', minHeight: '100vh', paddingBottom: '5rem' }}>
      
      {/* CSS print utility style overrides */}
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          body * {
            visibility: hidden;
            background-color: white !important;
          }
          #printable-invoice-card, #printable-invoice-card * {
            visibility: visible;
          }
          #printable-invoice-card {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            border: none !important;
            box-shadow: none !important;
            padding: 0 !important;
            margin: 0 !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}} />

      <div className="section-header no-print">
        <h2 className="section-title">{t('orderStatus')}</h2>
      </div>

      <div className="container" style={{ padding: 0 }}>
        
        {/* Status Status Indicator Panel */}
        <div className="card text-center flex-col items-center justify-center p-6 mb-4 border no-print" style={{ borderColor: '#EAEAEA', borderRadius: 'var(--border-radius-lg)', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ marginBottom: '1rem' }}>
            {getStatusIcon(order.status)}
          </div>
          <h2 style={{ margin: 0, fontFamily: 'var(--font-serif)', color: order.status === 'Ready' || order.status === 'Served' ? 'var(--color-green)' : 'var(--color-accent)', fontWeight: 700 }}>
            {order.status.toUpperCase()}
          </h2>
          <p style={{ color: 'var(--color-text-secondary)', marginTop: '0.5rem', fontStyle: 'italic', fontSize: '0.85rem' }}>
            {getStatusMessage(order.status)}
          </p>

          {/* Stepper Progress Bar */}
          <div style={{ display: 'flex', width: '100%', justifyContent: 'space-between', alignItems: 'center', marginTop: '2rem', position: 'relative' }}>
            {/* Background line */}
            <div style={{
              position: 'absolute',
              top: '12px',
              left: '5%',
              right: '5%',
              height: '4px',
              backgroundColor: '#EAEAEA',
              zIndex: 1
            }} />
            
            {/* Active Line */}
            <div style={{
              position: 'absolute',
              top: '12px',
              left: '5%',
              width: `${(currentStep / (steps.length - 1)) * 90}%`,
              height: '4px',
              backgroundColor: 'var(--color-accent)',
              zIndex: 2,
              transition: 'width 0.4s ease'
            }} />

            {/* Stepper Nodes */}
            {steps.map((step, idx) => {
              const isActive = idx <= currentStep;
              const isCurrent = idx === currentStep;
              return (
                <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 10, flex: 1 }}>
                  <div style={{
                    width: '26px',
                    height: '26px',
                    borderRadius: '50%',
                    backgroundColor: isCurrent ? 'var(--color-accent)' : isActive ? 'var(--color-accent-light)' : '#EAEAEA',
                    color: isActive ? 'white' : 'var(--color-text-secondary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.7rem',
                    fontWeight: 'bold',
                    border: isCurrent ? '3px solid white' : 'none',
                    boxShadow: isCurrent ? '0 0 0 2px var(--color-accent)' : 'none',
                    transition: 'all 0.3s ease'
                  }}>
                    {isActive ? '✓' : idx + 1}
                  </div>
                  <span style={{ 
                    fontSize: '0.65rem', 
                    marginTop: '8px', 
                    fontWeight: isActive ? 700 : 500,
                    color: isActive ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
                    textAlign: 'center',
                    lineHeight: 1.2
                  }}>
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* GST Compliant Bill/Tax Invoice Card */}
        <div id="printable-invoice-card" className="card mb-4" style={{ borderRadius: 'var(--border-radius-lg)', border: '1px solid #EAEAEA', padding: '1.5rem', boxShadow: 'var(--shadow-sm)', backgroundColor: 'white' }}>
          
          {/* Invoice Header */}
          <div style={{ textAlign: 'center', marginBottom: '1.5rem', borderBottom: '1px dashed #E0DCD3', paddingBottom: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <img src="/logo.png" alt="Logo" style={{ height: '32px', width: 'auto' }} />
              <h2 style={{ fontFamily: 'var(--font-serif)', margin: 0, fontSize: '1.3rem', fontWeight: 800 }}>{order.restaurantName || settings.restaurantName}</h2>
            </div>
            <p style={{ margin: '4px 0 0 0', fontSize: '0.75rem', color: 'var(--color-text-secondary)', lineHeight: 1.4 }}>
              {order.restaurantAddress || settings.restaurantAddress}<br/>
              Phone: {order.restaurantPhone || settings.restaurantPhone}
            </p>
            <h4 style={{ margin: '8px 0 0 0', letterSpacing: '0.05em', color: 'var(--color-text-primary)', fontSize: '0.85rem', textTransform: 'uppercase', fontWeight: 700 }}>
              {t('gstInvoice')}
            </h4>
          </div>

          {/* Invoice Metadata */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontSize: '0.8rem', color: 'var(--color-text-primary)', marginBottom: '1.25rem' }}>
            <div>
              <strong>{t('invoiceNo')}:</strong> {order.invoiceNumber || 'INV-TEMP-9999'}<br/>
              <strong>{t('date')}:</strong> {new Date(order.createdAt).toLocaleDateString()} {new Date(order.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
            </div>
            <div style={{ textAlign: 'right' }}>
              <strong>{t('table')}:</strong> T{order.tableId.replace('T', '')}<br/>
              <strong>GSTIN:</strong> {order.gstin || settings.gstin}<br/>
              <strong>Customer:</strong> {order.customerName || 'Guest'}
            </div>
          </div>

          {/* Itemized list */}
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', marginBottom: '1rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #E0DCD3', borderTop: '1px solid #E0DCD3', textTransform: 'uppercase', fontSize: '0.75rem', fontWeight: 700 }}>
                <th style={{ textAlign: 'left', padding: '6px 0' }}>Item Description</th>
                <th style={{ textAlign: 'center', padding: '6px 0', width: '50px' }}>Qty</th>
                <th style={{ textAlign: 'right', padding: '6px 0', width: '80px' }}>Rate</th>
                <th style={{ textAlign: 'right', padding: '6px 0', width: '80px' }}>Amt</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map(item => (
                <tr key={item.cartId} style={{ borderBottom: '1px solid #F6F5F0' }}>
                  <td style={{ padding: '8px 0', verticalAlign: 'top' }}>
                    <span style={{ fontWeight: 600 }}>{item.name}</span>
                    {item.customizations?.length > 0 && (
                      <div style={{ fontSize: '0.7rem', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
                        + {item.customizations.join(', ')}
                      </div>
                    )}
                    {item.specialInstructions && (
                      <div style={{ fontSize: '0.7rem', color: 'var(--color-accent)', fontStyle: 'italic', marginTop: '2px' }}>
                        * {item.specialInstructions}
                      </div>
                    )}
                  </td>
                  <td style={{ textAlign: 'center', padding: '8px 0', verticalAlign: 'top' }}>{item.quantity}</td>
                  <td style={{ textAlign: 'right', padding: '8px 0', verticalAlign: 'top' }}>₹{item.price}</td>
                  <td style={{ textAlign: 'right', padding: '8px 0', verticalAlign: 'top', fontWeight: 600 }}>₹{item.price * item.quantity}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Subtotal, tax and Grand Total calculations */}
          <div style={{ borderTop: '1px dashed #E0DCD3', paddingTop: '0.75rem', fontSize: '0.8rem', display: 'flex', flexDirection: 'column', gap: '0.4rem', borderBottom: '1px solid #000', paddingBottom: '0.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>{t('subtotal')}</span>
              <span>₹{orderSubtotal}</span>
            </div>
            {discount > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-green)' }}>
                <span>{t('discount')}</span>
                <span>-₹{discount}</span>
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>{t('taxableAmt')}</span>
              <span>₹{taxableAmount}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-text-secondary)' }}>
              <span>{t('cgst')} ({cgstRate}%)</span>
              <span>₹{cgstAmount.toFixed(2)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-text-secondary)' }}>
              <span>{t('sgst')} ({sgstRate}%)</span>
              <span>₹{sgstAmount.toFixed(2)}</span>
            </div>
            {serviceChargeRate > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-text-secondary)' }}>
                <span>{t('serviceCharge')} ({serviceChargeRate}%)</span>
                <span>₹{serviceChargeAmount.toFixed(2)}</span>
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--color-text-secondary)', fontStyle: 'italic', marginTop: '4px' }}>
              <span>{t('taxBreakup')}: CGST+SGST @ 5.0%</span>
              <span>Combined: ₹{(cgstAmount + sgstAmount).toFixed(2)}</span>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.75rem', fontSize: '1.05rem', fontWeight: 800 }}>
            <span>{t('grandTotal').toUpperCase()}</span>
            <span style={{ color: 'var(--color-accent)', fontSize: '1.2rem' }}>₹{grandTotal}</span>
          </div>

          <div style={{ marginTop: '1rem', borderTop: '1px solid #E0DCD3', paddingTop: '0.5rem', display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>
            <span>Mode: {order.paymentMode || 'Cash'}</span>
            <span style={{ color: order.paymentStatus === 'Paid' ? 'var(--color-green)' : 'var(--color-red)', fontWeight: 700 }}>
              Payment Status: {order.paymentStatus.toUpperCase()}
            </span>
          </div>
          
          <div style={{ textAlign: 'center', marginTop: '1rem', fontSize: '0.75rem', color: 'var(--color-text-secondary)', fontStyle: 'italic' }}>
             Thank you for dining at {order.restaurantName || settings.restaurantName}!
          </div>
        </div>

        {/* Action Panel: Call Waiter / Print / Google Review */}
        <div className="flex-col gap-2 no-print" style={{ display: 'flex', gap: '0.75rem' }}>
          
          {/* Google Reviews Promotion Block (visible when Ready or Served) */}
          {(order.status === 'Ready' || order.status === 'Served') && settings.showReviewCTA && (
            <div className="card text-center" style={{ 
              borderRadius: 'var(--border-radius-lg)', 
              border: '2px solid var(--color-accent)',
              backgroundColor: 'rgba(183, 137, 79, 0.03)',
              padding: '1.5rem',
              boxShadow: 'var(--shadow-sm)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '0.5rem',
              animation: 'pulse 2s infinite'
            }}>
              <div className="flex justify-center" style={{ color: 'var(--color-accent)', marginBottom: '0.25rem' }}>
                <Star size={24} fill="var(--color-accent)" />
                <Star size={24} fill="var(--color-accent)" />
                <Star size={24} fill="var(--color-accent)" />
                <Star size={24} fill="var(--color-accent)" />
                <Star size={24} fill="var(--color-accent)" />
              </div>
              <h3 style={{ margin: 0, fontFamily: 'var(--font-serif)', fontSize: '1.15rem' }}>
                {language === 'hi' ? 'भोजन पसंद आया? समीक्षा छोड़ें!' : language === 'te' ? 'భోజనం నచ్చిందా? రివ్యూ ఇవ్వండి!' : 'Enjoying L\'Artisan?'}
              </h3>
              <p style={{ margin: 0, color: 'var(--color-text-secondary)', fontSize: '0.8rem', lineHeight: 1.4 }}>
                {language === 'hi' ? 'गूगल पर हमारे काम को स्टार्स दें और हमारी मदद करें।' : language === 'te' ? 'గూగుల్‌లో మాకు స్టార్ రేటింగ్ ఇచ్చి మాకు సహాయం చేయండి.' : 'Leave us a 5-star Google Review and help us grow! Tap the button below.'}
              </p>
              <a 
                href={settings.googleReviewLink} 
                target="_blank" 
                rel="noopener noreferrer" 
                style={{
                  backgroundColor: 'var(--color-accent)',
                  color: 'white',
                  padding: '0.6rem 1.5rem',
                  borderRadius: '20px',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  marginTop: '0.5rem',
                  textDecoration: 'none',
                  boxShadow: 'var(--shadow-sm)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <Star size={14} fill="white" />
                {t('leaveReview')}
              </a>
            </div>
          )}

          {/* Assistant Action Buttons */}
          <div className="flex gap-3">
            <button 
              className="btn-primary flex-1 flex items-center justify-center gap-2" 
              style={{ backgroundColor: waiterCalled ? 'var(--color-green)' : 'var(--color-text-primary)' }}
              onClick={handleCallWaiter}
              disabled={waiterCalled}
            >
              <BellRing size={16} />
              <span>{waiterCalled ? t('waiterNotified') : t('requestAssistance')}</span>
            </button>

            <button 
              className="btn-success flex-1 flex items-center justify-center gap-2"
              onClick={handlePrint}
              style={{ backgroundColor: 'var(--color-accent)' }}
            >
              <Printer size={16} />
              <span>{t('printInvoice')}</span>
            </button>
          </div>

          <button 
            className="btn-primary" 
            style={{ backgroundColor: 'transparent', color: 'var(--color-text-secondary)', border: '1px solid #CCC', marginTop: '0.5rem' }}
            onClick={() => navigate('/app/menu')}
          >
            {t('backToMenu')}
          </button>

          {order.status === 'Served' && order.paymentStatus === 'Unpaid' && (
            <div className="text-center mt-3" style={{ padding: '0.5rem', borderRadius: '4px', backgroundColor: 'rgba(211, 47, 47, 0.05)', border: '1px solid rgba(211, 47, 47, 0.1)' }}>
              <p style={{ color: 'var(--color-red)', fontStyle: 'italic', fontSize: '0.8rem', margin: 0 }}>
                ⚠️ {t('paymentPending')}
              </p>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};

export default Tracking;
