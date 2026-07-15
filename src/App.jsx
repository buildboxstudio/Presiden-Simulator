import { useEffect, useRef } from 'react'
import { useGame } from './context/GameContext'
import TitleScreen from './components/TitleScreen'
import Dashboard from './components/Dashboard'
import DebatRoom from './components/DebatRoom'
import ResultScreen from './components/ResultScreen'
import PolicySetup from './components/PolicySetup'
import Period2Setup from './components/Period2Setup'

// 16:9 widescreen design canvas
const DESIGN_W = 1280
const DESIGN_H = 720

export default function App() {
  const { phase } = useGame()
  const gameRef = useRef(null)
  const wrapperRef = useRef(null)

  // Fit a true 16:9 (1280x720) stage into the viewport on landscape/PC.
  // On portrait/mobile, fall back to the natural full-width layout.
  useEffect(() => {
    const handleResize = () => {
      if (!gameRef.current || !wrapperRef.current) return
      const vw = window.innerWidth
      const vh = window.innerHeight

      if (vw >= vh) {
        // Landscape / PC: scale the 16:9 stage to fill the screen
        const scale = Math.min(vw / DESIGN_W, vh / DESIGN_H)
        gameRef.current.style.width = `${DESIGN_W}px`
        gameRef.current.style.height = `${DESIGN_H}px`
        gameRef.current.style.minHeight = 'auto'
        gameRef.current.style.transform = `scale(${scale})`
        gameRef.current.style.transformOrigin = 'center center'

        wrapperRef.current.style.height = `${vh}px`
        wrapperRef.current.style.minHeight = '100vh'
        wrapperRef.current.style.alignItems = 'center'
        wrapperRef.current.style.overflow = 'hidden'
      } else {
        // Portrait / mobile: natural full-width layout
        gameRef.current.style.width = ''
        gameRef.current.style.height = ''
        gameRef.current.style.minHeight = '100vh'
        gameRef.current.style.transform = 'none'

        wrapperRef.current.style.height = ''
        wrapperRef.current.style.minHeight = '100vh'
        wrapperRef.current.style.alignItems = 'flex-start'
        wrapperRef.current.style.overflow = ''
      }
    }

    // Run after layout paint
    requestAnimationFrame(() => {
      handleResize()
    })

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [phase])

  return (
    <div ref={wrapperRef} className="game-wrapper">
      <div ref={gameRef} className="game-content flex flex-col bg-black font-retro">
        <div className="flex-1 flex flex-col">
          {phase === 'menu' && <TitleScreen />}
          {phase === 'setup' && <PolicySetup />}
          {phase === 'game' && <Dashboard />}
          {phase === 'pemilu' && <DebatRoom />}
          {phase === 'period2_setup' && <Period2Setup />}
          {phase === 'result' && <ResultScreen />}
        </div>

        {phase !== 'result' && (
          <div className="text-center text-xs text-retroLight/20 py-2 border-t border-retroGray/20">
            PRESIDEN SIMULATOR — Buildbox Studio 2026
          </div>
        )}
      </div>
    </div>
  )
}
