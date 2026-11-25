import { Download, Music2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useCatalog } from '../context/CatalogContext'
import { useAuth } from '../context/AuthContext'

export default function Library() {
  const { purchased } = useCatalog()
  const { user } = useAuth()

  return (
    <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 animate-fade-in">
      <h2 className="text-3xl font-display font-extrabold uppercase tracking-tight text-ink">
        My <span className="text-brand">audio library</span>
      </h2>
      <p className="text-xs text-muted mb-8">
        Access your bought audio files and verified Beat License certificates.
      </p>

      {!user && (
        <div className="glass p-6 rounded-2xl border border-line mb-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div>
            <h3 className="font-bold">Sign in to sync your library</h3>
            <p className="text-sm text-muted">
              Licenses bought while signed in sync across devices via Supabase.
            </p>
          </div>
          <Link to="/login" className="btn-primary px-6 py-3 shrink-0">
            Sign in
          </Link>
        </div>
      )}

      {purchased.length === 0 ? (
        <div className="text-center py-16 text-muted text-sm font-mono">
          No purchased licenses yet. Explore the vault!
          <div className="mt-4">
            <Link to="/catalog" className="btn-primary px-6 py-3">
              <Music2 className="w-4 h-4" /> Browse beats
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {purchased.map((item) => (
            <div
              key={item.id}
              className="bg-card p-4 rounded-xl flex items-center justify-between gap-4 border border-line"
            >
              <div className="flex items-center gap-3 min-w-0">
                <img
                  src={item.beat?.cover_url}
                  alt={item.beat?.title ?? 'Cover'}
                  className="w-12 h-12 rounded-lg object-cover shrink-0"
                />
                <div className="min-w-0">
                  <h4 className="font-bold text-ink text-sm truncate">{item.beat?.title}</h4>
                  <p className="text-xs text-muted font-mono truncate">
                    {item.license_code} • ${item.price} • {item.tier.toUpperCase()}
                  </p>
                </div>
              </div>
              <a
                href={item.beat?.audio_url}
                download
                className="px-3 py-1.5 rounded-lg bg-brand text-white text-xs font-bold flex items-center gap-1 shrink-0"
              >
                <Download className="w-3.5 h-3.5" /> Download
              </a>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}