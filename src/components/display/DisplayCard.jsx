import { Link } from 'react-router-dom'
import AddToCartButton from '../cart/AddToCartButton'
import { formatCreator, formatPrice } from '../../data/data'
import '../../styles/collections.css'

export default function DisplayCard({ collection }) {
  const assetLabel = collection.hasVideo
    ? `${collection.imageCount} images + video`
    : `${collection.imageCount} images`

  return (
    <article className="collection-card">
      <Link
        to={`/collections/${collection.slug}`}
        className="collection-card__link"
      >
        <div className="collection-card__image-wrap">
          <img
            src={collection.coverImage}
            alt={collection.title}
            className="collection-card__image"
          />
        </div>
        <div className="collection-card__body">
          <div className="collection-card__meta">
            <span className="badge">{collection.category}</span>
            {collection.hasVideo && <span className="badge badge--muted">Video</span>}
          </div>
          <h3 className="collection-card__title">{collection.title}</h3>
          <p className="collection-card__creator">{formatCreator(collection)}</p>
          <div className="collection-card__footer">
            <span className="collection-card__price">
              {formatPrice(collection.price)}
            </span>
            <span className="collection-card__count">{assetLabel}</span>
          </div>
        </div>
      </Link>
      <div className="collection-card__actions">
        <AddToCartButton collection={collection} compact />
      </div>
    </article>
  )
}