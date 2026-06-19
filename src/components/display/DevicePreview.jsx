import { useState } from 'react'
import '../../styles/collections.css'

const DEVICES = [
  { key: 'phone', label: 'Phone' },
  { key: 'tablet', label: 'Tablet' },
  { key: 'desktop', label: 'Desktop' },
]

export default function DevicePreview({ previews, title }) {
  const [activeDevice, setActiveDevice] = useState('phone')

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
            onClick={() => setActiveDevice(key)}
          >
            {label}
          </button>
        ))}
      </div>
      <div className="device-preview__frame">
        <div className={`device-preview__screen device-preview__screen--${activeDevice}`}>
          <img
            src={previews[activeDevice]}
            alt={`${title} preview on ${activeDevice}`}
            className="device-preview__image"
          />
        </div>
      </div>
    </div>
  )
}