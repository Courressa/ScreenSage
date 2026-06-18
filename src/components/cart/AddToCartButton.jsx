import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useCart } from '../../context/useCart'
import '../../styles/cart.css'

export default function AddToCartButton({ collection, compact = false }) {
  const { isInCart, addToCart } = useCart()
  const [justAdded, setJustAdded] = useState(false)
  const inCart = isInCart(collection.slug)

  function handleAdd(event) {
    event.preventDefault()
    event.stopPropagation()
    addToCart(collection)
    setJustAdded(true)
    setTimeout(() => setJustAdded(false), 2000)
  }

  if (inCart) {
    return (
      <Link
        to="/cart"
        className={`btn btn--secondary add-to-cart${compact ? ' add-to-cart--compact' : ''}`}
        onClick={(e) => e.stopPropagation()}
      >
        In cart — View
      </Link>
    )
  }

  return (
    <button
      type="button"
      className={`btn btn--primary add-to-cart${compact ? ' add-to-cart--compact' : ''}${
        justAdded ? ' add-to-cart--added' : ''
      }`}
      onClick={handleAdd}
    >
      {justAdded ? 'Added!' : 'Add to cart'}
    </button>
  )
}