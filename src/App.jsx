import { useEffect, useRef } from 'react'
import { useGame } from './context/GameContext'
import TitleScreen from './components/TitleScreen'
import Dashboard from './components/Dashboard'
import DebatRoom from './components/DebatRoom'
import ResultScreen from './components/ResultScreen'
import PolicySetup from './components/PolicySetup'
import Period2Setup from './components/Period2Setup'

const DESIGN_WIDTH = 768 // px — base design width used for scale calc

export default function App() {
  const { phase } = useGame()
  const gameRef = useRef(null)
  const wrapperRef = useRef(null)

  // Auto-scale game UI on desktop so pixel-art text and graphics look bigger
  useEffect(() => {
    const handleResize = () => {
      if (!gameRef.current || !wrapperRef.current) return
      const vw = window.innerWidth

      // Only scale on desktop (tablet/laptop widths top)
      let scale = 1
      if (vw > 768) {
        scale = Math.min(1.6, Math.max(1, vw / DESIGN_WIDTH))
      }

      gameRef.current.style.transform = `scale(${scale})`
      gameRef.current.style.transformOrigin = 'top center'
      gameRef.current.style.width = `${DESIGN_WIDTH}px`
      gameRef.current.style.maxWidth = '100%'

      // Compensate wrapper height so scaled content isn't clipped
      const layoutHeight = gameRef.current.scrollHeight
      wrapperRef.current.style.height = `${layoutHeight * scale}px`
      wrapperRef.current.style.minHeight = '100vh'
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
      <div ref={gameRef} className="game-content flex flex-col min-h-screen bg-black font-retro">
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
