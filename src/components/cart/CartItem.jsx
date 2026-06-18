import { Link } from 'react-router-dom'
import { formatPrice } from '../../data/data'
import { useCart } from '../../context/useCart'

export default function CartItem({ collection }) {
  const { removeFromCart } = useCart()

  return (
    <li className="cart-item">
      <Link to={`/collections/${collection.slug}`} className="cart-item__image-link">
        <img
          src={collection.coverImage}
          alt={collection.title}
          className="cart-item__image"
        />
      </Link>
      <div className="cart-item__details">
        <Link to={`/collections/${collection.slug}`} className="cart-item__title">
          {collection.title}
        </Link>
        <p className="cart-item__meta">
          {collection.hasVideo
            ? `${collection.imageCount} images + video`
            : `${collection.imageCount} images`}
        </p>
      </div>
      <div className="cart-item__actions">
        <span className="cart-item__price">{formatPrice(collection.price)}</span>
        <button
          type="button"
          className="cart-item__remove"
          onClick={() => removeFromCart(collection.slug)}
          aria-label={`Remove ${collection.title} from cart`}
        >
          Remove
        </button>
      </div>
    </li>
  )
}