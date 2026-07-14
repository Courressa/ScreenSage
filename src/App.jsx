import { Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import HomePage from './pages/HomePage';
import ProductPage from './pages/ProductPage';
import SuggestPage from './pages/SuggestPage';
import CartPage from './pages/CartPage';
import BrowsePage from './pages/BrowsePage';
import AdminProtectedRoute from './components/auth/AdminProtectedRoute';
import AdminLoginPage from './pages/AdminLoginPage';
import AdminDashboard from './components/admin/AdminDashboard';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="suggest" element={<SuggestPage />} />
        <Route path="cart" element={<CartPage />} />
        <Route path="products" element={<BrowsePage />} />
        <Route path="products/:slug" element={<ProductPage />} />
      </Route>

      {/* Admin Routes */}
      <Route path="admin/login" element={<AdminLoginPage />} />

      <Route element={<AdminProtectedRoute />}>
        <Route path="admin/dashboard" element={<AdminDashboard />} />
      </Route>
    </Routes>
  )
}