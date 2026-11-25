import { useMemo, useState } from 'react'
import { Search } from 'lucide-react'
import { useCatalog } from '../context/CatalogContext'
import BeatCard from '../components/BeatCard'
import CheckoutModal from '../components/CheckoutModal'
import type { Beat } from '../types'

type SortKey = 'newest' | 'bpm-asc' | 'bpm-desc' | 'price-asc'

export default function Catalog() {
  const { beats, loading } = useCatalog()
  const [genre, setGenre] = useState('ALL')
  const [query, setQuery] = useState('')
  const [sort, setSort] = useState<SortKey>('newest')
  const [checkoutBeat, setCheckoutBeat] = useState<Beat | null>(null)

  const genres = useMemo(
    () => ['ALL', ...Array.from(new Set(beats.map((b) => b.genre)))],
    [beats],
  )

  const filtered = useMemo(() => {
    let list = beats.filter((b) => b.is_published)
    if (genre !== 'ALL') list = list.filter((b) => b.genre === genre)
    const q = query.trim().toLowerCase()
    if (q) {
      list = list.filter(
        (b) =>
          b.title.toLowerCase().includes(q) ||
          b.genre.toLowerCase().includes(q) ||
          (b.tags ?? []).some((t) => t.toLowerCase().includes(q)),
      )
    }
    switch (sort) {
      case 'bpm-asc':
        list = [...list].sort((a, b) => a.bpm - b.bpm)
        break
      case 'bpm-desc':
        list = [...list].sort((a, b) => b.bpm - a.bpm)
        break
      case 'price-asc':
        list = [...list].sort((a, b) => a.price - b.price)
        break
      default:
        list = [...list].sort(
          (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
        )
    }
    return list
  }, [beats, genre, query, sort])

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
        <div>
          <h2 className="text-3xl sm:text-4xl font-display font-extrabold uppercase tracking-tight">
            Explore <span className="text-brand">beat vault</span>
          </h2>
          <p className="text-muted text-sm mt-1">Filter by genre, tempo, key or mood.</p>
        </div>
        <p className="text-xs text-muted font-mono">
          SHOWING <span className="text-copper-ink font-bold">{filtered.length}</span> TRACKS
        </p>
      </div>

      <div className="glass p-4 rounded-2xl mb-8 flex flex-wrap gap-4 items-center justify-between border border-line">
        <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0 max-w-full">
          {genres.map((g) => (
            <button
              key={g}
              onClick={() => setGenre(g)}
              className={`chip whitespace-nowrap ${g === genre ? 'bg-brand text-btn' : 'bg-card hover:bg-line text-muted'}`}
            >
              {g}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
            <input
              className="input pl-10 text-xs"
              placeholder="Search title or tag..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <select
            className="px-3 py-2 rounded-xl bg-card border border-line text-xs text-ink focus:outline-none focus:border-brand [&>option]:bg-card [&>option]:text-ink"
            value={sort}
            onChange={(e) => setSort(e.target.value as SortKey)}
          >
            <option value="newest">Newest first</option>
            <option value="bpm-asc">BPM (low to high)</option>
            <option value="bpm-desc">BPM (high to low)</option>
            <option value="price-asc">Price (low to high)</option>
          </select>
        </div>
      </div>

      {loading ? (
        <p className="text-center py-16 text-muted font-mono text-sm">Syncing vault…</p>
      ) : filtered.length === 0 ? (
        <p className="text-center py-16 text-muted text-sm">
          No beats match your filters. Try clearing the search.
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((beat) => (
            <BeatCard key={beat.id} beat={beat} onBuy={setCheckoutBeat} />
          ))}
        </div>
      )}

      <CheckoutModal beat={checkoutBeat} onClose={() => setCheckoutBeat(null)} />
    </section>
  )
}