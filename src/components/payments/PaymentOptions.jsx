import { useMemo, useState } from 'react'
import { PayPalButtons, PayPalScriptProvider } from '@paypal/react-paypal-js'
import {
  createPaypalOrder,
  capturePaypalOrder,
  createStripeCheckout,
} from '../../api/api'
import { useCart } from '../../context/useCart'
import { formatPrice } from '../../data/data'
import '../../styles/payments.css'
import '../../styles/forms.css'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function buildOrderItems(items) {
  // Server re-prices and loads galleries from DB by slug — do not send fullGallery
  return items.map((item) => ({
    productId: item.id,
    slug: item.slug,
    title: item.title,
    quantity: 1,
  }))
}

export default function PaymentOptions({ items, total, onOrderComplete }) {
  const { clearCart } = useCart()
  const stripeKey = import.meta.env.VITE_STRIPE_KEY
  const paypalClientId = import.meta.env.VITE_PAYPAL_CLIENT_ID
  const count = items.length

  const [email, setEmail] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const emailValid = EMAIL_REGEX.test(email.trim())
  const paypalReady = Boolean(paypalClientId) && count > 0
  // Stripe Checkout is hosted — only secret is required on server; publishable key optional for future Elements
  const stripeReady = Boolean(stripeKey) && count > 0

  const paypalOptions = useMemo(
    () => ({
      clientId: paypalClientId || 'test',
      currency: 'USD',
      intent: 'capture',
    }),
    [paypalClientId]
  )

  const completeLocalOrder = (result, methodLabel, orderTotal = total) => {
    clearCart()
    onOrderComplete?.({
      message: result.message || 'Order placed successfully.',
      emailSent: Boolean(result.emailSent),
      emailMessage: result.emailMessage || '',
      customerEmail: email.trim().toLowerCase() || result.order?.customerEmail,
      order: result.order,
      downloads: result.downloads || [],
      total: orderTotal,
      paymentMethod: methodLabel,
    })
  }

  const handleStripeCheckout = async () => {
    setError('')
    const trimmedEmail = email.trim()
    if (!EMAIL_REGEX.test(trimmedEmail)) {
      setError('Enter a valid email before paying with Stripe.')
      return
    }

    setSubmitting(true)
    try {
      const data = await createStripeCheckout({
        items: buildOrderItems(items),
        customerEmail: trimmedEmail,
      })
      if (!data?.url) {
        throw new Error('Stripe did not return a checkout URL.')
      }
      // Leave cart intact until confirm on return — Stripe may cancel
      window.location.href = data.url
    } catch (err) {
      setError(err.message || 'Could not start Stripe checkout.')
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

      <div className="payment-options__form">
        <div className="form-group">
          <label htmlFor="checkout-email">Email for delivery *</label>
          <input
            id="checkout-email"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => {
              setEmail(e.target.value)
              setError('')
            }}
            placeholder="you@example.com"
            disabled={submitting || count === 0}
          />
          <small className="form-hint">
            We&apos;ll send your full gallery download links here after purchase.
          </small>
        </div>

        <div className="payment-options__buttons">
          {!emailValid && count > 0 && (
            <p className="payment-options__email-hint">
              Enter a valid email above to enable checkout.
            </p>
          )}

          {stripeReady ? (
            <button
              type="button"
              className={
                emailValid && !submitting && count > 0
                  ? 'btn btn--primary payment-options__btn'
                  : 'btn btn--primary payment-options__btn btn--disabled'
              }
              disabled={!emailValid || submitting || count === 0}
              onClick={handleStripeCheckout}
            >
              {submitting ? 'Redirecting…' : 'Pay with Stripe'}
            </button>
          ) : (
            <button
              type="button"
              className="btn btn--primary payment-options__btn btn--disabled"
              disabled
            >
              Pay with Stripe
            </button>
          )}

          {paypalReady ? (
            <div className="payment-options__paypal">
              <div
                className={
                  emailValid && !submitting
                    ? 'payment-options__paypal-buttons'
                    : 'payment-options__paypal-buttons payment-options__paypal-buttons--disabled'
                }
              >
                <PayPalScriptProvider options={paypalOptions}>
                  <PayPalButtons
                    style={{
                      layout: 'vertical',
                      color: 'gold',
                      shape: 'rect',
                      label: 'paypal',
                      height: 45,
                      borderRadius: 8,
                    }}
                    disabled={!emailValid || submitting}
                    forceReRender={[email, total, items.map((i) => i.slug).join(',')]}
                    createOrder={async () => {
                      setError('')
                      setSubmitting(true)
                      try {
                        const data = await createPaypalOrder({
                          items: buildOrderItems(items),
                          customerEmail: email.trim(),
                        })
                        if (!data?.id) {
                          throw new Error('PayPal did not return an order id.')
                        }
                        return data.id
                      } catch (err) {
                        setError(err.message || 'Could not start PayPal checkout.')
                        setSubmitting(false)
                        throw err
                      }
                    }}
                    onApprove={async (data) => {
                      setError('')
                      setSubmitting(true)
                      try {
                        const result = await capturePaypalOrder({
                          paypalOrderId: data.orderID,
                          items: buildOrderItems(items),
                          customerEmail: email.trim(),
                        })
                        completeLocalOrder(result, 'paypal')
                      } catch (err) {
                        setError(
                          err.message ||
                            'Payment approved but order fulfillment failed. Contact support.'
                        )
                      } finally {
                        setSubmitting(false)
                      }
                    }}
                    onCancel={() => {
                      setSubmitting(false)
                      setError('PayPal checkout was cancelled.')
                    }}
                    onError={(err) => {
                      console.error('PayPal button error:', err)
                      setSubmitting(false)
                      setError('PayPal encountered an error. Try again or use Stripe.')
                    }}
                  />
                </PayPalScriptProvider>
              </div>
            </div>
          ) : (
            <button
              type="button"
              className="btn btn--secondary payment-options__btn btn--disabled"
              disabled
            >
              Pay with PayPal
            </button>
          )}
        </div>
      </div>

      {error && (
        <p className="payment-options__note payment-options__note--error">
          {error}
        </p>
      )}
      {(!paypalClientId || !stripeKey) && (
        <p className="payment-options__note">
          {!paypalClientId && (
            <>
              PayPal needs <code>VITE_PAYPAL_CLIENT_ID</code> + server secrets.{' '}
            </>
          )}
          {!stripeKey && (
            <>
              Stripe needs <code>VITE_STRIPE_KEY</code> (pk_test_…) and server{' '}
              <code>STRIPE_SECRET_KEY</code> (sk_test_…).
            </>
          )}
        </p>
      )}
      {(paypalClientId || stripeKey) && (
        <p className="payment-options__note">
          Test mode: use sandbox PayPal buyers / Stripe test cards
          (e.g. <code>4242 4242 4242 4242</code>). No real charges with test keys.
        </p>
      )}
    </div>
  )
}
