import { useState, useEffect } from 'react'
import { useGame } from '../context/GameContext'
import backgrounds from '../data/backgrounds.json'
import PartySelect from './PartySelect'
import VPSelect from './VPSelect'
import MinisterSelect from './MinisterSelect'

const APP_VERSION = 'v3.0.2'

const SCENARIOS = [
  { id: 'stabil', name: '🇮🇩 Kondisi Stabil', desc: 'Negara dalam keadaan normal. Tantangan standar.', icon: '✅' },
  { id: 'krisis_ekonomi', name: '💸 Krisis Ekonomi', desc: 'APBN jeblok, kesejahteraan rendah. Ekonomi negara diambang kehancuran!', icon: '📉' },
  { id: 'konflik', name: '⚔ Konflik Berkepanjangan', desc: 'Keamanan nasional terganggu. Wilayah timur tidak stabil.', icon: '🔫' },
  { id: 'bencana', name: '🌊 Bencana Alam Melanda', desc: 'Infrastruktur hancur. Dana negara terkuras untuk rekonstruksi.', icon: '🌋' },
  { id: 'super_krisis', name: '💀 Super Krisis', desc: 'Semua sektor runtuh! Hanya presiden terbaik yang bisa bertahan!', icon: '☠️', unlockRequirement: 'Selesaikan skenario Krisis Ekonomi' },
  { id: 'perang_total', name: '⚔ Perang Total', desc: 'Konflik militer di seluruh Indonesia. Keamanan turun drastis!', icon: '💣', unlockRequirement: 'Selesaikan skenario Konflik' },
  { id: 'bumi_hangus', name: '🌋 Bumi Hangus', desc: 'Bencana alam bertubi-tubi. Infrastruktur hancur total!', icon: '🔥', unlockRequirement: 'Selesaikan skenario Bencana' },
]

const faqData = [
  { q: 'Apa itu PRESIDEN SIMULATOR?', a: 'Game simulasi dimana Anda menjadi Presiden Indonesia selama 2 periode. Atur kebijakan, hadapi krisis, dan menangkan pemilu!' },
  { q: 'Berapa lama satu permainan?', a: 'Satu periode penuh sekitar 20-30 menit. Ada 20 kuartal per periode.' },
  { q: 'Apa yang terjadi jika indikator mencapai 0?', a: 'Game Over! APBN 0 = krisis anggaran, Keamanan 0 = kudeta, Kesejahteraan 0 = revolusi, Infrastruktur 0 = kehancuran, Popularitas 0 = impeachment.' },
  { q: 'Apa itu skenario?', a: 'Skenario menentukan kondisi awal negara. Krisis Ekonomi, Konflik, atau Bencana membuat permainan lebih sulit.' },
  { q: 'Apa fungsi menteri?', a: 'Menteri dengan skill & loyalitas tinggi memberikan bonus indikator tiap kuartal. Loyalitas rendah bisa picu skandal korupsi!' },
  { q: 'Apa itu Oposisi Score?', a: 'Setiap kali popularitas turun, oposisi menguat. Jika >70%, oposisi menang telak di pemilu!' },
  { q: 'Apa itu trust score?', a: 'Trust score adalah kepercayaan rakyat saat debat pemilu. Jika mencapai 0, Anda kalah pemilu.' },
]

