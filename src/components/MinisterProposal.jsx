import { useGame } from '../context/GameContext'
import useSound from '../hooks/useSound'

const statLabels = { apbn: 'APBN', keamanan: 'Keamanan', kesejahteraan: 'Kesejahteraan', infrastruktur: 'Infrastruktur', popularitas: 'Popularitas' }

function formatEffects(effects) {
  return Object.entries(effects)
    .filter(([, v]) => v !== 0)
    .map(([s, v]) => `${statLabels[s] || s} ${v > 0 ? '+' : ''}${v}%`)
    .join(', ')
}

export default function MinisterProposal() {
  const { ministerProposal, respondMinisterProposal } = useGame()
  const sfx = useSound()

  if (!ministerProposal) return null

  const posLabels = {
    menteri_keuangan: 'Menteri Keuangan',
    menteri_pertahanan: 'Menteri Pertahanan',
    menteri_kesehatan: 'Menteri Kesehatan',
    menteri_pupr: 'Menteri PUPR',
  }

  return (
    <div className="fixed inset-0 flex items-start justify-center bg-black/80 z-50 p-4 pt-8 overflow-y-auto">
      <div className="fade-in max-w-lg w-full border-4 border-blue-500 bg-black/90 p-6 text-center my-auto">
        <div className="text-2xl text-blue-400 glow-text mb-4">📋 USULAN MENTERI</div>

        <div className="w-20 h-20 mx-auto mb-4 bg-retroGray rounded-full flex items-center justify-center border-2 border-blue-500">
          <span className="text-3xl">
            {ministerProposal.posisi === 'menteri_keuangan' ? '💰' :
             ministerProposal.posisi === 'menteri_pertahanan' ? '⚔' :
             ministerProposal.posisi === 'menteri_kesehatan' ? '🏥' : '🏗'}
          </span>
        </div>

        <div className="text-sm text-blue-300 mb-2">{posLabels[ministerProposal.posisi] || ministerProposal.posisi}</div>
        <div className="text-base text-retroYellow glow-text mb-3">{ministerProposal.title}</div>
        <div className="text-sm text-retroLight/80 mb-6 leading-relaxed italic border-l-4 border-blue-500 pl-4 text-left">
          {ministerProposal.desc}
        </div>

        <div className="grid grid-cols-2 gap-3 text-xs mb-6">
          <div className="border border-retroGreen/40 p-3 bg-retroGreen/10">
            <div className="text-retroGreen font-bold mb-2">✓ SETUJU</div>
            <div className="text-retroLight/70">{formatEffects(ministerProposal.acceptEffects)}</div>
            <div className="text-green-700/60 text-[10px] mt-1">+15 loyalitas menteri</div>
          </div>
          <div className="border border-red-500/40 p-3 bg-red-900/10">
            <div className="text-red-400 font-bold mb-2">✕ TOLAK</div>
            <div className="text-retroLight/70">{formatEffects(ministerProposal.rejectEffects)}</div>
            <div className="text-red-700/60 text-[10px] mt-1">-10 loyalitas menteri</div>
          </div>
        </div>

        <div className="flex gap-3">
          <button onClick={() => { sfx.select(); respondMinisterProposal(true, ministerProposal.acceptEffects, ministerProposal.posisi) }}
            className="flex-1 py-3 border-2 border-retroGreen bg-retroGreen/20 hover:bg-retroGreen/40 text-retroLight transition-colors text-sm">
            ► SETUJU ◄
          </button>
          <button onClick={() => { sfx.select(); respondMinisterProposal(false, ministerProposal.rejectEffects, ministerProposal.posisi) }}
            className="flex-1 py-3 border-2 border-red-500 bg-red-900/20 hover:bg-red-900/40 text-red-300 transition-colors text-sm">
            ✕ TOLAK
          </button>
        </div>
      </div>
    </div>
  )
}
