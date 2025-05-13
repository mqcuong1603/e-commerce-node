// src/routes.jsx
import { Route, Routes } from 'react-router-dom';

// Layout components
import PrivateRoute from './components/common/PrivateRoute';

// Pages
import HomePage from './pages/HomePage';
import ProductsPage from './pages/ProductsPage';
import ProductDetailPage from './pages/ProductDetailPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProfilePage from './pages/ProfilePage';
import OrderHistoryPage from './pages/OrderHistoryPage';

// Admin pages (can be imported later if needed)
// import AdminDashboard from './pages/admin/AdminDashboard';

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<HomePage />} />
      <Route path="/products" element={<ProductsPage />} />
      <Route path="/products/category/:slug" element={<ProductsPage />} />
      <Route path="/products/:slug" element={<ProductDetailPage />} />
      <Route path="/cart" element={<CartPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      
      {/* Protected Routes */}
      <Route 
        path="/checkout" 
        element={
          <PrivateRoute>
            <CheckoutPage />
          </PrivateRoute>
        } 
      />
      <Route 
        path="/profile" 
        element={
          <PrivateRoute>
            <ProfilePage />
          </PrivateRoute>
        }
      />
      <Route 
        path="/orders" 
        element={
          <PrivateRoute>
            <OrderHistoryPage />
          </PrivateRoute>
        }
      />
      <Route 
        path="/orders/:orderId" 
        element={
          <PrivateRoute>
            <OrderHistoryPage />
          </PrivateRoute>
        }
      />
      
      {/* Admin Routes would go here */}
      {/* 
      <Route 
        path="/admin/*" 
        element={
          <AdminRoute>
            <AdminRoutes />
          </AdminRoute>
        }
      />
      */}
      
      {/* 404 Page - Catch all unmatched routes */}
      <Route path="*" element={<div className="container py-5 text-center"><h1>404 - Page Not Found</h1></div>} />
    </Routes>
  );
};

export default AppRoutes;