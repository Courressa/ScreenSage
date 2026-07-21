import { useState } from 'react'
import { createOrder } from '../../api/api'
import { useCart } from '../../context/useCart'
import { formatPrice } from '../../data/data'
import '../../styles/payments.css'
import '../../styles/forms.css'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default function PaymentOptions({ items, total, onOrderComplete }) {
  const { clearCart } = useCart()
  const stripeKey = import.meta.env.VITE_STRIPE_KEY
  const paypalClientId = import.meta.env.VITE_PAYPAL_CLIENT_ID
  const keysConfigured = stripeKey && paypalClientId
  const count = items.length

  const [email, setEmail] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const handleDemoCheckout = async (event) => {
    event.preventDefault()
    setSubmitting(true)
    setError('')

    const trimmedEmail = email.trim()
    if (!EMAIL_REGEX.test(trimmedEmail)) {
      setError('Enter a valid email so we can send your wallpapers.')
      setSubmitting(false)
      return
    }

    try {
      const result = await createOrder({
        items: items.map((item) => ({
          productId: item.id,
          slug: item.slug,
          title: item.title,
          price: item.price,
          quantity: 1,
          fullGallery: item.fullGallery || [],
          coverImage: item.coverImage || '',
        })),
        customerEmail: trimmedEmail,
        paymentMethod: 'demo',
        status: 'completed',
      })

      clearCart()

      // Parent keeps this result so success UI survives cart becoming empty
      onOrderComplete?.({
        message: result.message || 'Order placed successfully.',
        emailSent: Boolean(result.emailSent),
        emailMessage: result.emailMessage || '',
        customerEmail: trimmedEmail,
        order: result.order,
        downloads: result.downloads || [],
        total,
      })
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

      <form className="payment-options__form" onSubmit={handleDemoCheckout}>
        <div className="form-group">
          <label htmlFor="checkout-email">Email for delivery *</label>
          <input
            id="checkout-email"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            disabled={submitting || count === 0}
          />
          <small className="form-hint">
            We&apos;ll send your full gallery download links here after purchase.
          </small>
        </div>

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
            type="submit"
            className="btn btn--primary payment-options__btn"
            disabled={submitting || count === 0}
          >
            {submitting ? 'Placing order…' : 'Complete order (test)'}
          </button>
        </div>
      </form>

      {error && (
        <p className="payment-options__note payment-options__note--error">
          {error}
        </p>
      )}
      {!keysConfigured && (
        <p className="payment-options__note">
          Real Stripe/PayPal coming later. Use{' '}
          <strong>Complete order (test)</strong> to place a demo order, receive
          delivery info, and download your wallpapers.
        </p>
      )}
    </div>
  )
}
