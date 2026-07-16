import { useEffect, useMemo, useState } from 'react'
import { getProducts } from '../api/api'
import { CartContext, CART_STORAGE_KEY } from './cartContext'

function loadCart() {
  try {
    const stored = localStorage.getItem(CART_STORAGE_KEY)
    if (!stored) return []
    const slugs = JSON.parse(stored)
    return Array.isArray(slugs) ? slugs : []
  } catch {
    return []
  }
}

export default function CartProvider({ children }) {
  const [slugs, setSlugs] = useState(loadCart)
  const [catalog, setCatalog] = useState([])
  const [catalogLoading, setCatalogLoading] = useState(true)

  useEffect(() => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(slugs))
  }, [slugs])

  useEffect(() => {
    let cancelled = false

    const loadCatalog = async () => {
      setCatalogLoading(true)
      try {
        const products = await getProducts()
        if (!cancelled) setCatalog(products)
      } catch (error) {
        console.error('Failed to load products for cart:', error)
        if (!cancelled) setCatalog([])
      } finally {
        if (!cancelled) setCatalogLoading(false)
      }
    }

    loadCatalog()
    return () => {
      cancelled = true
    }
  }, [])

  const value = useMemo(() => {
    const bySlug = new Map(catalog.map((product) => [product.slug, product]))

    const items = slugs
      .map((slug) => bySlug.get(slug))
      .filter(Boolean)

    const total = items.reduce((sum, item) => sum + item.price, 0)

    return {
      items,
      count: items.length,
      total,
      catalogLoading,
      isInCart: (slug) => slugs.includes(slug),
      addToCart: (item) => {
        setSlugs((prev) =>
          prev.includes(item.slug) ? prev : [...prev, item.slug],
        )
      },
      removeFromCart: (slug) => {
        setSlugs((prev) => prev.filter((s) => s !== slug))
      },
      clearCart: () => setSlugs([]),
    }
  }, [slugs, catalog, catalogLoading])

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}
