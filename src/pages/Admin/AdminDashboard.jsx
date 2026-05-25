import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { LogOut, LayoutDashboard, Coffee, Users, ScrollText, Plus, Download } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
  const { db, logout, addMenuItem, toggleMenuItemAvailability } = useAppContext();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('analytics');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newDish, setNewDish] = useState({
    name: '',
    categoryId: '',
    price: '',
    description: '',
    imageUrl: '',
    customizationOptions: ''
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

  const exportToExcel = () => {
    const completedOrders = db.orders.filter(o => o.status === 'Served' && o.paymentStatus === 'Paid');
    if (completedOrders.length === 0) {
      alert("No completed orders to export.");
      return;
    }

    const headers = ["S.No", "Date", "Time", "Table No", "Order ID", "Email", "Payment", "Bill Paid"];
    const rows = completedOrders.map((o, index) => {
      const d = new Date(o.createdAt);
      return [
        index + 1,
        d.toLocaleDateString(),
        d.toLocaleTimeString(),
        o.tableId,
        o.id,
        o.customerEmail || 'N/A',
        o.paymentStatus,
        `$${o.totalAmount.toFixed(2)}`
      ];
    });

    const csvContent = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "completed_orders.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex" style={{ minHeight: '100vh', backgroundColor: 'var(--color-bg)' }}>
      {/* Sidebar */}
      <div style={{ width: '260px', backgroundColor: '#FFFFFF', borderRight: '1px solid #EAEAEA', color: 'var(--color-text-primary)', padding: '2rem 1.5rem' }} className="flex-col justify-between">
        <div>
          <h2 style={{ fontFamily: 'var(--font-serif)', letterSpacing: '0.1em', marginBottom: '2.5rem', textAlign: 'center', fontSize: '1.25rem' }}>L'ARTISAN</h2>
          <nav className="flex-col gap-2">
            {[
              { id: 'analytics', label: 'Analytics', icon: LayoutDashboard },
              { id: 'menu', label: 'Menu Catalog', icon: Coffee },
              { id: 'orders', label: 'Order Archive', icon: ScrollText },
              { id: 'staff', label: 'Associates', icon: Users }
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
                  fontWeight: activeTab === tab.id ? 600 : 400
                }} 
                className="flex items-center gap-3"
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
      <div style={{ flex: 1, padding: '3rem', backgroundColor: 'var(--color-bg)' }}>
        {activeTab === 'analytics' && (
          <div>
            <div className="section-header" style={{ justifyContent: 'flex-start', margin: '0 0 2rem 0' }}>
              <h1 className="section-title">Business Overview</h1>
            </div>
            <div className="flex gap-4">
              <div className="card flex-1 p-6 text-center" style={{ borderTop: '4px solid var(--color-accent)' }}>
                <h3 style={{ fontFamily: 'var(--font-sans)', color: 'var(--color-text-secondary)', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Revenue (Paid)</h3>
                <h1 style={{ color: 'var(--color-text-primary)', fontSize: '2.5rem', margin: '0.5rem 0 0 0', fontFamily: 'var(--font-serif)' }}>${revenue.toFixed(2)}</h1>
              </div>
              <div className="card flex-1 p-6 text-center">
                <h3 style={{ fontFamily: 'var(--font-sans)', color: 'var(--color-text-secondary)', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Orders</h3>
                <h1 style={{ color: 'var(--color-text-primary)', fontSize: '2.5rem', margin: '0.5rem 0 0 0', fontFamily: 'var(--font-serif)' }}>{db.orders.length}</h1>
              </div>
            </div>
          </div>
        )}

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
                      categoryId: db.categories[0]?.id || 'c1',
                      price: '',
                      description: '',
                      imageUrl: '',
                      customizationOptions: ''
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
                      <h4 style={{ margin: 0, fontFamily: 'var(--font-serif)', fontSize: '1.1rem' }}>{item.name}</h4>
                      <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--color-accent)', fontWeight: 500 }}>${item.price.toFixed(2)}</p>
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

        {activeTab === 'orders' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h1 className="section-title" style={{ margin: 0 }}>Order Archive</h1>
              <button className="btn-success flex items-center gap-2" style={{ width: 'auto', backgroundColor: 'var(--color-green)' }} onClick={exportToExcel}>
                <Download size={18} /> Export Excel
              </button>
            </div>
            <div className="card" style={{ padding: '1.5rem', overflowX: 'auto' }}>
              <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #CCC', color: 'var(--color-text-secondary)', textTransform: 'uppercase', fontSize: '0.8rem', letterSpacing: '0.05em' }}>
                    <th style={{ padding: '1rem 0.5rem' }}>Reference</th>
                    <th style={{ padding: '1rem 0.5rem' }}>Table</th>
                    <th style={{ padding: '1rem 0.5rem' }}>Status</th>
                    <th style={{ padding: '1rem 0.5rem' }}>Payment</th>
                    <th style={{ padding: '1rem 0.5rem', textAlign: 'right' }}>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {db.orders.map(o => (
                    <tr key={o.id} style={{ borderBottom: '1px solid #EAEAEA' }}>
                      <td style={{ padding: '1rem 0.5rem', fontFamily: 'monospace' }}>{o.id.substring(4)}</td>
                      <td style={{ padding: '1rem 0.5rem' }}>T{o.tableId.replace('T', '')}</td>
                      <td style={{ padding: '1rem 0.5rem', fontWeight: 500 }}>{o.status}</td>
                      <td style={{ padding: '1rem 0.5rem', color: o.paymentStatus === 'Paid' ? 'var(--color-green)' : 'var(--color-red)' }}>{o.paymentStatus}</td>
                      <td style={{ padding: '1rem 0.5rem', textAlign: 'right', fontWeight: 600 }}>${o.totalAmount.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'staff' && (
          <div>
            <h1 className="section-title mb-6">Associates</h1>
            <div className="card" style={{ padding: '1.5rem' }}>
              {db.users.filter(u => u.role !== 'customer').map(staff => (
                <div key={staff.id} className="flex justify-between items-center border-b pb-3 mb-3" style={{ borderColor: '#EAEAEA' }}>
                  <div>
                    <h4 style={{ margin: 0, fontFamily: 'var(--font-serif)', fontSize: '1.2rem' }}>{staff.name}</h4>
                    <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--color-text-secondary)' }}>{staff.email}</p>
                  </div>
                  <div style={{ backgroundColor: 'rgba(183, 137, 79, 0.1)', color: 'var(--color-accent)', padding: '0.35rem 1rem', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 600, letterSpacing: '0.05em' }}>
                    {staff.role.toUpperCase()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Add Dish Modal */}
      {isModalOpen && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="card" style={{ width: '500px', padding: '2rem', borderRadius: 'var(--border-radius-lg)', backgroundColor: '#FFFFFF', maxHeight: '90vh', overflowY: 'auto' }}>
            <h2 style={{ fontFamily: 'var(--font-serif)', marginBottom: '1.5rem', color: 'var(--color-text-primary)' }}>Add New Dish</h2>
            <form onSubmit={async (e) => {
              e.preventDefault();
              if (!newDish.name || !newDish.price || !newDish.description) {
                alert("Please fill in name, price, and description.");
                return;
              }
              const customOpts = newDish.customizationOptions
                ? newDish.customizationOptions.split(',').map(o => o.trim()).filter(Boolean)
                : [];
              await addMenuItem({
                ...newDish,
                customizationOptions: customOpts
              });
              setIsModalOpen(false);
            }} className="flex-col gap-4">
              <div className="flex-col gap-1">
                <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>Name *</label>
                <input 
                  type="text" 
                  required 
                  value={newDish.name} 
                  onChange={e => setNewDish(prev => ({ ...prev, name: e.target.value }))}
                  style={{ padding: '0.75rem', borderRadius: 'var(--border-radius-md)', border: '1px solid #CCC' }}
                />
              </div>
              <div className="flex justify-between gap-4">
                <div className="flex-col gap-1" style={{ flex: 1 }}>
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
                <div className="flex-col gap-1" style={{ flex: 1 }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>Price ($) *</label>
                  <input 
                    type="number" 
                    step="0.01" 
                    required 
                    value={newDish.price} 
                    onChange={e => setNewDish(prev => ({ ...prev, price: e.target.value }))}
                    style={{ padding: '0.75rem', borderRadius: 'var(--border-radius-md)', border: '1px solid #CCC' }}
                  />
                </div>
              </div>
              <div className="flex-col gap-1">
                <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>Description *</label>
                <textarea 
                  required 
                  rows="3"
                  value={newDish.description} 
                  onChange={e => setNewDish(prev => ({ ...prev, description: e.target.value }))}
                  style={{ padding: '0.75rem', borderRadius: 'var(--border-radius-md)', border: '1px solid #CCC', resize: 'none' }}
                />
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
                <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>Customizations (Optional, comma-separated)</label>
                <input 
                  type="text" 
                  placeholder="Extra shot, Oat milk, Less sugar" 
                  value={newDish.customizationOptions} 
                  onChange={e => setNewDish(prev => ({ ...prev, customizationOptions: e.target.value }))}
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
