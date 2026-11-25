export type LicenseTier = 'basic' | 'premium' | 'exclusive'

export type PaymentProvider = 'chapa' | 'telebirr' | 'cbe' | 'stripe_card' | 'paypal'

export interface Beat {
  id: string
  title: string
  slug?: string
  genre: string
  bpm: number
  key_root: string
  cover_url: string
  audio_url: string
  description?: string
  tags?: string[]
  price: number
  has_stems?: boolean
  has_midi?: boolean
  stems_url?: string
  midi_url?: string
  is_published: boolean
  owner_id?: string | null
  created_at: string
}

export interface License {
  id: string
  beat_id: string
  buyer_id?: string | null
  payment_order_id?: string | null
  tier: LicenseTier
  price: number
  currency?: 'USD' | 'ETB'
  amount_paid?: number
  payment_provider?: PaymentProvider
  payment_ref?: string
  signature_hash?: string
  license_code: string
  buyer_name: string
  buyer_email: string
  issued_at: string
  beat?: Beat
}

export interface Profile {
  id: string
  username?: string
  full_name?: string
  avatar_url?: string
  role: 'admin' | 'customer'
  created_at: string
}

export interface Tier {
  id: LicenseTier
  name: string
  price: number
  tagline: string
  features: string[]
  requiresStems?: boolean
  requiresMidi?: boolean
}
