import { Navigate, Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import HomePage from './pages/HomePage';
import ProductPage from './pages/ProductPage';
import SuggestPage from './pages/SuggestPage';
import ContactPage from './pages/ContactPage';
import CartPage from './pages/CartPage';
import BrowsePage from './pages/BrowsePage';
import AdminProtectedRoute from './components/auth/AdminProtectedRoute';
import AdminLayout from './components/admin/AdminLayout';
import AdminLoginPage from './pages/AdminLoginPage';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import AdminWallpapersPage from './pages/admin/AdminWallpapersPage';
import AdminWallpaperFormPage from './pages/admin/AdminWallpaperFormPage';
import AdminSalesPage from './pages/admin/AdminSalesPage';
import AdminUsersPage from './pages/admin/AdminUsersPage';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="suggest" element={<SuggestPage />} />
        <Route path="contact" element={<ContactPage />} />
        <Route path="cart" element={<CartPage />} />
        <Route path="products" element={<BrowsePage />} />
        <Route path="products/:slug" element={<ProductPage />} />
      </Route>

      {/* Admin Routes */}
      <Route path="admin/login" element={<AdminLoginPage />} />

      <Route path="admin" element={<AdminProtectedRoute />}>
        <Route element={<AdminLayout />}>
          <Route index element={<AdminDashboardPage />} />
          <Route path="wallpapers" element={<AdminWallpapersPage />} />
          <Route path="wallpapers/new" element={<AdminWallpaperFormPage />} />
          <Route path="wallpapers/:slug/edit" element={<AdminWallpaperFormPage />} />
          <Route path="sales" element={<AdminSalesPage />} />
          <Route path="users" element={<AdminUsersPage />} />
        </Route>
      </Route>

      <Route path="admin/dashboard" element={<Navigate to="/admin" replace />} />
    </Routes>
  );
}
