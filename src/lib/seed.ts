import type { Beat, LicenseTier, PaymentProvider, Tier } from '../types'

const baseTime = Date.UTC(2026, 0, 10)

export const DEFAULT_ETB_RATE = 125

/** Catalog sourced from @Yabuonthebeat — fallback when Supabase is not configured yet. */
export const seedBeats: Beat[] = [
  {
    id: 'fallen-city',
    title: 'FALLEN CITY',
    genre: 'TRAP',
    bpm: 140,
    key_root: 'C Minor',
    price: 29.99,
    cover_url: '/covers/fallen-city.jpg',
    audio_url: '/beats/fallen-city.m4a',
    description:
      'Ethiopian old-scale inspired dark trap beat blending traditional melodies with hard modern 808s.',
    tags: ['ethiopian', 'dark trap', '808'],
    has_stems: false,
    has_midi: false,
    is_published: true,
    created_at: new Date(baseTime - 0 * 86400000).toISOString(),
  },
  {
    id: 'relic',
    title: 'RELIC',
    genre: 'DRILL',
    bpm: 142,
    key_root: 'F Minor',
    price: 34.99,
    cover_url: '/covers/relic.jpg',
    audio_url: '/beats/relic.m4a',
    description:
      'Ethiopian-sampled drill instrumental pairing traditional scales with heavy sliding 808 patterns.',
    tags: ['ethiopian', 'drill', 'sliding 808'],
    has_stems: false,
    has_midi: false,
    is_published: true,
    created_at: new Date(baseTime - 1 * 86400000).toISOString(),
  },
  {
    id: 'k9',
    title: 'K9',
    genre: 'TRAP',
    bpm: 138,
    key_root: 'G Minor',
    price: 29.99,
    cover_url: '/covers/k9.jpg',
    audio_url: '/beats/k9.m4a',
    description: 'Hard dark trap instrumental with punchy drums and relentless low-end drive.',
    tags: ['hard', 'dark trap'],
    has_stems: false,
    has_midi: false,
    is_published: true,
    created_at: new Date(baseTime - 2 * 86400000).toISOString(),
  },
  {
    id: 'cold-night',
    title: 'COLD NIGHT',
    genre: 'TRAP',
    bpm: 134,
    key_root: 'D Minor',
    price: 29.99,
    cover_url: '/covers/cold-night.jpg',
    audio_url: '/beats/cold-night.m4a',
    description:
      'Moody late-night dark trap beat layered with atmospheric synths and crisp hi-hats.',
    tags: ['dark trap', 'atmospheric'],
    has_stems: false,
    has_midi: false,
    is_published: true,
    created_at: new Date(baseTime - 3 * 86400000).toISOString(),
  },
  {
    id: 'tenet',
    title: 'TENET',
    genre: 'TRAP',
    bpm: 144,
    key_root: 'C# Minor',
    price: 34.99,
    cover_url: '/covers/tenet.jpg',
    audio_url: '/beats/tenet.m4a',
    description:
      'Tenet movie inspired dark cinematic trap beat with tense sub-bass and eerie textures.',
    tags: ['cinematic', 'dark trap'],
    has_stems: false,
    has_midi: false,
    is_published: true,
    created_at: new Date(baseTime - 4 * 86400000).toISOString(),
  },
  {
    id: 'tier',
    title: 'TIER',
    genre: 'TRAP',
    bpm: 140,
    key_root: 'E Minor',
    price: 29.99,
    cover_url: '/covers/tier.jpg',
    audio_url: '/beats/tier.m4a',
    description:
      'Hard-hitting trap instrumental driven by dark melodies and razor-sharp percussion.',
    tags: ['trap', 'dark'],
    has_stems: false,
    has_midi: false,
    is_published: true,
    created_at: new Date(baseTime - 5 * 86400000).toISOString(),
  },
  {
    id: 'hope-spanish-drill',
    title: 'HOPE',
    genre: 'DRILL',
    bpm: 140,
    key_root: 'A Minor',
    price: 34.99,
    cover_url: '/covers/hope-spanish-drill.jpg',
    audio_url: '/beats/hope-spanish-drill.m4a',
    description:
      'Spanish-inspired drill beat pairing nylon acoustic textures with hard drill drums.',
    tags: ['spanish drill', 'melodic'],
    has_stems: false,
    has_midi: false,
    is_published: true,
    created_at: new Date(baseTime - 6 * 86400000).toISOString(),
  },
  {
    id: 'glock-drill',
    title: 'GLOCK',
    genre: 'DRILL',
    bpm: 144,
    key_root: 'G# Minor',
    price: 29.99,
    cover_url: '/covers/glock-drill.jpg',
    audio_url: '/beats/glock-drill.m4a',
    description:
      'Aggressive drill instrumental built with heavy 808 glides and crisp snare bounce.',
    tags: ['drill', 'hard'],
    has_stems: false,
    has_midi: false,
    is_published: true,
    created_at: new Date(baseTime - 7 * 86400000).toISOString(),
  },
  {
    id: 'dark-trap-2023',
    title: 'DARK TRAP',
    genre: 'TRAP',
    bpm: 136,
    key_root: 'F# Minor',
    price: 29.99,
    cover_url: '/covers/dark-trap-2023.jpg',
    audio_url: '/beats/dark-trap-2023.m4a',
    description: 'Dark trap instrumental produced by Yabsera Teshome (@Yabuonthebeat).',
    tags: ['dark trap', 'yabuonthebeat'],
    has_stems: false,
    has_midi: false,
    is_published: true,
    created_at: new Date(baseTime - 8 * 86400000).toISOString(),
  },
]

