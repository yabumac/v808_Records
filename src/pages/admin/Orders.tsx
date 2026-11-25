import { useEffect, useState } from 'react'
import { supabase, isSupabaseConfigured } from '../../lib/supabase'
import { useCatalog } from '../../context/CatalogContext'
import type { License, ServiceBooking } from '../../types'

function readLocalBookings(): ServiceBooking[] {
  try {
    const raw = localStorage.getItem('v808-service-bookings')
    return raw ? (JSON.parse(raw) as ServiceBooking[]) : []
  } catch {
    return []
  }
}

export default function Orders() {
  const { purchased } = useCatalog()
  const [remote, setRemote] = useState<License[] | null>(null)
  const [services, setServices] = useState<ServiceBooking[]>(() => readLocalBookings())

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) return
    supabase
      .from('licenses')
      .select('*')
      .order('issued_at', { ascending: false })
      .then(({ data }) => {
        if (data) setRemote(data as License[])
      })
    supabase
      .from('service_requests')
      .select('*')
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        if (data) setServices(data as ServiceBooking[])
      })
  }, [])

  const licenses = remote ?? purchased

  return (
    <div className="space-y-8">
      <div className="glass rounded-2xl border border-line p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-bold text-ink">All license orders</h3>
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
                  <p className="text-sm font-bold truncate text-ink">{l.beat?.title ?? l.beat_id}</p>
                  <p className="text-xs text-muted font-mono">
                    {l.license_code} • {l.tier.toUpperCase()} • {l.buyer_name || '—'} •{' '}
                    {l.buyer_email || '—'}
                  </p>
                </div>
                <div className="flex items-center gap-4 shrink-0">
                  <span className="text-xs text-muted font-mono">
                    {new Date(l.issued_at).toLocaleDateString()}
                  </span>
                  <span className="text-sm font-extrabold text-ink">${Number(l.price).toFixed(2)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="glass rounded-2xl border border-line p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-bold text-ink">Studio service bookings</h3>
          <span className="text-xs text-muted font-mono">{services.length} total</span>
        </div>

        {services.length === 0 ? (
          <p className="text-sm text-muted font-mono">
            No 1-on-1 production, customization, or mixing bookings yet.
          </p>
        ) : (
          <div className="space-y-3">
            {services.map((s) => (
              <div
                key={s.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-card rounded-xl border border-line px-4 py-3"
              >
                <div className="min-w-0">
                  <p className="text-sm font-bold truncate text-ink">
                    {s.project_title}{' '}
                    <span className="text-xs font-mono text-copper-ink">
                      ({s.service_type.replace('_', ' ')})
                    </span>
                  </p>
                  <p className="text-xs text-muted font-mono">
                    {s.booking_code} • {s.artist_name} • {s.email} • {s.contact_handle}
                  </p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-copper/15 text-copper-ink font-bold">
                    {s.status}
                  </span>
                  <span className="text-xs text-muted font-mono">
                    {new Date(s.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
