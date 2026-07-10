import { Routes, Route } from 'react-router-dom'
import Layout from './components/layout/Layout.jsx'
import HomePage from './pages/HomePage.jsx'
import ProductPage from './pages/ProductPage.jsx'
import SuggestPage from './pages/SuggestPage.jsx'
import CartPage from './pages/CartPage.jsx'
import BrowsePage from './pages/BrowsePage.jsx'

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
    </Routes>
  )
}