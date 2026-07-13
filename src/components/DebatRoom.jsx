import { useState, useEffect, useRef } from 'react'
import { useGame } from '../context/GameContext'
import campaignData from '../data/campaign.json'
import partiesData from '../data/parties.json'
import vpData from '../data/vicePresidents.json'
import useSound from '../hooks/useSound'
import html2canvas from 'html2canvas'

const DEBATE_QUESTIONS = [
  {
    question: 'Mengapa utang luar negeri naik selama 5 tahun terakhir?',
    opponent: 'Utang Anda melonjak 200%! Ekonomi bangsa terancam! Rakyat yang membayar!',
    choices: [
      { label: 'Untuk membangun infrastruktur masa depan!', trust: 3, counter: 'Infrastruktur dari utang? Itu warisan beban untuk anak cucu!' },
      { label: 'Saya akui ini kesalahan dan akan saya perbaiki.', trust: 7, counter: 'Terlambat mengakui! Rakyat sudah menderita!' },
      { label: 'Itu kebohongan! Data dari oposisi!', trust: -15, counter: 'Ini data BPS! Jangan mengelak!' },
    ],
    relevantPrograms: ['ekonomi_kerakyatan', 'pajak_adil'],
  },
  {
    question: 'Apa yang akan Anda lakukan untuk menaikkan kesejahteraan rakyat?',
    opponent: 'Angka kemiskinan di era Anda naik! Janji kampanye ingkar!',
    choices: [
      { label: 'Program sembako murah dan lapangan kerja massal', trust: 7, counter: 'Program gagal di daerah! Buktinya?' },
      { label: 'Bantuan langsung tunai setiap bulan', trust: 3, counter: 'BLT hanya solusi sementara, bukan perbaikan!' },
      { label: 'Biarkan pasar bekerja, rakyat akan menyesuaikan', trust: -10, counter: 'Tidak punya hati! Rakyat kecil yang menanggung!' },
    ],
    relevantPrograms: ['ekonomi_kerakyatan', 'kesehatan_gratis', 'pendidikan_merdeka', 'pangan_berdaulat'],
  },
  {
    question: 'Bagaimana menjamin tidak ada korupsi di kabinet Anda?',
    opponent: 'Kabinet Anda dinobatkan sebagai yang paling korup! 12 menteri tersangkut kasus!',
    choices: [
      { label: 'Sistem e-budgeting dan pengawasan publik terbuka', trust: 7, counter: 'Sistem Anda bocor! Di mana hasilnya?' },
      { label: 'Saya akan hukum berat koruptor!', trust: 3, counter: 'Bicara mah murah! Buktikan!' },
      { label: 'Saya percaya menteri-menteri saya bersih', trust: -5, counter: 'Naif! Anda tidak tahu apa yang terjadi di bawah!' },
    ],
    relevantPrograms: ['pemberantasan_korupsi', 'pertahanan_kuat'],
  },
  {
    question: 'Nilai tukar rupiah melemah terhadap dolar, apa strategi Anda?',
    opponent: 'Rupiah tembus 16.500 per dolar di era Anda! Terlemah dalam sejarah!',
    choices: [
      { label: 'Intervensi BI dan pengendalian impor', trust: 5, counter: 'BI sudah intervensi! Tidak mempan!' },
      { label: 'Genjot ekspor dan hilirisasi SDA', trust: 7, counter: 'Hilirisasi macet karena regulasi Anda sendiri!' },
      { label: 'Pinjam dana talangan asing', trust: -8, counter: 'Bungkuk lagi! Asing terus yang mengendalikan!' },
    ],
    relevantPrograms: ['pajak_adil', 'ekonomi_kerakyatan'],
  },
  {
    question: 'Bagaimana dengan masalah lingkungan dan deforestasi?',
    opponent: 'Hutan Indonesia menyusut 2 juta hektar! Kalimantan gundul!',
    choices: [
      { label: 'Moratorium izin tambang dan sawit baru', trust: 7, counter: 'Tidak tegas! Izin lama tetap berjalan!' },
      { label: 'Program reboisasi massal dan restorasi', trust: 3, counter: 'Reboisasi hanya seremonial! Tidak ada realisasi!' },
      { label: 'Ekonomi dulu, lingkungan nanti', trust: -12, counter: 'Kriminal! Warisan untuk cucu kita!' },
    ],
    relevantPrograms: ['infrastruktur_digital', 'pangan_berdaulat'],
  },
]

const MENANG_IMG = 'https://ik.imagekit.io/dntonfire/image_2026-05-29_174230980.png'
const LULUS_IMG = 'https://ik.imagekit.io/dntonfire/image_2026-05-29_150123216.png?updatedAt=1780041687679'

