import { Link } from 'react-router-dom'
import CartItem from '../components/cart/CartItem'
import PaymentOptions from '../components/payments/PaymentOptions'
import { useCart } from '../context/useCart'
import { formatPrice } from '../data/data'
import '../styles/cart.css'

export default function CartPage() {
  const { items, total, count } = useCart()

  if (count === 0) {
    return (
      <div className="page cart-page cart-page--empty">
        <h1 className="page__title">Your cart is empty</h1>
        <p className="page__subtitle">
          Browse our wallpapers and add the ones you like.
        </p>
        <Link to="/products" className="btn btn--primary">
          Browse wallpapers
        </Link>
      </div>
    )
  }

  return (
    <div className="page cart-page">
      <header className="page__header">
        <h1 className="page__title">Your cart</h1>
        <p className="page__subtitle">
          {count} {count === 1 ? 'wallpaper' : 'wallpapers'} ready for checkout.
        </p>
      </header>

      <div className="cart-page__layout">
        <section className="cart-page__items" aria-label="Cart items">
          <ul className="cart-list">
            {items.map((item) => (
              <CartItem key={item.slug} item={item} />
            ))}
          </ul>
        </section>

        <aside className="cart-page__summary">
          <div className="cart-summary">
            <div className="cart-summary__row">
              <span>Subtotal</span>
              <span>{formatPrice(total)}</span>
            </div>
            <div className="cart-summary__row cart-summary__row--total">
              <span>Total</span>
              <span>{formatPrice(total)}</span>
            </div>
          </div>
          <PaymentOptions items={items} total={total} />
        </aside>
      </div>
    </div>
  )
}