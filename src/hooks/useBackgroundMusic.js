import { useRef, useCallback, useEffect } from 'react'

export default function useBackgroundMusic() {
  const audioRef = useRef(null)
  const playingRef = useRef(false)

  const startMusic = useCallback(() => {
    if (playingRef.current) return
    playingRef.current = true
    try {
      const base = import.meta.env.BASE_URL || '/'
      const audio = new Audio(base + 'music/bgm.mp3')
      audio.loop = true
      audio.volume = 0.3
      audio.play().catch(() => { playingRef.current = false })
      audioRef.current = audio
    } catch (e) {
      playingRef.current = false
    }
  }, [])

  const stopMusic = useCallback(() => {
    playingRef.current = false
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current = null
    }
  }, [])

  const toggleMusic = useCallback(() => {
    if (playingRef.current) {
      stopMusic()
    } else {
      startMusic()
    }
  }, [startMusic, stopMusic])

  useEffect(() => {
    return () => stopMusic()
  }, [stopMusic])

  return { startMusic, stopMusic, toggleMusic, isPlaying: () => playingRef.current }
}
