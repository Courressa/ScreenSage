import { useMemo, useState } from 'react'
import { PayPalButtons, PayPalScriptProvider } from '@paypal/react-paypal-js'
import {
  createOrder,
  createPaypalOrder,
  capturePaypalOrder,
} from '../../api/api'
import { useCart } from '../../context/useCart'
import { formatPrice } from '../../data/data'
import '../../styles/payments.css'
import '../../styles/forms.css'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function buildOrderItems(items) {
  return items.map((item) => ({
    productId: item.id,
    slug: item.slug,
    title: item.title,
    price: item.price,
    quantity: 1,
    fullGallery: item.fullGallery || [],
    coverImage: item.coverImage || '',
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

  const paypalOptions = useMemo(
    () => ({
      clientId: paypalClientId || 'test',
      currency: 'USD',
      intent: 'capture',
      // Disable funding sources you don't need yet if desired
      // disableFunding: 'credit,card',
    }),
    [paypalClientId]
  )

  const completeLocalOrder = (result, methodLabel) => {
    clearCart()
    onOrderComplete?.({
      message: result.message || 'Order placed successfully.',
      emailSent: Boolean(result.emailSent),
      emailMessage: result.emailMessage || '',
      customerEmail: email.trim().toLowerCase(),
      order: result.order,
      downloads: result.downloads || [],
      total,
      paymentMethod: methodLabel,
    })
  }

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
        items: buildOrderItems(items),
        customerEmail: trimmedEmail,
        paymentMethod: 'demo',
        status: 'completed',
      })
      completeLocalOrder(result, 'demo')
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
          <button
            type="button"
            className="btn btn--primary payment-options__btn btn--disabled"
            disabled
          >
            Pay with Stripe
          </button>

          {paypalReady ? (
            <div className="payment-options__paypal">
              {!emailValid && (
                <p className="payment-options__paypal-hint">
                  Enter your email above to enable PayPal.
                </p>
              )}
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
                      // Soften sharp PayPal corners to match site radius
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
                      setError('PayPal encountered an error. Try again or use test checkout.')
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
      {!paypalClientId && (
        <p className="payment-options__note">
          Add <code>VITE_PAYPAL_CLIENT_ID</code> (and server{' '}
          <code>PAYPAL_CLIENT_ID</code> / <code>PAYPAL_CLIENT_SECRET</code>) to
          enable sandbox PayPal. Demo checkout still works without it.
          {!stripeKey && ' Stripe wiring comes later.'}
        </p>
      )}
      {paypalClientId && (
        <p className="payment-options__note">
          PayPal is in <strong>sandbox</strong> mode when you use sandbox
          credentials. Log in with a{' '}
          <a
            href="https://developer.paypal.com/dashboard/accounts"
            target="_blank"
            rel="noreferrer"
          >
            sandbox buyer account
          </a>
          , not your real PayPal login.
        </p>
      )}
    </div>
  )
}
