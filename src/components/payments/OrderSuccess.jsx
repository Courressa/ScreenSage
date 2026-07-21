import { useState } from 'react'
import { Link } from 'react-router-dom'
import { formatPrice } from '../../data/data'
import { downloadPurchaseFiles } from '../../utils/downloadFiles'
import '../../styles/payments.css'

export default function OrderSuccess({ result, onDismiss }) {
  const [downloading, setDownloading] = useState(false)
  const [downloadNote, setDownloadNote] = useState('')

  const downloads = result?.downloads || []
  const fileCount = downloads.length
  const orderItems = result?.order?.items || []

  const handleDownload = async () => {
    if (!fileCount) {
      setDownloadNote(
        'No full-gallery files were saved on these products yet. Add gallery media in Admin, then order again.'
      )
      return
    }

    setDownloading(true)
    setDownloadNote('')
    try {
      await downloadPurchaseFiles(downloads, {
        onProgress: (done, total) => {
          setDownloadNote(`Downloading ${done} of ${total}…`)
        },
      })
      setDownloadNote(
        fileCount === 1
          ? 'Download started.'
          : `Started ${fileCount} downloads. If some were blocked, allow multiple downloads in your browser.`
      )
    } catch {
      setDownloadNote('Download failed. Try again or use the links from your email.')
    } finally {
      setDownloading(false)
    }
  }

  return (
    <div className="order-success">
      <div className="order-success__badge" aria-hidden="true">
        ✓
      </div>
      <h1 className="order-success__title">Order placed successfully</h1>
      <p className="order-success__lead">
        Thanks for your purchase
        {result?.total != null ? ` — ${formatPrice(result.total)}` : ''}.
      </p>

      <ul className="order-success__status">
        <li className="order-success__status-item order-success__status-item--ok">
          <strong>Order:</strong> recorded successfully
          {result?.order?._id ? (
            <span className="order-success__meta">
              {' '}
              (ref {String(result.order._id).slice(-8)})
            </span>
          ) : null}
        </li>
        <li
          className={
            result?.emailSent
              ? 'order-success__status-item order-success__status-item--ok'
              : 'order-success__status-item order-success__status-item--warn'
          }
        >
          <strong>Email:</strong>{' '}
          {result?.emailMessage ||
            (result?.emailSent
              ? `Sent to ${result.customerEmail}`
              : `Could not send email to ${result?.customerEmail || 'your address'}`)}
        </li>
        <li className="order-success__status-item">
          <strong>Download:</strong> use the button below to save the wallpapers
          you purchased to this device. You can also use the links from the
          delivery email when it arrives.
        </li>
      </ul>

      {orderItems.length > 0 && (
        <div className="order-success__items">
          <h2 className="order-success__subtitle">Your purchase</h2>
          <ul>
            {orderItems.map((item) => (
              <li key={item.slug}>
                <span>{item.title}</span>
                <span>
                  {(item.fullGallery || []).length}{' '}
                  {(item.fullGallery || []).length === 1 ? 'file' : 'files'}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="order-success__actions">
        <button
          type="button"
          className="btn btn--primary"
          onClick={handleDownload}
          disabled={downloading}
        >
          {downloading
            ? 'Downloading…'
            : fileCount
              ? `Download wallpapers (${fileCount})`
              : 'Download wallpapers'}
        </button>
        <Link
          to="/products"
          className="btn btn--ghost"
          onClick={() => onDismiss?.()}
        >
          Continue browsing
        </Link>
      </div>

      {downloadNote && (
        <p className="payment-options__note order-success__download-note">
          {downloadNote}
        </p>
      )}

      <p className="order-success__future">
        Later, signed-in accounts will receive purchases at the account email
        and keep them in a personal library for re-download anytime.
      </p>
    </div>
  )
}
