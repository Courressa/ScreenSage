import { useCallback, useEffect, useRef, useState } from 'react'

export default function UniqueImageList({
  previews,
  onSelectImageInd,
  selectedDevice,
  selectedImageInd = 0,
  title = 'Wallpaper',
}) {
  const listRef = useRef(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)

  const images = (previews && selectedDevice && previews[selectedDevice]) || []

  const updateScrollState = useCallback(() => {
    const el = listRef.current
    if (!el) {
      setCanScrollLeft(false)
      setCanScrollRight(false)
      return
    }

    const maxScroll = el.scrollWidth - el.clientWidth
    const overflow = maxScroll > 2
    setCanScrollLeft(overflow && el.scrollLeft > 2)
    setCanScrollRight(overflow && el.scrollLeft < maxScroll - 2)
  }, [])

  useEffect(() => {
    const el = listRef.current
    if (!el) return undefined

    updateScrollState()

    const onScroll = () => updateScrollState()
    el.addEventListener('scroll', onScroll, { passive: true })

    const resizeObserver = typeof ResizeObserver !== 'undefined'
      ? new ResizeObserver(() => updateScrollState())
      : null
    resizeObserver?.observe(el)

    window.addEventListener('resize', updateScrollState)

    return () => {
      el.removeEventListener('scroll', onScroll)
      resizeObserver?.disconnect()
      window.removeEventListener('resize', updateScrollState)
    }
  }, [images.length, selectedDevice, updateScrollState])

  const scrollByPage = (direction) => {
    const el = listRef.current
    if (!el) return

    const amount = Math.max(el.clientWidth * 0.7, 240)
    el.scrollBy({ left: direction * amount, behavior: 'smooth' })
  }

  if (!selectedDevice || !images.length) return null

  const showNav = canScrollLeft || canScrollRight

  return (
    <div className="display-preview-gallery__scroller">
      {showNav && (
        <button
          type="button"
          className="display-preview-gallery__nav display-preview-gallery__nav--prev"
          onClick={() => scrollByPage(-1)}
          disabled={!canScrollLeft}
          aria-label="Scroll gallery left"
        >
          <i className="fa-solid fa-chevron-left" aria-hidden="true" />
        </button>
      )}

      <ul
        ref={listRef}
        className="display-preview-gallery__list"
        role="list"
      >
        {images.map((image, idx) => {
          const isSelected = selectedImageInd === idx

          return (
            <li
              key={`${selectedDevice}-${idx}-${image}`}
              className="display-preview-gallery__item"
            >
              <button
                type="button"
                className={`display-preview-gallery__thumb${
                  isSelected ? ' display-preview-gallery__thumb--selected' : ''
                }`}
                onClick={() => onSelectImageInd(idx)}
                aria-label={`${title} preview ${idx + 1} of ${images.length}`}
                aria-current={isSelected ? 'true' : undefined}
              >
                <img
                  src={image}
                  alt=""
                  className="display-preview-gallery__image"
                  onLoad={updateScrollState}
                />
              </button>
            </li>
          )
        })}
      </ul>

      {showNav && (
        <button
          type="button"
          className="display-preview-gallery__nav display-preview-gallery__nav--next"
          onClick={() => scrollByPage(1)}
          disabled={!canScrollRight}
          aria-label="Scroll gallery right"
        >
          <i className="fa-solid fa-chevron-right" aria-hidden="true" />
        </button>
      )}
    </div>
  )
}
