import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { INITIAL_DATA } from '../lib/initial-data';
import { db as firestore } from '../lib/firebase';
import { collection, doc, setDoc, updateDoc, deleteDoc, onSnapshot, query, orderBy } from 'firebase/firestore';

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

  // ── Orders / WaiterCalls state (Firebase) ────────────────────────────
  const [ordersState, setOrdersState] = useState({ orders: [], waiterCalls: [] });

  useEffect(() => {
    // Listen to orders
    const ordersQuery = query(collection(firestore, 'orders'));
    const unsubscribeOrders = onSnapshot(ordersQuery, (snapshot) => {
      const orders = snapshot.docs.map(doc => doc.data());
      // Sort in memory by createdAt descending to keep the newest first
      orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setOrdersState(prev => ({ ...prev, orders }));
      setLoading(false); // Consider loading finished once first orders arrive
    }, (error) => {
      console.error("Firestore Orders listener error:", error);
      setLoading(false);
    });

    // Listen to waiter calls
    const waiterCallsQuery = query(collection(firestore, 'waitercalls'));
    const unsubscribeWaiterCalls = onSnapshot(waiterCallsQuery, (snapshot) => {
      const waiterCalls = snapshot.docs.map(doc => doc.data());
      waiterCalls.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      setOrdersState(prev => ({ ...prev, waiterCalls }));
    }, (error) => {
      console.error("Firestore WaiterCalls listener error:", error);
    });

    return () => {
      unsubscribeOrders();
      unsubscribeWaiterCalls();
    };
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

  // ─── Orders (Firebase) ───────────────────────────────────────────────────────

  const placeOrder = async (tableId) => {
    const totalAmount = cart.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    const orderId = `ord_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
    
    // Clean items for firestore
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
      await setDoc(doc(firestore, 'orders', orderId), {
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
    try {
      await updateDoc(doc(firestore, 'orders', orderId), { status });
    } catch (err) {
      console.error("Error updating order status:", err);
    }
  };

  const updateOrderPayment = async (orderId, paymentStatus) => {
    try {
      await updateDoc(doc(firestore, 'orders', orderId), { paymentStatus });
    } catch (err) {
      console.error("Error updating order payment status:", err);
    }
  };

  const callWaiter = async (tableId, orderId) => {
    const callId = `call_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
    try {
      await setDoc(doc(firestore, 'waitercalls', callId), {
        id: callId,
        tableId,
        orderId: orderId || '',
        timestamp: new Date().toISOString(),
      });
    } catch (err) {
      console.error("Error calling waiter:", err);
    }
  };

  const dismissCall = async (callId) => {
    try {
      await deleteDoc(doc(firestore, 'waitercalls', callId));
    } catch (err) {
      console.error("Error dismissing call:", err);
    }
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
