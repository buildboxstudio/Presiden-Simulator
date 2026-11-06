import { useState } from 'react'
import vpData from '../data/vicePresidents.json'

export default function VPSelect({ onSelect, onBack }) {
  const [selected, setSelected] = useState(null)

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-4">
      <div className="max-w-lg w-full fade-in">
        <div className="text-2xl text-retroYellow glow-text text-center mb-2">PILIH WAKIL PRESIDEN</div>
        <div className="text-xs text-retroLight/50 text-center mb-6">
          Pilih wakil yang akan mendampingi Anda memimpin negeri selama 5 tahun ke depan.
        </div>

        <div className="space-y-3 mb-6">
          {vpData.map((vp) => (
            <button
              key={vp.id}
              onClick={() => setSelected(vp)}
              className={`w-full text-left p-4 border-2 transition-colors ${
                selected?.id === vp.id
                  ? 'border-retroYellow bg-retroYellow/10'
                  : 'border-retroGray bg-black/40 hover:border-retroLight/40'
              }`}
            >
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 md:w-24 md:h-24 bg-retroGray flex items-center justify-center overflow-hidden rounded-full border-2 border-retroGray/50 shrink-0">
                  <img
                    src={vp.photo}
                    alt={vp.name}
                    className="w-full h-full object-cover pixelated"
                    onError={(e) => { e.target.style.display = 'none'; e.target.parentNode.textContent = vp.id === 'vp_loyal' ? '🤝' : vp.id === 'vp_ambisius' ? '🧠' : '🎭' }}
                  />
                </div>
                <div className="min-w-0">
                  <div className="text-sm text-retroLight break-words">{vp.name}</div>
                  <div className="text-xs text-retroLight/50 break-words">{vp.desc}</div>
                </div>
              </div>
            </button>
          ))}
        </div>

        <div className="flex gap-3">
          <button onClick={onBack} className="flex-1 py-3 border-2 border-retroGray bg-black/40 hover:bg-retroGray/40 text-retroLight text-sm transition-colors">
            ◄ KEMBALI
          </button>
          <button
            disabled={!selected}
            onClick={() => onSelect(selected)}
            className={`flex-1 py-3 border-2 transition-colors ${
              selected
                ? 'border-retroYellow bg-retroYellow/20 hover:bg-retroYellow/40 text-retroLight'
                : 'border-retroGray bg-black/20 text-retroLight/30 cursor-not-allowed'
            }`}
          >
            ► PILIH ◄
          </button>
        </div>
      </div>
    </div>
  )
}
