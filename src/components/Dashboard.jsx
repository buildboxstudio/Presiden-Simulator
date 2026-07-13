import { useState, useEffect, useRef } from 'react'
import { useGame } from '../context/GameContext'
import StatBar from './StatBar'
import EventCard from './EventCard'
import ActivityCard from './ActivityCard'
import PartyDemand from './PartyDemand'
import DubiProposal from './DubiProposal'
import MinisterProposal from './MinisterProposal'
import NewsTicker from './NewsTicker'
import policiesData from '../data/policies.json'
import ministerData from '../data/ministerCandidates.json'
import useSound from '../hooks/useSound'
import useBackgroundMusic from '../hooks/useBackgroundMusic'

const IDEOLOGY_COLORS = {
  Nasionalis: '#961313', Agamis: '#1a7a1a', Demokrat: '#2a6a9a',
}
const MAX_ACTIVITIES = 2

export default function Dashboard() {
  const { quarter, period, indicators, playerName, background, party, vicePresident, ministers, policies, updatePolicy, endQuarter, currentEvent, reshuffle, showQuarterReport, quarterReportText, dispatchHideReport, partyDemand, dubiProposal, saveGame, oposisiScore, historyIndicators, ministerProposal } = useGame()
  const [activeTab, setActiveTab] = useState('ringkasan')
  const [reshuffleMode, setReshuffleMode] = useState(false)
  const [reshufflingPos, setReshufflingPos] = useState(null)
  const [showActivity, setShowActivity] = useState(false)
  const [pendingActivity, setPendingActivity] = useState(false)
  const [activitiesDone, setActivitiesDone] = useState(0)
  const sfx = useSound()
  const music = useBackgroundMusic()
  const [musicOn, setMusicOn] = useState(true)

  useEffect(() => {
    music.startMusic()
    const handler = () => {
      if (!music.isPlaying()) music.startMusic()
    }
    document.addEventListener('click', handler, { once: true })
    return () => {
      document.removeEventListener('click', handler)
      music.stopMusic()
    }
  }, [])

  // Autosave setiap kali laporan kuartal muncul
  useEffect(() => {
    if (showQuarterReport) {
      saveGame()
    }
  }, [showQuarterReport])

  const handleMusicToggle = () => {
    music.toggleMusic()
    setMusicOn(!musicOn)
  }

  // When report is dismissed and no event, trigger activity
  useEffect(() => {
    if (pendingActivity && !currentEvent) {
      setShowActivity(true)
      setPendingActivity(false)
    }
  }, [pendingActivity, currentEvent])

  const handleHideReport = () => {
    sfx.click()
    dispatchHideReport()
    setActivitiesDone(0)
    setPendingActivity(true)
  }

  const handleActivityClose = () => {
    setShowActivity(false)
    const next = activitiesDone + 1
    setActivitiesDone(next)
    if (next < MAX_ACTIVITIES) {
      setTimeout(() => setPendingActivity(true), 50)
    }
  }

  const year = Math.floor((quarter - 1) / 4) + 1
  const quarterInYear = ((quarter - 1) % 4) + 1
  const maxQuarter = 20
  const partyColor = party ? IDEOLOGY_COLORS[party.ideology] || '#b39c00' : '#b39c00'

  const tabs = [
    { id: 'ringkasan', label: 'RINGKASAN' },
    { id: 'kebijakan', label: 'KEBIJAKAN' },
    { id: 'kabinet', label: 'KABINET' },
  ]

  const statMap = {
    menteri_keuangan: { label: 'Menteri Keuangan', icon: '💰', effect: 'apbn' },
    menteri_pertahanan: { label: 'Menteri Pertahanan', icon: '⚔', effect: 'keamanan' },
    menteri_kesehatan: { label: 'Menteri Kesehatan', icon: '🏥', effect: 'kesejahteraan' },
    menteri_pupr: { label: 'Menteri PUPR', icon: '🏗', effect: 'infrastruktur' },
  }

  return (
    <div className="flex-1 flex flex-col relative">
      {/* Garuda Background */}
      <div className="fixed inset-0 pointer-events-none z-0 flex items-center justify-center opacity-[0.08]">
        <img src="https://ik.imagekit.io/dntonfire/image_2026-05-29_091810373-Photoroom.png"
          alt="" className="w-full h-full object-contain" />
      </div>
      <div className="relative z-10 flex-1 flex flex-col">
        <NewsTicker />

      {/* Header */}
      <div className="bg-gradient-to-b from-black/80 to-transparent px-2 md:px-4 pt-3 pb-2 text-center border-b border-retroGray/30">
        <div className="text-[10px] md:text-xs text-retroYellow/60 uppercase tracking-widest flex items-center justify-center gap-1 md:gap-3 flex-wrap">
          <span>P{period}</span>
          <span>•</span>
          <span>T{year} K{quarter}/{maxQuarter}</span>
          <button onClick={() => { sfx.click(); saveGame() }}
            className="text-[10px] md:text-xs text-retroLight/40 hover:text-retroYellow border border-retroGray/40 px-1.5 md:px-2 py-0.5 transition-colors"
          >💾 SIMPAN</button>
          <button onClick={handleMusicToggle}
            className="text-[10px] md:text-xs border border-retroGray/40 px-1.5 md:px-2 py-0.5 transition-colors whitespace-nowrap"
            style={{ color: musicOn ? '#b39c00' : '#961313' }}
          >{musicOn ? '🔊 MUSIK' : '🔇 MUTE'}</button>
        </div>
        <h1 className="text-lg md:text-2xl text-retroLight glow-text mt-1 tracking-wider break-words">
          PRESIDEN {playerName.toUpperCase()}
        </h1>
        <div className="flex items-center justify-center gap-1 md:gap-2 text-[10px] md:text-xs text-retroLight/50 flex-wrap px-2">
          <span style={{ color: partyColor }}>■</span>
          <span className="truncate max-w-[80px] md:max-w-none">{party?.name || '-'}</span>
          <span>|</span>
          <span className="truncate max-w-[80px] md:max-w-none">{background?.name || '-'}</span>
          {vicePresident && <><span>|</span><span className="truncate max-w-[80px] md:max-w-none">W: {vicePresident.name}</span></>}
          {period === 2 && <span className="text-retroYellow blink ml-2">★ P2</span>}
        </div>
        {/* Step Indicator */}
        {(showQuarterReport || currentEvent || showActivity) && (
          <div className="flex items-center justify-center gap-1 text-[9px] md:text-xs mt-2">
            <span className={showQuarterReport ? 'text-retroYellow' : 'text-retroLight/30'}>📋 Laporan</span>
            <span className="text-retroLight/30">→</span>
            <span className={currentEvent ? 'text-retroYellow' : 'text-retroLight/30'}>⚠ Krisis</span>
            <span className="text-retroLight/30">→</span>
            <span className={showActivity && activitiesDone < MAX_ACTIVITIES ? 'text-retroYellow' : 'text-retroLight/30'}>
              🎯 Aksi {showActivity ? activitiesDone + 1 : MAX_ACTIVITIES}/{MAX_ACTIVITIES}
            </span>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 px-4 pt-2">
        {tabs.map((tab) => (
          <button key={tab.id} onClick={() => { setActiveTab(tab.id); setReshuffleMode(false); setReshufflingPos(null); sfx.click() }}
            className={`flex-1 py-2 text-sm tracking-wider border-b-2 transition-colors ${activeTab === tab.id ? 'border-retroYellow text-retroYellow' : 'border-transparent text-retroLight/40 hover:text-retroLight/70'}`}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 p-4 max-w-4xl mx-auto w-full overflow-y-auto">
        {activeTab === 'ringkasan' && (
          <div className="fade-in">
            {/* Quarter Progress Bar */}
            <div className="mb-4 bg-black/40 border-2 border-retroGray p-3">
              <div className="flex justify-between text-xs text-retroLight/60 mb-1">
                <span>Progress Periode {period}</span>
                <span>{quarter} / {maxQuarter} kuartal</span>
              </div>
              <div className="w-full bg-retroGray h-3 border border-retroGray/50">
                <div className="h-full transition-all duration-500" style={{ width: `${(quarter / maxQuarter) * 100}%`, background: '#b39c00' }} />
              </div>
            </div>

            {/* Oposisi Score Meter */}
            <div className="mb-4 bg-black/40 border-2 border-retroGray p-3">
              <div className="flex justify-between text-xs mb-1">
                <span className="text-red-400">⚡ Oposisi</span>
                <span className={oposisiScore >= 60 ? 'text-red-400 blink' : 'text-retroLight/60'}>{Math.round(oposisiScore)}%</span>
              </div>
              <div className="w-full bg-retroGray h-2 border border-retroGray/50">
                <div className="h-full transition-all duration-500" style={{ width: `${Math.min(100, oposisiScore)}%`, background: oposisiScore >= 60 ? '#961313' : oposisiScore >= 40 ? '#b39c00' : '#666' }} />
              </div>
              {oposisiScore >= 70 && <div className="text-xs text-red-400 mt-1 blink">⚠ Bahaya! Oposisi bisa menang telak!</div>}
            </div>

            {/* History Mini Chart */}
            {historyIndicators.length > 0 && (
              <div className="mb-4 bg-black/40 border-2 border-retroGray p-3">
                <div className="text-xs text-retroLight/60 mb-2">📈 Tren 10 Kuartal Terakhir</div>
                <div className="flex items-end gap-0.5" style={{ height: '80px' }}>
                  {historyIndicators.map((h, i) => (
                    <div key={i} className="flex-1 flex flex-col justify-end relative" style={{ height: '100%' }}>
                      <div className="flex gap-px" style={{ height: '100%' }}>
                        <div style={{ height: `${h.popularitas || 0}%`, background: '#8a4a9a', width: '25%', minHeight: '2px' }} title={`Pop: ${Math.round(h.popularitas)}%`} />
                        <div style={{ height: `${h.apbn || 0}%`, background: '#b39c00', width: '25%', minHeight: '2px' }} title={`APBN: ${Math.round(h.apbn)}%`} />
                        <div style={{ height: `${h.kesejahteraan || 0}%`, background: '#1a7a1a', width: '25%', minHeight: '2px' }} title={`Kes: ${Math.round(h.kesejahteraan)}%`} />
                        <div style={{ height: `${h.infrastruktur || 0}%`, background: '#2a6a9a', width: '25%', minHeight: '2px' }} title={`Inf: ${Math.round(h.infrastruktur)}%`} />
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between text-[10px] text-retroLight/30 mt-1">
                  <span>Q{Math.max(1, quarter - historyIndicators.length + 1)}</span>
                  <span>Q{quarter}</span>
                </div>
                <div className="flex gap-3 text-[10px] text-retroLight/30 mt-1 justify-center">
                  <span className="flex items-center gap-1"><span className="w-2 h-2 inline-block" style={{ background: '#8a4a9a' }} /> Pop</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 inline-block" style={{ background: '#b39c00' }} /> APBN</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 inline-block" style={{ background: '#1a7a1a' }} /> Kes</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 inline-block" style={{ background: '#2a6a9a' }} /> Inf</span>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="bg-black/40 border-2 border-retroGray p-4 pixel-border-light">
                <StatBar stat="apbn" value={indicators.apbn} />
                <StatBar stat="keamanan" value={indicators.keamanan} />
              </div>
              <div className="bg-black/40 border-2 border-retroGray p-4 pixel-border-light">
                <StatBar stat="kesejahteraan" value={indicators.kesejahteraan} />
                <StatBar stat="infrastruktur" value={indicators.infrastruktur} />
                <StatBar stat="popularitas" value={indicators.popularitas} />
              </div>
            </div>
            <button onClick={() => { sfx.select(); endQuarter() }}
              className="w-full py-4 text-lg tracking-widest border-2 border-retroYellow bg-retroYellow/20 hover:bg-retroYellow/40 text-retroLight transition-colors">
              {quarter >= maxQuarter ? '► AKHIRI MASA JABATAN ◄' : '► AKHIRI KUARTAL ◄'}
            </button>
          </div>
        )}

        {activeTab === 'kebijakan' && (
          <div className="fade-in space-y-4">
            {policiesData.map((policy) => (
              <div key={policy.id} className="bg-black/40 border-2 border-retroGray p-3 md:p-4 pixel-border-light">
                <div className="flex justify-between items-start mb-2 gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-bold text-retroLight break-words">{policy.name}</div>
                    <div className="text-xs text-retroLight/50 break-words">{policy.description}</div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-sm text-retroYellow">{policies[policy.id]}{policy.unit}</div>
                  </div>
                </div>
                <input type="range" min={policy.min} max={policy.max} value={policies[policy.id] || 0}
                  onChange={(e) => updatePolicy(policy.id, parseInt(e.target.value))}
                  className="w-full h-2 bg-retroGray appearance-none cursor-pointer" style={{ accentColor: '#b39c00' }} />
              </div>
            ))}
            <div className="text-xs text-retroLight/40 text-center mt-2">Kebijakan berlaku otomatis setiap kuartal</div>
          </div>
        )}

        {activeTab === 'kabinet' && (
          <div className="fade-in">
            {!reshuffleMode ? (
              <div className="bg-black/40 border-2 border-retroGray p-4 pixel-border-light">
                <div className="text-lg text-retroLight mb-4 glow-text text-center">KABINET PRESIDEN</div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  {Object.entries(statMap).map(([posisi, info]) => {
                    const minister = ministers[posisi]
                    return (
                      <div key={posisi} className="border border-retroGray p-3">
                        <div className="text-xs text-retroYellow flex items-center gap-1">{info.icon} {info.label}</div>
                        <div className="text-sm text-retroLight mt-1">{minister?.name || '-'}</div>
                        {minister && <div className="text-xs text-retroLight/50 mt-1">Skill: {minister.skill} | Loyal: {minister.loyalty}</div>}
                      </div>
                    )
                  })}
                </div>
                <div className="border-t border-retroGray pt-4 mt-2">
                  <div className="text-xs text-retroLight/50 mb-3">Wakil Presiden: {vicePresident?.name || 'Kosong'}</div>
                  <button onClick={() => { sfx.click(); setReshuffleMode(true) }}
                    className="w-full py-2 border border-retroYellow bg-retroYellow/10 hover:bg-retroYellow/30 text-retroYellow text-sm transition-colors">🔄 RESHUFFLE KABINET</button>
                </div>
              </div>
            ) : (
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <button onClick={() => { setReshuffleMode(false); setReshufflingPos(null); sfx.click() }}
                    className="text-xs text-retroLight/50 hover:text-retroLight px-2 border border-retroGray">◄ KEMBALI</button>
                  <div className="text-sm text-retroYellow glow-text">RESHUFFLE KABINET</div>
                </div>
                {!reshufflingPos ? (
                  <div className="grid grid-cols-1 gap-2">
                    {Object.entries(statMap).map(([posisi, info]) => (
                      <button key={posisi} onClick={() => { sfx.click(); setReshufflingPos(posisi) }}
                        className="text-left p-3 border border-retroGray bg-black/40 hover:border-retroLight/40 transition-colors">
                        <div className="flex items-center justify-between">
                          <div><div className="text-xs text-retroYellow">{info.icon} {info.label}</div><div className="text-sm text-retroLight">{ministers[posisi]?.name}</div></div>
                          <div className="text-xs text-retroLight/40">Klik untuk ganti ►</div>
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div>
                    <div className="text-sm text-retroYellow mb-3">Pilih {statMap[reshufflingPos]?.label} baru:</div>
                    <div className="space-y-2">
                      {ministerData.find((m) => m.posisi === reshufflingPos)?.candidates.map((c, i) => {
                        const isCurrent = ministers[reshufflingPos]?.name === c.name
                        return (
                          <button key={i} disabled={isCurrent}
                            onClick={() => { sfx.select(); reshuffle(reshufflingPos, { ...c, posisi: reshufflingPos }); setReshufflingPos(null); setReshuffleMode(false) }}
                            className={`w-full text-left p-3 border-2 transition-colors ${isCurrent ? 'border-retroGray bg-black/20 text-retroLight/30' : 'border-retroGray bg-black/40 hover:border-retroYellow/50'}`}>
                            <div className="flex items-center gap-3">
                              <div className="flex-1"><div className="text-sm text-retroLight">{c.name}</div><div className="text-xs text-retroLight/50">{c.desc}</div></div>
                              <div className="text-xs text-right"><div className="text-retroGreen">Skill: {c.skill}</div><div className="text-retroYellow">Loyal: {c.loyalty}</div></div>
                              {isCurrent && <div className="text-xs text-retroGray">(Aktif)</div>}
                            </div>
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {dubiProposal && <DubiProposal />}

      {ministerProposal && !currentEvent && !dubiProposal && !partyDemand && !showQuarterReport && (
        <MinisterProposal />
      )}

      {partyDemand && !currentEvent && <PartyDemand />}

      {/* Quarter Report Notification */}
      {showQuarterReport && !currentEvent && !partyDemand && (
        <div className="fixed inset-0 flex items-start justify-center bg-black/70 z-40 p-2 md:p-4 pt-8 overflow-y-auto" onClick={handleHideReport}>
          <div className="fade-in bg-retroGray border-4 border-retroLight max-w-md w-full p-3 md:p-6 pixel-border text-center my-auto" onClick={(e) => e.stopPropagation()}>
            <div className="text-xl md:text-2xl text-retroYellow mb-4">📋 LAPORAN KUARTAL</div>
            <div className="text-sm text-retroLight/80 mb-6 leading-relaxed break-words">{quarterReportText}</div>
            <button onClick={handleHideReport}
              className="px-8 py-2 border-2 border-retroLight bg-retroLight/10 hover:bg-retroLight/30 text-retroLight transition-colors">► OK ◄</button>
          </div>
        </div>
      )}

      {currentEvent && <EventCard />}

      {/* Activity Card */}
      {showActivity && !currentEvent && (
        <ActivityCard onClose={handleActivityClose} activityNum={activitiesDone + 1} maxActivities={MAX_ACTIVITIES} />
      )}
      </div>
    </div>
  )
}
