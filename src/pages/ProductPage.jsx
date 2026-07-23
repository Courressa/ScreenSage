import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import AddToCartButton from '../components/cart/AddToCartButton'
import DevicePreview from '../components/display/DevicePreview'
import UniqueImageList from '../components/display/UniqueImageList'
import { getProductBySlug } from '../api/api'
import { formatCreator, formatPrice } from '../data/data'
import '../styles/display.css'
import '../styles/forms.css'

export default function ProductPage() {
  //Retrieved from device preview
  const [selectedDevice, setSelectedDevice] = useState('desktop');
  //Retrieved from unique image list
  const [selectedImageInd, setSelectedImageInd] = useState(0);
  const { slug } = useParams()
  const [item, setItem] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true)
      setError('')
      setNotFound(false)
      setItem(null)
      try {
        const product = await getProductBySlug(slug)
        if (!cancelled) setItem(product)
      } catch (err) {
        if (!cancelled) {
          if (err.message?.toLowerCase().includes('not found')) {
            setNotFound(true)
          } else {
            setError(err.message || 'Failed to load product')
          }
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [slug])

  if (loading) {
    return (
      <div className="page">
        <p>Loading product…</p>
      </div>
    )
  }

  if (notFound || (!item && !error)) {
    return (
      <div className="page not-found">
        <h1>Product not found</h1>
        <p>The product you&apos;re looking for doesn&apos;t exist.</p>
        <Link to="/products" className="btn btn--primary">
          Back to products
        </Link>
      </div>
    )
  }

  if (error) {
    return (
      <div className="page not-found">
        <h1>Something went wrong</h1>
        <p>{error}</p>
        <Link to="/products" className="btn btn--primary">
          Back to products
        </Link>
      </div>
    )
  }

  const assetLabel = item.hasVideo
    ? `${item.imageCount} wallpapers + video`
    : `${item.imageCount} wallpapers`;

  const handleSelectedDevice = (device) => {
    setSelectedDevice(device)
    setSelectedImageInd(0)
  }

  const handleSelectedImageInd = (image) => {
    setSelectedImageInd(image)
  }

  const moods = item.mood || []
  const devices = item.devices || []
  const tags = item.tags || []

  return (
    <div className="page">
      <div className="display-detail__header">
        <h1 className="display-detail__title">{item.title}</h1>
        <p className="display-detail__creator">{formatCreator(item)}</p>
        <p className="display-detail__description">{item.description}</p>
        <div className="display-detail__meta">
          <span className="badge">{item.category}</span>
          {moods.map((m) => (
            <span key={m} className="badge badge--muted">
              {m}
            </span>
          ))}
          {item.hasVideo && <span className="badge">Video included</span>}
        </div>
        <p className="display-detail__price">{formatPrice(item.price)}</p>
      </div>

      <div className="display-detail__layout">
        <DevicePreview
          previews={item.devicePreviews}
          title={item.title}
          onSelectDevice={handleSelectedDevice}
          selectedImageInd={selectedImageInd}
          onSelectImageInd={handleSelectedImageInd}
          />
        <div>
          <div className="display-detail__purchase">
            <AddToCartButton item={item} />
          </div>
          <div className="display-detail__tags">
            <span>{assetLabel}</span>
            {devices.map((d) => (
              <span key={d}>{d}</span>
            ))}
            {tags.map((tag) => (
              <span key={tag}>#{tag}</span>
            ))}
          </div>
        </div>
      </div>
      <div className="display-preview-gallery">
        <UniqueImageList
          previews={item.devicePreviews}
          onSelectImageInd={handleSelectedImageInd}
          selectedDevice={selectedDevice}
          selectedImageInd={selectedImageInd}
          title={item.title}
        />
      </div>
    </div>
  )
}