export default function TitleScreen() {
  const { startGame, loadGame, hasSavedGame, deleteSave, qaSkip, getCareerStats, getUnlockedScenarios } = useGame()
  const [playerName, setPlayerName] = useState('')
  const [selectedBg, setSelectedBg] = useState(null)
  const [selectedParty, setSelectedParty] = useState(null)
  const [selectedVP, setSelectedVP] = useState(null)
  const [selectedMinisters, setSelectedMinisters] = useState(null)
  const [selectedScenario, setSelectedScenario] = useState(null)
  const [step, setStep] = useState('title')
  const [showFaq, setShowFaq] = useState(false)
  const [showAbout, setShowAbout] = useState(false)
  const [showCareer, setShowCareer] = useState(false)
  const [faqOpen, setFaqOpen] = useState(null)
  const [savedExists, setSavedExists] = useState(hasSavedGame())
  const careerStats = getCareerStats()
  const unlockedScenarios = getUnlockedScenarios()

  if (step === 'title') {
    if (showFaq) {
      return (
        <div className="flex-1 flex flex-col items-center justify-center p-4">
          <div className="max-w-lg w-full fade-in">
            <div className="text-2xl text-retroYellow glow-text text-center mb-6">FAQ - TANYA JAWAB</div>
            <div className="space-y-2 mb-6 max-h-96 overflow-y-auto">
              {faqData.map((item, i) => (
                <div key={i} className="border border-retroGray bg-black/40">
                  <button onClick={() => setFaqOpen(faqOpen === i ? null : i)}
                    className="w-full text-left p-3 flex justify-between items-center hover:bg-retroGray/20 transition-colors">
                    <span className="text-sm text-retroLight">{item.q}</span>
                    <span className="text-retroYellow text-xs">{faqOpen === i ? '▲' : '▼'}</span>
                  </button>
                  {faqOpen === i && (
                    <div className="px-3 pb-3 text-xs text-retroLight/70 leading-relaxed">{item.a}</div>
                  )}
                </div>
              ))}
            </div>
            <button onClick={() => setShowFaq(false)}
              className="w-full py-3 border-2 border-retroYellow bg-retroYellow/20 hover:bg-retroYellow/40 text-retroLight transition-colors">◄ KEMBALI ◄</button>
          </div>
        </div>
      )
    }

    if (showAbout) {
      return (
        <div className="flex-1 flex flex-col items-center justify-center p-4">
          <div className="max-w-lg w-full fade-in text-center">
            <div className="text-2xl text-retroYellow glow-text mb-4">TENTANG APLIKASI</div>
            <div className="bg-black/40 border-2 border-retroGray p-6 mb-6">
              <div className="text-3xl text-retroLight glow-text mb-2">PRESIDEN</div>
              <div className="text-3xl text-retroYellow glow-text mb-4">SIMULATOR</div>
              <div className="text-sm text-retroYellow mb-4">Versi {APP_VERSION}</div>
              <div className="text-xs text-retroLight/60 leading-relaxed mb-4">
                Game simulasi kepemimpinan presiden Indonesia. Atur negara, hadapi krisis,
                menangkan pemilu, dan bawa Indonesia menuju kejayaan!
              </div>
              <div className="text-xs text-retroLight/50">
                <div className="mb-1">Dikembangkan oleh <span className="text-retroYellow">Buildbox Studio</span></div>
                <div className="mb-1">© 2026 Buildbox Studio. All rights reserved.</div>
                <div>Terinspirasi dari berbagai game simulasi politik dan</div>
                <div>realita politik Indonesia.</div>
              </div>
            </div>
              <div className="text-xs text-retroLight/30 mb-6">
                Pembaruan terakhir: {APP_VERSION} — Multi-Step Quarter (2 aksi), event selalu muncul + skenario filter, 20+ event baru, proposal menteri, karir statistik + unlockable skenario, autosave tiap kuartal.
              </div>
            <button onClick={() => setShowAbout(false)}
              className="w-full py-3 border-2 border-retroYellow bg-retroYellow/20 hover:bg-retroYellow/40 text-retroLight transition-colors">◄ KEMBALI ◄</button>
          </div>
        </div>
      )
    }

    return (
      <div className="flex-1 flex flex-col items-center justify-center p-4 text-center relative overflow-hidden">
        <img
          src="https://ik.imagekit.io/dntonfire/image_2026-05-29_082903103.png"
          alt="Peta Indonesia"
          className="absolute inset-0 w-full h-full object-cover opacity-20 pixelated"
          style={{ imageRendering: 'pixelated' }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/60" />
        <div className="max-w-lg w-full fade-in relative z-10">
          <img
            src="https://ik.imagekit.io/dntonfire/image_2026-05-29_112902025.png"
            alt="Garuda"
            className="w-32 h-32 mx-auto mb-4 pixelated"
            style={{ imageRendering: 'pixelated' }}
          />
          <div className="text-5xl font-bold text-retroLight glow-text mb-2 tracking-wider">PRESIDEN</div>
          <div className="text-5xl font-bold text-retroYellow glow-text mb-6 tracking-wider">SIMULATOR</div>
          <div className="text-sm text-retroLight/50 mb-6">
            Pimpin Indonesia menuju kejayaan atau kehancuran.
            <br />Setiap keputusan menentukan nasib negara.
          </div>
          <div className="animate-pulse text-retroYellow text-sm mb-8">Klik untuk Mulai</div>
          <button onClick={() => setStep('customize')}
            className="w-full px-8 py-3 border-2 border-retroYellow bg-retroYellow/20 hover:bg-retroYellow/40 text-retroLight transition-colors mb-3"
          >► MULAI ◄</button>
          {savedExists && (
            <button onClick={() => { loadGame(); setSavedExists(false) }}
              className="w-full px-8 py-3 border-2 border-retroGreen bg-retroGreen/20 hover:bg-retroGreen/40 text-retroLight transition-colors mb-3 animate-pulse"
            >⟳ LANJUTKAN PERMAINAN</button>
          )}
          <div className="flex gap-3">
            <button onClick={() => setShowFaq(true)}
              className="flex-1 py-2 border border-retroGray bg-black/40 hover:bg-retroGray/40 text-retroLight/70 hover:text-retroLight text-sm transition-colors"
            >FAQ</button>
            <button onClick={() => setShowCareer(true)}
              className="flex-1 py-2 border border-retroGray bg-black/40 hover:bg-retroGray/40 text-retroLight/70 hover:text-retroLight text-sm transition-colors"
            >📊 KARIR</button>
            <button onClick={() => setShowAbout(true)}
              className="flex-1 py-2 border border-retroGray bg-black/40 hover:bg-retroGray/40 text-retroLight/70 hover:text-retroLight text-sm transition-colors"
            >ABOUT</button>
          </div>
          {showCareer && (
            <div className="mt-4 p-4 border-2 border-retroGray bg-black/60 text-xs text-left">
              <div className="text-retroYellow glow-text mb-3 text-center text-sm">📊 STATISTIK KARIR</div>
              <div className="grid grid-cols-2 gap-3 text-center">
                <div className="border border-retroGray/30 p-2">
                  <div className="text-retroLight text-base font-bold">{careerStats.gamesPlayed}</div>
                  <div className="text-retroLight/50">Game Dimainkan</div>
                </div>
                <div className="border border-retroGray/30 p-2">
                  <div className="text-retroGreen text-base font-bold">{careerStats.gamesWon}</div>
                  <div className="text-retroLight/50">Dimenangkan</div>
                </div>
                <div className="border border-retroGray/30 p-2">
                  <div className="text-red-400 text-base font-bold">{careerStats.gamesLost}</div>
                  <div className="text-retroLight/50">Dikalahkan</div>
                </div>
                <div className="border border-retroGray/30 p-2">
                  <div className="text-retroYellow text-base font-bold">{careerStats.totalQuarters}</div>
                  <div className="text-retroLight/50">Total Kuartal</div>
                </div>
              </div>
              {unlockedScenarios.length > 0 && (
                <div className="mt-3 pt-3 border-t border-retroGray/30">
                  <div className="text-retroYellow/70 mb-1 text-center">Skenario Terbuka:</div>
                  <div className="flex flex-wrap gap-1 justify-center">
                    {unlockedScenarios.map((s) => (
                      <span key={s} className="border border-retroGreen/40 px-2 py-0.5 text-retroGreen text-[10px]">
                        {s === 'super_krisis' ? '💀 Super Krisis' :
                         s === 'perang_total' ? '⚔ Perang Total' :
                         s === 'bumi_hangus' ? '🌋 Bumi Hangus' : s}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              <button onClick={() => setShowCareer(false)}
                className="w-full mt-3 py-1.5 border border-retroGray bg-black/40 hover:bg-retroGray/40 text-retroLight/70 text-xs transition-colors">TUTUP</button>
            </div>
          )}
        </div>
      </div>
    )
  }

  if (step === 'customize') {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-4">
        <div className="max-w-lg w-full fade-in">
          <div className="text-2xl text-retroYellow glow-text text-center mb-6">KUSTOMISASI PRESIDEN</div>
          <div className="mb-6">
            <label className="block text-sm text-retroLight/60 mb-2">Nama Presiden:</label>
            <input
              type="text"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              placeholder="Masukkan nama Anda..."
              className="w-full px-4 py-3 bg-black border-2 border-retroGray text-retroLight placeholder-retroLight/30 font-retro text-lg outline-none focus:border-retroYellow"
              maxLength={30}
            />
          </div>

          {playerName.toLowerCase() === 'hidupjokowi' && (
            <div className="mb-6 p-3 border-2 border-red-500 bg-red-900/10">
              <div className="text-xs text-red-400 font-bold mb-2">☣ QA TEST MODE ☣</div>
              <div className="grid grid-cols-2 gap-2">
                <button onClick={() => { const bg = backgrounds[0]; const p = { id: 'nasionalis', name: 'Garuda Perkasa', logo: '', ideology: 'Nasionalis' }; startGame(playerName, bg, p, null, {}, 1) }}
                  className="text-xs py-1 px-2 border border-red-500 bg-red-900/20 hover:bg-red-900/40 text-red-300 transition-colors">GAME</button>
                <button onClick={() => qaSkip('pemilu')}
                  className="text-xs py-1 px-2 border border-red-500 bg-red-900/20 hover:bg-red-900/40 text-red-300 transition-colors">PEMILU</button>
                <button onClick={() => qaSkip('pemilu_timses')}
                  className="text-xs py-1 px-2 border border-red-500 bg-red-900/20 hover:bg-red-900/40 text-red-300 transition-colors">TIM SES</button>
                <button onClick={() => qaSkip('pemilu_program')}
                  className="text-xs py-1 px-2 border border-red-500 bg-red-900/20 hover:bg-red-900/40 text-red-300 transition-colors">PROGRAM</button>
                <button onClick={() => qaSkip('pemilu_debat')}
                  className="text-xs py-1 px-2 border border-red-500 bg-red-900/20 hover:bg-red-900/40 text-red-300 transition-colors">DEBAT</button>
                <button onClick={() => qaSkip('pemilu_kampanye')}
                  className="text-xs py-1 px-2 border border-red-500 bg-red-900/20 hover:bg-red-900/40 text-red-300 transition-colors">KAMPANYE</button>
                <button onClick={() => qaSkip('menang')}
                  className="text-xs py-1 px-2 border border-red-500 bg-red-900/20 hover:bg-red-900/40 text-red-300 transition-colors">HASIL MENANG</button>
                <button onClick={() => qaSkip('kalah')}
                  className="text-xs py-1 px-2 border border-red-500 bg-red-900/20 hover:bg-red-900/40 text-red-300 transition-colors">HASIL KALAH</button>
              </div>
            </div>
          )}

          <div className="mb-8">
            <label className="block text-sm text-retroLight/60 mb-3">Latar Belakang:</label>
            <div className="grid grid-cols-1 gap-2 max-h-80 overflow-y-auto pr-1">
              {backgrounds.map((bg) => (
                <button
                  key={bg.id}
                  onClick={() => setSelectedBg(bg)}
                  className={`text-left p-3 border-2 transition-colors ${
                    selectedBg?.id === bg.id
                      ? 'border-retroYellow bg-retroYellow/10'
                      : 'border-retroGray bg-black/40 hover:border-retroLight/40'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-retroGray flex items-center justify-center text-retroYellow text-sm">
                      {bg.icon || '?'}
                    </div>
                    <div>
                      <div className="text-sm text-retroLight">{bg.name}</div>
                      <div className="text-xs text-retroLight/50">{bg.description}</div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
          <button
            disabled={!playerName.trim() || !selectedBg}
            onClick={() => setStep('scenario')}
            className={`w-full py-3 border-2 transition-colors ${
              playerName.trim() && selectedBg
                ? 'border-retroYellow bg-retroYellow/20 hover:bg-retroYellow/40 text-retroLight'
                : 'border-retroGray bg-black/20 text-retroLight/30 cursor-not-allowed'
            }`}
          >► SELANJUTNYA ◄</button>
        </div>
      </div>
    )
  }

  if (step === 'scenario') {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-4">
        <div className="max-w-lg w-full fade-in">
          <div className="text-2xl text-retroYellow glow-text text-center mb-4">PILIH SKENARIO</div>
          <div className="text-sm text-retroLight/60 text-center mb-6">
            Pilih kondisi awal negara. Ini akan mempengaruhi kesulitan permainan.
          </div>
          <div className="space-y-3 mb-6">
            {SCENARIOS.map((s) => {
              const isLocked = s.unlockRequirement && !unlockedScenarios.includes(s.id)
              return (
              <button key={s.id} onClick={() => { if (!isLocked) { setSelectedScenario(s); setStep('party') } }}
                className={`w-full text-left p-4 border-2 transition-colors ${
                  isLocked
                    ? 'border-retroGray/30 bg-black/20 text-retroLight/30 cursor-not-allowed'
                    : selectedScenario?.id === s.id
                      ? 'border-retroYellow bg-retroYellow/10'
                      : 'border-retroGray bg-black/40 hover:border-retroLight/40'
                }`}>
                <div className="text-sm mb-1">{s.icon} {isLocked && '🔒 '}{s.name}</div>
                <div className="text-xs text-retroLight/50">{isLocked ? s.unlockRequirement : s.desc}</div>
              </button>
              )
            })}
          </div>
          <button onClick={() => setStep('customize')}
            className="w-full py-2 border border-retroGray bg-black/40 hover:bg-retroGray/40 text-retroLight/70 text-sm transition-colors">
            ◄ KEMBALI ◄
          </button>
        </div>
      </div>
    )
  }

  if (step === 'party') {
    return (
      <PartySelect
        onSelect={(party) => { setSelectedParty(party); setStep('vp') }}
        onBack={() => setStep('customize')}
      />
    )
  }

  if (step === 'vp') {
    return (
      <VPSelect
        onSelect={(vp) => { setSelectedVP(vp); setStep('minister') }}
        onBack={() => setStep('party')}
      />
    )
  }

  if (step === 'minister') {
    return (
      <MinisterSelect
        onSelect={(ministers) => {
          setSelectedMinisters(ministers)
          startGame(playerName.trim(), selectedBg, selectedParty, selectedVP, ministers, 1, selectedScenario?.id)
        }}
        onBack={() => setStep('vp')}
      />
    )
  }

  return null
}
