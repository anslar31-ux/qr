import { INITIAL_DATA } from './initial-data';

// -------------------------------------------------------------------
// Helper: Generate full URLs for each table
// -------------------------------------------------------------------
export const getTableLinks = () => {
  const base = typeof window !== 'undefined' ? window.location.origin : '';
  return INITIAL_DATA.tables.map(t => ({
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
