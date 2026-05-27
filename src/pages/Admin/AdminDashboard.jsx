import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { LogOut, LayoutDashboard, Coffee, Users, ScrollText, Plus, Download, Settings, FileText, X, Printer, ThumbsUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
  const { db, logout, addMenuItem, toggleMenuItemAvailability, settings, updateSettings } = useAppContext();
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState('analytics');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedInvoiceOrder, setSelectedInvoiceOrder] = useState(null); // For previewing GST Invoices
  
  const [newDish, setNewDish] = useState({
    name: '',
    name_hi: '',
    name_te: '',
    categoryId: '',
    price: '',
    description: '',
    description_hi: '',
    description_te: '',
    imageUrl: '',
    customizationOptions: '',
    isVeg: true,
    isSpicy: '0',
    portionInfo: 'Serves 1-2',
    upsellIds: ''
  });

  // Settings form state
  const [settingsForm, setSettingsForm] = useState({
    restaurantName: settings.restaurantName,
    restaurantAddress: settings.restaurantAddress,
    restaurantPhone: settings.restaurantPhone,
    gstin: settings.gstin,
    cgstRate: settings.cgstRate,
    sgstRate: settings.sgstRate,
    serviceChargeRate: settings.serviceChargeRate,
    showWifiQR: settings.showWifiQR,
    wifiSSID: settings.wifiSSID,
    wifiPassword: settings.wifiPassword,
    wifiEncryption: settings.wifiEncryption,
    showReviewCTA: settings.showReviewCTA,
    googleReviewLink: settings.googleReviewLink,
  });

  const handleLogout = () => {
    logout();
    navigate('/app/auth');
  };

  const paidOrders = db.orders.filter(o => o.paymentStatus === 'Paid');
  const revenue = paidOrders.reduce((sum, o) => sum + o.totalAmount, 0);

  const toggleAvailability = (itemId) => {
    toggleMenuItemAvailability(itemId);
  };

  // Calculate best-selling dishes
  const itemCounts = {};
  db.orders.forEach(o => {
    o.items?.forEach(item => {
      itemCounts[item.name] = (itemCounts[item.name] || 0) + item.quantity;
    });
  });
  const bestSellers = Object.keys(itemCounts)
    .map(name => ({ name, count: itemCounts[name] }))
    .sort((a,b) => b.count - a.count)
    .slice(0, 3);

  const handleSaveSettings = (e) => {
    e.preventDefault();
    updateSettings({
      ...settingsForm,
      cgstRate: Number(settingsForm.cgstRate),
      sgstRate: Number(settingsForm.sgstRate),
      serviceChargeRate: Number(settingsForm.serviceChargeRate),
    });
    alert("Settings updated successfully and synchronized across devices!");
  };

  const exportToExcel = () => {
    const completedOrders = db.orders.filter(o => o.status === 'Served' && o.paymentStatus === 'Paid');
    if (completedOrders.length === 0) {
      alert("No completed orders to export.");
      return;
    }

    const headers = ["S.No", "Date", "Invoice No", "Table No", "Order ID", "Items Count", "Payment Mode", "Bill Amount"];
    const rows = completedOrders.map((o, index) => {
      const d = new Date(o.createdAt);
      return [
        index + 1,
        d.toLocaleDateString(),
        o.invoiceNumber || 'N/A',
        `T${o.tableId.replace('T', '')}`,
        o.id.substring(4),
        o.items?.reduce((sum, i) => sum + i.quantity, 0) || 0,
        o.paymentMode || 'Cash',
        `₹${o.totalAmount}`
      ];
    });

    const csvContent = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "gst_sales_report.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex" style={{ minHeight: '100vh', backgroundColor: 'var(--color-bg)' }}>
      
      {/* Sidebar */}
      <div style={{ width: '260px', backgroundColor: '#FFFFFF', borderRight: '1px solid #EAEAEA', color: 'var(--color-text-primary)', padding: '2rem 1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        <div>
          <div className="flex justify-center items-center gap-2 mb-8">
            <img src="/logo.png" alt="Logo" style={{ height: '36px', width: 'auto' }} />
            <h2 style={{ fontFamily: 'var(--font-serif)', letterSpacing: '0.05em', fontSize: '1.15rem', margin: 0, fontWeight: 700 }}>
              {settings.restaurantName.toUpperCase()}
            </h2>
          </div>
          <nav className="flex-col gap-2">
            {[
              { id: 'analytics', label: 'Analytics', icon: LayoutDashboard },
              { id: 'menu', label: 'Menu Catalog', icon: Coffee },
              { id: 'orders', label: 'Order Archive', icon: ScrollText },
              { id: 'staff', label: 'Associates', icon: Users },
              { id: 'settings', label: 'Settings', icon: Settings }
            ].map(tab => (
              <button 
                key={tab.id}
                onClick={() => setActiveTab(tab.id)} 
                style={{ 
                  color: activeTab === tab.id ? 'var(--color-accent)' : 'var(--color-text-secondary)', 
                  textAlign: 'left', 
                  padding: '0.75rem 1rem', 
                  borderRadius: 'var(--border-radius-md)', 
                  backgroundColor: activeTab === tab.id ? 'rgba(183, 137, 79, 0.05)' : 'transparent',
                  fontWeight: activeTab === tab.id ? 600 : 400,
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem'
                }} 
              >
                <tab.icon size={18} /> {tab.label}
              </button>
            ))}
          </nav>
        </div>
        <button className="flex items-center gap-3 p-3 mt-8" style={{ color: 'var(--color-text-secondary)' }} onClick={handleLogout}>
          <LogOut size={18} /> Sign Out
        </button>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, padding: '3rem', backgroundColor: 'var(--color-bg)', overflowY: 'auto', maxHeight: '100vh' }}>
        
        {/* TAB: ANALYTICS */}
        {activeTab === 'analytics' && (
          <div>
            <div className="section-header" style={{ justifyContent: 'flex-start', margin: '0 0 2rem 0' }}>
              <h1 className="section-title">Business Overview</h1>
            </div>
            
            <div className="flex gap-4" style={{ marginBottom: '2rem' }}>
              <div className="card flex-1 p-6 text-center" style={{ borderTop: '4px solid var(--color-accent)' }}>
                <h3 style={{ fontFamily: 'var(--font-sans)', color: 'var(--color-text-secondary)', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Revenue (Paid)</h3>
                <h1 style={{ color: 'var(--color-text-primary)', fontSize: '2.5rem', margin: '0.5rem 0 0 0', fontFamily: 'var(--font-serif)', fontWeight: 800 }}>₹{revenue}</h1>
              </div>
              <div className="card flex-1 p-6 text-center">
                <h3 style={{ fontFamily: 'var(--font-sans)', color: 'var(--color-text-secondary)', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Orders</h3>
                <h1 style={{ color: 'var(--color-text-primary)', fontSize: '2.5rem', margin: '0.5rem 0 0 0', fontFamily: 'var(--font-serif)', fontWeight: 800 }}>{db.orders.length}</h1>
              </div>
            </div>

            <div className="card" style={{ padding: '1.5rem' }}>
              <div className="flex items-center gap-2 mb-4" style={{ color: 'var(--color-accent)' }}>
                <ThumbsUp size={20} />
                <h3 style={{ margin: 0, fontFamily: 'var(--font-serif)' }}>Best-Selling Dishes</h3>
              </div>
              
              {bestSellers.length === 0 ? (
                <p style={{ fontStyle: 'italic', color: 'var(--color-text-secondary)' }}>No order data available yet.</p>
              ) : (
                <div className="flex-col gap-2">
                  {bestSellers.map((bs, i) => (
                    <div key={bs.name} className="flex justify-between items-center" style={{ padding: '0.75rem', backgroundColor: '#F9F8F4', borderRadius: 'var(--border-radius-md)', border: '1px solid rgba(0,0,0,0.02)' }}>
                      <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>
                        {i + 1}. {bs.name}
                      </span>
                      <span style={{ fontSize: '0.85rem', color: 'var(--color-accent)', fontWeight: 700 }}>
                        {bs.count} orders
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB: MENU CATALOG */}
        {activeTab === 'menu' && (
          <div>
             <div className="flex justify-between items-center mb-6">
                <h1 className="section-title" style={{ margin: 0 }}>Menu Catalog</h1>
                <button 
                  className="btn-success flex items-center gap-2" 
                  style={{ width: 'auto' }} 
                  onClick={() => {
                    setNewDish({
                      name: '',
                      name_hi: '',
                      name_te: '',
                      categoryId: db.categories[0]?.id || 'c_starters',
                      price: '',
                      description: '',
                      description_hi: '',
                      description_te: '',
                      imageUrl: '',
                      customizationOptions: '',
                      isVeg: true,
                      isSpicy: '0',
                      portionInfo: 'Serves 1-2',
                      upsellIds: ''
                    });
                    setIsModalOpen(true);
                  }}
                >
                  <Plus size={18} /> Add Dish
                </button>
             </div>
            
            <div className="card flex-col gap-4" style={{ padding: '1.5rem' }}>
              {db.menuItems.map(item => (
                <div key={item.id} className="flex justify-between items-center border-b pb-3" style={{ borderColor: '#EAEAEA' }}>
                  <div className="flex items-center gap-4">
                    <img src={item.imageUrl} alt={item.name} style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: 'var(--border-radius-sm)' }} />
                    <div>
                      <div className="flex items-center gap-2">
                        {/* Veg indicator badge */}
                        <div style={{ 
                          width: '12px', 
                          height: '12px', 
                          border: `1.5px solid ${item.isVeg ? 'var(--color-green)' : 'var(--color-red)'}`, 
                          padding: '1px', 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center'
                        }}>
                          <div style={{ 
                            width: '4px', 
                            height: '4px', 
                            borderRadius: item.isVeg ? '50%' : '0', 
                            backgroundColor: item.isVeg ? 'var(--color-green)' : 'var(--color-red)' 
                          }} />
                        </div>
                        <h4 style={{ margin: 0, fontFamily: 'var(--font-serif)', fontSize: '1.1rem' }}>{item.name}</h4>
                      </div>
                      <p style={{ margin: '2px 0 0 0', fontSize: '0.85rem', color: 'var(--color-accent)', fontWeight: 700 }}>₹{item.price} • {item.portionInfo || 'Serves 1-2'}</p>
                    </div>
                  </div>
                  <button 
                    className="btn-primary" 
                    style={{ width: 'auto', padding: '0.5rem 1rem', backgroundColor: item.available ? 'var(--color-text-primary)' : 'var(--color-text-secondary)' }}
                    onClick={() => toggleAvailability(item.id)}
                  >
                    {item.available ? "Active" : "Hidden"}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB: ORDER ARCHIVE */}
        {activeTab === 'orders' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h1 className="section-title" style={{ margin: 0 }}>Order Archive</h1>
              <button className="btn-success flex items-center gap-2" style={{ width: 'auto', backgroundColor: 'var(--color-green)' }} onClick={exportToExcel}>
                <Download size={18} /> Export report
              </button>
            </div>
            <div className="card" style={{ padding: '1.5rem', overflowX: 'auto' }}>
              <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #CCC', color: 'var(--color-text-secondary)', textTransform: 'uppercase', fontSize: '0.8rem', letterSpacing: '0.05em' }}>
                    <th style={{ padding: '1rem 0.5rem' }}>Invoice</th>
                    <th style={{ padding: '1rem 0.5rem' }}>Table</th>
                    <th style={{ padding: '1rem 0.5rem' }}>Status</th>
                    <th style={{ padding: '1rem 0.5rem' }}>Payment</th>
                    <th style={{ padding: '1rem 0.5rem', textAlign: 'right' }}>Total</th>
                    <th style={{ padding: '1rem 0.5rem', textAlign: 'center' }}>GST Receipt</th>
                  </tr>
                </thead>
                <tbody>
                  {db.orders.map(o => (
                    <tr key={o.id} style={{ borderBottom: '1px solid #EAEAEA' }}>
                      <td style={{ padding: '1rem 0.5rem', fontFamily: 'monospace' }}>{o.invoiceNumber || o.id.substring(4)}</td>
                      <td style={{ padding: '1rem 0.5rem' }}>T{o.tableId.replace('T', '')}</td>
                      <td style={{ padding: '1rem 0.5rem', fontWeight: 500 }}>{o.status}</td>
                      <td style={{ padding: '1rem 0.5rem', color: o.paymentStatus === 'Paid' ? 'var(--color-green)' : 'var(--color-red)', fontWeight: 600 }}>{o.paymentStatus}</td>
                      <td style={{ padding: '1rem 0.5rem', textAlign: 'right', fontWeight: 600 }}>₹{o.totalAmount}</td>
                      <td style={{ padding: '1rem 0.5rem', textAlign: 'center' }}>
                        <button 
                          className="flex items-center justify-center gap-1"
                          style={{ 
                            color: 'var(--color-accent)', 
                            margin: '0 auto', 
                            fontSize: '0.8rem', 
                            fontWeight: 600,
                            padding: '0.35rem 0.75rem',
                            border: '1px solid var(--color-accent)',
                            borderRadius: '4px',
                            backgroundColor: 'transparent'
                          }}
                          onClick={() => setSelectedInvoiceOrder(o)}
                        >
                          <FileText size={14} /> View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB: ASSOCIATES */}
        {activeTab === 'staff' && (
          <div>
            <h1 className="section-title mb-6">Associates</h1>
            <div className="card" style={{ padding: '1.5rem' }}>
              {db.users.filter(u => u.role !== 'customer').map(staff => (
                <div key={staff.id} className="flex justify-between items-center border-b pb-3 mb-3" style={{ borderColor: '#EAEAEA' }}>
                  <div>
                    <h4 style={{ margin: 0, fontFamily: 'var(--font-serif)', fontSize: '1.2rem' }}>{staff.name}</h4>
                    <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--color-text-secondary)' }}>{staff.email} (Password: {staff.password})</p>
                  </div>
                  <div style={{ backgroundColor: 'rgba(183, 137, 79, 0.1)', color: 'var(--color-accent)', padding: '0.35rem 1rem', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 600, letterSpacing: '0.05em' }}>
                    {staff.role.toUpperCase()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB: BUSINESS SETTINGS */}
        {activeTab === 'settings' && (
          <div>
            <h1 className="section-title mb-6">Restaurant & Billing Settings</h1>
            <form onSubmit={handleSaveSettings} className="card flex-col gap-4" style={{ padding: '2rem' }}>
              
              <h3 style={{ borderBottom: '1px solid #EAEAEA', paddingBottom: '0.5rem', fontFamily: 'var(--font-serif)', color: 'var(--color-accent)', fontSize: '1.15rem' }}>Branding & Contact Info</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="flex-col gap-1">
                  <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>Restaurant Name</label>
                  <input 
                    type="text" 
                    value={settingsForm.restaurantName} 
                    onChange={e => setSettingsForm(prev => ({ ...prev, restaurantName: e.target.value }))}
                    style={{ padding: '0.75rem', borderRadius: 'var(--border-radius-md)', border: '1px solid #CCC' }}
                  />
                </div>
                <div className="flex-col gap-1">
                  <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>Contact Phone Number</label>
                  <input 
                    type="text" 
                    value={settingsForm.restaurantPhone} 
                    onChange={e => setSettingsForm(prev => ({ ...prev, restaurantPhone: e.target.value }))}
                    style={{ padding: '0.75rem', borderRadius: 'var(--border-radius-md)', border: '1px solid #CCC' }}
                  />
                </div>
              </div>
              <div className="flex-col gap-1">
                <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>Restaurant Address</label>
                <input 
                  type="text" 
                  value={settingsForm.restaurantAddress} 
                  onChange={e => setSettingsForm(prev => ({ ...prev, restaurantAddress: e.target.value }))}
                  style={{ padding: '0.75rem', borderRadius: 'var(--border-radius-md)', border: '1px solid #CCC' }}
                />
              </div>

              <h3 style={{ borderBottom: '1px solid #EAEAEA', paddingBottom: '0.5rem', fontFamily: 'var(--font-serif)', color: 'var(--color-accent)', fontSize: '1.15rem', marginTop: '1rem' }}>GST Tax & Service Charge (Indian Regulations)</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '1rem' }}>
                <div className="flex-col gap-1">
                  <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>GSTIN (GST Number)</label>
                  <input 
                    type="text" 
                    value={settingsForm.gstin} 
                    onChange={e => setSettingsForm(prev => ({ ...prev, gstin: e.target.value }))}
                    style={{ padding: '0.75rem', borderRadius: 'var(--border-radius-md)', border: '1px solid #CCC' }}
                  />
                </div>
                <div className="flex-col gap-1">
                  <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>CGST Rate (%)</label>
                  <input 
                    type="number" 
                    step="0.1"
                    value={settingsForm.cgstRate} 
                    onChange={e => setSettingsForm(prev => ({ ...prev, cgstRate: e.target.value }))}
                    style={{ padding: '0.75rem', borderRadius: 'var(--border-radius-md)', border: '1px solid #CCC' }}
                  />
                </div>
                <div className="flex-col gap-1">
                  <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>SGST Rate (%)</label>
                  <input 
                    type="number" 
                    step="0.1"
                    value={settingsForm.sgstRate} 
                    onChange={e => setSettingsForm(prev => ({ ...prev, sgstRate: e.target.value }))}
                    style={{ padding: '0.75rem', borderRadius: 'var(--border-radius-md)', border: '1px solid #CCC' }}
                  />
                </div>
                <div className="flex-col gap-1">
                  <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>Service Charge (%)</label>
                  <input 
                    type="number" 
                    step="0.1"
                    value={settingsForm.serviceChargeRate} 
                    onChange={e => setSettingsForm(prev => ({ ...prev, serviceChargeRate: e.target.value }))}
                    style={{ padding: '0.75rem', borderRadius: 'var(--border-radius-md)', border: '1px solid #CCC' }}
                  />
                </div>
              </div>

              <h3 style={{ borderBottom: '1px solid #EAEAEA', paddingBottom: '0.5rem', fontFamily: 'var(--font-serif)', color: 'var(--color-accent)', fontSize: '1.15rem', marginTop: '1rem' }}>WiFi Auto-Login Credentials</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr 1.5fr 1fr', gap: '1rem' }}>
                <div className="flex-col gap-1">
                  <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>Show WiFi QR</label>
                  <select 
                    value={settingsForm.showWifiQR ? "yes" : "no"} 
                    onChange={e => setSettingsForm(prev => ({ ...prev, showWifiQR: e.target.value === 'yes' }))}
                    style={{ padding: '0.75rem', borderRadius: 'var(--border-radius-md)', border: '1px solid #CCC', backgroundColor: '#FFF' }}
                  >
                    <option value="yes">Enabled</option>
                    <option value="no">Disabled</option>
                  </select>
                </div>
                <div className="flex-col gap-1">
                  <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>WiFi SSID</label>
                  <input 
                    type="text" 
                    value={settingsForm.wifiSSID} 
                    onChange={e => setSettingsForm(prev => ({ ...prev, wifiSSID: e.target.value }))}
                    style={{ padding: '0.75rem', borderRadius: 'var(--border-radius-md)', border: '1px solid #CCC' }}
                  />
                </div>
                <div className="flex-col gap-1">
                  <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>WiFi Password</label>
                  <input 
                    type="text" 
                    value={settingsForm.wifiPassword} 
                    onChange={e => setSettingsForm(prev => ({ ...prev, wifiPassword: e.target.value }))}
                    style={{ padding: '0.75rem', borderRadius: 'var(--border-radius-md)', border: '1px solid #CCC' }}
                  />
                </div>
                <div className="flex-col gap-1">
                  <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>Encryption</label>
                  <select 
                    value={settingsForm.wifiEncryption} 
                    onChange={e => setSettingsForm(prev => ({ ...prev, wifiEncryption: e.target.value }))}
                    style={{ padding: '0.75rem', borderRadius: 'var(--border-radius-md)', border: '1px solid #CCC', backgroundColor: '#FFF' }}
                  >
                    <option value="WPA">WPA/WPA2</option>
                    <option value="WEP">WEP</option>
                    <option value="nopass">None (Open)</option>
                  </select>
                </div>
              </div>

              <h3 style={{ borderBottom: '1px solid #EAEAEA', paddingBottom: '0.5rem', fontFamily: 'var(--font-serif)', color: 'var(--color-accent)', fontSize: '1.15rem', marginTop: '1rem' }}>Google Review CTA</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 3fr', gap: '1rem' }}>
                <div className="flex-col gap-1">
                  <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>Show CTA Button</label>
                  <select 
                    value={settingsForm.showReviewCTA ? "yes" : "no"} 
                    onChange={e => setSettingsForm(prev => ({ ...prev, showReviewCTA: e.target.value === 'yes' }))}
                    style={{ padding: '0.75rem', borderRadius: 'var(--border-radius-md)', border: '1px solid #CCC', backgroundColor: '#FFF' }}
                  >
                    <option value="yes">Enabled</option>
                    <option value="no">Disabled</option>
                  </select>
                </div>
                <div className="flex-col gap-1">
                  <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>Direct Review Link (URL)</label>
                  <input 
                    type="url" 
                    value={settingsForm.googleReviewLink} 
                    onChange={e => setSettingsForm(prev => ({ ...prev, googleReviewLink: e.target.value }))}
                    style={{ padding: '0.75rem', borderRadius: 'var(--border-radius-md)', border: '1px solid #CCC' }}
                  />
                </div>
              </div>

              <button type="submit" className="btn-success mt-4" style={{ width: '200px', alignSelf: 'flex-start' }}>
                Save Settings
              </button>

            </form>
          </div>
        )}

      </div>

      {/* MODAL: View and Print GST Tax Invoice */}
      {selectedInvoiceOrder && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="card" style={{ width: '450px', padding: '1.5rem', borderRadius: 'var(--border-radius-lg)', backgroundColor: '#FFFFFF', maxHeight: '90vh', overflowY: 'auto', position: 'relative' }}>
            <button 
              onClick={() => setSelectedInvoiceOrder(null)} 
              style={{ position: 'absolute', top: '1rem', right: '1rem', color: 'var(--color-text-secondary)', cursor: 'pointer' }}
            >
              <X size={20} />
            </button>
            
            {/* Printable Frame wrapper */}
            <div id="admin-receipt-view" style={{ padding: '0.25rem' }}>
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
                        {item.customizations?.length > 0 && (
                          <div style={{ fontSize: '0.65rem', color: 'var(--color-text-secondary)' }}>+ {item.customizations.join(', ')}</div>
                        )}
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

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.5rem', fontSize: '1rem', fontWeight: 800 }}>
                <span>GRAND TOTAL</span>
                <span style={{ color: 'var(--color-accent)' }}>₹{selectedInvoiceOrder.totalAmount}</span>
              </div>
              
              <div style={{ marginTop: '0.5rem', fontSize: '0.7rem', color: 'var(--color-text-secondary)', display: 'flex', justifyContent: 'space-between' }}>
                <span>Mode: {selectedInvoiceOrder.paymentMode || 'Cash'}</span>
                <span>Payment status: {selectedInvoiceOrder.paymentStatus.toUpperCase()}</span>
              </div>
            </div>

            {/* Print trigger */}
            <div className="flex gap-4 mt-6">
              <button 
                type="button" 
                className="btn-success flex items-center justify-center gap-2" 
                style={{ flex: 1, backgroundColor: 'var(--color-accent)' }}
                onClick={() => {
                  const printContents = document.getElementById('admin-receipt-view').innerHTML;
                  const originalContents = document.body.innerHTML;
                  document.body.innerHTML = `<div style="padding:2rem; background:white;">${printContents}</div>`;
                  window.print();
                  window.location.reload(); // Quick clean restore SPA state
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

      {/* Add Dish Modal */}
      {isModalOpen && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="card" style={{ width: '550px', padding: '2rem', borderRadius: 'var(--border-radius-lg)', backgroundColor: '#FFFFFF', maxHeight: '90vh', overflowY: 'auto' }}>
            <h2 style={{ fontFamily: 'var(--font-serif)', marginBottom: '1.5rem', color: 'var(--color-text-primary)' }}>Add New Indian Dish</h2>
            <form onSubmit={async (e) => {
              e.preventDefault();
              if (!newDish.name || !newDish.price || !newDish.description) {
                alert("Please fill in name, price, and description.");
                return;
              }
              const customOpts = newDish.customizationOptions
                ? newDish.customizationOptions.split(',').map(o => o.trim()).filter(Boolean)
                : [];
              const upsells = newDish.upsellIds
                ? newDish.upsellIds.split(',').map(o => o.trim()).filter(Boolean)
                : [];

              await addMenuItem({
                ...newDish,
                price: Number(newDish.price),
                isVeg: !!newDish.isVeg,
                isSpicy: Number(newDish.isSpicy),
                customizationOptions: customOpts,
                upsellIds: upsells
              });
              setIsModalOpen(false);
            }} className="flex-col gap-4">
              
              <div className="flex-col gap-1">
                <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>English Name *</label>
                <input 
                  type="text" 
                  required 
                  value={newDish.name} 
                  onChange={e => setNewDish(prev => ({ ...prev, name: e.target.value }))}
                  style={{ padding: '0.75rem', borderRadius: 'var(--border-radius-md)', border: '1px solid #CCC' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="flex-col gap-1">
                  <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>Hindi Name (Optional)</label>
                  <input 
                    type="text" 
                    value={newDish.name_hi} 
                    onChange={e => setNewDish(prev => ({ ...prev, name_hi: e.target.value }))}
                    style={{ padding: '0.75rem', borderRadius: 'var(--border-radius-md)', border: '1px solid #CCC' }}
                  />
                </div>
                <div className="flex-col gap-1">
                  <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>Telugu Name (Optional)</label>
                  <input 
                    type="text" 
                    value={newDish.name_te} 
                    onChange={e => setNewDish(prev => ({ ...prev, name_te: e.target.value }))}
                    style={{ padding: '0.75rem', borderRadius: 'var(--border-radius-md)', border: '1px solid #CCC' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr 1fr', gap: '1rem' }}>
                <div className="flex-col gap-1">
                  <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>Category</label>
                  <select 
                    value={newDish.categoryId} 
                    onChange={e => setNewDish(prev => ({ ...prev, categoryId: e.target.value }))}
                    style={{ padding: '0.75rem', borderRadius: 'var(--border-radius-md)', border: '1px solid #CCC', backgroundColor: '#FFF' }}
                  >
                    {db.categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
                <div className="flex-col gap-1">
                  <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>Price (₹) *</label>
                  <input 
                    type="number" 
                    step="1" 
                    required 
                    value={newDish.price} 
                    onChange={e => setNewDish(prev => ({ ...prev, price: e.target.value }))}
                    style={{ padding: '0.75rem', borderRadius: 'var(--border-radius-md)', border: '1px solid #CCC' }}
                  />
                </div>
                <div className="flex-col gap-1">
                  <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>Portion Size</label>
                  <input 
                    type="text" 
                    value={newDish.portionInfo} 
                    onChange={e => setNewDish(prev => ({ ...prev, portionInfo: e.target.value }))}
                    style={{ padding: '0.75rem', borderRadius: 'var(--border-radius-md)', border: '1px solid #CCC' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="flex-col gap-1">
                  <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>Food Classification</label>
                  <select 
                    value={newDish.isVeg ? "veg" : "nonveg"} 
                    onChange={e => setNewDish(prev => ({ ...prev, isVeg: e.target.value === 'veg' }))}
                    style={{ padding: '0.75rem', borderRadius: 'var(--border-radius-md)', border: '1px solid #CCC', backgroundColor: '#FFF' }}
                  >
                    <option value="veg">Veg (Green Dot)</option>
                    <option value="nonveg">Non-Veg (Red Triangle)</option>
                  </select>
                </div>
                <div className="flex-col gap-1">
                  <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>Spice Level</label>
                  <select 
                    value={newDish.isSpicy} 
                    onChange={e => setNewDish(prev => ({ ...prev, isSpicy: e.target.value }))}
                    style={{ padding: '0.75rem', borderRadius: 'var(--border-radius-md)', border: '1px solid #CCC', backgroundColor: '#FFF' }}
                  >
                    <option value="0">Mild (No Chilli)</option>
                    <option value="1">Medium (🌶️)</option>
                    <option value="2">Spicy (🌶️🌶️)</option>
                    <option value="3">Extra Spicy (🌶️🌶️🌶️)</option>
                  </select>
                </div>
              </div>

              <div className="flex-col gap-1">
                <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>English Description *</label>
                <textarea 
                  required 
                  rows="2"
                  value={newDish.description} 
                  onChange={e => setNewDish(prev => ({ ...prev, description: e.target.value }))}
                  style={{ padding: '0.75rem', borderRadius: 'var(--border-radius-md)', border: '1px solid #CCC', resize: 'none' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="flex-col gap-1">
                  <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>Hindi Description</label>
                  <textarea 
                    rows="2"
                    value={newDish.description_hi} 
                    onChange={e => setNewDish(prev => ({ ...prev, description_hi: e.target.value }))}
                    style={{ padding: '0.75rem', borderRadius: 'var(--border-radius-md)', border: '1px solid #CCC', resize: 'none' }}
                  />
                </div>
                <div className="flex-col gap-1">
                  <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>Telugu Description</label>
                  <textarea 
                    rows="2"
                    value={newDish.description_te} 
                    onChange={e => setNewDish(prev => ({ ...prev, description_te: e.target.value }))}
                    style={{ padding: '0.75rem', borderRadius: 'var(--border-radius-md)', border: '1px solid #CCC', resize: 'none' }}
                  />
                </div>
              </div>

              <div className="flex-col gap-1">
                <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>Image URL (Optional)</label>
                <input 
                  type="url" 
                  placeholder="https://images.unsplash.com/..." 
                  value={newDish.imageUrl} 
                  onChange={e => setNewDish(prev => ({ ...prev, imageUrl: e.target.value }))}
                  style={{ padding: '0.75rem', borderRadius: 'var(--border-radius-md)', border: '1px solid #CCC' }}
                />
              </div>

              <div className="flex-col gap-1">
                <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>Recommended Pairings (Comma-separated dish IDs)</label>
                <input 
                  type="text" 
                  placeholder="m_garlic_naan, m_mango_lassi" 
                  value={newDish.upsellIds} 
                  onChange={e => setNewDish(prev => ({ ...prev, upsellIds: e.target.value }))}
                  style={{ padding: '0.75rem', borderRadius: 'var(--border-radius-md)', border: '1px solid #CCC' }}
                />
              </div>

              <div className="flex gap-4 mt-4">
                <button type="button" className="btn-secondary" onClick={() => setIsModalOpen(false)} style={{ flex: 1 }}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary" style={{ flex: 1 }}>
                  Save Dish
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
