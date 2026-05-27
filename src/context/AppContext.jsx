import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { INITIAL_DATA } from '../lib/initial-data';
import { db as firestore } from '../lib/firebase';
import { collection, doc, setDoc, updateDoc, deleteDoc, onSnapshot, query, orderBy } from 'firebase/firestore';

const AppContext = createContext();

const MENU_STORAGE_KEY = 'cafe_menu_indian_v1';
const BROADCAST_CHANNEL = 'cafe_menu_sync';
const SETTINGS_STORAGE_KEY = 'cafe_settings_v1';
const SETTINGS_BROADCAST_CHANNEL = 'cafe_settings_sync';

// ─── Translations Dictionary ────────────────────────────────────────────────
const TRANSLATIONS = {
  en: {
    menu: "Menu",
    bag: "Bag",
    account: "Account",
    reserve: "Reserve",
    addToBag: "Add to Bag",
    itemAdded: "Item added to bag!",
    specialInstructions: "Special Instructions",
    quantity: "Quantity",
    customizations: "Customizations",
    orderTotal: "Order Total",
    placeOrder: "Place Order to Table",
    emptyBag: "Your bag is currently empty.",
    returnToMenu: "Return to Menu",
    orderStatus: "Order Status",
    requestAssistance: "Request Assistance",
    waiterNotified: "Waiter Notified",
    orderReceived: "Order received, waiting for kitchen.",
    preparing: "Kitchen is crafting your order.",
    ready: "Your order is ready to be served.",
    served: "Served! Please enjoy.",
    paymentPending: "Please complete your payment before leaving.",
    leaveReview: "Leave a Google Review",
    connectWifi: "Connect to WiFi",
    scanToConnect: "Scan to connect instantly",
    recommendedWithDish: "Recommended with this dish",
    completeYourMeal: "Complete your meal",
    combos: "Combos",
    veg: "Veg",
    nonVeg: "Non-Veg",
    spicy: "Spicy",
    bestseller: "Bestseller",
    chefSpecial: "Chef Special",
    newItem: "New",
    searchPlaceholder: "Search dishes, ingredients...",
    all: "All",
    priceRange: "Price Range",
    gstInvoice: "GST Tax Invoice",
    invoiceNo: "Invoice No",
    date: "Date",
    table: "Table",
    taxBreakup: "GST Tax Breakup",
    cgst: "CGST",
    sgst: "SGST",
    serviceCharge: "Service Charge",
    discount: "Discount",
    grandTotal: "Grand Total",
    subtotal: "Subtotal",
    taxableAmt: "Taxable Amt",
    printInvoice: "Print Invoice",
    downloadPDF: "Download Invoice",
    welcome: "Welcome",
    login: "Log In",
    signup: "Sign Up",
    backToMenu: "Back to Menu",
  },
  hi: {
    menu: "मेन्यू",
    bag: "थैला",
    account: "खाता",
    reserve: "आरक्षित",
    addToBag: "कार्ट में जोड़ें",
    itemAdded: "सामग्री जोड़ी गई!",
    specialInstructions: "विशेष निर्देश",
    quantity: "मात्रा",
    customizations: "विकल्प",
    orderTotal: "कुल योग",
    placeOrder: "टेबल पर ऑर्डर भेजें",
    emptyBag: "आपका थैला खाली है।",
    returnToMenu: "मेन्यू पर जाएं",
    orderStatus: "ऑर्डर की स्थिति",
    requestAssistance: "सहायता बुलाएं",
    waiterNotified: "वेटर को सूचित किया गया",
    orderReceived: "ऑर्डर प्राप्त हुआ, रसोई की प्रतीक्षा है।",
    preparing: "रसोई में भोजन तैयार हो रहा है।",
    ready: "आपका भोजन तैयार है।",
    served: "परोस दिया गया! आनंद लें।",
    paymentPending: "जाने से पहले भुगतान पूरा करें।",
    leaveReview: "गूगल पर समीक्षा लिखें",
    connectWifi: "वाई-फाई से जुड़ें",
    scanToConnect: "कनेक्ट करने के लिए स्कैन करें",
    recommendedWithDish: "इस डिश के साथ अनुशंसित",
    completeYourMeal: "अपना भोजन पूरा करें",
    combos: "कॉम्बो",
    veg: "शाकाहारी",
    nonVeg: "मांसाहारी",
    spicy: "तीखा",
    bestseller: "लोकप्रिय",
    chefSpecial: "शेफ स्पेशल",
    newItem: "नया",
    searchPlaceholder: "व्यंजन, सामग्री खोजें...",
    all: "सभी",
    priceRange: "मूल्य सीमा",
    gstInvoice: "जीएसटी टैक्स इनवॉइस",
    invoiceNo: "इनवॉइस नंबर",
    date: "दिनांक",
    table: "टेबल",
    taxBreakup: "जीएसटी टैक्स ब्रेकअप",
    cgst: "सीजीएसटी",
    sgst: "एसजीएसटी",
    serviceCharge: "सेवा शुल्क",
    discount: "छूट",
    grandTotal: "कुल राशि",
    subtotal: "उप-योग",
    taxableAmt: "कर योग्य राशि",
    printInvoice: "इनवॉइस प्रिंट करें",
    downloadPDF: "इनवॉइस डाउनलोड करें",
    welcome: "स्वागत है",
    login: "लॉग इन",
    signup: "साइन अप",
    backToMenu: "मेन्यू पर वापस जाएं",
  },
  te: {
    menu: "మెనూ",
    bag: "బ్యాగ్",
    account: "ఖాతా",
    reserve: "రిజర్వేషన్",
    addToBag: "బ్యాగ్‌లో చేర్చు",
    itemAdded: "చేర్చబడింది!",
    specialInstructions: "ప్రత్యేక సూచనలు",
    quantity: "పరిమాణం",
    customizations: "కస్టమైజేషన్స్",
    orderTotal: "ఆర్డర్ మొత్తం",
    placeOrder: "టేబుల్‌కి ఆర్డర్ చేయి",
    emptyBag: "మీ బ్యాగ్ ఖాళీగా ఉంది.",
    returnToMenu: "మెనూకి వెళ్ళు",
    orderStatus: "ఆర్డర్ స్థితి",
    requestAssistance: "సహాయం కోరండి",
    waiterNotified: "వేటర్‌కి సమాచారం అందింది",
    orderReceived: "ఆర్డర్ అందింది, కిచెన్ స్పందన కోసం నిరీక్షణ.",
    preparing: "కిచెన్‌లో మీ ఆర్డర్ తయారవుతోంది.",
    ready: "వడ్డించడానికి సిద్ధంగా ఉంది.",
    served: "వడ్డించబడింది! ఆస్వాదించండి.",
    paymentPending: "వెళ్లే ముందు బిల్లు చెల్లించండి.",
    leaveReview: "గూగుల్ రివ్యూ ఇవ్వండి",
    connectWifi: "వైఫై కనెక్ట్ చేయి",
    scanToConnect: "కనెక్ట్ కావడానికి స్కాన్ చేయి",
    recommendedWithDish: "దీనితో పాటు సిఫార్సు చేయబడింది",
    completeYourMeal: "మీ భోజనాన్ని పూర్తి చేయండి",
    combos: "కాంబోలు",
    veg: "వెజ్",
    nonVeg: "నాన్-వెజ్",
    spicy: "కారం",
    bestseller: "బెస్ట్ సెల్లర్",
    chefSpecial: "షెఫ్ స్పెషల్",
    newItem: "కొత్తది",
    searchPlaceholder: "వంటకాలు వెతకండి...",
    all: "అన్నీ",
    priceRange: "ధర పరిధి",
    gstInvoice: "జీఎస్టీ ఇన్వాయిస్",
    invoiceNo: "ఇన్వాయిస్ సంఖ్య",
    date: "తేదీ",
    table: "టేబుల్",
    taxBreakup: "జీఎస్టీ పన్ను విభజన",
    cgst: "సీజీఎస్‌టీ",
    sgst: "ఎస్‌జీఎస్‌టీ",
    serviceCharge: "సర్వీస్ చార్జ్",
    discount: "డిస్కౌంట్",
    grandTotal: "మొత్తం బిల్లు",
    subtotal: "సబ్ టోటల్",
    taxableAmt: "పన్ను విధించదగిన మొత్తం",
    printInvoice: "ప్రింట్ ఇన్వాయిస్",
    downloadPDF: "ఇన్వాయిస్ డౌన్‌లోడ్",
    welcome: "స్వాగతం",
    login: "లాగిన్",
    signup: "సైన్ అప్",
    backToMenu: "మెనూకి తిరిగి వెళ్ళు",
  }
};

