import { useState } from 'react'
import '../../styles/display.css'

const DEVICES = [
  { key: 'phone', label: 'Phone' },
  { key: 'tablet', label: 'Tablet' },
  { key: 'desktop', label: 'Desktop' },
]

export default function DevicePreview({
  previews,
  title,
  onSelectDevice,
  selectedImageInd,
  onSelectImageInd,
}) {
  const [activeDevice, setActiveDevice] = useState('desktop')
  const activePreviews = previews?.[activeDevice] || []
  const currentIndex = selectedImageInd ?? 0
  const hasMultiple = activePreviews.length > 1

  const next = () => {
    if (!activePreviews.length) return

    const nextIndex = (currentIndex + 1) % activePreviews.length
    onSelectImageInd?.(nextIndex)
  }

  const prev = () => {
    if (!activePreviews.length) return

    const prevIndex = (currentIndex - 1 + activePreviews.length) % activePreviews.length
    onSelectImageInd?.(prevIndex)
  }

  return (
    <div className="device-preview">
      <div className="device-preview__tabs" role="tablist" aria-label="Device preview">
        {DEVICES.map(({ key, label }) => (
          <button
            key={key}
            type="button"
            role="tab"
            aria-selected={activeDevice === key}
            className={`device-preview__tab${
              activeDevice === key ? ' device-preview__tab--active' : ''
            }`}
            onClick={() => {
              setActiveDevice(key)
              onSelectDevice(key)
            }}
          >
            {label}
          </button>
        ))}
      </div>
      <div className="device-preview__frame">
        {hasMultiple && (
          <button
            type="button"
            className="device-preview__nav device-preview__nav--prev"
            onClick={prev}
            aria-label="Previous preview"
          >
            <i className="fa-solid fa-chevron-left" aria-hidden="true" />
          </button>
        )}

        <div className={`device-preview__screen device-preview__screen--${activeDevice}`}>
          {activePreviews[currentIndex] ? (
            <img
              src={activePreviews[currentIndex]}
              alt={`${title} preview on ${activeDevice}`}
              className="device-preview__image"
            />
          ) : (
            <p className="device-preview__empty">
              Selected wallpaper is not available for this device.
            </p>
          )}
        </div>

        {hasMultiple && (
          <button
            type="button"
            className="device-preview__nav device-preview__nav--next"
            onClick={next}
            aria-label="Next preview"
          >
            <i className="fa-solid fa-chevron-right" aria-hidden="true" />
          </button>
        )}
      </div>

      {hasMultiple && (
        <p className="device-preview__counter" aria-live="polite">
          {currentIndex + 1} / {activePreviews.length}
        </p>
      )}
    </div>
  )
}
