import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { store } from './store/store';
import Layout from './components/layout/Layout';
import AuthModals from './components/modals/AuthModals';
import CartModal from './components/modals/CartModal';
import HomePage from './pages/customer/HomePage';
import RestaurantPage from './pages/customer/RestaurantPage';
import CartPage from './pages/customer/CartPage';
import OrdersPage from './pages/customer/OrdersPage';
import ProfilePage from './pages/customer/ProfilePage';
import AdminDashboard from './pages/admin/AdminDashboard';
import RestaurantDashboard from './pages/restaurant/RestaurantDashboard';
import DeliveryDashboard from './pages/delivery/DeliveryDashboard';
import ProtectedRoute from './components/layout/ProtectedRoute';

const theme = createTheme({
  palette: {
    primary: {
      main: '#ff6b35',
    },
    secondary: {
      main: '#f7931e',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
        },
      },
    },
  },
});

function App() {
  return (
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Router>
          <div className="App">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Layout />}>
                <Route index element={<HomePage />} />
                <Route path="restaurant/:id" element={<RestaurantPage />} />
                <Route path="cart" element={<CartPage />} />
                <Route path="orders" element={<OrdersPage />} />
                <Route path="profile" element={<ProfilePage />} />
              </Route>
              
              {/* Protected Admin Routes */}
              <Route 
                path="/admin/*" 
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminDashboard />
                  </ProtectedRoute>
                } 
              />
              
              {/* Protected Restaurant Owner Routes */}
              <Route 
                path="/restaurant-owner/*" 
                element={
                  <ProtectedRoute allowedRoles={['restaurant_owner']}>
                    <RestaurantDashboard />
                  </ProtectedRoute>
                } 
              />
              
              {/* Protected Delivery Partner Routes */}
              <Route 
                path="/delivery/*" 
                element={
                  <ProtectedRoute allowedRoles={['delivery_partner']}>
                    <DeliveryDashboard />
                  </ProtectedRoute>
                } 
              />
              
              {/* Redirect unknown routes */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
            
            <AuthModals />
            <CartModal />
          </div>
        </Router>
      </ThemeProvider>
    </Provider>
  );
}

export default App;