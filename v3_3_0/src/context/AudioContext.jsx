import { createContext, useContext, useState, useRef, useEffect, useCallback } from 'react'

const AudioContext = createContext()

export function AudioProvider({ children }) {
  const [volume, setVolume] = useState(0.5)
  const bgmRef = useRef(null)
  const trackRef = useRef(null)
  const [bgmPlaying, setBgmPlaying] = useState(false)

  const getAudio = () => {
    if (!bgmRef.current) {
      bgmRef.current = new Audio()
      bgmRef.current.loop = true
    }
    return bgmRef.current
  }

  const playBGM = useCallback((track) => {
    const audio = getAudio()
    const base = import.meta.env.BASE_URL || '/'
    if (trackRef.current !== track) {
      audio.src = base + 'music/' + track
      trackRef.current = track
    }
    audio.volume = volume
    audio.play().then(() => setBgmPlaying(true)).catch(() => setBgmPlaying(false))
  }, [volume])

  const stopBGM = useCallback(() => {
    if (!bgmRef.current) return
    bgmRef.current.pause()
    setBgmPlaying(false)
  }, [])

  const toggleBGM = useCallback(() => {
    const audio = bgmRef.current
    if (!audio) return
    if (audio.paused) {
      audio.play().then(() => setBgmPlaying(true)).catch(() => setBgmPlaying(false))
    } else {
      audio.pause()
      setBgmPlaying(false)
    }
  }, [])

  useEffect(() => {
    if (bgmRef.current) bgmRef.current.volume = volume
  }, [volume])

  return (
    <AudioContext.Provider value={{ volume, setVolume, playBGM, stopBGM, toggleBGM, bgmPlaying }}>
      {children}
    </AudioContext.Provider>
  )
}

export function useAudio() {
  const ctx = useContext(AudioContext)
  if (!ctx) throw new Error('useAudio must be used within AudioProvider')
  return ctx
}
