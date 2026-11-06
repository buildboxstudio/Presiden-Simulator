import { useGame } from './context/GameContext'
import TitleScreen from './components/TitleScreen'
import Dashboard from './components/Dashboard'
import DebatRoom from './components/DebatRoom'
import ResultScreen from './components/ResultScreen'
import PolicySetup from './components/PolicySetup'
import Period2Setup from './components/Period2Setup'

export default function App() {
  const { phase } = useGame()

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-black font-retro">
      <div className="flex-1 flex flex-col">
        {phase === 'menu' && <TitleScreen />}
        {phase === 'setup' && <PolicySetup />}
        {phase === 'game' && <Dashboard />}
        {phase === 'pemilu' && <DebatRoom />}
        {phase === 'period2_setup' && <Period2Setup />}
        {phase === 'result' && <ResultScreen />}
      </div>

      {phase !== 'result' && (
        <div className="text-center text-xs lg:text-sm text-retroLight/20 py-2 border-t border-retroGray/20">
          PRESIDEN SIMULATOR — Buildbox Studio 2026
        </div>
      )}
    </div>
  )
}
