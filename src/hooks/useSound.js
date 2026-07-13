import { useCallback, useRef } from 'react'

export default function useSound() {
  const ctxRef = useRef(null)

  const getCtx = useCallback(() => {
    if (!ctxRef.current) {
      ctxRef.current = new (window.AudioContext || window.webkitAudioContext)()
    }
    return ctxRef.current
  }, [])

  const playNote = useCallback((freq, duration, type, vol) => {
    try {
      const ctx = getCtx()
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = type || 'square'
      osc.frequency.value = freq
      gain.gain.setValueAtTime(vol || 0.08, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration)
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start(ctx.currentTime)
      osc.stop(ctx.currentTime + duration)
    } catch (e) {}
  }, [getCtx])

  const sfx = useCallback({
    select: () => playNote(600, 0.08, 'square', 0.06),
    click: () => playNote(300, 0.05, 'square', 0.04),
    success: () => {
      playNote(523, 0.15, 'square', 0.06)
      setTimeout(() => playNote(659, 0.15, 'square', 0.06), 100)
      setTimeout(() => playNote(784, 0.2, 'square', 0.06), 200)
    },
    danger: () => {
      playNote(400, 0.15, 'square', 0.06)
      setTimeout(() => playNote(300, 0.15, 'square', 0.06), 120)
      setTimeout(() => playNote(200, 0.25, 'square', 0.06), 240)
    },
    event: () => {
      playNote(880, 0.08, 'triangle', 0.05)
      setTimeout(() => playNote(660, 0.08, 'triangle', 0.05), 80)
      setTimeout(() => playNote(880, 0.12, 'triangle', 0.05), 160)
    },
    notif: () => {
      playNote(440, 0.06, 'square', 0.04)
      setTimeout(() => playNote(660, 0.06, 'square', 0.04), 60)
    },
    gameover: () => {
      playNote(500, 0.2, 'square', 0.06)
      setTimeout(() => playNote(400, 0.2, 'square', 0.06), 200)
      setTimeout(() => playNote(300, 0.2, 'square', 0.06), 400)
      setTimeout(() => playNote(200, 0.4, 'square', 0.06), 600)
    },
    victory: () => {
      playNote(523, 0.15, 'square', 0.06)
      setTimeout(() => playNote(659, 0.15, 'square', 0.06), 150)
      setTimeout(() => playNote(784, 0.15, 'square', 0.06), 300)
      setTimeout(() => playNote(1047, 0.3, 'square', 0.06), 450)
    },
  }, [playNote])

  return sfx
}