const TEAM_OPTIONS = [
  { id: 'juru_bicara', name: 'Juru Bicara Handal', icon: '🎙', desc: 'Menguasai retorika dan komunikasi publik.', cost: { apbn: -3 }, trustBonus: 3, debatBonus: true },
  { id: 'ahli_strategi', name: 'Ahli Strategi Politik', icon: '🧠', desc: 'Membaca peta politik dan mengatur langkah.', cost: { apbn: -5 }, trustBonus: 5, debatBonus: false },
  { id: 'fundraiser', name: 'Fundraiser Ulung', icon: '💰', desc: 'Mengumpulkan dana dari berbagai sumber.', cost: { popularitas: -3 }, trustBonus: 2, debatBonus: false, campaignFundingBonus: true },
  { id: 'konsultan_media', name: 'Konsultan Media Massal', icon: '📺', desc: 'Mengelola citra di TV dan media sosial.', cost: { apbn: -4 }, trustBonus: 4, debatBonus: false },
  { id: 'penghubung_tokoh', name: 'Penghubung Tokoh Daerah', icon: '🤝', desc: 'Jaringan kuat di daerah-daerah kunci.', cost: { apbn: -2 }, trustBonus: 2, debatBonus: false },
  { id: 'ahli_debat', name: 'Ahli Debat Profesional', icon: '⚡', desc: 'Mempersiapkan argumentasi dan data debat.', cost: { popularitas: -5 }, trustBonus: 0, debatBonus: true, debatExtraPoint: true },
  { id: 'dubi_arry', name: 'BUDEE ARIE (LOYALIS PRESIDEN)', icon: '🦅', desc: 'Kader LOYALIS PRESIDEN — otomatis tergabung jika popularitas >= 80.', cost: {}, trustBonus: 6, debatBonus: true, autoJoin: true },
]

const WEALTH_STYLES = {
  kaya: { icon: '👑', label: 'KAYA RAYA', color: 'text-yellow-400', border: 'border-yellow-600' },
  cukupan: { icon: '🍚', label: 'BERKECUKUPAN', color: 'text-retroGreen', border: 'border-retroGreen' },
  miskin: { icon: '🌾', label: 'SEDERHANA', color: 'text-blue-300', border: 'border-blue-500' },
}

