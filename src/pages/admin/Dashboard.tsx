import { Disc3, FileText, Users, TrendingUp } from 'lucide-react'
import { useCatalog } from '../../context/CatalogContext'

export default function Dashboard() {
  const { beats, purchased } = useCatalog()

  const published = beats.filter((b) => b.is_published).length
  const revenue = purchased.reduce((sum, l) => sum + Number(l.price), 0)

  const stats = [
    { icon: Disc3, label: 'Published beats', value: published, tint: 'text-brand' },
    { icon: FileText, label: 'Licenses sold', value: purchased.length, tint: 'text-accent' },
    { icon: TrendingUp, label: 'Revenue', value: `$${revenue.toFixed(2)}`, tint: 'text-emerald-500' },
    { icon: Users, label: 'Genre count', value: new Set(beats.map((b) => b.genre)).size, tint: 'text-ink' },
  ]

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(({ icon: Icon, label, value, tint }) => (
          <div key={label} className="glass p-5 rounded-2xl border border-line card-hover">
            <Icon className={`w-6 h-6 mb-2 ${tint}`} />
            <div className="text-2xl font-extrabold font-display">{value}</div>
            <p className="text-xs text-muted uppercase tracking-wider">{label}</p>
          </div>
        ))}
      </div>

      <div className="glass rounded-2xl border border-line p-6">
        <h3 className="font-bold mb-4">Recent licenses</h3>
        {purchased.length === 0 ? (
          <p className="text-sm text-muted font-mono">
            No licenses yet. When customers buy beats, orders appear here.
          </p>
        ) : (
          <div className="space-y-3">
            {purchased.slice(0, 5).map((l) => (
              <div
                key={l.id}
                className="flex items-center justify-between gap-4 bg-card rounded-xl border border-line px-4 py-3"
              >
                <div className="min-w-0">
                  <p className="text-sm font-bold truncate">{l.beat?.title}</p>
                  <p className="text-xs text-muted font-mono">
                    {l.license_code} • {l.buyer_email}
                  </p>
                </div>
                <span className="text-sm font-extrabold shrink-0">
                  ${Number(l.price).toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}