export const genres = ['ALL', 'TRAP', 'DRILL'] as const

export const tiers: Tier[] = [
  {
    id: 'basic',
    name: 'Basic MP3 Lease',
    price: 29.99,
    tagline: 'Entry tier · Available now',
    requiresStems: false,
    requiresMidi: false,
    features: [
      'High quality untagged audio',
      'Up to 100,000 streams',
      'Non-exclusive rights',
      'Signed PDF license agreement',
    ],
  },
  {
    id: 'premium',
    name: 'Premium WAV + Stems',
    price: 79.99,
    tagline: 'Full stems access · Future uploads',
    requiresStems: true,
    requiresMidi: false,
    features: [
      '24-bit uncompressed WAV',
      'Full tracked-out audio stems',
      'Up to 500,000 streams',
      'Commercial performance rights',
      'Instant PDF license contract',
    ],
  },
  {
    id: 'exclusive',
    name: 'Exclusive Unlimited',
    price: 299.99,
    tagline: 'Full ownership + MIDI · Future uploads',
    requiresStems: true,
    requiresMidi: true,
    features: [
      '100% exclusive full rights',
      'Unlimited commercial streams',
      'Beat removed from marketplace',
      'Full master, stems & MIDI files',
      'Customized master transfer PDF',
    ],
  },
]

export function isTierAvailableForBeat(
  tierId: LicenseTier,
  beat?: Beat,
): { available: boolean; reason?: string } {
  const tier = tiers.find((t) => t.id === tierId)
  if (!tier) return { available: false, reason: 'Unsupported tier.' }
  if (!beat) {
    if (tier.requiresStems || tier.requiresMidi) {
      return {
        available: false,
        reason:
          'Unavailable for current catalog releases (stems & MIDI not archived yet). Enabled on upcoming uploads.',
      }
    }
    return { available: true }
  }
  if (tier.requiresStems && !beat.has_stems) {
    return {
      available: false,
      reason: 'Stems are not available for this beat yet — coming on future uploads.',
    }
  }
  if (tier.requiresMidi && !beat.has_midi) {
    return {
      available: false,
      reason: 'MIDI & stems are not available for this beat yet — coming on future uploads.',
    }
  }
  return { available: true }
}

export interface PaymentMethodMeta {
  id: PaymentProvider
  label: string
  region: 'ethiopia' | 'international'
  currency: 'ETB' | 'USD'
  subtitle: string
  badge: string
  needsPhone?: boolean
}

export const PAYMENT_METHODS: PaymentMethodMeta[] = [
  {
    id: 'chapa',
    label: 'Chapa Checkout',
    region: 'ethiopia',
    currency: 'ETB',
    subtitle: 'Telebirr, CBE Birr, Amole, AwashBirr & Ethiopian Bank Cards',
    badge: 'ETHIOPIA ALL-IN-ONE',
  },
  {
    id: 'telebirr',
    label: 'Telebirr',
    region: 'ethiopia',
    currency: 'ETB',
    subtitle: 'Ethio Telecom mobile wallet instant confirmation',
    badge: 'MOBILE MONEY',
    needsPhone: true,
  },
  {
    id: 'cbe',
    label: 'CBE / CBE Birr',
    region: 'ethiopia',
    currency: 'ETB',
    subtitle: 'Commercial Bank of Ethiopia mobile & wallet transfer',
    badge: 'BANK & WALLET',
    needsPhone: true,
  },
  {
    id: 'stripe_card',
    label: 'Credit / Debit Card',
    region: 'international',
    currency: 'USD',
    subtitle: 'Visa, Mastercard, Amex, Apple Pay & Google Pay (3D Secure)',
    badge: 'STRIPE SECURE',
  },
  {
    id: 'paypal',
    label: 'PayPal',
    region: 'international',
    currency: 'USD',
    subtitle: 'PayPal balance or international cards with buyer protection',
    badge: 'GLOBAL',
  },
]
