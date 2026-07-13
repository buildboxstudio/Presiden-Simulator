import { useRef, useEffect, useState } from 'react'
import { useGame } from '../context/GameContext'
import useSound from '../hooks/useSound'
import html2canvas from 'html2canvas'

const STAT_CONFIG = [
  { key: 'apbn', label: 'APBN', color: '#b39c00' },
  { key: 'keamanan', label: 'Keamanan', color: '#961313' },
  { key: 'kesejahteraan', label: 'Kesejahteraan', color: '#1a7a1a' },
  { key: 'infrastruktur', label: 'Infrastruktur', color: '#2a6a9a' },
  { key: 'popularitas', label: 'Popularitas', color: '#8a4a9a' },
]

const FAILURE_IMG = 'https://ik.imagekit.io/dntonfire/image_2026-05-29_151846814.png'
const MENANG_IMG = 'https://ik.imagekit.io/dntonfire/image_2026-05-29_174230980.png'
const LULUS_IMG = 'https://ik.imagekit.io/dntonfire/image_2026-05-29_150123216.png?updatedAt=1780041687679'

const ENDING_MESSAGES = {
  krisis_anggaran: {
    title: 'NEGARA BANGKRUT!', subtitle: 'Krisis Moneter 2026',
    desc: 'APBN habis total. Negara dinyatakan gagal bayar utang. IMF mengambil alih ekonomi Indonesia. Presiden lengser.',
    color: '#b39c00', gagal: true,
  },
  kudeta: {
    title: 'KUDETA MILITER!', subtitle: 'Keamanan Nasional Runtuh',
    desc: 'Militer mengambil alih kekuasaan. Keamanan negara kolaps. Istana dikepung. Presiden digulingkan.',
    color: '#961313', gagal: true,
  },
  revolusi: {
    title: 'REVOLUSI RAKYAT!', subtitle: 'Rakyat Menggulingkan Pemerintah',
    desc: 'Rakyat kelaparan dan bangkit melawan. Istana diduduki massa. Presiden melarikan diri ke luar negeri.',
    color: '#1a5c1a', gagal: true,
  },
  kehancuran_infrastruktur: {
    title: 'INFRASTRUKTUR RUNTUH!', subtitle: 'Indonesia Kembali ke Zaman Batu',
    desc: 'Seluruh infrastruktur negara ambruk. Jembatan roboh, listrik padam total, jalan tidak bisa dilalui. Rakyat mengusir Anda dari Istana Negara!',
    color: '#8a4a9a', gagal: true,
  },
  impeachment: {
    title: 'IMPEACHMENT!', subtitle: 'DPR Memberhentikan Presiden',
    desc: 'Popularitas anjlok ke titik nol. DPR dan rakyat menuntut pertanggungjawaban. Presiden dijatuhkan.',
    color: '#8a4a9a', gagal: true,
  },
  kalah_pemilu: {
    title: 'KALAH PEMILU!', subtitle: 'Rakyat Memilih Pemimpin Baru',
    desc: 'Anda kalah dalam Pemilu. Kandidat oposisi dilantik menjadi presiden baru. Karier politik Anda berakhir.',
    color: '#2a6a9a', gagal: true,
  },
  kalah_pemilu_vp: {
    title: 'DIKHIANATI WAPRES!', subtitle: 'Wakil Presiden Menjadi Lawan',
    desc: 'Wakil presiden Anda berkhianat dan maju sebagai calon! Suara terpecah dan Anda kalah dalam Pemilu.',
    color: '#8a0000', gagal: true,
  },
  menang_pemilu: {
    title: 'PRESIDEN TERPILIH!', subtitle: 'Periode Kedua Dimulai',
    desc: 'Selamat! Anda memenangkan Pemilu dan akan melanjutkan kepemimpinan untuk periode kedua.',
    color: '#1a7a1a',
  },
  lulus: {
    title: '★ INDONESIA EMAS! ★', subtitle: 'Dua Periode Kepemimpinan',
    desc: 'Selamat! Anda berhasil memimpin Indonesia selama dua periode penuh! Karena Anda sangat berjasa, negara memberikan Tembok Ratapan Oslo sebagai kenang-kenangan!',
    color: '#b39c00',
  },
}

