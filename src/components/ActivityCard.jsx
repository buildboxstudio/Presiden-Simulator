import { useState, useEffect } from 'react'
import { useGame } from '../context/GameContext'
import useSound from '../hooks/useSound'

const activities = [
  {
    id: 'blusukan',
    label: 'Blusukan ke Daerah',
    icon: '🚶',
    desc: 'Turun langsung ke lapangan, dengarkan aspirasi rakyat kecil.',
    effects: { popularitas: 5, kesejahteraan: 3, apbn: -3, infrastruktur: -2 },
    detail: '+ popularitas, + kesejahteraan, - APBN',
  },
  {
    id: 'kunjungan_luar_negeri',
    label: 'Kunjungan Luar Negeri',
    icon: '✈',
    desc: 'Perkuat hubungan diplomatik dan tarik investasi asing.',
    effects: { popularitas: 3, keamanan: 4, apbn: -5, infrastruktur: 2 },
    detail: '+ popularitas, + keamanan, + infrastruktur, - APBN',
  },
  {
    id: 'rapat_kabinet',
    label: 'Rapat Kabinet Khusus',
    icon: '📋',
    desc: 'Evaluasi menyeluruh program kerja dan koreksi kebijakan.',
    effects: { apbn: 3, keamanan: 2, kesejahteraan: 2, infrastruktur: 2, popularitas: -2 },
    detail: '+ semua indikator (kecuali popularitas -)',
  },
  {
    id: 'pidato_kenegaraan',
    label: 'Pidato Kenegaraan',
    icon: '🎤',
    desc: 'Tenangkan rakyat dengan pidato di televisi nasional.',
    effects: { popularitas: 8, apbn: -2 },
    detail: '+ popularitas besar, - APBN kecil',
  },
  {
    id: 'sidang_kabinet',
    label: 'Sidak Dadakan ke Kementerian',
    icon: '🔍',
    desc: 'Periksa langsung kinerja kementerian. Efektif cegah korupsi.',
    effects: { popularitas: 2, keamanan: 2, apbn: 2, kesejahteraan: 1 },
    detail: '+ kecil semua indikator',
  },
  {
    id: 'pinjam_rotschild',
    label: 'Pinjam Bank Rotschild',
    icon: '🏦',
    desc: 'Pinjam dana besar dari bank internasional. APBN naik drastis tapi oposisi menguat.',
    effects: { apbn: 50, popularitas: -25, infrastruktur: 10, kesejahteraan: 5 },
    detail: '+50 APBN, -25 popularitas, +10 infrastruktur, +5 kesejahteraan',
    oposisiEffect: 10,
  },
  {
    id: 'makanan_bergizi',
    label: 'Pemberian Makanan Bergizi Gretongan',
    icon: '🍱',
    desc: 'Program gizi gratis untuk jutaan anak sekolah di seluruh Indonesia.',
    effects: { kesejahteraan: 35, popularitas: -10, infrastruktur: 25, apbn: -15 },
    detail: '+35 kesejahteraan, +25 infrastruktur, -10 popularitas, -15 APBN',
  },
]

const badActivities = [
  {
    id: 'skandal_istana',
    label: 'Isu Skandal Istana',
    icon: '🔥',
    desc: 'Ada isu miring beredar di media sosial. Rakyat mulai resah.',
    effects: { popularitas: -5 },
    detail: '- popularitas',
  },
  {
    id: 'demo_mahasiswa',
    label: 'Demo Mahasiswa Besar',
    icon: '📢',
    desc: 'Mahasiswa turun ke jalan menolak kebijakan Anda. Media ramai.',
    effects: { popularitas: -3, keamanan: -3 },
    detail: '- popularitas, - keamanan',
  },
]

