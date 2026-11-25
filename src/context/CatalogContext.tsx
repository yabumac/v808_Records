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
import type { Beat, License } from '../types'

interface CatalogContextValue {
  beats: Beat[]
  loading: boolean
  purchased: License[]
  refreshBeats: () => Promise<void>
  refreshLicenses: () => Promise<void>
  recordVerifiedLicense: (license: License) => void
  addBeat: (beat: Omit<Beat, 'id' | 'created_at'>) => Promise<Beat>
  updateBeat: (id: string, patch: Partial<Beat>) => Promise<void>
  deleteBeat: (id: string) => Promise<void>
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
    if (data && data.length > 0) setBeats(data as Beat[])
    setLoading(false)
  }, [])

  const refreshLicenses = useCallback(async () => {
    if (!isSupabaseConfigured || !supabase || !user) return
    const { data } = await supabase
      .from('licenses')
      .select('*')
      .eq('buyer_id', user.id)
      .order('issued_at', { ascending: false })
    if (data) {
      const hydrated = (data as License[]).map((lic) => ({
        ...lic,
        beat: lic.beat ?? beats.find((b) => b.id === lic.beat_id),
      }))
      setPurchased(hydrated)
    }
  }, [user, beats])

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

  // Load the signed-in user's verified licenses from Supabase.
  useEffect(() => {
    if (!user) {
      if (isSupabaseConfigured) setPurchased([])
      return
    }
    refreshLicenses()
  }, [user, refreshLicenses])

  const recordVerifiedLicense = useCallback(
    (license: License) => {
      const enriched: License = {
        ...license,
        beat: license.beat ?? beats.find((b) => b.id === license.beat_id),
      }
      setPurchased((prev) =>
        prev.some((l) => l.id === enriched.id || l.license_code === enriched.license_code)
          ? prev
          : [enriched, ...prev],
      )
    },
    [beats],
  )

  const addBeat: CatalogContextValue['addBeat'] = async (beat) => {
    const id = crypto.randomUUID()
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('beats')
        .insert({ ...beat, id })
        .select()
        .single()
      if (error) throw error
      setBeats((p) => [data as Beat, ...p])
      return data as Beat
    }
    const created: Beat = {
      ...beat,
      id,
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

  const value = useMemo(
    () => ({
      beats,
      loading,
      purchased,
      refreshBeats,
      refreshLicenses,
      recordVerifiedLicense,
      addBeat,
      updateBeat,
      deleteBeat,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [beats, loading, purchased, refreshBeats, refreshLicenses, recordVerifiedLicense],
  )

  return <CatalogContext.Provider value={value}>{children}</CatalogContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useCatalog() {
  const ctx = useContext(CatalogContext)
  if (!ctx) throw new Error('useCatalog must be used within CatalogProvider')
  return ctx
}
