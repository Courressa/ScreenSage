import { Routes, Route } from 'react-router-dom'
import Layout from './components/layout/Layout'
import HomePage from './pages/HomePage'
import CollectionPage from './pages/CollectionPage'
import SuggestPage from './pages/SuggestPage'
import CartPage from './pages/CartPage'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="collections/:slug" element={<CollectionPage />} />
        <Route path="suggest" element={<SuggestPage />} />
        <Route path="cart" element={<CartPage />} />
      </Route>
    </Routes>
  )
}