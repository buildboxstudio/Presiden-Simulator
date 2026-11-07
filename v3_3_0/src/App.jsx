import { useGame } from './context/GameContext'
import { useAudio } from './context/AudioContext'
import TitleScreen from './components/TitleScreen'
import Dashboard from './components/Dashboard'
import DebatRoom from './components/DebatRoom'
import ResultScreen from './components/ResultScreen'
import PolicySetup from './components/PolicySetup'
import Period2Setup from './components/Period2Setup'

export default function App() {
  const { phase } = useGame()
  const { volume, setVolume, bgmPlaying } = useAudio()

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
        <div className="text-center text-xs lg:text-sm text-retroLight/20 py-2 border-t border-retroGray/20 flex items-center justify-between px-4">
          <div>PRESIDEN SIMULATOR — Buildbox Studio 2026</div>
          {bgmPlaying && (
            <div className="flex items-center gap-2 text-xs">
              <span>🔊</span>
              <input type="range" min="0" max="100" value={volume * 100} onChange={(e) => setVolume(e.target.value / 100)} className="w-20 h-1 bg-retroGray rounded cursor-pointer" />
            </div>
          )}
        </div>
      )}
    </div>
  )
}
