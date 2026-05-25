import React, { createContext, useContext, useState, useEffect } from 'react';
import { initRxDB } from '../lib/rxdb';
import { INITIAL_DATA } from '../lib/initial-data';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [rxdb, setRxdb] = useState(null);
  
  // Initialize db state with empty arrays. 
  // It matches the structure expected by components.
  const [dbState, setDbState] = useState({
    users: [],
    tables: [],
    categories: [],
    menuItems: [],
    orders: [],
    waiterCalls: []
  });

  const [user, setUser] = useState(null); // Current authenticated user
  const [cart, setCart] = useState([]); // Cart array

  useEffect(() => {
    let subs = [];

    const setupDB = async () => {
      try {
        const db = await initRxDB();
        setRxdb(db);

        // Check if DB is empty, if so populate from INITIAL_DATA
        const usersCount = await db.users.count().exec();
        if (usersCount === 0) {
          await Promise.all([
            db.users.bulkInsert(INITIAL_DATA.users),
            db.tables.bulkInsert(INITIAL_DATA.tables),
            db.categories.bulkInsert(INITIAL_DATA.categories),
            db.menuItems.bulkInsert(INITIAL_DATA.menuItems)
          ]);
        }

        // Helper to pull all data into React state
        const updateState = async () => {
          const [users, tables, categories, menuItems, orders, waiterCalls] = await Promise.all([
            db.users.find().exec(),
            db.tables.find().exec(),
            db.categories.find().exec(),
            db.menuItems.find().exec(),
            db.orders.find().exec(),
            db.waitercalls.find().exec()
          ]);

          setDbState({
            users: users.map(d => d.toJSON()),
            tables: tables.map(d => d.toJSON()),
            categories: categories.map(d => d.toJSON()),
            menuItems: menuItems.map(d => d.toJSON()),
            orders: orders.map(d => d.toJSON()),
            waiterCalls: waiterCalls.map(d => d.toJSON())
          });
        };

        // Initial fetch
        await updateState();

        // Subscribe to real-time changes via RxDB Observables
        // Whenever any data changes (locally or via WebRTC), update the state
        subs.push(db.orders.$.subscribe(() => updateState()));
        subs.push(db.waitercalls.$.subscribe(() => updateState()));
        subs.push(db.users.$.subscribe(() => updateState()));
        subs.push(db.menuItems.$.subscribe(() => updateState()));
      } catch (error) {
        console.error("RxDB init error:", error);
      }
    };

    setupDB();

    return () => {
      subs.forEach(s => s.unsubscribe());
    };
  }, []);

  const login = (email, password) => {
    const u = dbState.users.find(u => u.email === email && u.password === password);
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

  const placeOrder = async (tableId) => {
    if (!rxdb) return;
    const totalAmount = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const orderId = `ord_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
    
    const newOrder = {
      id: orderId,
      tableId,
      customerId: user?.id || 'guest',
      customerName: user?.name || 'Guest',
      customerEmail: user?.email || '',
      items: cart,
      totalAmount,
      status: 'Pending',
      paymentStatus: 'Unpaid',
      createdAt: new Date().toISOString()
    };
    
    await rxdb.orders.insert(newOrder);
    clearCart();
    return orderId;
  };

  const updateOrderStatus = async (orderId, status) => {
    if (!rxdb) return;
    const orderDoc = await rxdb.orders.findOne(orderId).exec();
    if (orderDoc) {
      await orderDoc.patch({ status });
    }
  };

  const updateOrderPayment = async (orderId, paymentStatus) => {
    if (!rxdb) return;
    const orderDoc = await rxdb.orders.findOne(orderId).exec();
    if (orderDoc) {
      await orderDoc.patch({ paymentStatus });
    }
  };

  const callWaiter = async (tableId, orderId) => {
    if (!rxdb) return;
    const callId = `call_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
    const call = { 
      id: callId, 
      tableId, 
      orderId: orderId || '', 
      timestamp: new Date().toISOString() 
    };
    await rxdb.waitercalls.insert(call);
  };

  const dismissCall = async (callId) => {
    if (!rxdb) return;
    const callDoc = await rxdb.waitercalls.findOne(callId).exec();
    if (callDoc) {
      await callDoc.remove();
    }
  };

  return (
    <AppContext.Provider value={{ 
      db: dbState, 
      user, login, logout, 
      cart, addToCart, removeFromCart, clearCart, 
      placeOrder, updateOrderStatus, updateOrderPayment, 
      callWaiter, dismissCall 
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => useContext(AppContext);
