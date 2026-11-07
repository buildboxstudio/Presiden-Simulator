import { createContext, useContext, useState, useRef, useEffect } from 'react'

const AudioContext = createContext()

export function AudioProvider({ children }) {
  const [volume, setVolume] = useState(0.5)
  const bgmRef = useRef(null)
  const [bgmPlaying, setBgmPlaying] = useState(false)

  useEffect(() => {
    if (bgmRef.current) bgmRef.current.volume = volume
  }, [volume])

  const playBGM = (url) => {
    if (!bgmRef.current) {
      bgmRef.current = new Audio(url)
      bgmRef.current.loop = true
      bgmRef.current.volume = volume
    }
    if (bgmRef.current.src !== url) {
      bgmRef.current.src = url
    }
    if (!bgmPlaying) {
      bgmRef.current.play().catch(() => {})
      setBgmPlaying(true)
    }
  }

  const stopBGM = () => {
    if (bgmRef.current) {
      bgmRef.current.pause()
      bgmRef.current.currentTime = 0
      setBgmPlaying(false)
    }
  }

  return (
    <AudioContext.Provider value={{ volume, setVolume, playBGM, stopBGM, bgmPlaying }}>
      {children}
    </AudioContext.Provider>
  )
}

export function useAudio() {
  const ctx = useContext(AudioContext)
  if (!ctx) throw new Error('useAudio must be used within AudioProvider')
  return ctx
}
