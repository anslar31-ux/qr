// api/menu.js - Vercel Serverless API for menu items
// Stores menu items in Vercel Blob storage (or falls back to INITIAL_DATA)

import { INITIAL_MENU_DATA } from '../src/lib/initial-data.js';

// In-memory store for the serverless function lifecycle
// For production persistence, use Vercel KV or Blob storage
let menuStore = null;

function getInitialMenu() {
  return {
    categories: INITIAL_MENU_DATA.categories,
    menuItems: INITIAL_MENU_DATA.menuItems
  };
}

export default function handler(req, res) {
  // CORS headers so browser can call this API
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // GET - return all menu data
  if (req.method === 'GET') {
    if (!menuStore) {
      menuStore = getInitialMenu();
    }
    return res.status(200).json(menuStore);
  }

  // POST - add a new menu item
  if (req.method === 'POST') {
    if (!menuStore) {
      menuStore = getInitialMenu();
    }
    const item = req.body;
    menuStore.menuItems.push(item);
    return res.status(201).json(item);
  }

  // PATCH - update an existing menu item
  if (req.method === 'PATCH') {
    if (!menuStore) {
      menuStore = getInitialMenu();
    }
    const { id, ...updates } = req.body;
    const idx = menuStore.menuItems.findIndex(m => m.id === id);
    if (idx !== -1) {
      menuStore.menuItems[idx] = { ...menuStore.menuItems[idx], ...updates };
      return res.status(200).json(menuStore.menuItems[idx]);
    }
    return res.status(404).json({ error: 'Item not found' });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
