import { Link, useParams } from 'react-router-dom'
import AddToCartButton from '../components/cart/AddToCartButton'
import DevicePreview from '../components/display/DevicePreview'
import { formatCreator, formatPrice, getProductBySlug } from '../data/data'
import '../styles/display.css'

export default function CollectionPage() {
  const { slug } = useParams()
  const collection = getProductBySlug(slug)

  if (!collection) {
    return (
      <div className="page not-found">
        <h1>Collection not found</h1>
        <p>The collection you&apos;re looking for doesn&apos;t exist.</p>
        <Link to="/" className="btn btn--primary">
          Back to collections
        </Link>
      </div>
    )
  }

  const assetLabel = collection.hasVideo
    ? `${collection.imageCount} wallpapers + video`
    : `${collection.imageCount} wallpapers`

  return (
    <div className="page">
      <div className="display-detail__header">
        <h1 className="display-detail__title">{collection.title}</h1>
        <p className="display-detail__creator">{formatCreator(collection)}</p>
        <p className="display-detail__description">{collection.description}</p>
        <div className="display-detail__meta">
          <span className="badge">{collection.category}</span>
          {collection.mood.map((m) => (
            <span key={m} className="badge badge--muted">
              {m}
            </span>
          ))}
          {collection.hasVideo && <span className="badge">Video included</span>}
        </div>
        <p className="display-detail__price">{formatPrice(collection.price)}</p>
      </div>

      <div className="display-detail__layout">
        <DevicePreview previews={collection.previews} title={collection.title} />
        <div>
          <div className="display-detail__purchase">
            <AddToCartButton item={collection} />
          </div>
          <div className="display-detail__tags">
            <span>{assetLabel}</span>
            {collection.resolutions.map((r) => (
              <span key={r}>{r}</span>
            ))}
            {collection.devices.map((d) => (
              <span key={d}>{d}</span>
            ))}
            {collection.tags.map((tag) => (
              <span key={tag}>#{tag}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}