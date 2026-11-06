import { useState } from 'react'
import partiesData from '../data/parties.json'

export default function PartySelect({ onSelect, onBack }) {
  const [selected, setSelected] = useState(null)

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-4">
      <div className="max-w-lg w-full fade-in">
        <div className="text-2xl text-retroYellow glow-text text-center mb-2">PILIH PARTAI</div>
        <div className="text-xs text-retroLight/50 text-center mb-6">
          Partai politik yang akan mengusung Anda sebagai calon presiden.
        </div>

        <div className="space-y-3 mb-6">
          {partiesData.map((party) => (
            <button
              key={party.id}
              onClick={() => setSelected(party)}
              className={`w-full text-left p-4 border-2 transition-colors ${
                selected?.id === party.id
                  ? 'border-retroYellow bg-retroYellow/10'
                  : 'border-retroGray bg-black/40 hover:border-retroLight/40'
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 flex items-center justify-center overflow-hidden"
                  style={{ background: party.color }}
                >
                  <img
                    src={party.logo}
                    alt={party.name}
                    className="w-full h-full object-contain pixelated"
                    onError={(e) => { e.target.style.display = 'none'; e.target.parentNode.textContent = party.id === 'nasionalis' ? 'GP' : party.id === 'agamis' ? 'NB' : 'RR' }}
                  />
                </div>
                <div>
                  <div className="text-sm text-retroLight">
                    {party.name}
                    <span className="text-retroYellow text-xs ml-2">({party.ideology})</span>
                  </div>
                  <div className="text-xs text-retroLight/50">{party.desc}</div>
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
