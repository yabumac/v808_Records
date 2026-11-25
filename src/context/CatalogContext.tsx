import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { supabase, isSupabaseConfigured } from '../lib/supabase'
import { seedBeats } from '../lib/seed'
import { useAuth } from './AuthContext'
import type { Beat, License, LicenseTier } from '../types'

interface CatalogContextValue {
  beats: Beat[]
  loading: boolean
  purchased: License[]
  refreshBeats: () => Promise<void>
  addBeat: (beat: Omit<Beat, 'id' | 'created_at'>) => Promise<Beat>
  updateBeat: (id: string, patch: Partial<Beat>) => Promise<void>
  deleteBeat: (id: string) => Promise<void>
  purchase: (input: {
    beat: Beat
    tier: LicenseTier
    price: number
    buyerName: string
    buyerEmail: string
  }) => Promise<License>
}

const CatalogContext = createContext<CatalogContextValue | undefined>(undefined)

const LOCAL_BEATS = 'v808-beats-v2'
const LOCAL_LICENSES = 'v808-licenses'

function readLocal<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

export function CatalogProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [beats, setBeats] = useState<Beat[]>(() => readLocal(LOCAL_BEATS, seedBeats))
  const [purchased, setPurchased] = useState<License[]>(() =>
    readLocal(LOCAL_LICENSES, [] as License[]),
  )
  const [loading, setLoading] = useState(false)

  const refreshBeats = useCallback(async () => {
    if (!isSupabaseConfigured || !supabase) return
    setLoading(true)
    const { data } = await supabase
      .from('beats')
      .select('*')
      .order('created_at', { ascending: false })
    if (data) setBeats(data as Beat[])
    setLoading(false)
  }, [])

  useEffect(() => {
    refreshBeats()
  }, [refreshBeats])

  useEffect(() => {
    if (isSupabaseConfigured) return
    localStorage.setItem(LOCAL_BEATS, JSON.stringify(beats))
  }, [beats])

  useEffect(() => {
    if (isSupabaseConfigured) return
    localStorage.setItem(LOCAL_LICENSES, JSON.stringify(purchased))
  }, [purchased])

  // Load the signed-in user's licenses from Supabase.
  useEffect(() => {
    if (!isSupabaseConfigured || !supabase || !user) return
    supabase
      .from('licenses')
      .select('*, beat:beats(*)')
      .eq('buyer_id', user.id)
      .order('issued_at', { ascending: false })
      .then(({ data }) => {
        if (data) setPurchased(data as License[])
      })
  }, [user])

  const addBeat: CatalogContextValue['addBeat'] = async (beat) => {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('beats').insert(beat).select().single()
      if (error) throw error
      setBeats((p) => [data as Beat, ...p])
      return data as Beat
    }
    const created: Beat = {
      ...beat,
      id: crypto.randomUUID(),
      created_at: new Date().toISOString(),
    }
    setBeats((p) => [created, ...p])
    return created
  }

  const updateBeat: CatalogContextValue['updateBeat'] = async (id, patch) => {
    if (isSupabaseConfigured && supabase) {
      await supabase.from('beats').update(patch).eq('id', id)
    }
    setBeats((p) => p.map((b) => (b.id === id ? { ...b, ...patch } : b)))
  }

  const deleteBeat: CatalogContextValue['deleteBeat'] = async (id) => {
    if (isSupabaseConfigured && supabase) {
      await supabase.from('beats').delete().eq('id', id)
    }
    setBeats((p) => p.filter((b) => b.id !== id))
  }

  const purchase: CatalogContextValue['purchase'] = async ({
    beat,
    tier,
    price,
    buyerName,
    buyerEmail,
  }) => {
    const licenseCode = `LIC-${Math.floor(100000 + Math.random() * 900000)}`
    const payload = {
      beat_id: beat.id,
      buyer_id: user?.id ?? null,
      tier,
      price,
      license_code: licenseCode,
      buyer_name: buyerName,
      buyer_email: buyerEmail,
    }

    let created: License = {
      id: crypto.randomUUID(),
      ...payload,
      issued_at: new Date().toISOString(),
      beat,
    }

    if (isSupabaseConfigured && supabase) {
      const { data } = await supabase
        .from('licenses')
        .insert(payload)
        .select('*, beat:beats(*)')
        .single()
      if (data) created = data as License
    }

    setPurchased((p) => [created, ...p])
    return created
  }

  const value = useMemo(
    () => ({
      beats,
      loading,
      purchased,
      refreshBeats,
      addBeat,
      updateBeat,
      deleteBeat,
      purchase,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [beats, loading, purchased],
  )

  return <CatalogContext.Provider value={value}>{children}</CatalogContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useCatalog() {
  const ctx = useContext(CatalogContext)
  if (!ctx) throw new Error('useCatalog must be used within CatalogProvider')
  return ctx
}
