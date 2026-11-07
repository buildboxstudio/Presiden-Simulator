import { useState } from 'react'
import { useGame } from '../context/GameContext'
import ministerData from '../data/ministerCandidates.json'
import useSound from '../hooks/useSound'

const PERIOD2_VPS = [
  { id: 'vp2_1', name: 'KH. Cecep Solehudin', desc: 'Ulama muda dengan pendukung fanatik. Bisa redam gejolak sosial.', trait: 'setia', buffs: { popularitas: 8, keamanan: 20, kesejahteraan: 3 }, will_betray: false },
  { id: 'vp2_2', name: 'Ir. Rudi Hadikusumo', desc: 'Megakontraktor yang tahu cara menguras APBN tanpa ketahuan.', trait: 'ambisius', buffs: { infrastruktur: 8, apbn: 15 }, debuffs: { keamanan: -5 }, will_betray: true },
  { id: 'vp2_3', name: 'Dra. Yuni Safitri', desc: 'Eks komisioner KPK yang terlalu pintar. Bisa bahaya jika Anda korup.', trait: 'pengkhianat', buffs: { apbn: 12, keamanan: 15, popularitas: 12 }, debuffs: { apbn: -8 }, oposisiBonus: 8, will_betray: true },
  { id: 'vp2_4', name: 'Mayjend (Purn.) Tommy Kurnia', desc: 'Jenderal pensiunan dengan jaringan militer kuat. Disukai rakyat.', trait: 'setia', buffs: { keamanan: 35, popularitas: 7 }, will_betray: false },
  { id: 'vp2_5', name: 'Hj. Dewi Aminah', desc: 'Pengusaha sukses dengan dana melimpah. Setia selama bisnisnya lancar.', trait: 'setia', buffs: { apbn: 25, kesejahteraan: 8 }, will_betray: false },
]

const NEW_NAMES = {
  menteri_keuangan: ['Dr. Siti Maemunah', 'Ir. Bambang Gento', 'H. Rahmat Santoso', 'Dr. Maria Oentoro', 'Ir. Sugeng Priyadi'],
  menteri_pertahanan: ['Jend. TNI Putra Sihombing', 'Laks. Made Wirawan', 'Mars. Dwi Hartanto', 'Kolonel Alex Situmorang', 'Letjen Susilo Adi'],
  menteri_kesehatan: ['Dr. Fitriani Zahra', 'Prof. Hadi Suwondo', 'drg. Dimas Prakoso', 'Dr. Lestari Dewi', 'Prof. Agus Wibisono'],
  menteri_pupr: ['Ir. Tri Kusuma', 'ST. Budi Santosa', 'Ir. Ratna Sari', 'MT. Eko Prasetyo', 'Ir. Dewi Sartika'],
}

function getNewCandidates(posisi) {
  const old = ministerData.find(m => m.posisi === posisi)
  if (!old) return []
  const newNames = NEW_NAMES[posisi] || ['Kandidat Baru 1', 'Kandidat Baru 2', 'Kandidat Baru 3', 'Kandidat Baru 4', 'Kandidat Baru 5']
  return newNames.map((name, i) => ({
    name,
    skill: Math.max(40, Math.min(95, (old.candidates[i]?.skill || 50) + Math.floor(Math.random() * 21) - 10)),
    loyalty: Math.max(30, Math.min(95, (old.candidates[i]?.loyalty || 50) + Math.floor(Math.random() * 21) - 10)),
    desc: old.candidates[i]?.desc?.replace(/^(.*?)(\d+)\s(tahun)/, `$1${Math.floor(Math.random() * 10 + 5)} tahun`) || `${Math.floor(Math.random() * 10 + 5)} tahun pengalaman`,
  }))
}

