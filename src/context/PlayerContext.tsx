import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import type { Beat } from '../types'

interface PlayerContextValue {
  current: Beat | null
  queue: Beat[]
  isPlaying: boolean
  currentTime: number
  duration: number
  volume: number
  play: (beat: Beat) => void
  playQueue: (tracks: Beat[], startIndex?: number) => void
  nextTrack: () => void
  prevTrack: () => void
  toggle: () => void
  seek: (fraction: number) => void
  setVolume: (v: number) => void
}

const PlayerContext = createContext<PlayerContextValue | undefined>(undefined)

export function PlayerProvider({ children }: { children: ReactNode }) {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const queueRef = useRef<Beat[]>([])
  const currentRef = useRef<Beat | null>(null)

  const [current, setCurrent] = useState<Beat | null>(null)
  const [queue, setQueue] = useState<Beat[]>([])
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolumeState] = useState(0.8)

  const startTrack = useCallback((beat: Beat) => {
    const audio = audioRef.current
    if (!audio || !beat.audio_url) return
    currentRef.current = beat
    setCurrent(beat)
    audio.src = beat.audio_url
    audio.currentTime = 0
    audio.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false))
  }, [])

  useEffect(() => {
    const audio = new Audio()
    audio.volume = volume
    audioRef.current = audio

    const onTime = () => setCurrentTime(audio.currentTime)
    const onMeta = () => setDuration(audio.duration || 0)
    const onEnd = () => {
      const q = queueRef.current
      const cur = currentRef.current
      if (q.length > 1 && cur) {
        const idx = q.findIndex((t) => t.id === cur.id)
        if (idx >= 0 && idx + 1 < q.length) {
          startTrack(q[idx + 1])
          return
        }
      }
      setIsPlaying(false)
    }

    audio.addEventListener('timeupdate', onTime)
    audio.addEventListener('loadedmetadata', onMeta)
    audio.addEventListener('ended', onEnd)

    return () => {
      audio.pause()
      audio.removeEventListener('timeupdate', onTime)
      audio.removeEventListener('loadedmetadata', onMeta)
      audio.removeEventListener('ended', onEnd)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startTrack])

  const play = (beat: Beat) => {
    const audio = audioRef.current
    if (!audio || !beat.audio_url) return
    if (current?.id === beat.id) {
      if (isPlaying) audio.pause()
      else audio.play().catch(() => {})
      setIsPlaying(!isPlaying)
      return
    }
    queueRef.current = []
    setQueue([])
    startTrack(beat)
  }

  const playQueue = (tracks: Beat[], startIndex = 0) => {
    const playable = tracks.filter((t) => Boolean(t.audio_url))
    if (playable.length === 0) return
    const target = tracks[startIndex]
    const resolvedIdx = target ? Math.max(0, playable.findIndex((t) => t.id === target.id)) : 0
    const selected = playable[resolvedIdx]

    if (current?.id === selected.id && audioRef.current) {
      queueRef.current = playable
      setQueue(playable)
      if (isPlaying) audioRef.current.pause()
      else audioRef.current.play().catch(() => {})
      setIsPlaying(!isPlaying)
      return
    }

    queueRef.current = playable
    setQueue(playable)
    startTrack(selected)
  }

  const nextTrack = () => {
    if (queue.length < 2 || !current) return
    const idx = queue.findIndex((t) => t.id === current.id)
    if (idx >= 0) {
      startTrack(queue[(idx + 1) % queue.length])
    }
  }

  const prevTrack = () => {
    if (queue.length < 2 || !current) return
    const idx = queue.findIndex((t) => t.id === current.id)
    if (idx >= 0) {
      startTrack(queue[(idx - 1 + queue.length) % queue.length])
    }
  }

  const toggle = () => {
    const audio = audioRef.current
    if (!audio || !current) return
    if (isPlaying) {
      audio.pause()
      setIsPlaying(false)
    } else {
      audio.play().catch(() => {})
      setIsPlaying(true)
    }
  }

  const seek = (fraction: number) => {
    const audio = audioRef.current
    if (!audio || !audio.duration) return
    audio.currentTime = fraction * audio.duration
  }

  const setVolume = (v: number) => {
    setVolumeState(v)
    if (audioRef.current) audioRef.current.volume = v
  }

  return (
    <PlayerContext.Provider
      value={{
        current,
        queue,
        isPlaying,
        currentTime,
        duration,
        volume,
        play,
        playQueue,
        nextTrack,
        prevTrack,
        toggle,
        seek,
        setVolume,
      }}
    >
      {children}
    </PlayerContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function usePlayer() {
  const ctx = useContext(PlayerContext)
  if (!ctx) throw new Error('usePlayer must be used within PlayerProvider')
  return ctx
}
