import { useEffect } from 'react'
import { useGame } from '../context/GameContext'
import useSound from '../hooks/useSound'

export default function PartyDemand() {
  const { partyDemand, party, respondPartyDemand } = useGame()
  const sfx = useSound()

  useEffect(() => {
    if (partyDemand) sfx.notif()
  }, [partyDemand])

  if (!partyDemand || !party) return null

  return (
    <div className="fade-in fixed inset-0 flex items-start justify-center bg-black/80 z-50 p-4 pt-8 overflow-y-auto">
      <div className="bg-retroGray border-4 border-retroLight max-w-lg w-full p-6 pixel-border my-auto">
        <div className="text-center mb-4">
          <div className="text-xl text-retroYellow glow-text mb-2">🏛 DESAKAN INTERNAL PARTAI</div>
          <div className="text-xs text-retroLight/50">{party.name} ({party.ideology})</div>
        </div>
        <div className="bg-yellow-900/20 border-2 border-yellow-700 p-4 mb-6">
          <div className="text-sm text-yellow-400 font-bold mb-2">{partyDemand.title}</div>
          <div className="text-xs text-yellow-300/70 leading-relaxed">{partyDemand.desc}</div>
        </div>
        <div className="flex gap-3">
          <button onClick={() => { sfx.select(); respondPartyDemand('Setujui ' + partyDemand.title, partyDemand.acceptEffects) }}
            className="flex-1 py-3 border-2 border-retroGreen bg-retroGreen/20 hover:bg-retroGreen/40 text-retroLight transition-colors text-sm">
            ► {partyDemand.acceptLabel} ◄
          </button>
          <button onClick={() => { sfx.select(); respondPartyDemand('Tolak ' + partyDemand.title, partyDemand.rejectEffects) }}
            className="flex-1 py-3 border-2 border-red-500 bg-red-900/20 hover:bg-red-900/40 text-red-300 transition-colors text-sm">
            ✕ {partyDemand.rejectLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