const DEFAULT_SETTINGS = {
  restaurantName: "L'Artisan Indian Bistro",
  restaurantAddress: "12, Kasturba Gandhi Marg, Connaught Place, New Delhi, Delhi 110001",
  restaurantPhone: "+91 11 2345 6789",
  gstin: "07AAAAA1111A1Z1",
  cgstRate: 2.5,
  sgstRate: 2.5,
  serviceChargeRate: 5.0,
  showWifiQR: true,
  wifiSSID: "LArtisan_Premium_WiFi",
  wifiPassword: "Namaste2026",
  wifiEncryption: "WPA",
  showReviewCTA: true,
  googleReviewLink: "https://search.google.com/local/writereview?placeid=ChIJe0O8a7PzDzkR6Lq-Vn1P3r8",
};

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

function loadSettingsFromStorage() {
  try {
    const raw = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (_) {}
  return DEFAULT_SETTINGS;
}

function saveSettingsToStorage(settings) {
  try {
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
  } catch (_) {}
}

const LOCAL_ORDERS_STORAGE_KEY = 'cafe_local_orders_v1';

function loadLocalOrdersFromStorage() {
  try {
    const raw = localStorage.getItem(LOCAL_ORDERS_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (_) {}
  return [];
}

function saveLocalOrdersToStorage(orders) {
  try {
    localStorage.setItem(LOCAL_ORDERS_STORAGE_KEY, JSON.stringify(orders));
  } catch (_) {}
}

const USERS_STORAGE_KEY = 'cafe_users_v1';

function loadUsersFromStorage() {
  try {
    const raw = localStorage.getItem(USERS_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (_) {}
  try {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(INITIAL_DATA.users));
  } catch (_) {}
  return INITIAL_DATA.users;
}

function saveUsersToStorage(users) {
  try {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
  } catch (_) {}
}

const CART_STORAGE_KEY = 'cafe_cart_v1';

function loadCartFromStorage() {
  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (_) {}
  return [];
}

function saveCartToStorage(cart) {
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
  } catch (_) {}
}

// ─── Provider ────────────────────────────────────────────────────────────────

export const AppProvider = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [localOrders, setLocalOrders] = useState(loadLocalOrdersFromStorage);

  // ── Language State ────────────────────────────────────────────────────────
  const [language, setLanguageState] = useState(() => {
    try {
      return localStorage.getItem('selected_language') || 'en';
    } catch (_) {
      return 'en';
    }
  });

  const setLanguage = (lang) => {
    setLanguageState(lang);
    try {
      localStorage.setItem('selected_language', lang);
    } catch (_) {}
  };

  const t = (key) => {
    const dict = TRANSLATIONS[language] || TRANSLATIONS.en;
    return dict[key] || TRANSLATIONS.en[key] || key;
  };

  // ── Settings State (localStorage + BroadcastChannel) ──────────────────────
  const [settings, setSettingsState] = useState(loadSettingsFromStorage);
  const settingsBcRef = useRef(null);

  useEffect(() => {
    const settingsBc = new BroadcastChannel(SETTINGS_BROADCAST_CHANNEL);
    settingsBcRef.current = settingsBc;
    settingsBc.onmessage = (e) => {
      setSettingsState(e.data);
      saveSettingsToStorage(e.data);
    };
    return () => settingsBc.close();
  }, []);

  const updateSettings = (updatedSettings) => {
    const fresh = { ...settings, ...updatedSettings };
    setSettingsState(fresh);
    saveSettingsToStorage(fresh);
    try {
      settingsBcRef.current?.postMessage(fresh);
    } catch (_) {}
  };

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

  // ── Persistent Users and Static Tables ───────────────────────────────────
  const [users, setUsers] = useState(loadUsersFromStorage);
  const [staticState] = useState({
    tables: INITIAL_DATA.tables,
  });

  // Translate menu items and categories on-the-fly based on selected language
  const translatedMenuItems = menuState.menuItems.map(item => {
    let name = item.name;
    let description = item.description;
    if (language === 'hi') {
      name = item.name_hi || item.name;
      description = item.description_hi || item.description;
    } else if (language === 'te') {
      name = item.name_te || item.name;
      description = item.description_te || item.description;
    }
    return { ...item, name, description };
  });

  const translatedCategories = menuState.categories.map(cat => {
    let name = cat.name;
    if (language === 'hi') {
      if (cat.id === 'c_starters') name = "शुरुआती भोजन (Starters)";
      else if (cat.id === 'c_soups') name = "सूप (Soups)";
      else if (cat.id === 'c_veg') name = "शाकाहारी मुख्य (Veg)";
      else if (cat.id === 'c_nonveg') name = "मांसाहारी मुख्य (Non-Veg)";
      else if (cat.id === 'c_tandoor') name = "तंदूर और रोटियां";
      else if (cat.id === 'c_rice') name = "चावल के व्यंजन";
      else if (cat.id === 'c_biryani') name = "बिरयानी";
      else if (cat.id === 'c_snacks') name = "नाश्ता और स्नैक्स";
      else if (cat.id === 'c_beverages') name = "पेय पदार्थ";
      else if (cat.id === 'c_desserts') name = "मीठा (Desserts)";
      else if (cat.id === 'c_combos') name = "कॉम्बो ऑफर्स";
    } else if (language === 'te') {
      if (cat.id === 'c_starters') name = "స్టార్టర్స్ (Starters)";
      else if (cat.id === 'c_soups') name = "సూప్స్ (Soups)";
      else if (cat.id === 'c_veg') name = "వెజ్ కర్రీస్ (Veg)";
      else if (cat.id === 'c_nonveg') name = "నాన్-వెజ్ కర్రీస్ (Non-Veg)";
      else if (cat.id === 'c_tandoor') name = "తందూరి & రోటీలు";
      else if (cat.id === 'c_rice') name = "అన్నం రకాలు";
      else if (cat.id === 'c_biryani') name = "బిరియాని";
      else if (cat.id === 'c_snacks') name = "స్నాక్స్";
      else if (cat.id === 'c_beverages') name = "పానీయాలు";
      else if (cat.id === 'c_desserts') name = "డెజర్ట్స్ (Desserts)";
      else if (cat.id === 'c_combos') name = "కాంబో ఆఫర్స్";
    }
    return { ...cat, name };
  });

  // Combine Firestore orders with local orders (avoiding duplicates)
  const combinedOrders = [...ordersState.orders];
  localOrders.forEach(localOrd => {
    if (!combinedOrders.some(o => o.id === localOrd.id)) {
      combinedOrders.push(localOrd);
    }
  });
  // Sort by createdAt descending
  combinedOrders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  // ── Composed db object for components ─────────────────────────────────────
  const db = {
    users: users,
    tables: staticState.tables,
    categories: translatedCategories,
    menuItems: translatedMenuItems,
    orders: combinedOrders,
    waiterCalls: ordersState.waiterCalls,
  };

  // ─── Auth ─────────────────────────────────────────────────────────────────
  const [user, setUser] = useState(() => {
    try {
      const raw = localStorage.getItem('current_user_v1');
      if (raw) return JSON.parse(raw);
    } catch (_) {}
    return null;
  });

  const login = (email, password) => {
    const u = users.find(
      (u) => u.email === email && u.password === password
    );
    if (u) { 
      setUser(u); 
      localStorage.setItem('current_user_v1', JSON.stringify(u));
      return u; 
    }
    return null;
  };

  const signup = (name, email, password) => {
    if (users.some(u => u.email === email)) {
      return { error: 'Email already registered' };
    }
    const newUser = {
      id: `u_${Date.now()}`,
      name,
      email,
      password,
      role: 'customer'
    };
    const updatedUsers = [...users, newUser];
    setUsers(updatedUsers);
    saveUsersToStorage(updatedUsers);
    
    // Auto-login after signup
    setUser(newUser);
    localStorage.setItem('current_user_v1', JSON.stringify(newUser));
    return { user: newUser };
  };

  const logout = () => {
    setUser(null);
    try {
      localStorage.removeItem('current_user_v1');
    } catch (_) {}
  };

  // ─── Cart ─────────────────────────────────────────────────────────────────
  const [cart, setCartState] = useState(loadCartFromStorage);

  const addToCart = (item, quantity, customizations, specialInstructions) => {
    setCartState((prev) => {
      const updated = [
        ...prev,
        { ...item, cartId: Date.now(), quantity, customizations, specialInstructions },
      ];
      saveCartToStorage(updated);
      return updated;
    });
  };

  const removeFromCart = (cartId) => {
    setCartState((prev) => {
      const updated = prev.filter((c) => c.cartId !== cartId);
      saveCartToStorage(updated);
      return updated;
    });
  };

  const clearCart = () => {
    setCartState([]);
    try {
      localStorage.removeItem(CART_STORAGE_KEY);
    } catch (_) {}
  };

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
      name_hi: item.name_hi || item.name,
      name_te: item.name_te || item.name,
      categoryId: item.categoryId,
      price: Number(item.price),
      description: item.description,
      description_hi: item.description_hi || item.description,
      description_te: item.description_te || item.description,
      imageUrl:
        item.imageUrl ||
        'https://images.unsplash.com/photo-1541167760496-1628856ab772?auto=format&fit=crop&q=80',
      available: true,
      customizationOptions: item.customizationOptions || [],
      isVeg: item.isVeg !== undefined ? item.isVeg : true,
      isSpicy: Number(item.isSpicy || 0),
      isBestseller: !!item.isBestseller,
      isChefSpecial: !!item.isChefSpecial,
      isNew: !!item.isNew,
      portionInfo: item.portionInfo || 'Serves 1-2',
      upsellIds: item.upsellIds || []
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

  const placeOrder = async (tableId, paymentMode = 'Cash') => {
    const subtotal = cart.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    const discount = 0; // standard 0 discount initially
    const taxableAmount = subtotal - discount;
    const cgstAmount = Math.round((taxableAmount * (settings.cgstRate / 100)) * 100) / 100;
    const sgstAmount = Math.round((taxableAmount * (settings.sgstRate / 100)) * 100) / 100;
    const serviceChargeAmount = Math.round((taxableAmount * (settings.serviceChargeRate / 100)) * 100) / 100;
    const grandTotal = Math.round(taxableAmount + cgstAmount + sgstAmount + serviceChargeAmount);

    const orderId = `ord_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
    
    const year = new Date().getFullYear();
    const month = String(new Date().getMonth() + 1).padStart(2, '0');
    const day = String(new Date().getDate()).padStart(2, '0');
    const invoiceNumber = `INV-${year}${month}${day}-${Math.floor(1000 + Math.random() * 9000)}`;

    const cleanedItems = cart.map(item => ({
      cartId: item.cartId,
      id: item.id,
      name: item.name,
      price: item.price,
      quantity: item.quantity,
      customizations: item.customizations || [],
      specialInstructions: item.specialInstructions || ''
    }));

    const newOrder = {
      id: orderId,
      tableId,
      customerId: user?.id || 'guest',
      customerName: user?.name || 'Guest',
      customerEmail: user?.email || '',
      items: cleanedItems,
      subtotal,
      discount,
      taxableAmount,
      cgstRate: settings.cgstRate,
      sgstRate: settings.sgstRate,
      cgstAmount,
      sgstAmount,
      serviceChargeRate: settings.serviceChargeRate,
      serviceChargeAmount,
      totalAmount: grandTotal,
      paymentMode,
      gstin: settings.gstin,
      restaurantName: settings.restaurantName,
      restaurantAddress: settings.restaurantAddress,
      restaurantPhone: settings.restaurantPhone,
      invoiceNumber,
      status: 'Placed',
      paymentStatus: 'Unpaid',
      createdAt: new Date().toISOString(),
    };

    // Save to local orders state and localStorage immediately
    setLocalOrders(prev => {
      const updated = [newOrder, ...prev];
      saveLocalOrdersToStorage(updated);
      return updated;
    });

    try {
      await setDoc(doc(firestore, 'orders', orderId), newOrder);
    } catch (err) {
      console.error("Failed to sync order to server:", err);
      // We don't block the user, as we have stored it locally and they can still track/print it!
    }

    clearCart();
    return orderId;
  };

  const updateOrderStatus = async (orderId, status) => {
    setLocalOrders(prev => {
      const updated = prev.map(o => o.id === orderId ? { ...o, status } : o);
      saveLocalOrdersToStorage(updated);
      return updated;
    });
    try {
      await updateDoc(doc(firestore, 'orders', orderId), { status });
    } catch (err) {
      console.error("Error updating order status:", err);
    }
  };

  const updateOrderPayment = async (orderId, paymentStatus) => {
    setLocalOrders(prev => {
      const updated = prev.map(o => o.id === orderId ? { ...o, paymentStatus } : o);
      saveLocalOrdersToStorage(updated);
      return updated;
    });
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
        user, login, logout, signup,
        cart, addToCart, removeFromCart, clearCart,
        placeOrder, updateOrderStatus, updateOrderPayment,
        callWaiter, dismissCall,
        addMenuItem, toggleMenuItemAvailability,
        settings, updateSettings,
        language, setLanguage, t
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => useContext(AppContext);
