import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import CartItem from '../components/cart/CartItem.jsx'
import OrderSuccess from '../components/payments/OrderSuccess.jsx'
import PaymentOptions from '../components/payments/PaymentOptions.jsx'
import { confirmStripeCheckout } from '../api/api'
import { useCart } from '../context/useCart.js'
import { formatPrice } from '../data/data.js'
import '../styles/cart.css'
import '../styles/payments.css'

/** Survives React Strict Mode remounts so we only confirm each session once */
const stripeConfirmPromises = new Map()

export default function CartPage() {
  const { items, total, count, clearCart } = useCart()
  const [searchParams, setSearchParams] = useSearchParams()
  const [orderResult, setOrderResult] = useState(null)
  const [stripeReturnState, setStripeReturnState] = useState(null)

  const sessionId = searchParams.get('stripe_session_id')
  const stripeCancelled = searchParams.get('stripe_cancelled')

  useEffect(() => {
    if (stripeCancelled) {
      setStripeReturnState({
        type: 'cancelled',
        message: 'Stripe checkout was cancelled. Your cart is unchanged.',
      })
      setSearchParams({}, { replace: true })
      return
    }

    if (!sessionId) return

    setStripeReturnState({ type: 'confirming' })

    let ignore = false

    const run = async () => {
      try {
        let promise = stripeConfirmPromises.get(sessionId)
        if (!promise) {
          promise = confirmStripeCheckout({ sessionId })
          stripeConfirmPromises.set(sessionId, promise)
        }

        const result = await promise
        if (ignore) return

        clearCart()
        setOrderResult({
          message: result.message || 'Order placed successfully.',
          emailSent: Boolean(result.emailSent),
          emailMessage: result.emailMessage || '',
          customerEmail: result.order?.customerEmail || '',
          order: result.order,
          downloads: result.downloads || [],
          total: result.order?.totalAmount,
          paymentMethod: 'stripe',
        })
        setStripeReturnState(null)
        setSearchParams({}, { replace: true })
      } catch (err) {
        stripeConfirmPromises.delete(sessionId)
        if (ignore) return
        setStripeReturnState({
          type: 'error',
          message: err.message || 'Could not confirm Stripe payment.',
        })
        setSearchParams({}, { replace: true })
      }
    }

    run()
    return () => {
      ignore = true
    }
    // Only re-run when the session id / cancel flag changes — not when clearCart identity changes
  }, [sessionId, stripeCancelled, setSearchParams, clearCart])

  // Keep success visible after cart is cleared
  if (orderResult) {
    return (
      <div className="page cart-page">
        <OrderSuccess
          result={orderResult}
          onDismiss={() => setOrderResult(null)}
        />
      </div>
    )
  }

  if (stripeReturnState?.type === 'confirming') {
    return (
      <div className="page cart-page cart-page--empty">
        <h1 className="page__title">Confirming payment…</h1>
        <p className="page__subtitle">
          Please wait while we verify your Stripe payment and prepare downloads.
        </p>
      </div>
    )
  }

  if (count === 0 && !stripeReturnState) {
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

      {stripeReturnState?.type === 'error' && (
        <p className="payment-options__note payment-options__note--error">
          {stripeReturnState.message}
        </p>
      )}
      {stripeReturnState?.type === 'cancelled' && (
        <p className="payment-options__note">{stripeReturnState.message}</p>
      )}

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
          <PaymentOptions
            items={items}
            total={total}
            onOrderComplete={setOrderResult}
          />
        </aside>
      </div>
    </div>
  )
}
