import { Link, useParams } from 'react-router-dom'
import AddToCartButton from '../components/cart/AddToCartButton'
import DevicePreview from '../components/display/DevicePreview'
import { formatCreator, formatPrice, getProductBySlug } from '../data/data'
import '../styles/display.css'

export default function ProductPage() {
  const { slug } = useParams()
  const item = getProductBySlug(slug)

  if (!item) {
    return (
      <div className="page not-found">
        <h1>Product not found</h1>
        <p>The product you&apos;re looking for doesn&apos;t exist.</p>
        <Link to="/" className="btn btn--primary">
          Back to products
        </Link>
      </div>
    )
  }

  const assetLabel = item.hasVideo
    ? `${item.imageCount} wallpapers + video`
    : `${item.imageCount} wallpapers`

  return (
    <div className="page">
      <div className="display-detail__header">
        <h1 className="display-detail__title">{item.title}</h1>
        <p className="display-detail__creator">{formatCreator(item)}</p>
        <p className="display-detail__description">{item.description}</p>
        <div className="display-detail__meta">
          <span className="badge">{item.category}</span>
          {item.mood.map((m) => (
            <span key={m} className="badge badge--muted">
              {m}
            </span>
          ))}
          {item.hasVideo && <span className="badge">Video included</span>}
        </div>
        <p className="display-detail__price">{formatPrice(item.price)}</p>
      </div>

      <div className="display-detail__layout">
        <DevicePreview previews={item.previews} title={item.title} />
        <div>
          <div className="display-detail__purchase">
            <AddToCartButton item={item} />
          </div>
          <div className="display-detail__tags">
            <span>{assetLabel}</span>
            {item.resolutions.map((r) => (
              <span key={r}>{r}</span>
            ))}
            {item.devices.map((d) => (
              <span key={d}>{d}</span>
            ))}
            {item.tags.map((tag) => (
              <span key={tag}>#{tag}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}