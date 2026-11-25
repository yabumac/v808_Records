import type { Beat, Tier } from '../types'

/** Fallback catalog used when Supabase is not configured yet. */
export const seedBeats: Beat[] = [
  {
    id: '1',
    title: 'MAGNOLIA VIBES',
    genre: 'TRAP',
    bpm: 140,
    key_root: 'C Minor',
    price: 29.99,
    cover_url:
      'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&auto=format&fit=crop&q=80',
    audio_url: 'https://cdn.pixabay.com/download/audio/2022/03/15/audio_c8c8a2a8e8.mp3',
    description: 'Lush trap textures with warm 808s and airy pads.',
    tags: ['melodic', 'warm'],
    is_published: true,
    created_at: new Date().toISOString(),
  },
  {
    id: '2',
    title: 'CYBER CITY DRILL',
    genre: 'DRILL',
    bpm: 144,
    key_root: 'G Minor',
    price: 34.99,
    cover_url:
      'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=600&auto=format&fit=crop&q=80',
    audio_url: 'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3',
    description: 'Sliding 808 drill patterns with dark cinematic leads.',
    tags: ['dark', 'sliding'],
    is_published: true,
    created_at: new Date().toISOString(),
  },
  {
    id: '3',
    title: 'SYNTH ERA NIGHTS',
    genre: 'CYBERPUNK',
    bpm: 128,
    key_root: 'F# Minor',
    price: 29.99,
    cover_url:
      'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80',
    audio_url: 'https://cdn.pixabay.com/download/audio/2022/10/14/audio_9939f7f023.mp3',
    description: 'Retro-futuristic synthwave with punchy analog drums.',
    tags: ['synthwave', 'retro'],
    is_published: true,
    created_at: new Date().toISOString(),
  },
  {
    id: '4',
    title: 'AFRO GROOVE GOLD',
    genre: 'AFROBEAT',
    bpm: 105,
    key_root: 'A Major',
    price: 39.99,
    cover_url:
      'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=600&auto=format&fit=crop&q=80',
    audio_url: 'https://cdn.pixabay.com/download/audio/2022/01/18/audio_d0a13f69d2.mp3',
    description: 'Sun-soaked afrobeat percussion with melodic guitar loops.',
    tags: ['afro', 'groove'],
    is_published: true,
    created_at: new Date().toISOString(),
  },
  {
    id: '5',
    title: '90S STREET DREAMS',
    genre: 'BOOM BAP',
    bpm: 92,
    key_root: 'D Minor',
    price: 29.99,
    cover_url:
      'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=600&auto=format&fit=crop&q=80',
    audio_url: 'https://cdn.pixabay.com/download/audio/2022/03/10/audio_c3b999fa41.mp3',
    description: 'Dusty boom bap drums with jazz-flavoured sample chops.',
    tags: ['boombap', 'dusty'],
    is_published: true,
    created_at: new Date().toISOString(),
  },
]

export const genres = ['ALL', 'TRAP', 'DRILL', 'BOOM BAP', 'AFROBEAT', 'CYBERPUNK'] as const

export const tiers: Tier[] = [
  {
    id: 'basic',
    name: 'Basic MP3 Lease',
    price: 29.99,
    tagline: 'Entry tier',
    features: [
      'High quality untagged MP3',
      'Up to 100,000 streams',
      'Non-exclusive rights',
      'PDF license agreement',
    ],
  },
  {
    id: 'premium',
    name: 'Premium WAV + Stems',
    price: 79.99,
    tagline: 'Full stems access',
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
    tagline: 'Full ownership',
    features: [
      '100% exclusive full rights',
      'Unlimited commercial streams',
      'Beat removed from marketplace',
      'Full master & stem files',
      'Customized master transfer PDF',
    ],
  },
]