export default function DebatRoom() {
  const { playerName, background, party, vicePresident, vpFired, indicators, electionStage, electionTrust, setElectionStage, setElectionTrust, electionResult, fireVP, setVicePresident, dubiArry, qaStage } = useGame()
  const [selectedPrograms, setSelectedPrograms] = useState([])
  const [showIntro, setShowIntro] = useState(true)
  const [debateStep, setDebateStep] = useState(0)
  const [showPartySwitch, setShowPartySwitch] = useState(false)
  const [currentParty, setCurrentParty] = useState(party)
  const [switchedParty, setSwitchedParty] = useState(false)
  const [showOpponentResponse, setShowOpponentResponse] = useState(null)
  const [votePhase, setVotePhase] = useState(false)
  const [votes, setVotes] = useState({ player: 0, opponent1: 0, opponent2: 0, vp: 0 })
  const [voting, setVoting] = useState(false)
  const [voteCount, setVoteCount] = useState(0)
  const [vpDecision, setVpDecision] = useState(null)
  const [showNewVPSelect, setShowNewVPSelect] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const resultRef = useRef(null)
  const [capturing, setCapturing] = useState(false)

  const downloadScreenshot = async () => {
    if (!resultRef.current) return
    setCapturing(true)
    try {
      const canvas = await html2canvas(resultRef.current, { backgroundColor: '#1a1a1a', useCORS: true, scale: 1.5 })
      const link = document.createElement('a')
      link.download = `PresidenSimulator-Pemilu-${playerName}.png`
      link.href = canvas.toDataURL('image/png')
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (e) { console.error(e) }
    setCapturing(false)
  }

  // Campaign state
  const [campaignPhase, setCampaignPhase] = useState(false)
  const [campaignStep, setCampaignStep] = useState(0)
  const [campaignFunding, setCampaignFunding] = useState(null)
  const [campaignLocation, setCampaignLocation] = useState(null)
  const [campaignMethod, setCampaignMethod] = useState(null)
  const [foreignControl, setForeignControl] = useState(false)

  // Campaign team state
  const [showWealthProfile, setShowWealthProfile] = useState(false)
  const [showTeamSelect, setShowTeamSelect] = useState(false)

  // Auto-add Dubi Arry if propores active
  const dubiArryOption = TEAM_OPTIONS.find(t => t.id === 'dubi_arry')
  const [selectedTeam, setSelectedTeam] = useState(dubiArry ? [dubiArryOption] : [])

  const applyTeamEffects = () => {
    selectedTeam.forEach((t) => {
      Object.entries(t.cost).forEach(([stat, val]) => {
        if (stat === 'popularitas') {
          setElectionTrust(val)
        }
      })
      if (t.trustBonus) setElectionTrust(t.trustBonus)
    })
  }

  const campaignOptions = {
    funding: [
      { id: 'domestic', label: 'Dalam Negeri (APBN & Donasi)', desc: 'Aman. Dana terbatas tapi tidak ada campur tangan asing.', trust: 3, icon: '🇮🇩' },
      { id: 'foreign', label: 'Luar Negeri (Investor Asing)', desc: 'Dana besar. Tapi kontrol asing mengintai...', trust: 6, icon: '🌐', triggersForeignControl: true },
    ],
    locations: [
      { id: 'jawa', label: 'Fokus Jawa', desc: 'Pulau dengan suara terbanyak.', trust: 5, icon: '🏝' },
      { id: 'sumatera', label: 'Fokus Sumatera', desc: 'Lumbung suara alternatif.', trust: 3, icon: '🏔' },
      { id: 'timur', label: 'Fokus Indonesia Timur', desc: 'Daerah tertinggal, butuh perhatian.', trust: 2, icon: '🌅' },
      { id: 'merata', label: 'Kampanye Merata', desc: 'Semua daerah, biaya besar.', trust: 6, icon: '🗺' },
    ],
    methods: [
      { id: 'blusukan', label: 'Blusukan Langsung', desc: 'Temu rakyat di pasar dan desa.', trust: 5, icon: '🚶' },
      { id: 'iklan', label: 'Iklan TV & Radio Massal', desc: 'Jangkau luas, tapi mahal.', trust: 3, icon: '📺' },
      { id: 'medsos', label: 'Media Sosial & Viral', desc: 'Efektif untuk pemilih muda.', trust: 4, icon: '📱' },
      { id: 'debat_tematik', label: 'Debat Tematik', desc: 'Tunjukkan kapasitas di bidang tertentu.', trust: 6, icon: '🎤' },
    ],
  }
  const sfx = useSound()

  // QA skip: jump to specific stage
  useEffect(() => {
    if (qaStage === 'pemilu') {
      setShowIntro(false)
      setShowWealthProfile(false)
      setVpDecision('skip')
      setShowTeamSelect(false)
    } else if (qaStage === 'pemilu_timses') {
      setShowIntro(false)
      setShowWealthProfile(false)
      setVpDecision('skip')
      setShowTeamSelect(true)
    }
  }, [qaStage])

  const vpBetrays = vicePresident && vicePresident.will_betray && !vpFired

  const kandidats = [
    { name: 'H. Ahmad Populis', slogan: 'Rakyat Harus Bahagia!', color: '#961313', id: 'opponent1' },
    { name: 'Dr. Richard Teknokrat', slogan: 'Indonesia Maju, Ekonomi Tumbuh!', color: '#1a5c1a', id: 'opponent2' },
  ]
  if (vpBetrays) {
    kandidats.push({ name: vicePresident.name, slogan: `${currentParty?.name || 'Independen'} untuk Semua!`, color: '#b39c00', id: 'vp' })
  }

  // Voting timer effect — weighted by trust score
  useEffect(() => {
    if (!voting || !votePhase) return
    if (voteCount >= 100) return

    const timer = setTimeout(() => {
      const newVotes = { ...votes }
      const candidates = ['player', 'opponent1', 'opponent2', ...(vpBetrays ? ['vp'] : [])]

      // Weighted random — player weight = electionTrust, opponents get 100-trust split
      const playerWeight = Math.max(10, electionTrust)
      const opponentWeight = Math.max(5, (100 - electionTrust) / (candidates.length - 1))
      const weights = candidates.map((c) => c === 'player' ? playerWeight : opponentWeight)
      const totalWeight = weights.reduce((a, b) => a + b, 0)
      let r = Math.random() * totalWeight
      let winner = candidates[0]
      for (let i = 0; i < weights.length; i++) {
        r -= weights[i]
        if (r <= 0) { winner = candidates[i]; break }
      }

      newVotes[winner] = (newVotes[winner] || 0) + 1
      setVotes(newVotes)
      setVoteCount(voteCount + 1)
      if ((voteCount + 1) % 5 === 0) sfx.click()
    }, 80)

    return () => clearTimeout(timer)
  }, [voting, votePhase, voteCount, votes, electionTrust, vpBetrays])

  // Election result after voting ends
  useEffect(() => {
    if (!voting || !votePhase || voteCount < 100) return
    setShowResults(true)
    sfx.notif()
    const timeout = setTimeout(() => {
      const maxVotes = Math.max(...Object.values(votes))
      const winner = Object.keys(votes).find(k => votes[k] === maxVotes)
      electionResult()
    }, 3500)
    return () => clearTimeout(timeout)
  }, [voteCount, voting, votePhase])

  if (showIntro) {
    sfx.notif()
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-4 text-center">
        <div className="max-w-lg fade-in">
          <div className="mb-4 flex items-center justify-center gap-4">
            <img src="https://ik.imagekit.io/dntonfire/image_2026-05-29_102130570.png"
              alt="Lembaga Pemilu" className="h-28 object-contain pixelated"
              onError={(e) => { e.target.style.display = 'none' }} />
          </div>
          <div className="text-2xl text-retroYellow glow-text mb-4">🗳 PEMILU PRESIDEN 🗳</div>
          <div className="text-sm text-retroLight/70 mb-6">Masa jabatan Anda telah berakhir! Rakyat akan memilih.</div>
          {vpBetrays && (
            <div className="mb-4 p-4 border-2 border-red-500 bg-red-900/20 shake">
              <div className="text-red-400 text-sm font-bold mb-1">⚠ WAPRES BERKHIANAT! ⚠</div>
              <div className="text-xs text-red-300/80">{vicePresident.name} mendeklarasikan diri sebagai calon presiden dari partai oposisi!</div>
            </div>
          )}
          <div className="grid grid-cols-2 gap-4 mb-6">
            {kandidats.map((k, i) => (
              <div key={i} className="bg-black/60 border-2 p-4 border-retroGray">
                <div className="w-16 h-16 mx-auto mb-2 bg-retroGray flex items-center justify-center"><span className="text-2xl">?</span></div>
                <div className="text-sm text-retroLight font-bold">{k.name}</div>
                <div className="text-xs text-retroLight/50">"{k.slogan}"</div>
              </div>
            ))}
          </div>
          <button onClick={() => { sfx.click(); setShowIntro(false); setShowWealthProfile(true) }}
            className="px-8 py-3 border-2 border-retroYellow bg-retroYellow/20 hover:bg-retroYellow/40 text-retroLight transition-colors">► MULAI KAMPANYE ◄</button>
        </div>
      </div>
    )
  }

  // Wealth Profile
  if (showWealthProfile) {
    const wealth = background ? WEALTH_STYLES[background.wealth] || WEALTH_STYLES.cukupan : WEALTH_STYLES.cukupan
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-4">
        <div className="max-w-lg w-full fade-in text-center">
          <div className="text-2xl text-retroYellow glow-text mb-6">📋 PROFIL CALON PRESIDEN</div>
          <div className="bg-black/60 border-2 border-retroGray p-6 mb-6">
            <div className="text-4xl mb-3">{background?.icon || '?'}</div>
            <div className="text-lg text-retroLight mb-2">{playerName}</div>
            <div className="text-sm text-retroYellow mb-4">{background?.name || '-'}</div>
            <div className={`text-lg mb-3 ${wealth.color}`}>{wealth.icon} {wealth.label}</div>
            <div className="text-xs text-retroLight/70 leading-relaxed mb-4">{background?.wealth_desc || ''}</div>
            <div className={`border-t ${wealth.border} pt-3 mt-3`}>
              <div className="text-xs text-retroLight/50">Status Ekonomi:</div>
              <div className={`text-sm mt-1 ${wealth.color}`}>
                {background?.wealth === 'kaya' ? '💰 Aset melimpah — dana kampanye besar, tapi rakyat curiga' :
                 background?.wealth === 'miskin' ? '🌾 Hidup sederhana — dana terbatas, tapi rakyat percaya Anda tulus' :
                 '📊 Hidup berkecukupan — dana cukup, tidak mencolok'}
              </div>
            </div>
          </div>
          <button onClick={() => { sfx.click(); setShowWealthProfile(false); if (vicePresident && !vpFired) { setVpDecision('pending') } else { setVpDecision('skip'); setShowTeamSelect(true) } }}
            className="w-full py-3 border-2 border-retroYellow bg-retroYellow/20 hover:bg-retroYellow/40 text-retroLight transition-colors">► LANJUTKAN ◄</button>
        </div>
      </div>
    )
  }

  if (vpDecision === 'pending' && vicePresident) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-4">
        <div className="max-w-lg w-full fade-in text-center">
          <div className="text-2xl text-retroYellow glow-text mb-4">PILIH WAKIL PRESIDEN</div>
          <div className="text-sm text-retroLight/60 mb-6">
            Apakah Anda akan tetap mempertahankan <span className="text-retroYellow">{vicePresident.name}</span> sebagai calon wakil presiden?
          </div>
          <div className="bg-black/60 border-2 border-retroGray p-4 mb-6">
            <div className="text-xs text-retroLight/50 mb-2">Wapres petahana:</div>
            <div className="text-lg text-retroLight">{vicePresident.name}</div>
            <div className="text-xs text-retroLight/50">{vicePresident.desc}</div>
          </div>
          <div className="flex gap-3">
            <button onClick={() => { sfx.click(); setVpDecision('kept'); setShowTeamSelect(true) }}
              className="flex-1 py-3 border-2 border-retroGreen bg-retroGreen/20 hover:bg-retroGreen/40 text-retroLight transition-colors text-sm">
              ► PERTAHANKAN ◄
            </button>
            <button onClick={() => { sfx.click(); fireVP(); setVpDecision('fired'); setShowTeamSelect(true) }}
              className="flex-1 py-3 border-2 border-red-500 bg-red-900/20 hover:bg-red-900/40 text-red-300 transition-colors text-sm">
              ✕ PECAT
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (false && showNewVPSelect) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-4">
        <div className="max-w-lg w-full fade-in text-center">
          <div className="text-2xl text-retroYellow glow-text mb-4">PILIH WAKIL PRESIDEN BARU</div>
          <div className="text-sm text-retroLight/60 mb-6">
            Anda telah memecat wakil presiden. Pilih calon baru untuk mendampingi di pemilu.
          </div>
          <div className="space-y-3 mb-6">
            {vpData.filter((v) => v.id !== vicePresident?.id).map((vp) => (
              <button key={vp.id}
                onClick={() => { sfx.select(); setVicePresident(vp); setShowNewVPSelect(false); setVpDecision('fired'); setShowTeamSelect(true) }}
                className="w-full text-left p-4 border-2 border-retroGray bg-black/40 hover:border-retroYellow/50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 md:w-24 md:h-24 bg-retroGray flex items-center justify-center overflow-hidden rounded-full border-2 border-retroGray/50 shrink-0">
                    <img src={vp.photo} alt={vp.name} className="w-full h-full object-cover pixelated"
                      onError={(e) => { e.target.style.display = 'none'; e.target.parentNode.textContent = '👤' }} />
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm text-retroLight break-words">{vp.name}</div>
                    <div className="text-xs text-retroLight/50 break-words">{vp.desc}</div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // Campaign Team Selection (after VP decision, before Babak 1)
  if (showTeamSelect) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-4">
        <div className="max-w-lg w-full fade-in">
          <div className="text-2xl text-retroYellow glow-text text-center mb-2">PILIH TIM SUKSES</div>
          <div className="text-xs text-retroLight/50 text-center mb-6">
            Pilih 3 anggota tim sukses yang akan membantu kampanye dan debat Anda. Setiap anggota punya efek dan biaya berbeda. Dipilih: {selectedTeam.length}/3
          </div>
          <div className="space-y-2 mb-6">
            {TEAM_OPTIONS.filter(t => !t.autoJoin || (t.autoJoin && dubiArry)).map((t) => {
              const isSelected = selectedTeam.find((s) => s.id === t.id)
              const canSelect = !isSelected && selectedTeam.length < 3 && !t.autoJoin
              const isAutoJoin = t.autoJoin && dubiArry
              return (
                <button key={t.id} onClick={() => {
                  if (isAutoJoin) return
                  sfx.select()
                  if (isSelected) {
                    setSelectedTeam(selectedTeam.filter((s) => s.id !== t.id))
                  } else if (canSelect) {
                    setSelectedTeam([...selectedTeam, t])
                  }
                }}
                  className={`w-full text-left p-3 border-2 transition-colors ${
                    isAutoJoin
                      ? 'border-retroGreen bg-retroGreen/20'
                      : isSelected
                        ? 'border-retroYellow bg-retroYellow/20'
                        : canSelect
                          ? 'border-retroGray bg-black/40 hover:border-retroLight/40'
                          : 'border-retroGray bg-black/20 text-retroLight/30'
                  }`}>
                  <div className="flex items-center gap-3">
                    <span className="text-lg">{t.icon}</span>
                    <div className="flex-1">
                      <div className={`text-sm ${isAutoJoin ? 'text-retroGreen' : 'text-retroLight'}`}>
                        {t.name}
                        {isAutoJoin && <span className="text-xs ml-2 text-retroGreen">(AUTO-JOIN)</span>}
                      </div>
                      <div className="text-xs text-retroLight/50">{t.desc}</div>
                    </div>
                    <div className="text-xs text-right">
                      {Object.entries(t.cost).map(([s, v]) => (
                        <div key={s} className={v < 0 ? 'text-red-400' : 'text-retroGreen'}>{s === 'apbn' ? 'APBN' : 'Pop'} {v > 0 ? '+' : ''}{v}</div>
                      ))}
                      {t.trustBonus > 0 && <div className="text-retroYellow">Trust +{t.trustBonus}</div>}
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
          <button disabled={selectedTeam.length !== 3}
            onClick={() => { sfx.click(); setShowTeamSelect(false); applyTeamEffects() }}
            className={`w-full py-3 border-2 transition-colors ${
              selectedTeam.length === 3
                ? 'border-retroYellow bg-retroYellow/20 hover:bg-retroYellow/40 text-retroLight'
                : 'border-retroGray bg-black/20 text-retroLight/30 cursor-not-allowed'
            }`}>► LANJUTKAN KE VISI & MISI ◄</button>
        </div>
      </div>
    )
  }

  if (!votePhase) {
    const handleSelectProgram = (programId) => {
      if (selectedPrograms.includes(programId)) {
        setSelectedPrograms(selectedPrograms.filter((id) => id !== programId))
      } else if (selectedPrograms.length < 3) {
        sfx.select()
        setSelectedPrograms([...selectedPrograms, programId])
      }
    }

    if (electionStage === 0) {
      const isTrustIssue = selectedPrograms.some((id) => {
        const program = campaignData.find((p) => p.id === id)
        if (!program) return false
        return program.requires.some((req) => {
          const val = indicators[req.stat]
          return val !== undefined && val < req.min
        })
      })

      return (
        <div className="flex-1 flex flex-col p-4 max-w-2xl mx-auto w-full overflow-y-auto">
          <div className="text-center mb-4">
            <div className="text-xl text-retroYellow glow-text mb-2">BABAK 1: VISI & MISI</div>
            <div className="text-sm text-retroLight/60 mb-2">
              Partai: {currentParty?.name} ({currentParty?.ideology}) {switchedParty && <span className="text-yellow-400">(Pindah Partai!)</span>}
            </div>
          </div>
          {!showPartySwitch && !switchedParty && (
            <button onClick={() => { sfx.click(); setShowPartySwitch(true) }}
              className="w-full py-2 mb-4 border-2 border-yellow-600 bg-yellow-900/20 hover:bg-yellow-900/40 text-yellow-400 text-sm transition-colors">
              🔄 PINDAH PARTAI? (Trust -15)</button>
          )}
          {showPartySwitch && (
            <div className="mb-4 p-4 border-2 border-yellow-600 bg-yellow-900/10">
              <div className="text-sm text-yellow-400 mb-3">Pilih partai baru:</div>
              <div className="space-y-2">
                {partiesData.filter((p) => p.id !== currentParty?.id).map((p) => (
                  <button key={p.id} onClick={() => { sfx.select(); setCurrentParty(p); setSwitchedParty(true); setShowPartySwitch(false); setElectionTrust(-15) }}
                    className="w-full text-left p-3 border border-yellow-600 bg-black/40 hover:bg-yellow-900/20 text-sm transition-colors">
                    <span className="text-retroYellow">{p.name}</span><span className="text-xs text-retroLight/50 ml-2">({p.ideology})</span>
                  </button>
                ))}
              </div>
              <button onClick={() => setShowPartySwitch(false)} className="mt-2 text-xs text-retroLight/40 hover:text-retroLight">Batal</button>
            </div>
          )}
          <div className="grid grid-cols-1 gap-3 mb-6">
            {campaignData.map((program) => {
              const selected = selectedPrograms.includes(program.id)
              return (
                <button key={program.id} onClick={() => handleSelectProgram(program.id)}
                  className={`text-left p-4 border-2 transition-colors ${selected ? 'border-retroYellow bg-retroYellow/20' : 'border-retroGray bg-black/40 hover:border-retroLight/40'}`}>
                  <div className="flex items-center gap-3">
                    <div className={`w-6 h-6 flex items-center justify-center border-2 text-xs ${selected ? 'border-retroYellow bg-retroYellow text-black' : 'border-retroLight/30'}`}>{selected ? '✓' : ''}</div>
                    <div>
                      <div className="text-sm text-retroLight">{program.title}</div>
                      <div className="text-xs text-retroLight/50">{program.desc}</div>
                      {program.requires.map((req, i) => {
                        const current = indicators[req.stat] || 0
                        return <div key={i} className={`text-xs mt-1 ${current >= req.min ? 'text-retroGreen' : 'text-red-400'}`}>{current >= req.min ? '✓' : '✗'} Butuh {req.stat} ≥ {req.min}% ({current}%)</div>
                      })}
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
          <div className="text-center text-sm text-retroLight/50 mb-4">Dipilih: {selectedPrograms.length}/3</div>
          <button disabled={selectedPrograms.length !== 3}
            onClick={() => { sfx.select(); if (isTrustIssue) { setElectionTrust(-100); electionResult() } else { setElectionStage(1); setDebateStep(0) } }}
            className={`w-full py-3 border-2 transition-colors ${selectedPrograms.length === 3 ? 'border-retroYellow bg-retroYellow/20 hover:bg-retroYellow/40 text-retroLight' : 'border-retroGray bg-black/20 text-retroLight/30 cursor-not-allowed'}`}>
            {isTrustIssue ? '► PERINGATAN: TRUST ISSUE! ◄' : '► LANJUTKAN KE DEBAT ◄'}
          </button>
        </div>
      )
    }

    if (electionStage === 1) {
      const currentDebate = DEBATE_QUESTIONS[debateStep]
      if (!currentDebate) {
        setCampaignPhase(true)
        setElectionStage(2)
        return null
      }

      // Program-based bonus/malus for this debate question
      const matchedPrograms = currentDebate.relevantPrograms.filter((pid) => selectedPrograms.includes(pid))
      const programMap = {
        ekonomi_kerakyatan: 'kesejahteraan', infrastruktur_digital: 'infrastruktur',
        pertahanan_kuat: 'keamanan', kesehatan_gratis: 'kesejahteraan',
        pendidikan_merdeka: 'kesejahteraan', pangan_berdaulat: 'infrastruktur',
        pajak_adil: 'apbn', pemberantasan_korupsi: 'keamanan',
      }
      let programBonus = 0
      let programNote = ''
      matchedPrograms.forEach((pid) => {
        const stat = programMap[pid]
        const val = indicators[stat] || 0
        if (val >= 40) {
          programBonus += 2
          const name = campaignData.find((p) => p.id === pid)?.title || pid
          programNote = `✅ Visi "${name}" berhasil! Trust +2`
        } else {
          programBonus -= 3
          const name = campaignData.find((p) => p.id === pid)?.title || pid
          programNote = `⚠ Janji "${name}" ditagih! Capaian masih rendah! Trust -3`
        }
      })

      return (
        <div className="flex-1 flex flex-col p-4 max-w-2xl mx-auto w-full overflow-y-auto">
          <div className="text-center mb-4">
            <div className="text-xl text-retroYellow glow-text mb-2">BABAK 2: DEBAT TERBUKA</div>
            <div className="text-sm text-retroLight/60">Pertanyaan {debateStep + 1} dari {DEBATE_QUESTIONS.length}</div>
            <div className="mt-2 w-full bg-retroGray h-2"><div className="bg-retroYellow h-2" style={{ width: `${electionTrust}%` }} /></div>
            <div className="text-xs text-retroLight/50 mt-1">Trust Score: {electionTrust}%</div>
          </div>
          <div className="bg-red-900/20 border border-red-800 p-3 mb-4 fade-in">
            <div className="text-xs text-red-400 mb-1">🗣 {kandidats[0].name} (Oposisi):</div>
            <div className="text-sm text-red-300/90 italic">"{currentDebate.opponent}"</div>
          </div>
          <div className="bg-black/60 border-2 border-retroGray p-6 mb-6">
            <div className="text-sm text-retroLight/50 mb-2">Pewawancara:</div>
            <div className="text-base text-retroLight glow-text mb-4">{currentDebate.question}</div>
            {showOpponentResponse !== null ? (
              <div className="fade-in">
                <div className="bg-yellow-900/20 border border-yellow-700 p-3 mb-4">
                  <div className="text-xs text-yellow-400 mb-1">🗣 {kandidats[0].name} (Sanggahan):</div>
                  <div className="text-sm text-yellow-300/80 italic">"{currentDebate.choices[showOpponentResponse].counter}"</div>
                </div>
                <button onClick={() => { setShowOpponentResponse(null);
                  if (debateStep < DEBATE_QUESTIONS.length - 1) setDebateStep(debateStep + 1); else { setCampaignPhase(true); setElectionStage(2) }; sfx.click() }}
                  className="w-full py-2 border border-retroYellow bg-retroYellow/20 hover:bg-retroYellow/40 text-retroLight text-sm transition-colors">► LANJUT ◄</button>
              </div>
              ) : (
                <div className="space-y-3">
                  {currentDebate.choices.map((choice, i) => {
                    const extraTrust = selectedTeam.find((t) => t.debatBonus) ? 2 : 0
                    const totalTrust = choice.trust + extraTrust + programBonus
                    return (
                    <button key={i} onClick={() => { sfx.select(); setElectionTrust(totalTrust); setShowOpponentResponse(i); if (electionTrust + totalTrust <= 0) setTimeout(() => electionResult(), 1500) }}
                      className="w-full text-left px-4 py-3 border-2 border-retroLight/20 hover:border-retroYellow/50 bg-black/40 hover:bg-retroYellow/10 transition-colors text-sm">
                      <div>{choice.label}</div>
                      {programNote && <div className="text-[10px] mt-1 text-retroLight/40">{programNote}</div>}
                    </button>
                    )
                  })}
                </div>
            )}
          </div>
        </div>
      )
    }

    // Campaign Phase
    if (campaignPhase && electionStage === 2) {
      const currentOptions = campaignStep === 0 ? campaignOptions.funding : campaignStep === 1 ? campaignOptions.locations : campaignOptions.methods
      const currentLabel = campaignStep === 0 ? 'Sumber Dana Kampanye' : campaignStep === 1 ? 'Lokasi Kampanye' : 'Metode Kampanye'
      const currentIcon = campaignStep === 0 ? '💰' : campaignStep === 1 ? '🗺' : '📣'
      const currentSelection = campaignStep === 0 ? campaignFunding : campaignStep === 1 ? campaignLocation : campaignMethod

      const handleSelect = (opt) => {
        sfx.select()
        if (campaignStep === 0) {
          setCampaignFunding(opt)
          if (opt.triggersForeignControl) setForeignControl(true)
        } else if (campaignStep === 1) {
          setCampaignLocation(opt)
        } else {
          setCampaignMethod(opt)
        }
      }

      const handleNext = () => {
        if (!currentSelection) return
        sfx.click()
        setElectionTrust(currentSelection.trust)
        if (campaignStep < 2) {
          setCampaignStep(campaignStep + 1)
        } else {
          // All campaign steps done, proceed to voting
          setCampaignPhase(false)
          setVotePhase(true)
        }
      }

      return (
        <div className="flex-1 flex flex-col items-center justify-center p-4">
          <div className="max-w-lg w-full fade-in">
            <div className="text-center mb-6">
              <div className="text-xl text-retroYellow glow-text mb-2">{currentIcon} BABAK 3: KAMPANYE {currentIcon}</div>
              <div className="text-sm text-retroLight/60">Langkah {campaignStep + 1} dari 3 — {currentLabel}</div>
              <div className="mt-2 w-full bg-retroGray h-2"><div className="bg-retroYellow h-2" style={{ width: `${Math.max(0, electionTrust)}%` }} /></div>
              <div className="text-xs text-retroLight/50 mt-1">Trust Score: {electionTrust}%</div>
              {foreignControl && (
                <div className="mt-2 text-xs text-red-400 animate-pulse">⚠ Dana asing terdeteksi! Kontrol asing meningkat!</div>
              )}
            </div>
            <div className="space-y-2 mb-6">
              {currentOptions.map((opt) => (
                <button key={opt.id} onClick={() => handleSelect(opt)}
                  className={`w-full text-left p-4 border-2 transition-colors ${
                    currentSelection?.id === opt.id
                      ? 'border-retroYellow bg-retroYellow/20'
                      : 'border-retroGray bg-black/40 hover:border-retroLight/40'
                  }`}>
                  <div className="flex items-center gap-3">
                    <span className="text-lg">{opt.icon}</span>
                    <div className="flex-1">
                      <div className="text-sm text-retroLight">{opt.label}</div>
                      <div className="text-xs text-retroLight/50">{opt.desc}</div>
                    </div>
                    <span className="text-xs text-retroGreen">+{opt.trust} trust</span>
                  </div>
                </button>
              ))}
            </div>
            <div className="flex gap-3">
              <span className="flex-1" />
              <button disabled={!currentSelection} onClick={handleNext}
                className={`flex-1 py-3 border-2 transition-colors ${
                  currentSelection
                    ? 'border-retroYellow bg-retroYellow/20 hover:bg-retroYellow/40 text-retroLight'
                    : 'border-retroGray bg-black/20 text-retroLight/30 cursor-not-allowed'
                }`}>
                {campaignStep < 2 ? '► SELANJUTNYA ◄' : '► MULAI PEMUNGUTAN SUARA ◄'}
              </button>
            </div>
          </div>
        </div>
      )
    }
  }

  // Voting phase - not voting yet, show bars
  if (votePhase && !voting) {
    const names = ['player', 'opponent1', 'opponent2', ...(vpBetrays ? ['vp'] : [])]
    const initials = { player: playerName, opponent1: kandidats[0].name, opponent2: kandidats[1].name, vp: kandidats[2]?.name }
    const voteColors = { player: '#b39c00', opponent1: '#961313', opponent2: '#1a5c1a', vp: '#8a4a9a' }
    const totalVotes = Object.values(votes).reduce((a, b) => a + b, 0)
    const playerParty = partiesData.find(p => p.id === party)

    return (
      <div className="flex-1 flex flex-col p-4 max-w-2xl mx-auto w-full">
        <div className="text-center mb-6">
          <div className="text-xl text-retroYellow glow-text mb-2">🗳 BABAK 3: PEMUNGUTAN SUARA</div>
          <div className="text-sm text-retroLight/60">Rakyat mulai memberikan suaranya...</div>
        </div>
        <div className="bg-black/60 border-2 border-retroGray p-6 mb-6">
          <div className="text-center text-retroLight/50 text-xs mb-6">Klik COBLOS untuk memberikan suara Anda sebagai presiden petahana</div>
          <div className="space-y-4">
            {names.map((n, i) => {
              const pct = totalVotes > 0 ? (votes[n] / totalVotes) * 100 : 0
              return (
                <div key={n}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-retroLight flex items-center gap-1">
                      {i === 0 && playerParty && (
                        <img src={playerParty.logo} alt="" className="w-10 h-10 object-contain pixelated" />
                      )}
                      {i === 0 ? `${initials[n]} (Anda)` : initials[n]}
                    </span>
                    <span className="text-retroYellow">{Math.round(pct)}% ({votes[n]} suara)</span>
                  </div>
                  <div className="w-full bg-retroGray h-4 border border-retroGray/50">
                    <div className="h-full transition-all duration-500" style={{ width: `${pct}%`, background: voteColors[n] }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
        <button onClick={() => { sfx.select(); setVoting(true) }}
          className="w-full py-4 text-lg tracking-wider border-2 border-retroYellow bg-retroYellow/20 hover:bg-retroYellow/40 text-retroLight transition-colors animate-pulse">
          🗳 COBLOS!</button>
      </div>
    )
  }

  // Voting animation
  const names = ['player', 'opponent1', 'opponent2', ...(vpBetrays ? ['vp'] : [])]
  const initials = { player: playerName, opponent1: kandidats[0].name, opponent2: kandidats[1].name, vp: kandidats[2]?.name }
  const voteColors = { player: '#b39c00', opponent1: '#961313', opponent2: '#1a5c1a', vp: '#8a4a9a' }
  const totalVotes = Object.values(votes).reduce((a, b) => a + b, 0) || 1

  const maxVotes = Math.max(...Object.values(votes))
  const winnerKey = Object.keys(votes).find(k => votes[k] === maxVotes)
  const winnerName = initials[winnerKey] || '-'

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md" ref={resultRef}>
      <div className="text-center mb-6">
        {showResults ? (
          <div className="fade-in">
            <div className="text-xl text-retroYellow glow-text mb-2">📊 HASIL PEMILU 📊</div>
            <div className="text-xs text-retroLight/50 mb-4">100 TPS telah selesai menghitung suara</div>
            <div className="max-w-[200px] mx-auto mb-4">
              <img src={winnerKey === 'player' ? MENANG_IMG : 'https://ik.imagekit.io/dntonfire/image_2026-05-29_151846814.png'}
                alt="Hasil Pemilu"
                className="w-full rounded pixelated"
                style={{ imageRendering: 'pixelated' }}
                onError={(e) => { e.target.style.display = 'none' }} />
            </div>
            <div className="text-sm text-retroLight mb-2">
              Pemenang: <span className="text-retroYellow glow-text">{winnerName}</span>
            </div>
          </div>
        ) : (
          <>
            <div className="text-lg text-retroYellow glow-text mb-2 blink">MENGHITUNG SUARA...</div>
            <div className="text-xs text-retroLight/50">{voteCount} dari 100 TPS</div>
          </>
        )}
      </div>
      <div className="w-full max-w-md space-y-3 px-2">
        {names.map((n) => {
          const pct = totalVotes > 0 ? (votes[n] / totalVotes) * 100 : 0
          const isWinner = showResults && n === winnerKey
          return (
            <div key={n}>
              <div className="flex justify-between text-xs mb-1">
                <span className={`truncate max-w-[60%] ${isWinner ? 'text-retroYellow glow-text' : 'text-retroLight'}`}>
                  {isWinner ? '🏆 ' : ''}{initials[n]}
                </span>
                <span className="text-retroYellow shrink-0">{Math.round(pct)}% ({votes[n]})</span>
              </div>
              <div className="w-full bg-retroGray h-6 border border-retroGray/50">
                <div className={`h-full transition-all duration-300 ${isWinner ? 'animate-pulse' : ''}`}
                  style={{ width: `${pct}%`, background: voteColors[n] }} />
              </div>
            </div>
          )
        })}
      </div>
      </div>
      {showResults && (
        <div className="mt-4 flex flex-col items-center gap-2">
          <button onClick={downloadScreenshot} disabled={capturing}
            className="px-6 py-2 border-2 border-retroGray bg-black/40 hover:bg-retroGray/40 text-retroLight/70 hover:text-retroLight text-xs transition-colors">
            {capturing ? '📸 MEMPROSES...' : '📸 SIMPAN SEBAGAI GAMBAR'}
          </button>
          <div className="text-xs text-retroLight/40 animate-pulse">Mengalihkan ke hasil akhir...</div>
        </div>
      )}
    </div>
  )
}
