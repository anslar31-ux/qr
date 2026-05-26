import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { initRxDB } from '../lib/rxdb';
import { INITIAL_DATA } from '../lib/initial-data';

const AppContext = createContext();

const MENU_STORAGE_KEY = 'cafe_menu_v1';
const BROADCAST_CHANNEL = 'cafe_menu_sync';

// ─── Helpers ────────────────────────────────────────────────────────────────

function loadMenuFromStorage() {
  try {
    const raw = localStorage.getItem(MENU_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (_) {}
  return null;
}

function saveMenuToStorage(menu) {
  try {
    localStorage.setItem(MENU_STORAGE_KEY, JSON.stringify(menu));
  } catch (_) {}
}

// ─── Provider ────────────────────────────────────────────────────────────────

export const AppProvider = ({ children }) => {
  const [rxdb, setRxdb] = useState(null);
  const [loading, setLoading] = useState(true);

  // ── Menu state (localStorage + BroadcastChannel) ──────────────────────────
  const getInitialMenu = () => {
    const stored = loadMenuFromStorage();
    if (stored) return stored;
    const fresh = {
      categories: INITIAL_DATA.categories,
      menuItems: INITIAL_DATA.menuItems,
    };
    saveMenuToStorage(fresh);
    return fresh;
  };

  const [menuState, setMenuState] = useState(getInitialMenu);
  const bcRef = useRef(null);

  useEffect(() => {
    // BroadcastChannel: sync menu across all open tabs instantly
    const bc = new BroadcastChannel(BROADCAST_CHANNEL);
    bcRef.current = bc;
    bc.onmessage = (e) => {
      setMenuState(e.data);
      saveMenuToStorage(e.data);
    };
    return () => bc.close();
  }, []);

  // ── Orders / WaiterCalls state (RxDB + WebRTC) ────────────────────────────
  const [ordersState, setOrdersState] = useState({ orders: [], waiterCalls: [] });

  useEffect(() => {
    let subs = [];

    const setupDB = async () => {
      try {
        const db = await initRxDB();
        setRxdb(db);

        const updateOrders = async () => {
          const [orders, waiterCalls] = await Promise.all([
            db.orders.find().exec(),
            db.waitercalls.find().exec(),
          ]);
          setOrdersState({
            orders: orders.map((d) => d.toJSON()),
            waiterCalls: waiterCalls.map((d) => d.toJSON()),
          });
        };

        await updateOrders();
        setLoading(false);

        subs.push(db.orders.$.subscribe(() => updateOrders()));
        subs.push(db.waitercalls.$.subscribe(() => updateOrders()));
      } catch (err) {
        console.error('RxDB init error:', err);
        setLoading(false);
      }
    };

    setupDB();
    return () => subs.forEach((s) => s.unsubscribe());
  }, []);

  // ── Static data (users + tables from INITIAL_DATA) ───────────────────────
  const [staticState] = useState({
    users: INITIAL_DATA.users,
    tables: INITIAL_DATA.tables,
  });

  // ── Composed db object for components ─────────────────────────────────────
  const db = {
    users: staticState.users,
    tables: staticState.tables,
    categories: menuState.categories,
    menuItems: menuState.menuItems,
    orders: ordersState.orders,
    waiterCalls: ordersState.waiterCalls,
  };

  // ─── Auth ─────────────────────────────────────────────────────────────────
  const [user, setUser] = useState(null);

  const login = (email, password) => {
    const u = staticState.users.find(
      (u) => u.email === email && u.password === password
    );
    if (u) { setUser(u); return true; }
    return false;
  };

  const logout = () => setUser(null);

  // ─── Cart ─────────────────────────────────────────────────────────────────
  const [cart, setCart] = useState([]);

  const addToCart = (item, quantity, customizations, specialInstructions) =>
    setCart((prev) => [
      ...prev,
      { ...item, cartId: Date.now(), quantity, customizations, specialInstructions },
    ]);

  const removeFromCart = (cartId) =>
    setCart((prev) => prev.filter((c) => c.cartId !== cartId));

  const clearCart = () => setCart([]);

  // ─── Menu management (localStorage + BroadcastChannel) ───────────────────

  const broadcastMenu = (updated) => {
    saveMenuToStorage(updated);
    setMenuState(updated);
    try {
      bcRef.current?.postMessage(updated);
    } catch (_) {}
  };

  const addMenuItem = (item) => {
    const newItem = {
      id: `m_${Date.now()}`,
      name: item.name,
      categoryId: item.categoryId,
      price: Number(item.price),
      description: item.description,
      imageUrl:
        item.imageUrl ||
        'https://images.unsplash.com/photo-1541167760496-1628856ab772?auto=format&fit=crop&q=80',
      available: true,
      customizationOptions: item.customizationOptions || [],
    };
    const updated = {
      ...menuState,
      menuItems: [...menuState.menuItems, newItem],
    };
    broadcastMenu(updated);
    return newItem.id;
  };

  const toggleMenuItemAvailability = (itemId) => {
    const updated = {
      ...menuState,
      menuItems: menuState.menuItems.map((m) =>
        m.id === itemId ? { ...m, available: !m.available } : m
      ),
    };
    broadcastMenu(updated);
  };

  // ─── Orders (RxDB) ───────────────────────────────────────────────────────

  const placeOrder = async (tableId) => {
    if (!rxdb) return;
    const totalAmount = cart.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    const orderId = `ord_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
    
    // Strip out fields not in the RxDB schema to prevent validation errors
    const cleanedItems = cart.map(item => ({
      cartId: item.cartId,
      id: item.id,
      name: item.name,
      price: item.price,
      quantity: item.quantity,
      customizations: item.customizations || [],
      specialInstructions: item.specialInstructions || ''
    }));

    try {
      await rxdb.orders.insert({
        id: orderId,
        tableId,
        customerId: user?.id || 'guest',
        customerName: user?.name || 'Guest',
        customerEmail: user?.email || '',
        items: cleanedItems,
        totalAmount,
        status: 'Pending',
        paymentStatus: 'Unpaid',
        createdAt: new Date().toISOString(),
      });
      clearCart();
      return orderId;
    } catch (err) {
      console.error("Failed to place order:", err);
      alert("Error placing order. Please try again.");
    }
  };

  const updateOrderStatus = async (orderId, status) => {
    if (!rxdb) return;
    const doc = await rxdb.orders.findOne(orderId).exec();
    if (doc) await doc.patch({ status });
  };

  const updateOrderPayment = async (orderId, paymentStatus) => {
    if (!rxdb) return;
    const doc = await rxdb.orders.findOne(orderId).exec();
    if (doc) await doc.patch({ paymentStatus });
  };

  const callWaiter = async (tableId, orderId) => {
    if (!rxdb) return;
    const callId = `call_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
    await rxdb.waitercalls.insert({
      id: callId,
      tableId,
      orderId: orderId || '',
      timestamp: new Date().toISOString(),
    });
  };

  const dismissCall = async (callId) => {
    if (!rxdb) return;
    const doc = await rxdb.waitercalls.findOne(callId).exec();
    if (doc) await doc.remove();
  };

  // ─── Context value ────────────────────────────────────────────────────────

  return (
    <AppContext.Provider
      value={{
        db,
        loading,
        user, login, logout,
        cart, addToCart, removeFromCart, clearCart,
        placeOrder, updateOrderStatus, updateOrderPayment,
        callWaiter, dismissCall,
        addMenuItem, toggleMenuItemAvailability,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => useContext(AppContext);
