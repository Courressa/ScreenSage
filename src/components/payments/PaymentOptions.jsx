import { useState } from 'react'
import { createOrder } from '../../api/api'
import { useCart } from '../../context/useCart'
import { formatPrice } from '../../data/data'
import '../../styles/payments.css'
import '../../styles/forms.css'

export default function PaymentOptions({ items, total }) {
  const { clearCart } = useCart()
  const stripeKey = import.meta.env.VITE_STRIPE_KEY
  const paypalClientId = import.meta.env.VITE_PAYPAL_CLIENT_ID
  const keysConfigured = stripeKey && paypalClientId
  const count = items.length

  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const handleDemoCheckout = async () => {
    setSubmitting(true)
    setError('')
    setMessage('')

    try {
      await createOrder({
        items: items.map((item) => ({
          productId: item.id,
          slug: item.slug,
          title: item.title,
          price: item.price,
          quantity: 1,
        })),
        paymentMethod: 'demo',
        status: 'completed',
      })
      clearCart()
      setMessage('Test order completed! Check Admin → Sales / Dashboard for totals.')
    } catch (err) {
      setError(err.message || 'Failed to complete test order')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="payment-options">
      <h2 className="payment-options__title">Checkout</h2>
      <p className="payment-options__subtitle">
        {count} {count === 1 ? 'wallpaper' : 'wallpapers'} — {formatPrice(total)}
      </p>
      <ul className="payment-options__items">
        {items.map((item) => (
          <li key={item.slug}>
            <span>{item.title}</span>
            <span>{formatPrice(item.price)}</span>
          </li>
        ))}
      </ul>
      <div className="payment-options__buttons">
        <button
          type="button"
          className="btn btn--primary payment-options__btn btn--disabled"
          disabled
        >
          Pay with Stripe
        </button>
        <button
          type="button"
          className="btn btn--secondary payment-options__btn btn--disabled"
          disabled
        >
          Pay with PayPal
        </button>
        <button
          type="button"
          className="btn btn--primary payment-options__btn"
          onClick={handleDemoCheckout}
          disabled={submitting || count === 0}
        >
          {submitting ? 'Placing order…' : 'Complete order (test)'}
        </button>
      </div>
      {message && (
        <p className="payment-options__note" style={{ color: '#4ade80' }}>
          {message}
        </p>
      )}
      {error && (
        <p className="payment-options__note" style={{ color: '#f87171' }}>
          {error}
        </p>
      )}
      {!keysConfigured && (
        <p className="payment-options__note">
          Real Stripe/PayPal coming later. Use{' '}
          <strong>Complete order (test)</strong> to record a demo sale for the
          admin dashboard.
        </p>
      )}
    </div>
  )
}
