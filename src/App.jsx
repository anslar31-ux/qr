import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';

import Landing from './pages/Customer/Landing';
import Auth from './pages/Auth/Auth';
import Menu from './pages/Customer/Menu';
import ItemDetail from './pages/Customer/ItemDetail';
import Cart from './pages/Customer/Cart';
import Tracking from './pages/Customer/Tracking';

import CustomerLayout from './components/CustomerLayout';
import KitchenDashboard from './pages/Staff/KitchenDashboard';
import WaiterDashboard from './pages/Staff/WaiterDashboard';

import AdminDashboard from './pages/Admin/AdminDashboard';

function App() {
  return (
    <AppProvider>
      <Router>
        <Routes>
          {/* Customer Routes inside Layout */}
          <Route path="/app" element={<CustomerLayout />}>
            <Route path="t/:tableId" element={<Landing />} />
            <Route path="auth" element={<Auth />} />
            <Route path="menu" element={<Menu />} />
            <Route path="item/:id" element={<ItemDetail />} />
            <Route path="cart" element={<Cart />} />
            <Route path="tracking/:orderId" element={<Tracking />} />
          </Route>

          {/* Staff Routes */}
          <Route path="/staff/kitchen" element={<KitchenDashboard />} />
          <Route path="/staff/waiter" element={<WaiterDashboard />} />

          {/* Admin Routes */}
          <Route path="/admin/*" element={<AdminDashboard />} />

          {/* Default redirect to login or landing */}
          <Route path="/" element={<Navigate to="/app/auth" />} />
        </Routes>
      </Router>
    </AppProvider>
  );
}

export default App;
