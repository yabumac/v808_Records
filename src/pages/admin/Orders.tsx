import { useEffect, useState } from 'react'
import { supabase, isSupabaseConfigured } from '../../lib/supabase'
import { useCatalog } from '../../context/CatalogContext'
import type { License } from '../../types'

export default function Orders() {
  const { purchased } = useCatalog()
  const [remote, setRemote] = useState<License[] | null>(null)

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) return
    supabase
      .from('licenses')
      .select('*, beat:beats(*)')
      .order('issued_at', { ascending: false })
      .then(({ data }) => setRemote(data as License[]))
  }, [])

  const licenses = remote ?? purchased

  return (
    <div>
      <div className="glass rounded-2xl border border-line p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-bold">All license orders</h3>
          <span className="text-xs text-muted font-mono">{licenses.length} total</span>
        </div>

        {licenses.length === 0 ? (
          <p className="text-sm text-muted font-mono">
            No orders recorded yet. {!isSupabaseConfigured &&
              'You are running offline — connect Supabase to view real orders.'}
          </p>
        ) : (
          <div className="space-y-3">
            {licenses.map((l) => (
              <div
                key={l.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-card rounded-xl border border-line px-4 py-3"
              >
                <div className="min-w-0">
                  <p className="text-sm font-bold truncate">{l.beat?.title}</p>
                  <p className="text-xs text-muted font-mono">
                    {l.license_code} • {l.tier.toUpperCase()} • {l.buyer_name || '—'} •{' '}
                    {l.buyer_email || '—'}
                  </p>
                </div>
                <div className="flex items-center gap-4 shrink-0">
                  <span className="text-xs text-muted font-mono">
                    {new Date(l.issued_at).toLocaleDateString()}
                  </span>
                  <span className="text-sm font-extrabold">${Number(l.price).toFixed(2)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}