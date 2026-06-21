import { Link } from 'react-router-dom'
import AddToCartButton from '../cart/AddToCartButton'
import { formatCreator, formatPrice } from '../../data/data'
import '../../styles/collections.css'

export default function DisplayCard({ product }) {
  const assetLabel = product.hasVideo
    ? `${product.imageCount} image${product.imageCount > 1 ? 's' : ''} + video`
    : (`${product.imageCount} image${product.imageCount > 1 ? 's' : ''}`);

  return (
    <article className="collection-card">
      <Link
        to={`/collections/${product.slug}`}
        className="collection-card__link"
      >
        <div className="collection-card__image-wrap">
          <img
            src={product.coverImage}
            alt={product.title}
            className="collection-card__image"
          />
        </div>
        <div className="collection-card__body">
          <div className="collection-card__meta">
            <span className="badge">{product.category}</span>
            {product.hasVideo && <span className="badge badge--muted">Video</span>}
          </div>
          <h3 className="collection-card__title">{product.title}</h3>
          <p className="collection-card__creator">{formatCreator(product)}</p>
          <div className="collection-card__footer">
            <span className="collection-card__price">
              {formatPrice(product.price)}
            </span>
            <span className="collection-card__count">{assetLabel}</span>
          </div>
        </div>
      </Link>
      <div className="collection-card__actions">
        <AddToCartButton collection={product} compact />
      </div>
    </article>
  )
}