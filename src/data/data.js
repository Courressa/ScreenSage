import placeholderImage from '../assets/hero.png'

export const products = [
  // ========================
  // COLLECTIONS
  // ========================
  {
    id: 1,
    type: 'collection',
    slug: 'ethereal-dreams',
    title: 'Ethereal Dreams',
    contributor: null,
    category: 'abstract',
    mood: ['dreamy', 'calming'],
    tags: ['glow', 'minimal', 'nature'],
    description: 'Soft glowing orbs and misty landscapes perfect for a peaceful home screen.',
    price: 18.99,
    imageCount: 12,
    hasVideo: true,
    coverImage: placeholderImage,
    previews: {
      phone: placeholderImage,
      tablet: placeholderImage,
      desktop: placeholderImage,
    },
    previewGallery: [placeholderImage, placeholderImage, placeholderImage],   // Watermarked versions
    fullGallery: [placeholderImage, placeholderImage, placeholderImage],      // Will contain clean high-res images (after purchase)
    devices: ['phone', 'tablet', 'desktop'],
    resolutions: ['4K', '8K'],
    stripePriceId: null,
    paypalProductId: null,
  },
  {
    id: 2,
    type: 'collection',
    slug: 'cyber-neon-nights',
    title: 'Cyber Neon Nights',
    contributor: 'Jordan Rivera',
    category: 'cyberpunk',
    mood: ['energetic', 'futuristic'],
    tags: ['neon', 'city', 'dark'],
    description: 'Vibrant neon cityscapes and cyberpunk aesthetics for tech lovers.',
    price: 22.99,
    imageCount: 15,
    hasVideo: true,
    coverImage: placeholderImage,
    previews: {
      phone: placeholderImage,
      tablet: placeholderImage,
      desktop: placeholderImage,
    },
    previewGallery: [placeholderImage, placeholderImage],
    fullGallery: [placeholderImage, placeholderImage],
    devices: ['phone', 'tablet', 'desktop'],
    resolutions: ['4K'],
    stripePriceId: null,
    paypalProductId: null,
  },
  {
    id: 3,
    type: 'collection',
    slug: 'serene-horizons',
    title: 'Serene Horizons',
    contributor: null,
    category: 'nature',
    mood: ['calming', 'dreamy'],
    tags: ['landscape', 'nature', 'peaceful'],
    description: 'Peaceful mountain ranges, golden sunsets, and tranquil ocean views.',
    price: 16.99,
    imageCount: 10,
    hasVideo: false,
    coverImage: placeholderImage,
    previews: {
      phone: placeholderImage,
      tablet: placeholderImage,
      desktop: placeholderImage,
    },
    previewGallery: [placeholderImage, placeholderImage, placeholderImage],
    fullGallery: [placeholderImage, placeholderImage, placeholderImage],
    devices: ['phone', 'tablet', 'desktop'],
    resolutions: ['4K', '8K'],
    stripePriceId: null,
    paypalProductId: null,
  },

  // ========================
  // INDIVIDUAL ITEMS
  // ========================
  {
    id: 4,
    type: 'individual',
    slug: 'mystic-mountain-glow',
    title: 'Mystic Mountain Glow',
    contributor: null,
    category: 'nature',
    mood: ['calming', 'dreamy'],
    tags: ['glow', 'landscape'],
    description: 'A majestic mountain peak bathed in soft ethereal light.',
    price: 2.99,
    imageCount: 1,
    hasVideo: false,
    coverImage: placeholderImage,
    previews: {
      phone: placeholderImage,
      tablet: placeholderImage,
      desktop: placeholderImage,
    },
    previewGallery: [placeholderImage],
    fullGallery: [placeholderImage],
    devices: ['phone', 'tablet', 'desktop'],
    resolutions: ['4K', '8K'],
    stripePriceId: null,
    paypalProductId: null,
  },
  {
    id: 5,
    type: 'individual',
    slug: 'tokyo-neon-rain',
    title: 'Tokyo Neon Rain',
    contributor: null,
    category: 'cyberpunk',
    mood: ['energetic', 'futuristic'],
    tags: ['neon', 'city', 'video'],
    description: 'Rainy cyberpunk Tokyo street with moving neon reflections.',
    price: 4.99,
    imageCount: 1,
    hasVideo: true,
    coverImage: placeholderImage,
    previews: {
      phone: placeholderImage,
      tablet: placeholderImage,
      desktop: placeholderImage,
    },
    previewGallery: [placeholderImage],
    fullGallery: [placeholderImage],
    devices: ['phone', 'tablet', 'desktop'],
    resolutions: ['4K'],
    stripePriceId: null,
    paypalProductId: null,
  }
]

export const categories = [
  'abstract',
  'nature',
  'cyberpunk',
  'minimal',
  'space',
  'geometric'
]

export const moods = [
  'calming',
  'energetic',
  'dreamy',
  'futuristic',
  'minimal',
  'vibrant',
  'dark',
  'warm'
]

export function getProductBySlug(slug) {
  return products.find((product) => product.slug === slug)
}

export function formatCreator(product) {
  if (product.contributor) {
    return `Suggested by ${product.contributor}`
  }
  return 'ScreenSage Studio'
}

export function formatPrice(price) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(price)
}