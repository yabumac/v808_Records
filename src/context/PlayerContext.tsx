import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import type { Beat } from '../types'

interface PlayerContextValue {
  current: Beat | null
  isPlaying: boolean
  currentTime: number
  duration: number
  volume: number
  play: (beat: Beat) => void
  toggle: () => void
  seek: (fraction: number) => void
  setVolume: (v: number) => void
}

const PlayerContext = createContext<PlayerContextValue | undefined>(undefined)

export function PlayerProvider({ children }: { children: ReactNode }) {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [current, setCurrent] = useState<Beat | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolumeState] = useState(0.8)

  useEffect(() => {
    const audio = new Audio()
    audio.volume = volume
    audioRef.current = audio

    const onTime = () => setCurrentTime(audio.currentTime)
    const onMeta = () => setDuration(audio.duration || 0)
    const onEnd = () => setIsPlaying(false)

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
  }, [])

  const play = (beat: Beat) => {
    const audio = audioRef.current
    if (!audio) return
    if (current?.id === beat.id) {
      if (isPlaying) audio.pause()
      else audio.play().catch(() => {})
      setIsPlaying(!isPlaying)
      return
    }
    setCurrent(beat)
    audio.src = beat.audio_url
    audio.currentTime = 0
    audio.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false))
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
      value={{ current, isPlaying, currentTime, duration, volume, play, toggle, seek, setVolume }}
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
