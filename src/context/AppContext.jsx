import React, { createContext, useContext, useState, useEffect } from 'react';
import { getDB, saveDB, subscribeToOrders, triggerDBUpdate } from '../lib/db';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [db, setDb] = useState(getDB());
  const [user, setUser] = useState(null); // Current authenticated user
  const [cart, setCart] = useState([]); // Cart array

  useEffect(() => {
    const unsub = subscribeToOrders((newOrders) => {
      // In a real app we'd subscribe to specific tables.
      // Here, we just reload the whole DB if the storage event fires, ensuring everything syncs.
      setDb(getDB()); 
    });
    return unsub;
  }, []);

  const login = (email, password) => {
    const u = db.users.find(u => u.email === email && u.password === password);
    if (u) {
      setUser(u);
      return true;
    }
    return false;
  };

  const logout = () => setUser(null);

  const addToCart = (item, quantity, customizations, specialInstructions) => {
    setCart(prev => [...prev, { ...item, cartId: Date.now(), quantity, customizations, specialInstructions }]);
  };

  const removeFromCart = (cartId) => {
    setCart(prev => prev.filter(c => c.cartId !== cartId));
  };

  const clearCart = () => setCart([]);

  const placeOrder = (tableId) => {
    const totalAmount = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const newOrder = {
      id: `ord_${Date.now()}`,
      tableId,
      customerId: user?.id,
      customerName: user?.name || 'Guest',
      customerEmail: user?.email || '',
      items: cart,
      totalAmount,
      status: 'Pending',
      paymentStatus: 'Unpaid',
      createdAt: new Date().toISOString()
    };
    const newDb = { ...db, orders: [...db.orders, newOrder] };
    setDb(newDb);
    saveDB(newDb);
    triggerDBUpdate();
    clearCart();
    return newOrder.id;
  };

  const updateOrderStatus = (orderId, status) => {
    const newDb = {
      ...db,
      orders: db.orders.map(o => o.id === orderId ? { ...o, status } : o)
    };
    setDb(newDb);
    saveDB(newDb);
    triggerDBUpdate();
  };

  const updateOrderPayment = (orderId, paymentStatus) => {
     const newDb = {
      ...db,
      orders: db.orders.map(o => o.id === orderId ? { ...o, paymentStatus } : o)
    };
    setDb(newDb);
    saveDB(newDb);
    triggerDBUpdate();
  }

  const callWaiter = (tableId, orderId) => {
    const call = { id: `call_${Date.now()}`, tableId, orderId, timestamp: new Date().toISOString() };
    const newDb = { ...db, waiterCalls: [...(db.waiterCalls || []), call] };
    setDb(newDb);
    saveDB(newDb);
    triggerDBUpdate();
  };

  const dismissCall = (callId) => {
    const newDb = { ...db, waiterCalls: (db.waiterCalls || []).filter(c => c.id !== callId) };
    setDb(newDb);
    saveDB(newDb);
    triggerDBUpdate();
  };

  return (
    <AppContext.Provider value={{ db, user, login, logout, cart, addToCart, removeFromCart, clearCart, placeOrder, updateOrderStatus, updateOrderPayment, callWaiter, dismissCall }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => useContext(AppContext);