export default function Period2Setup() {
  const { playerName, background, party, ministers, startGame, setVicePresident } = useGame()
  const [reshuffle, setReshuffle] = useState(null)
  const [newMinisters, setNewMinisters] = useState(null)
  const [selecting, setSelecting] = useState(null)
  const [selected, setSelected] = useState({})
  const [vpStep, setVpStep] = useState(false)
  const [vpSelected, setVpSelected] = useState(null)
  const sfx = useSound()

  if (!vpStep) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-4">
        <div className="max-w-lg w-full fade-in text-center">
          <div className="text-2xl text-retroYellow glow-text mb-4">PERIODE 2: WAKIL PRESIDEN BARU</div>
          <div className="text-sm text-retroLight/60 mb-6">
            Periode 2 membutuhkan wakil presiden baru! Pilih salah satu dari 5 kandidat berikut.
          </div>
          <div className="space-y-2 mb-6">
            {PERIOD2_VPS.map((vp) => {
              const isSelected = vpSelected?.id === vp.id
              return (
                <button key={vp.id} onClick={() => { sfx.select(); setVpSelected(vp) }}
                  className={`w-full text-left p-3 border-2 transition-colors ${
                    isSelected ? 'border-retroYellow bg-retroYellow/10' : 'border-retroGray bg-black/40 hover:border-retroLight/40'
                  }`}>
                  <div className="flex items-center gap-3">
                    <div className="flex-1">
                      <div className="text-sm text-retroLight">{vp.name}</div>
                      <div className="text-xs text-retroLight/50">{vp.desc}</div>
                    </div>
                    <div className="text-xs text-right text-retroLight/40">{isSelected ? '✓' : '►'}</div>
                  </div>
                </button>
              )
            })}
          </div>
          <button disabled={!vpSelected}
            onClick={() => { sfx.click(); setVicePresident(vpSelected); setVpStep(true) }}
            className={`w-full py-3 border-2 transition-colors ${
              vpSelected
                ? 'border-retroGreen bg-retroGreen/20 hover:bg-retroGreen/40 text-retroLight'
                : 'border-retroGray bg-black/20 text-retroLight/30 cursor-not-allowed'
            }`}>► PILIH WAPRES ◄</button>
        </div>
      </div>
    )
  }

  if (reshuffle === null) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-4">
        <div className="max-w-lg w-full fade-in text-center">
          <div className="text-2xl text-retroYellow glow-text mb-4">PERIODE 2: KEPUTUSAN KABINET</div>
          <div className="text-sm text-retroLight/60 mb-8">
            Periode 2 dimulai! Apakah Anda ingin mereshuffle kabinet dengan menteri-menteri baru?
          </div>
          <div className="flex gap-4 flex-wrap justify-center">
            <button onClick={() => { sfx.click(); startGame(playerName, background, party, null, ministers, 2) }}
              className="flex-1 min-w-[200px] py-4 border-2 border-retroGreen bg-retroGreen/20 hover:bg-retroGreen/40 text-retroLight transition-colors text-lg tracking-wider">
              ► PERTAHANKAN KABINET ◄
            </button>
            <button onClick={() => { sfx.click(); setReshuffle(true); setNewMinisters({
              menteri_keuangan: getNewCandidates('menteri_keuangan'),
              menteri_pertahanan: getNewCandidates('menteri_pertahanan'),
              menteri_kesehatan: getNewCandidates('menteri_kesehatan'),
              menteri_pupr: getNewCandidates('menteri_pupr'),
            })}}
              className="flex-1 min-w-[200px] py-4 border-2 border-retroYellow bg-retroYellow/20 hover:bg-retroYellow/40 text-retroLight transition-colors text-lg tracking-wider">
              🔄 RESHUFFLE ◄
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (selecting === null) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-4">
        <div className="max-w-lg w-full fade-in text-center">
          <div className="text-2xl text-retroYellow glow-text mb-4">PILIH MENTERI BARU</div>
          <div className="text-sm text-retroLight/60 mb-6">
            Pilih menteri baru untuk periode 2. Skill dan loyalitas berbeda dari periode 1.
          </div>
          <div className="space-y-3 mb-6">
            {ministerData.map((pos) => {
              const done = selected[pos.posisi]
              return (
                <button key={pos.posisi} onClick={() => { sfx.click(); setSelecting(pos.posisi) }}
                  className={`w-full text-left p-3 border-2 transition-colors ${
                    done ? 'border-retroGreen bg-retroGreen/10' : 'border-retroGray bg-black/40 hover:border-retroLight/40'
                  }`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs text-retroYellow">{pos.icon} {pos.label}</div>
                      <div className="text-sm text-retroLight">{done ? `${done.name} (${done.skill}/${done.loyalty})` : '— Pilih —'}</div>
                    </div>
                    <div className="text-xs text-retroLight/40">{done ? '✓' : '►'}</div>
                  </div>
                </button>
              )
            })}
          </div>
          <button disabled={Object.keys(selected).length < 4}
            onClick={() => { sfx.click(); startGame(playerName, background, party, null, selected, 2) }}
            className={`w-full py-3 border-2 transition-colors ${
              Object.keys(selected).length >= 4
                ? 'border-retroGreen bg-retroGreen/20 hover:bg-retroGreen/40 text-retroLight'
                : 'border-retroGray bg-black/20 text-retroLight/30 cursor-not-allowed'
            }`}>► KONFIRMASI ◄</button>
        </div>
      </div>
    )
  }

  const candidates = newMinisters?.[selecting] || []
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-4">
      <div className="max-w-lg w-full fade-in">
        <div className="text-lg text-retroYellow glow-text text-center mb-4">Pilih {ministerData.find(m => m.posisi === selecting)?.label}</div>
        <div className="space-y-2 mb-6">
          {candidates.map((c, i) => {
            const isSelected = selected[selecting]?.name === c.name
            return (
              <button key={i} onClick={() => { sfx.select(); setSelected(prev => ({ ...prev, [selecting]: { ...c, posisi: selecting } })); setSelecting(null) }}
                className={`w-full text-left p-3 border-2 transition-colors ${
                  isSelected ? 'border-retroYellow bg-retroYellow/10' : 'border-retroGray bg-black/40 hover:border-retroLight/40'
                }`}>
                <div className="flex items-center gap-3">
                  <div className="flex-1">
                    <div className="text-sm text-retroLight">{c.name}</div>
                    <div className="text-xs text-retroLight/50">{c.desc || `${Math.floor(Math.random() * 10 + 5)} tahun pengalaman`}</div>
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
        <button onClick={() => { sfx.click(); setSelecting(null) }}
          className="w-full py-2 border border-retroGray bg-black/40 hover:bg-retroGray/40 text-retroLight text-sm transition-colors">◄ KEMBALI ◄</button>
      </div>
    </div>
  )
}
