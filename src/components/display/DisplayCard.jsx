import { Link } from 'react-router-dom'
import AddToCartButton from '../cart/AddToCartButton.jsx'
import { formatCreator, formatPrice } from '../../data/data.js'
import '../../styles/display.css'

export default function DisplayCard({ product }) {
  const assetLabel = product.hasVideo
    ? `${product.imageCount} image${product.imageCount > 1 ? 's' : ''} + video`
    : (`${product.imageCount} image${product.imageCount > 1 ? 's' : ''}`);

  return (
    <article className="display-card">
      <Link
        to={`/products/${product.slug}`}
        className="display-card__link"
      >
        <div className="display-card__image-wrap">
          <img
            src={product.coverImage}
            alt={product.title}
            className="display-card__image"
          />
        </div>
        <div className="display-card__body">
          <div className="display-card__meta">
            <span className="badge">{product.category}</span>
            {product.hasVideo && <span className="badge badge--muted">Video</span>}
          </div>
          <h3 className="display-card__title">{product.title}</h3>
          <p className="display-card__creator">{formatCreator(product)}</p>
          <div className="display-card__footer">
            <span className="display-card__price">
              {formatPrice(product.price)}
            </span>
            <span className="display-card__count">{assetLabel}</span>
          </div>
        </div>
      </Link>
      <div className="display-card__actions">
        <AddToCartButton item={product} compact />
      </div>
    </article>
  )
}