import placeholderImage from '../assets/hero.png'

export const collections = [
  {
    id: 1,
    slug: 'ethereal-dreams',
    title: 'Ethereal Dreams',
    contributor: null,
    category: 'abstract',
    mood: ['dreamy', 'calming'],
    tags: ['glow', 'minimal', 'nature'],
    description:
      'Soft glowing orbs and misty landscapes perfect for a peaceful home screen.',
    price: 9.99,
    imageCount: 12,
    hasVideo: true,
    coverImage: placeholderImage,
    previews: {
      phone: placeholderImage,
      tablet: placeholderImage,
      desktop: placeholderImage,
    },
    gallery: [placeholderImage, placeholderImage, placeholderImage],
    devices: ['phone', 'tablet', 'desktop'],
    resolutions: ['4K', '8K'],
    stripePriceId: null,
    paypalProductId: null,
  },
  {
    id: 2,
    slug: 'cyber-neon-nights',
    title: 'Cyber Neon Nights',
    contributor: 'Jordan Rivera',
    category: 'cyberpunk',
    mood: ['energetic', 'futuristic'],
    tags: ['neon', 'city', 'dark'],
    description:
      'Vibrant neon cityscapes and cyberpunk aesthetics for tech lovers.',
    price: 12.99,
    imageCount: 15,
    hasVideo: true,
    coverImage: placeholderImage,
    previews: {
      phone: placeholderImage,
      tablet: placeholderImage,
      desktop: placeholderImage,
    },
    gallery: [placeholderImage, placeholderImage],
    devices: ['phone', 'tablet', 'desktop'],
    resolutions: ['4K'],
    stripePriceId: null,
    paypalProductId: null,
  },
  {
    id: 3,
    slug: 'cosmic-horizons',
    title: 'Cosmic Horizons',
    contributor: null,
    category: 'space',
    mood: ['dreamy', 'vibrant'],
    tags: ['stars', 'galaxy', 'deep'],
    description:
      'Sweeping nebulae and distant galaxies rendered in rich, cinematic detail.',
    price: 11.99,
    imageCount: 10,
    hasVideo: false,
    coverImage: placeholderImage,
    previews: {
      phone: placeholderImage,
      tablet: placeholderImage,
      desktop: placeholderImage,
    },
    gallery: [placeholderImage, placeholderImage, placeholderImage],
    devices: ['phone', 'tablet', 'desktop'],
    resolutions: ['4K', '8K'],
    stripePriceId: null,
    paypalProductId: null,
  },
  {
    id: 4,
    slug: 'minimal-geometry',
    title: 'Minimal Geometry',
    contributor: 'Sam Okonkwo',
    category: 'geometric',
    mood: ['minimal', 'calming'],
    tags: ['shapes', 'clean', 'modern'],
    description:
      'Crisp geometric forms and subtle gradients for a refined, modern look.',
    price: 8.99,
    imageCount: 8,
    hasVideo: false,
    coverImage: placeholderImage,
    previews: {
      phone: placeholderImage,
      tablet: placeholderImage,
      desktop: placeholderImage,
    },
    gallery: [placeholderImage],
    devices: ['phone', 'tablet', 'desktop'],
    resolutions: ['4K'],
    stripePriceId: null,
    paypalProductId: null,
  },
]

export const categories = [
  'abstract',
  'nature',
  'cyberpunk',
  'minimal',
  'space',
  'anime',
  'dark',
  'colorful',
  'geometric',
]

export const moods = [
  'calming',
  'energetic',
  'dreamy',
  'futuristic',
  'minimal',
  'vibrant',
  'dark',
  'warm',
]

export function getCollectionBySlug(slug) {
  return collections.find((collection) => collection.slug === slug)
}

export function formatCreator(collection) {
  if (collection.contributor) {
    return `Suggested by ${collection.contributor}`
  }
  return 'ScreenSage Studio'
}

export function formatPrice(price) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(price)
}