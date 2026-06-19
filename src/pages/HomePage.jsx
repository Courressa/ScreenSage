import CollectionGrid from '../components/display/DisplayGrid'
import '../styles/collections.css'

export default function HomePage() {
  return (
    <div className="page">
      <section className="hero">
        <p className="hero__eyebrow">Premium AI Art</p>
        <h1 className="hero__title">
          Wallpapers &amp; Videos for Every Screen
        </h1>
        <p className="hero__text">
          Beautiful, original AI-generated art for phones, tablets, and
          desktops. Curated collections — one-time purchases only.
        </p>
      </section>

      <section className="how-it-works" aria-label="How it works">
        <div className="how-it-works__step">
          <span className="how-it-works__number">1</span>
          <p className="how-it-works__label">Browse</p>
          <p className="how-it-works__desc">Explore curated wallpaper collections</p>
        </div>
        <div className="how-it-works__step">
          <span className="how-it-works__number">2</span>
          <p className="how-it-works__label">Preview</p>
          <p className="how-it-works__desc">See how art looks on your device</p>
        </div>
        <div className="how-it-works__step">
          <span className="how-it-works__number">3</span>
          <p className="how-it-works__label">Checkout</p>
          <p className="how-it-works__desc">Add to cart, then pay once via Stripe or PayPal</p>
        </div>
      </section>

      <section aria-label="Collections">
        <CollectionGrid />
      </section>
    </div>
  )
}