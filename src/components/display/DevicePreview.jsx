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
  const [activeDevice, setActiveDevice] = useState('desktop');
  const activePreviews = previews?.[activeDevice] || [];
  const currentIndex = selectedImageInd ?? 0;

  const next = () => {
    if (!activePreviews.length) return;

    const nextIndex = (currentIndex + 1) % activePreviews.length;
    onSelectImageInd?.(nextIndex);
  }

  const prev = () => {
    if (!activePreviews.length) return;

    const prevIndex = (currentIndex - 1 + activePreviews.length) % activePreviews.length;
    onSelectImageInd?.(prevIndex);
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
        <button
          className={
            activePreviews.length > 1 ? "arrow-display__active" : "arrow-display__none"
          }
          onClick={prev}
        >Arrow Left</button>

        <div className={`device-preview__screen device-preview__screen--${activeDevice}`}>
          {activePreviews[currentIndex] ? (
            <img
              src={activePreviews[currentIndex]}
              alt={`${title} preview on ${activeDevice}`}
              className="device-preview__image"
            />
          ) : (
            <p>
              Selected wallpaper is not available for this device.
            </p>
          )}
        </div>
        <button onClick={next}>Arrow Right</button>
      </div>
    </div>
  )
}