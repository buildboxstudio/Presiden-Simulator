import { useState } from 'react'
import ministerData from '../data/ministerCandidates.json'

export default function MinisterSelect({ onSelect, onBack }) {
  const [selectedMinisters, setSelectedMinisters] = useState({})

  const handleSelect = (posisi, candidate) => {
    setSelectedMinisters((prev) => ({ ...prev, [posisi]: candidate }))
  }

  const allSelected = ministerData.every((m) => selectedMinisters[m.posisi])
  const selectedCount = Object.keys(selectedMinisters).length

  return (
    <div className="flex-1 flex flex-col p-4 overflow-y-auto">
      <div className="max-w-lg mx-auto w-full fade-in">
        <div className="text-2xl text-retroYellow glow-text text-center mb-2">PILIH KABINET</div>
        <div className="text-xs text-retroLight/50 text-center mb-6">
          Pilih menteri untuk setiap posisi. Setiap kandidat memiliki skill dan loyalitas berbeda.
          <br />Dipilih: {selectedCount}/{ministerData.length}
        </div>

        <div className="space-y-6 mb-6">
          {ministerData.map((pos) => (
            <div key={pos.posisi}>
              <div className="text-sm text-retroYellow mb-2">
                {pos.icon} {pos.label}
              </div>
              <div className="grid grid-cols-1 gap-2">
                {pos.candidates.map((c, i) => {
                  const selected = selectedMinisters[pos.posisi]?.name === c.name
                  return (
                    <button
                      key={i}
                      onClick={() => handleSelect(pos.posisi, c)}
                      className={`text-left p-3 border-2 transition-colors ${
                        selected
                          ? 'border-retroYellow bg-retroYellow/10'
                          : 'border-retroGray bg-black/40 hover:border-retroLight/40'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <div className={`w-5 h-5 flex items-center justify-center border text-xs ${
                          selected ? 'border-retroYellow bg-retroYellow text-black' : 'border-retroLight/30'
                        }`}>
                          {selected ? '✓' : ''}
                        </div>
                        <div className="flex-1">
                          <div className="text-sm text-retroLight">{c.name}</div>
                          <div className="text-xs text-retroLight/50">{c.desc}</div>
                        </div>
                        <div className="text-xs text-right">
                          <div className="text-retroGreen">Skill: {c.skill}</div>
                          <div className="text-retroYellow">Loyal: {c.loyalty}</div>
                        </div>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
        </div>

        <div className="flex gap-3 pb-8">
          <button onClick={onBack} className="flex-1 py-3 border-2 border-retroGray bg-black/40 hover:bg-retroGray/40 text-retroLight text-sm transition-colors">
            ◄ KEMBALI
          </button>
          <button
            disabled={!allSelected}
            onClick={() => onSelect(selectedMinisters)}
            className={`flex-1 py-3 border-2 transition-colors ${
              allSelected
                ? 'border-retroYellow bg-retroYellow/20 hover:bg-retroYellow/40 text-retroLight'
                : 'border-retroGray bg-black/20 text-retroLight/30 cursor-not-allowed'
            }`}
          >
            ► MULAI MEMERINTAH ◄
          </button>
        </div>
      </div>
    </div>
  )
}
