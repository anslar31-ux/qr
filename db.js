const INITIAL_DATA = {
  users: [
    { id: '1', name: 'Owner', email: 'owner@cafe.com', password: '123', role: 'owner' },
    { id: '2', name: 'Kitchen', email: 'kitchen@cafe.com', password: '123', role: 'kitchen' },
    { id: '3', name: 'Waiter', email: 'waiter@cafe.com', password: '123', role: 'waiter' }
  ],
  tables: Array.from({ length: 10 }, (_, i) => ({ id: `T${i + 1}`, label: `Table ${i + 1}`, qrCodeUrl: `/app/t/T${i + 1}`})),
  categories: [
    { id: 'c1', name: 'Coffee', order: 1 },
    { id: 'c2', name: 'Snacks', order: 2 },
    { id: 'c3', name: 'Desserts', order: 3 }
  ],
  menuItems: [
    { id: 'm1', name: 'Espresso', categoryId: 'c1', price: 3.50, description: 'Pure essence of roasted beans, bold and velvety.', imageUrl: 'https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04', available: true, customizationOptions: ['Extra shot', 'Less sugar'] },
    { id: 'm2', name: 'Cappuccino', categoryId: 'c1', price: 4.50, description: 'Harmonious balance of espresso, steamed milk, and clouds.', imageUrl: 'https://images.unsplash.com/photo-1541167760496-1628856ab772', available: true, customizationOptions: ['Oat milk', 'Extra hot', 'Less foam'] },
    { id: 'm3', name: 'Butter Croissant', categoryId: 'c2', price: 3.00, description: 'Hand-laminated layers of Charentes-Poitou butter.', imageUrl: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a', available: true, customizationOptions: ['Warm it up', 'With butter'] },
    { id: 'm4', name: 'Valrhona Cake', categoryId: 'c3', price: 5.50, description: 'Intense 70% dark chocolate with a silky ganache finish.', imageUrl: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587', available: true, customizationOptions: [] }
  ],
  orders: [],
  waiterCalls: []
};

export const getDB = () => {
  const data = localStorage.getItem('qr_cafe_db');
  if (data) return JSON.parse(data);
  localStorage.setItem('qr_cafe_db', JSON.stringify(INITIAL_DATA));
  return INITIAL_DATA;
};

export const saveDB = (data) => {
  localStorage.setItem('qr_cafe_db', JSON.stringify(data));
};

export const subscribeToOrders = (callback) => {
  const handler = (e) => {
    if (e.key === 'qr_cafe_db' || e.type === 'custom-db-update') callback(getDB().orders);
  };
  window.addEventListener('storage', handler);
  window.addEventListener('custom-db-update', handler);
  return () => {
    window.removeEventListener('storage', handler);
    window.removeEventListener('custom-db-update', handler);
  };
};

export const triggerDBUpdate = () => {
  window.dispatchEvent(new Event('custom-db-update'));
}
// -------------------------------------------------------------------
// Helper: Generate full URLs for each table
// -------------------------------------------------------------------
export const getTableLinks = () => {
  const base = typeof window !== 'undefined' ? window.location.origin : '';
  const db = getDB();
  return db.tables.map(t => ({
    id: t.id,
    link: `${base}${t.qrCodeUrl}`
  }));
};

// -------------------------------------------------------------------
// Helper: Get staff dashboard URLs
// -------------------------------------------------------------------
export const getStaffLinks = () => {
  const base = typeof window !== 'undefined' ? window.location.origin : '';
  return {
    owner: `${base}/admin/`,
    kitchen: `${base}/staff/kitchen`,
    waiter: `${base}/staff/waiter`
  };
};
