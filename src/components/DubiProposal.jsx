import { useGame } from '../context/GameContext'
import useSound from '../hooks/useSound'

export default function DubiProposal() {
  const { dubiProposal, indicators, respondDubiProposal } = useGame()
  const sfx = useSound()

  if (!dubiProposal) return null

  return (
    <div className="fixed inset-0 flex items-start justify-center bg-black/80 z-50 p-4 pt-8 overflow-y-auto">
      <div className="fade-in max-w-lg w-full border-4 border-retroYellow bg-black/90 p-6 text-center my-auto">
        <div className="text-2xl text-retroYellow glow-text mb-4">🔥 {dubiProposal.title} 🔥</div>

        <div className="w-24 h-24 mx-auto mb-4 bg-retroGray rounded-full flex items-center justify-center overflow-hidden border-2 border-retroYellow">
          <span className="text-4xl">🦅</span>
        </div>

        <div className="text-sm text-retroLight/80 mb-4 leading-relaxed italic border-l-4 border-retroYellow pl-4 text-left">
          {dubiProposal.desc}
        </div>
        <div className="text-[10px] text-retroLight/30 text-right mb-4">— BUDEE ARIE, Ketua LOYALIS PRESIDEN</div>

        <div className="text-xs text-retroLight/50 mb-4">Popularitas saat ini: {Math.round(indicators.popularitas)}%</div>

        <div className="flex flex-col gap-3">
          <button onClick={() => { sfx.select(); respondDubiProposal(true) }}
            className="w-full py-3 border-2 border-red-500 bg-red-900/20 hover:bg-red-900/40 text-red-300 transition-colors text-sm">
            🔥 SETUJU — 3 PERIODE 🔥
          </button>
          <div className="text-[10px] text-red-400/60 text-center -mt-2">⚠ Oposisi +50%, 3 kuartal susah dapat popularitas</div>
          <button onClick={() => { sfx.select(); respondDubiProposal(false) }}
            className="w-full py-3 border-2 border-retroGreen bg-retroGreen/20 hover:bg-retroGreen/40 text-retroLight transition-colors text-sm">
            ✋ TOLAK — Cukup 2 Periode
          </button>
        </div>
      </div>
    </div>
  )
}