export default function ActivityCard({ onClose, activityNum, maxActivities }) {
  const { doActivity } = useGame()
  const [selected, setSelected] = useState(null)
  const [showResult, setShowResult] = useState(false)
  const [badEvent, setBadEvent] = useState(null)
  const sfx = useSound()

  useEffect(() => {
    sfx.notif()
    const roll = Math.random()
    if (roll < 0.2) {
      setBadEvent(badActivities[Math.floor(Math.random() * badActivities.length)])
    }
  }, [])

  const handleSelect = (act) => {
    sfx.select()
    setSelected(act)
  }

  const handleConfirm = () => {
    sfx.click()
    setShowResult(true)
    if (selected) doActivity(selected.label, selected.effects, selected.oposisiEffect || 0)
    if (badEvent) doActivity(badEvent.label, badEvent.effects, 0)
    setTimeout(() => {
      onClose()
    }, 2000)
  }

  if (showResult) {
    return (
      <div className="fixed inset-0 flex items-start justify-center bg-black/70 z-40 p-4 pt-8 overflow-y-auto">
        <div className="fade-in bg-retroGray border-4 border-retroLight max-w-md w-full p-6 pixel-border text-center my-auto">
          <div className="text-2xl text-retroYellow mb-4">📋 HASIL KEGIATAN</div>
          {selected && (
            <div className="text-sm text-retroLight mb-3">
              <span className="text-retroYellow">{selected.icon}</span> {selected.label}
            </div>
          )}
          {badEvent && (
            <div className="text-sm text-red-400 mb-3">
              <span className="text-red-400">{badEvent.icon}</span> {badEvent.label}
            </div>
          )}
          <div className="text-xs text-retroLight/50 animate-pulse">Menerapkan efek...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 flex items-start justify-center bg-black/70 z-40 p-3 sm:p-4 pt-8 overflow-y-auto">
      <div className="fade-in bg-retroGray border-4 border-retroLight w-full max-w-lg p-3 sm:p-6 pixel-border my-auto">
          <div className="text-center mb-3 sm:mb-4">
            <div className="text-lg sm:text-xl text-retroYellow glow-text">📋 KEGIATAN PRESIDEN</div>
            {activityNum && maxActivities && (
              <div className="text-[10px] sm:text-xs text-retroLight/40 mt-1">Aksi {activityNum}/{maxActivities}</div>
            )}
            <div className="text-[10px] sm:text-xs text-retroLight/50 mt-1">Pilih kegiatan untuk kuartal ini</div>
        </div>
        {badEvent && (
          <div className="mb-3 sm:mb-4 p-2 sm:p-3 border-2 border-red-500 bg-red-900/20 shake">
            <div className="text-[10px] sm:text-xs text-red-400 font-bold mb-1">⚠ {badEvent.icon} {badEvent.label}</div>
            <div className="text-[10px] sm:text-xs text-red-300/70">{badEvent.desc}</div>
          </div>
        )}
        <div className="space-y-2 mb-4 sm:mb-6 max-h-[50vh] overflow-y-auto pr-1">
          {activities.map((act) => (
            <button key={act.id} onClick={() => handleSelect(act)}
              className={`w-full text-left p-2 sm:p-3 border-2 transition-colors ${
                selected?.id === act.id
                  ? 'border-retroYellow bg-retroYellow/20'
                  : 'border-retroGray bg-black/40 hover:border-retroLight/40'
              }`}>
              <div className="flex items-start gap-2 sm:gap-3">
                <span className="text-base sm:text-lg mt-0.5">{act.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="text-xs sm:text-sm text-retroLight leading-tight break-words">{act.label}</div>
                  <div className="text-[10px] sm:text-xs text-retroLight/50 leading-tight mt-0.5 hidden sm:block">{act.desc}</div>
                  <div className="text-[10px] sm:hidden text-retroGreen leading-tight mt-0.5">{act.detail}</div>
                </div>
                <div className="text-[10px] sm:text-xs text-retroGreen whitespace-nowrap hidden sm:block shrink-0">{act.detail}</div>
              </div>
            </button>
          ))}
        </div>
        <div className="flex gap-2 sm:gap-3">
          <button onClick={() => { sfx.click(); onClose() }}
            className="flex-1 py-2 border border-retroGray bg-black/40 hover:bg-retroGray/40 text-retroLight/70 text-xs sm:text-sm transition-colors">
            ◄ LEWATI ◄
          </button>
          <button onClick={handleConfirm}
            className="flex-1 py-2 border-2 border-retroYellow bg-retroYellow/20 hover:bg-retroYellow/40 text-retroLight text-xs sm:text-sm transition-colors">
            ► LAKSANAKAN ◄
          </button>
        </div>
      </div>
    </div>
  )
}
