import { useEffect, useState, type FormEvent } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  CalendarClock,
  Check,
  Headphones,
  Mail,
  PhoneCall,
  Send,
  Sliders,
  Sparkles,
  Wand2,
} from 'lucide-react'
import { STUDIO_SERVICES } from '../lib/seed'
import { useAuth } from '../context/AuthContext'
import { useCatalog } from '../context/CatalogContext'
import type { ServiceBooking, ServiceType } from '../types'

const SERVICE_ICONS: Record<ServiceType, typeof Sparkles> = {
  custom_production: Sparkles,
  beat_customization: Sliders,
  on_call_session: PhoneCall,
  mixing_mastering: Headphones,
}

const LOCAL_BOOKINGS_KEY = 'v808-service-bookings'

function readLocalBookings(): ServiceBooking[] {
  try {
    const raw = localStorage.getItem(LOCAL_BOOKINGS_KEY)
    return raw ? (JSON.parse(raw) as ServiceBooking[]) : []
  } catch {
    return []
  }
}

export default function Services() {
  const [params] = useSearchParams()
  const { user, session, profile } = useAuth()
  const { beats } = useCatalog()

  const initialParam = params.get('service') as ServiceType | null
  const refParam = params.get('ref')
  const [selected, setSelected] = useState<ServiceType>(
    STUDIO_SERVICES.some((s) => s.id === initialParam) ? (initialParam as ServiceType) : 'custom_production',
  )

  const [artistName, setArtistName] = useState('')
  const [email, setEmail] = useState('')
  const [contactHandle, setContactHandle] = useState('')
  const [projectTitle, setProjectTitle] = useState(
    refParam === 'reminisce-ep' ? 'Custom Cultural Score / Production (Reminisce EP style)' : '',
  )
  const [beatId, setBeatId] = useState('')
  const [referenceUrl, setReferenceUrl] = useState('')
  const [preferredSchedule, setPreferredSchedule] = useState('')
  const [notes, setNotes] = useState('')

  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [confirmed, setConfirmed] = useState<{ code: string; localOnly: boolean } | null>(null)

  useEffect(() => {
    setArtistName((p) => p || profile?.full_name || user?.user_metadata?.full_name || '')
    setEmail((p) => p || user?.email || '')
  }, [user, profile])

  const activeService = STUDIO_SERVICES.find((s) => s.id === selected) ?? STUDIO_SERVICES[0]

  const chooseService = (id: ServiceType) => {
    setSelected(id)
    setConfirmed(null)
    setError(null)
    document.getElementById('service-booking-form')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setBusy(true)
    setError(null)
    setConfirmed(null)

    const payload = {
      serviceType: selected,
      artistName: artistName.trim(),
      email: email.trim(),
      contactHandle: contactHandle.trim(),
      projectTitle: projectTitle.trim(),
      beatId: selected === 'beat_customization' && beatId ? beatId : undefined,
      referenceUrl: referenceUrl.trim() || undefined,
      preferredSchedule: preferredSchedule.trim() || undefined,
      notes: notes.trim(),
    }

    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' }
      if (session?.access_token) {
        headers.Authorization = `Bearer ${session.access_token}`
      }

      const res = await fetch('/api/services/book', {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
      })

      const ct = res.headers.get('content-type') || ''
      if (!ct.includes('application/json')) {
        // Local Vite preview without Vercel API runtime: store locally for review and show email fallback
        const localCode = `SRV-${Math.random().toString(36).slice(2, 8).toUpperCase()}`
        const localEntry: ServiceBooking = {
          id: crypto.randomUUID(),
          booking_code: localCode,
          service_type: selected,
          artist_name: payload.artistName,
          email: payload.email,
          contact_handle: payload.contactHandle,
          project_title: payload.projectTitle,
          beat_id: payload.beatId,
          reference_url: payload.referenceUrl,
          preferred_schedule: payload.preferredSchedule,
          notes: payload.notes,
          status: 'new',
          created_at: new Date().toISOString(),
        }
        localStorage.setItem(LOCAL_BOOKINGS_KEY, JSON.stringify([localEntry, ...readLocalBookings()]))
        setConfirmed({ code: localCode, localOnly: true })
        setNotes('')
        setProjectTitle('')
        setBusy(false)
        return
      }

      const data = (await res.json()) as { ok?: boolean; bookingCode?: string; error?: string }
      if (!res.ok) {
        if (res.status === 503) {
          // Server DB env vars not set yet — save locally cleanly & notify user
          const localCode = `SRV-${Math.random().toString(36).slice(2, 8).toUpperCase()}`
          const localEntry: ServiceBooking = {
            id: crypto.randomUUID(),
            booking_code: localCode,
            service_type: selected,
            artist_name: payload.artistName,
            email: payload.email,
            contact_handle: payload.contactHandle,
            project_title: payload.projectTitle,
            beat_id: payload.beatId,
            reference_url: payload.referenceUrl,
            preferred_schedule: payload.preferredSchedule,
            notes: payload.notes,
            status: 'new',
            created_at: new Date().toISOString(),
          }
          localStorage.setItem(LOCAL_BOOKINGS_KEY, JSON.stringify([localEntry, ...readLocalBookings()]))
          setConfirmed({ code: localCode, localOnly: true })
          setNotes('')
          setProjectTitle('')
          setBusy(false)
          return
        }
        throw new Error(data.error || 'Could not submit service booking.')
      }

      setConfirmed({ code: data.bookingCode || 'SRV-CONFIRMED', localOnly: false })
      setNotes('')
      setProjectTitle('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to send booking request.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-10">
        <div className="max-w-3xl">
          <p className="font-mono text-xs uppercase tracking-[0.25em] text-copper-ink font-semibold mb-3">
            1-on-1 studio services · Remote &amp; On-Call
          </p>
          <h1 className="text-4xl sm:text-5xl font-display font-extrabold uppercase tracking-tight text-ink leading-[1.05]">
            Custom production,{' '}
            <span className="text-copper">on-call sessions</span> &amp; mastering
          </h1>
          <p className="text-muted text-base sm:text-lg mt-4 leading-relaxed">
            Work directly with Yabsera (<span className="text-ink font-medium">@Yabuonthebeat</span>)
            to build custom beats from scratch, reshape any vault instrumental around your flow,
            hop on live production calls, or mix &amp; master your vocals to{' '}
            <span className="font-mono text-ink">-14 LUFS</span>.
          </p>
        </div>
      </section>

      {/* 4 Service Cards */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-14">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {STUDIO_SERVICES.map((svc) => {
            const Icon = SERVICE_ICONS[svc.id]
            const isSelected = selected === svc.id
            return (
              <div
                key={svc.id}
                className={`glass rounded-2xl p-6 flex flex-col justify-between transition-all ${
                  isSelected
                    ? 'border-2 border-copper shadow-xl shadow-copper/10'
                    : 'border border-line card-hover'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-xl bg-copper/15 border border-copper/30 flex items-center justify-center shrink-0">
                        <Icon className="w-5 h-5 text-copper-ink" />
                      </div>
                      <div>
                        <span className="font-mono text-[10px] uppercase tracking-widest text-copper-ink font-bold block">
                          {svc.badge}
                        </span>
                        <h2 className="text-xl font-bold text-ink">{svc.title}</h2>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-lg font-extrabold text-ink block">{svc.priceLabel}</span>
                      <span className="text-[11px] font-mono text-muted">{svc.turnaround}</span>
                    </div>
                  </div>

                  <p className="text-sm text-muted leading-relaxed mb-5">{svc.summary}</p>

                  <ul className="space-y-2 text-xs text-ink/85 mb-6">
                    {svc.deliverables.map((item) => (
                      <li key={item} className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-copper-ink shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <button
                  type="button"
                  onClick={() => chooseService(svc.id)}
                  className={`w-full py-3 rounded-xl text-xs font-bold transition-all ${
                    isSelected
                      ? 'bg-brand hover:bg-brand-hover text-btn shadow-lg'
                      : 'bg-card hover:bg-brand hover:text-btn text-ink border border-line'
                  }`}
                >
                  {isSelected ? 'Selected below — Fill session details' : `Book ${svc.title}`}
                </button>
              </div>
            )
          })}
        </div>
      </section>

      {/* 3-Step Workflow */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-14">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            {
              step: '01',
              title: 'Send your brief & references',
              desc: 'Pick your service, paste reference links or vault track names, and share your schedule.',
            },
            {
              step: '02',
              title: '1-on-1 call or studio build',
              desc: 'Collaborate live on call or receive custom arrangement / mix previews for feedback.',
            },
            {
              step: '03',
              title: 'Final WAVs, stems & master',
              desc: 'Approve the final bounce and get clean, release-ready -14 LUFS masters & stems.',
            },
          ].map((item) => (
            <div key={item.step} className="glass rounded-2xl border border-line p-5">
              <span className="font-mono text-xs font-bold text-copper-ink">{item.step}</span>
              <h3 className="font-bold text-ink text-base mt-1">{item.title}</h3>
              <p className="text-xs text-muted mt-1 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Interactive Booking Form */}
      <section
        id="service-booking-form"
        className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-20"
      >
        <div className="glass rounded-3xl border border-line p-6 sm:p-10 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-line pb-6 mb-6">
            <div>
              <span className="font-mono text-xs uppercase tracking-widest text-copper-ink font-bold">
                Book studio time
              </span>
              <h2 className="text-2xl sm:text-3xl font-display font-extrabold uppercase text-ink mt-1">
                {activeService.title}
              </h2>
            </div>
            <div className="text-left sm:text-right">
              <span className="text-xl font-extrabold text-ink block">{activeService.priceLabel}</span>
              <span className="text-xs font-mono text-muted flex items-center sm:justify-end gap-1">
                <CalendarClock className="w-3.5 h-3.5 text-copper-ink" /> {activeService.turnaround}
              </span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-ink/80 uppercase mb-1">
                  Service Type
                </label>
                <select
                  value={selected}
                  onChange={(e) => setSelected(e.target.value as ServiceType)}
                  className="input [&>option]:bg-card [&>option]:text-ink"
                >
                  {STUDIO_SERVICES.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.title} ({s.priceLabel})
                    </option>
                  ))}
                </select>
              </div>

              {selected === 'beat_customization' && (
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-ink/80 uppercase mb-1">
                    Which V808 beat should we customize?
                  </label>
                  <select
                    value={beatId}
                    onChange={(e) => setBeatId(e.target.value)}
                    className="input [&>option]:bg-card [&>option]:text-ink"
                  >
                    <option value="">Select a beat from the vault (optional)</option>
                    {beats.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.title} ({b.genre} • {b.bpm} BPM • {b.key_root})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-ink/80 uppercase mb-1">
                  Artist / Stage Name
                </label>
                <input
                  required
                  className="input"
                  value={artistName}
                  onChange={(e) => setArtistName(e.target.value)}
                  placeholder="Your artist or label name"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-ink/80 uppercase mb-1">
                  Email Address
                </label>
                <input
                  required
                  type="email"
                  className="input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@email.com"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-ink/80 uppercase mb-1">
                  Phone / Telegram / WhatsApp / IG
                </label>
                <input
                  required
                  className="input"
                  value={contactHandle}
                  onChange={(e) => setContactHandle(e.target.value)}
                  placeholder="e.g. @yourhandle or +2519XXXXXXXX"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-ink/80 uppercase mb-1">
                  Project / Song Title
                </label>
                <input
                  required
                  className="input"
                  value={projectTitle}
                  onChange={(e) => setProjectTitle(e.target.value)}
                  placeholder="e.g. Midnight Tape Intro"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-ink/80 uppercase mb-1">
                  Reference Track / Demo Link (optional)
                </label>
                <input
                  type="url"
                  className="input"
                  value={referenceUrl}
                  onChange={(e) => setReferenceUrl(e.target.value)}
                  placeholder="https://youtube.com/... or Google Drive link"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-ink/80 uppercase mb-1">
                  Preferred Call Time / Deadline (optional)
                </label>
                <input
                  className="input"
                  value={preferredSchedule}
                  onChange={(e) => setPreferredSchedule(e.target.value)}
                  placeholder="e.g. Weekdays 6pm EAT or Friday release"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-ink/80 uppercase mb-1">
                  Creative Direction, BPM / Key &amp; Notes
                </label>
                <textarea
                  required
                  minLength={10}
                  rows={4}
                  className="input resize-none"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Describe your vibe, tempo, structure changes, or vocal mix goals..."
                />
              </div>
            </div>

            {error && (
              <p className="text-xs text-rose-600 dark:text-rose-400 bg-rose-500/10 border border-rose-500/30 rounded-xl px-4 py-2.5">
                {error}
              </p>
            )}

            {confirmed && (
              <div className="rounded-2xl bg-emerald-500/10 border border-emerald-500/30 p-4 space-y-2">
                <p className="text-sm font-bold text-emerald-700 dark:text-emerald-300 flex items-center gap-2">
                  <Wand2 className="w-4 h-4" />
                  Booking Request Received — Reference: {confirmed.code}
                </p>
                <p className="text-xs text-muted leading-relaxed">
                  {confirmed.localOnly
                    ? 'Saved in your session preview. To also reach Yabsera directly right away, send your ref code via email or Instagram below.'
                    : 'Your request has been saved securely. Yabsera will follow up via your email or Telegram/phone handle to lock in your session.'}
                </p>
              </div>
            )}

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
              <div className="text-xs text-muted flex flex-wrap items-center gap-3">
                <a
                  href={`mailto:yabsera990@gmail.com?subject=${encodeURIComponent(
                    `V808 Studio Inquiry: ${activeService.title}`,
                  )}`}
                  className="inline-flex items-center gap-1.5 hover:text-copper-ink transition-colors"
                >
                  <Mail className="w-3.5 h-3.5" /> yabsera990@gmail.com
                </a>
                <span>•</span>
                <span className="font-mono">IG / TG: @yabuonthebeat</span>
              </div>

              <button
                type="submit"
                disabled={busy}
                className="btn-primary px-8 py-4 text-sm shrink-0 disabled:opacity-60"
              >
                <Send className="w-4 h-4" />
                {busy ? 'Submitting request…' : 'Submit booking request'}
              </button>
            </div>
          </form>
        </div>
      </section>
    </div>
  )
}
