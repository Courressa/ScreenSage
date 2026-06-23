import { Link } from 'react-router-dom'
import { formatPrice } from '../../data/data'
import { useCart } from '../../context/useCart'

export default function CartItem({ item }) {
  const { removeFromCart } = useCart()

  return (
    <li className="cart-item">
      <Link to={`/collections/${item.slug}`} className="cart-item__image-link">
        <img
          src={item.coverImage}
          alt={item.title}
          className="cart-item__image"
        />
      </Link>
      <div className="cart-item__details">
        <Link to={`/collections/${item.slug}`} className="cart-item__title">
          {item.title}
        </Link>
        <p className="cart-item__meta">
          {item.hasVideo
            ? `${item.imageCount} images + video`
            : `${item.imageCount} images`}
        </p>
      </div>
      <div className="cart-item__actions">
        <span className="cart-item__price">{formatPrice(item.price)}</span>
        <button
          type="button"
          className="cart-item__remove"
          onClick={() => removeFromCart(item.slug)}
          aria-label={`Remove ${item.title} from cart`}
        >
          Remove
        </button>
      </div>
    </li>
  )
}