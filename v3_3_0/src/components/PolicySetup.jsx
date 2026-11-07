import { useState } from 'react'
import { useGame } from '../context/GameContext'
import policiesData from '../data/policies.json'

export default function PolicySetup() {
  const { period, policies, updatePolicy, confirmSetup } = useGame()
  const [localPolicies, setLocalPolicies] = useState({ ...policies })

  const adjustPolicy = (id, delta) => {
    const policy = policiesData.find(p => p.id === id)
    if (!policy) return
    const newVal = Math.max(policy.min, Math.min(policy.max, (localPolicies[id] || 0) + delta))
    setLocalPolicies((prev) => ({ ...prev, [id]: newVal }))
  }

  const confirm = () => {
    Object.entries(localPolicies).forEach(([id, val]) => updatePolicy(id, val))
    confirmSetup()
  }

  return (
    <div className="flex-1 flex flex-col p-4 overflow-y-auto">
      <div className="max-w-lg mx-auto w-full fade-in">
        <div className="text-center mb-6">
          <div className="text-2xl text-retroYellow glow-text mb-2">ATUR ARAHAN KEBIJAKAN</div>
          <div className="text-sm text-retroLight/50">
            Periode {period} — Atur kebijakan sebelum memerintah. Kebijakan akan berlaku otomatis tiap kuartal.
          </div>
        </div>
        <div className="space-y-4 mb-6">
          {policiesData.map((policy) => (
            <div key={policy.id} className="bg-black/40 border-2 border-retroGray p-4">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <div className="text-sm font-bold text-retroLight">{policy.name}</div>
                  <div className="text-xs text-retroLight/50">{policy.description}</div>
                </div>
                <div className="text-right">
                  <div className="text-lg text-retroYellow">{localPolicies[policy.id] || policy.default}{policy.unit}</div>
                </div>
              </div>
              {/* Tooltip effects */}
              <div className="text-[10px] text-retroLight/40 mb-2 flex flex-wrap gap-x-3">
                {Object.entries(policy.effectsPer10).map(([stat, val]) => {
                  const labels = { apbn: 'APBN', keamanan: 'Keamanan', kesejahteraan: 'Kesejahteraan', infrastruktur: 'Infrastruktur', popularitas: 'Popularitas' }
                  return (
                    <span key={stat} className={val > 0 ? 'text-retroGreen' : 'text-red-400'}>
                      {labels[stat] || stat} {val > 0 ? '+' : ''}{Math.round((((localPolicies[policy.id] || 0) - policy.default) / 10) * val)}/kuartal
                    </span>
                  )
                })}
              </div>
              <div className="flex items-center gap-3">
                <button onClick={() => adjustPolicy(policy.id, -5)}
                  className="px-3 py-1 border border-retroGray bg-retroGray/20 hover:bg-retroGray/40 text-retroLight text-sm">-5</button>
                <button onClick={() => adjustPolicy(policy.id, -1)}
                  className="px-3 py-1 border border-retroGray bg-retroGray/20 hover:bg-retroGray/40 text-retroLight text-sm">-1</button>
                <input type="range" min={policy.min} max={policy.max} value={localPolicies[policy.id] || 0}
                  onChange={(e) => setLocalPolicies((prev) => ({ ...prev, [policy.id]: parseInt(e.target.value) }))}
                  className="flex-1 h-2 bg-retroGray appearance-none cursor-pointer" style={{ accentColor: '#b39c00' }} />
                <button onClick={() => adjustPolicy(policy.id, 1)}
                  className="px-3 py-1 border border-retroGray bg-retroGray/20 hover:bg-retroGray/40 text-retroLight text-sm">+1</button>
                <button onClick={() => adjustPolicy(policy.id, 5)}
                  className="px-3 py-1 border border-retroGray bg-retroGray/20 hover:bg-retroGray/40 text-retroLight text-sm">+5</button>
              </div>
            </div>
          ))}
        </div>
        <div className="flex gap-3 pb-8">
          <button onClick={confirm}
            className="flex-1 py-3 border-2 border-retroGreen bg-retroGreen/20 hover:bg-retroGreen/40 text-retroLight transition-colors text-lg tracking-wider">
            ► MULAI PERIODE {period} ◄</button>
        </div>
      </div>
    </div>
  )
}
