import { useEffect, useMemo, useState } from 'react'
import { getProductBySlug } from '../data/data.js'
import { CartContext, CART_STORAGE_KEY } from './cartContext.js'

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

  useEffect(() => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(slugs))
  }, [slugs])

  const value = useMemo(() => {
    const items = slugs
      .map((slug) => getProductBySlug(slug))
      .filter(Boolean)

    const total = items.reduce((sum, item) => sum + item.price, 0)

    return {
      items,
      count: items.length,
      total,
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
  }, [slugs])

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}