export default function ResultScreen() {
  const { ending, indicators, playerName, period, goToPeriod2Setup, background, party, vicePresident, ministers, resetGame, retryGame, retryCount, propores, dubiArry, reshuffleCount, delegateCount, oposisiScore, achievements, updateCareerStats, unlockScenario, scenario, quarter } = useGame()
  const msg = ENDING_MESSAGES[ending] || ENDING_MESSAGES.impeachment
  const sfx = useSound()
  const resultRef = useRef(null)
  const [capturing, setCapturing] = useState(false)

  const downloadScreenshot = async () => {
    if (!resultRef.current) return
    setCapturing(true)
    try {
      const canvas = await html2canvas(resultRef.current, { backgroundColor: '#1a1a1a', useCORS: true, scale: 1.5 })
      const link = document.createElement('a')
      link.download = `PresidenSimulator-${playerName}-${ending}.png`
      link.href = canvas.toDataURL('image/png')
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (e) { console.error(e) }
    setCapturing(false)
  }

  // Analisis tipe presiden
  const avgIndicators = Object.values(indicators).reduce((a, b) => a + b, 0) / 5
  const highestStat = Object.entries(indicators).sort((a, b) => b[1] - a[1])[0]
  const lowestStat = Object.entries(indicators).sort((a, b) => a[1] - b[1])[0]
  const isCorrupt = (reshuffleCount || 0) >= 4
  const isDelegator = (delegateCount || 0) >= 5

  const presidenTypes = []
  if (indicators.kesejahteraan >= 70 && indicators.popularitas >= 60) presidenTypes.push({ icon: '❤️', label: 'Presiden Rakyat', desc: 'Mengutamakan kesejahteraan dan cinta rakyat.' })
  if (indicators.infrastruktur >= 70) presidenTypes.push({ icon: '🏗️', label: 'Presiden Pembangunan', desc: 'Fokus pada infrastruktur dan konektivitas.' })
  if (indicators.keamanan >= 70) presidenTypes.push({ icon: '⚔️', label: 'Presiden Keamanan', desc: 'Negara aman dan stabil di bawah komando Anda.' })
  if (indicators.apbn >= 70) presidenTypes.push({ icon: '💰', label: 'Presiden Bendahara', desc: 'APBN surplus — Anda jago mengelola keuangan.' })
  if (avgIndicators <= 25) presidenTypes.push({ icon: '💀', label: 'Presiden Gagal', desc: 'Semua sektor runtuh. Kepemimpinan Anda dipertanyakan.' })
  if (isCorrupt) presidenTypes.push({ icon: '🦊', label: 'Presiden Korup', desc: 'Kabinet Anda sibuk reshuffle — tanda ketidakstabilan.' })
  if (isDelegator) presidenTypes.push({ icon: '📋', label: 'Presiden Delegator', desc: 'Terlalu banyak melimpahkan wewenang ke menteri.' })
  if (indicators.popularitas >= 80) presidenTypes.push({ icon: '⭐', label: 'Presiden Karismatik', desc: 'Rakyat mencintai Anda. Popularitas luar biasa.' })
  if (oposisiScore >= 60) presidenTypes.push({ icon: '👥', label: 'Presiden Tertekan', desc: 'Oposisi kuat — pemerintahan Anda penuh perlawanan.' })
  if (propores) presidenTypes.push({ icon: '🦅', label: 'Presiden LOYALIS PRESIDEN', desc: 'Didukung penuh oleh kelompok loyalis.' })
  if (vicePresident?.will_betray && ending?.includes('kalah')) presidenTypes.push({ icon: '🔪', label: 'Presiden Dikhianati', desc: 'Wakil Anda sendiri menusuk dari belakang.' })
  if (ending === 'lulus') presidenTypes.push({ icon: '🏆', label: 'Presiden Legenda', desc: 'Dua periode penuh! Nama Anda di buku sejarah.' })
  if (presidenTypes.length === 0) presidenTypes.push({ icon: '🤷', label: 'Presiden Biasa', desc: 'Tidak menonjol di bidang apapun, tapi tetap memimpin.' })

  const primaryType = presidenTypes[0]

  setTimeout(() => {
    if (ending === 'menang_pemilu' || ending === 'lulus') sfx.victory()
    else sfx.gameover()
  }, 100)

  // Update career stats + unlock scenario on mount
  const hasUpdated = useRef(false)
  useEffect(() => {
    if (hasUpdated.current) return
    hasUpdated.current = true
    const won = ending === 'menang_pemilu' || ending === 'lulus'
    updateCareerStats(won, quarter || 0)
    // Unlock next scenario based on current scenario
    if (scenario) {
      const unlockMap = {
        krisis_ekonomi: 'super_krisis',
        konflik: 'perang_total',
        bencana: 'bumi_hangus',
      }
      const toUnlock = unlockMap[scenario]
      if (toUnlock) unlockScenario(toUnlock)
    }
  }, [])

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-4 overflow-y-auto">
      <div className="max-w-lg w-full text-center fade-in bg-black/40 rounded pixel-border pb-4" ref={resultRef}>
        <div className="text-3xl md:text-4xl font-bold mb-2 glow-text break-words" style={{ color: msg.color }}>
          {msg.title}
        </div>
        <div className="text-sm text-retroYellow mb-4">{msg.subtitle}</div>

        <div className="bg-black/60 border-2 border-retroGray p-4 md:p-6 mb-6 pixel-border">
          <div className="text-sm text-retroLight/80 mb-4 leading-relaxed">{msg.desc}</div>

          {msg.gagal && (
            <div className="mb-6 p-4 border-2 border-red-800 bg-red-900/10">
              <div className="text-base text-red-400 glow-text mb-3">ANDA GAGAL MEMIMPIN!</div>
              <div className="text-sm text-red-300/80 mb-4">
                Anda dikenang sebagai <span className="text-red-400 font-bold">presiden terburuk dalam sejarah Indonesia</span>.
              </div>
              <img src={FAILURE_IMG}
                alt="Diusir dari Istana"
                className="w-full max-w-xs mx-auto rounded pixelated mb-2"
                style={{ imageRendering: 'pixelated' }}
                onError={(e) => { e.target.style.display = 'none' }} />
              <div className="text-xs text-red-400/60 mt-2">Rakyat memaksa Anda keluar dari Istana Negara</div>
            </div>
          )}

          {!msg.gagal && (
            <div className="mb-4">
              <img src={ending === 'lulus' ? LULUS_IMG : MENANG_IMG}
                alt="Berhasil"
                className="w-full max-w-xs mx-auto rounded pixelated mb-2"
                style={{ imageRendering: 'pixelated' }}
                onError={(e) => { e.target.style.display = 'none' }} />
              <div className="text-xs text-retroLight/50 mt-1">
                {ending === 'lulus' ? 'Menerima penghargaan Tembok Ratapan Oslo' :
                 ending === 'menang_pemilu' ? 'Presiden terpilih untuk periode kedua' : ''}
              </div>
            </div>
          )}

          <div className="text-xs text-retroLight/50 mb-4">LAPORAN KINERJA PRESIDEN {playerName.toUpperCase()}</div>
          {propores && (
            <div className="text-xs text-retroGreen mb-4">LOYALIS PRESIDEN aktif — BUDEE ARIE bersama tim sukses Anda!</div>
          )}

          {/* Bar Chart */}
          <div className="space-y-3 mb-4">
            {STAT_CONFIG.map((s) => {
              const val = indicators[s.key] || 0
              const barColor = val >= 50 ? s.color : '#961313'
              return (
                <div key={s.key}>
                  <div className="flex justify-between text-xs mb-1">
                    <span style={{ color: s.color }}>{s.label}</span>
                    <span className="text-retroLight">{val}%</span>
                  </div>
                  <div className="w-full bg-black h-4 border border-retroGray/50">
                    <div className="h-full transition-all" style={{ width: `${val}%`, background: barColor }} />
                  </div>
                </div>
              )
            })}
          </div>

          {/* Score card */}
          <div className="grid grid-cols-2 gap-2 text-sm border-t border-retroGray/30 pt-3">
            {STAT_CONFIG.map((s) => {
              const val = indicators[s.key] || 0
              return (
                <div key={s.key} className="border border-retroGray p-2">
                  <div className="text-retroYellow text-xs">{s.label}</div>
                  <div style={{ color: val > 30 ? '#1a7a1a' : '#961313' }}>{val}%</div>
                </div>
              )
            })}
          </div>
          </div>

          {/* Resume Tipe Presiden */}
          <div className="bg-black/60 border-2 border-retroGray p-4 md:p-6 mb-6 pixel-border">
            <div className="text-sm text-retroYellow glow-text mb-3">📋 RESUME: TIPE PRESIDEN</div>
            <div className="flex items-center gap-3 mb-3">
              <span className="text-3xl">{primaryType.icon}</span>
              <div className="text-left">
                <div className="text-base text-retroLight">{primaryType.label}</div>
                <div className="text-xs text-retroLight/60">{primaryType.desc}</div>
              </div>
            </div>
            {presidenTypes.length > 1 && (
              <div className="text-xs text-retroLight/40 mt-3 pt-3 border-t border-retroGray/30">
                Juga dikenal sebagai:
                <div className="flex flex-wrap gap-1 mt-1">
                  {presidenTypes.slice(1).map((t, i) => (
                    <span key={i} className="border border-retroGray/40 px-2 py-0.5 text-retroYellow/70">{t.icon} {t.label}</span>
                  ))}
                </div>
              </div>
            )}
            <div className="text-[10px] text-retroLight/30 mt-3 pt-2 border-t border-retroGray/20">
              Reshuffle: {reshuffleCount || 0}x | Delegasi: {delegateCount || 0}x | Oposisi: {Math.round(oposisiScore || 0)}% | Pencapaian: {achievements?.length || 0}
            </div>
          </div>

        {ending === 'menang_pemilu' && (
          <button
            onClick={() => {
              sfx.select()
              goToPeriod2Setup()
            }}
            className="w-full mb-3 py-3 border-2 border-retroGreen bg-retroGreen/20 hover:bg-retroGreen/40 text-retroLight transition-colors text-lg tracking-wider glow-text"
          >► LANJUT KE PERIODE 2 ◄</button>
        )}

        {msg.gagal && retryCount < 3 && (
          <button onClick={() => { sfx.select(); retryGame() }}
            className="w-full mb-3 py-3 border-2 border-retroYellow bg-retroYellow/20 hover:bg-retroYellow/40 text-retroLight transition-colors text-lg tracking-wider">
            ⟳ ULANGI DARI 2 KUARTAL SEBELUMNYA ({3 - retryCount}x tersisa)</button>
        )}

        {msg.gagal && retryCount >= 3 && (
          <div className="w-full mb-3 py-3 border-2 border-retroGray bg-black/20 text-retroLight/30 text-center text-sm">
            ✕ Kesempatan habis
          </div>
        )}

        <button onClick={downloadScreenshot} disabled={capturing}
          className="w-full mb-3 py-2 border border-retroGray bg-black/40 hover:bg-retroGray/40 text-retroLight/70 hover:text-retroLight text-xs transition-colors">
          {capturing ? '📸 MEMPROSES...' : '📸 SIMPAN SEBAGAI GAMBAR'}
        </button>

        <button onClick={() => resetGame()}
          className={`px-8 py-3 border-2 border-retroLight bg-retroLight/10 hover:bg-retroLight/30 text-retroLight transition-colors ${ending === 'menang_pemilu' ? '' : 'w-full mb-3'}`}>
          ► MAIN LAGI ◄
        </button>

        <div className="mt-8 text-xs text-retroLight/20">PRESIDEN SIMULATOR — Buildbox Studio 2026</div>
      </div>
    </div>
  )
}
