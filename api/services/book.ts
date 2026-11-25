import crypto from 'node:crypto'
import {
  checkRateLimit,
  getClientIp,
  getSupabaseConfig,
  readJsonBody,
  requireAuthUser,
  sanitizeEmail,
  sendJson,
  supabaseAdminFetch,
  writeAuditLog,
  type ApiRequest,
  type ApiResponse,
} from '../_lib/security.js'

const VALID_SERVICES = [
  'custom_production',
  'beat_customization',
  'on_call_session',
  'mixing_mastering',
] as const

type ServiceType = (typeof VALID_SERVICES)[number]

interface ServiceBody {
  serviceType?: string
  artistName?: string
  email?: string
  contactHandle?: string
  projectTitle?: string
  beatId?: string
  referenceUrl?: string
  preferredSchedule?: string
  notes?: string
}

function sanitizeHttpsUrl(raw?: string): string | null {
  const val = (raw || '').trim()
  if (!val) return null
  try {
    const u = new URL(val)
    if (u.protocol !== 'https:' && u.protocol !== 'http:') return null
    return u.toString().slice(0, 500)
  } catch {
    return null
  }
}

export default async function handler(req: ApiRequest, res: ApiResponse) {
  if (req.method !== 'POST') {
    return sendJson(res, 405, { error: 'Method not allowed.' })
  }

  const ip = getClientIp(req)
  if (!checkRateLimit(`service:${ip}`, 10, 60_000)) {
    await writeAuditLog({ event_type: 'service_rate_limited', ip_address: ip })
    return sendJson(res, 429, { error: 'Too many requests. Please wait a minute before submitting again.' })
  }

  let body: ServiceBody
  try {
    body = await readJsonBody<ServiceBody>(req)
  } catch {
    return sendJson(res, 400, { error: 'Invalid JSON request body.' })
  }

  const serviceType = String(body.serviceType || '').trim() as ServiceType
  if (!VALID_SERVICES.includes(serviceType)) {
    return sendJson(res, 400, { error: 'Please select a valid studio service.' })
  }

  const artistName = String(body.artistName || '').trim().slice(0, 120)
  const email = sanitizeEmail(String(body.email || ''))
  const contactHandle = String(body.contactHandle || '').trim().slice(0, 120)
  const projectTitle = String(body.projectTitle || '').trim().slice(0, 160)
  const notes = String(body.notes || '').trim().slice(0, 2000)

  if (!artistName || !email || !contactHandle || !projectTitle || notes.length < 10) {
    return sendJson(res, 400, {
      error: 'Please fill in your name, valid email, call/chat handle, project title, and brief notes (10+ characters).',
    })
  }

  const rawRef = String(body.referenceUrl || '').trim()
  const referenceUrl = sanitizeHttpsUrl(rawRef)
  if (rawRef && !referenceUrl) {
    return sendJson(res, 400, { error: 'Reference link must be a valid http(s) URL.' })
  }

  const beatId = String(body.beatId || '').trim().slice(0, 100) || null
  const preferredSchedule = String(body.preferredSchedule || '').trim().slice(0, 160) || null

  const authUser = await requireAuthUser(req)
  const bookingCode = `SRV-${crypto.randomBytes(3).toString('hex').toUpperCase()}`

  const sb = getSupabaseConfig()
  if (!sb.url || !sb.serviceKey) {
    return sendJson(res, 503, {
      error: 'Server database connection (SUPABASE_SERVICE_ROLE_KEY) is not configured yet.',
      missingEnv: ['SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY'],
    })
  }

  try {
    const insertRes = await supabaseAdminFetch<Record<string, unknown>[]>('service_requests', {
      method: 'POST',
      headers: { Prefer: 'return=representation' },
      body: JSON.stringify({
        booking_code: bookingCode,
        user_id: authUser?.id ?? null,
        service_type: serviceType,
        artist_name: artistName,
        email,
        contact_handle: contactHandle,
        project_title: projectTitle,
        beat_id: beatId,
        reference_url: referenceUrl,
        preferred_schedule: preferredSchedule,
        notes,
        status: 'new',
      }),
    })

    if (!insertRes.ok) {
      throw new Error(`Unable to store booking: ${insertRes.text}`)
    }

    await writeAuditLog({
      event_type: 'service_booking_created',
      user_id: authUser?.id ?? null,
      ip_address: ip,
      details: { booking_code: bookingCode, service_type: serviceType },
    })

    return sendJson(res, 201, {
      ok: true,
      bookingCode,
      booking: insertRes.data?.[0] ?? null,
    })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unable to save service request.'
    return sendJson(res, 500, { error: msg })
  }
}
