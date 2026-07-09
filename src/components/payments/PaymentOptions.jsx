import { formatPrice } from '../../data/data'
import '../../styles/payments.css'

export default function PaymentOptions({ items, total }) {
  const stripeKey = import.meta.env.VITE_STRIPE_KEY
  const paypalClientId = import.meta.env.VITE_PAYPAL_CLIENT_ID
  const keysConfigured = stripeKey && paypalClientId
  const count = items.length

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
      </div>
      {!keysConfigured && (
        <p className="payment-options__note">
          Payment integration coming soon. Set{' '}
          <code>VITE_STRIPE_KEY</code> and <code>VITE_PAYPAL_CLIENT_ID</code> in
          your <code>.env</code> file when ready.
        </p>
      )}
    </div>
  )
}