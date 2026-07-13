import { useState, useMemo, useEffect, useRef } from 'react'
import { useGame } from '../context/GameContext'
import useSound from '../hooks/useSound'

const DEDDY_IMG = 'https://ik.imagekit.io/dntonfire/image_2026-05-29_083324899.png'
const DEADLINE_SECONDS = 20

function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export default function EventCard() {
  const { currentEvent, vicePresident, ministers, resolveEvent, dubiArry } = useGame()
  const [showChoices, setShowChoices] = useState(false)
  const [imgError, setImgError] = useState(false)
  const [timeLeft, setTimeLeft] = useState(null)
  const [deadlinePassed, setDeadlinePassed] = useState(false)
  const [autoSelected, setAutoSelected] = useState(false)
  const sfx = useSound()
  const timerRef = useRef(null)
  const hasResolved = useRef(false)

  const shuffledChoices = useMemo(() => {
    if (!currentEvent) return []
    return shuffle(currentEvent.choices)
  }, [currentEvent])

  const relevantMinister = useMemo(() => {
    if (!currentEvent || !shuffledChoices || !shuffledChoices[0]) return null
    const statEffects = { apbn: 0, keamanan: 0, kesejahteraan: 0, infrastruktur: 0, popularitas: 0 }
    shuffledChoices.forEach((c) => {
      Object.entries(c.effects || {}).forEach(([s, v]) => {
        statEffects[s] = (statEffects[s] || 0) + Math.abs(v)
      })
    })
    const primaryStat = Object.entries(statEffects).sort((a, b) => b[1] - a[1])[0]?.[0]
    if (!primaryStat) return null
    const statMap = { apbn: 'menteri_keuangan', keamanan: 'menteri_pertahanan', kesejahteraan: 'menteri_kesehatan', infrastruktur: 'menteri_pupr' }
    const posisi = statMap[primaryStat]
    if (!posisi) return null
    return ministers[posisi] || null
  }, [currentEvent, ministers, shuffledChoices])

  // Deadline timer
  useEffect(() => {
    if (!showChoices || deadlinePassed) return
    setTimeLeft(DEADLINE_SECONDS)
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current)
          setDeadlinePassed(true)
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(timerRef.current)
  }, [showChoices, deadlinePassed])

  // Auto-select when deadline passes
  useEffect(() => {
    if (!deadlinePassed || autoSelected || hasResolved.current) return
    setAutoSelected(true)
    sfx.buzzer && sfx.buzzer()
    const randomIdx = Math.floor(Math.random() * shuffledChoices.length)
    const choice = shuffledChoices[randomIdx]
    setTimeout(() => {
      hasResolved.current = true
      resolveEvent(choice.effects, false)
    }, 1500)
  }, [deadlinePassed, autoSelected, shuffledChoices, sfx, resolveEvent])

  if (!currentEvent) return null

  if (!showChoices) {
    sfx.event()
    return (
      <div className="fade-in fixed inset-0 flex items-start justify-center bg-black/90 z-50 p-4 pt-8 overflow-y-auto">
        <div className="bg-retroGray border-4 border-retroLight max-w-lg w-full p-6 pixel-border text-center my-auto">
          <div className="text-lg text-retroYellow mb-3 tracking-wider">🗣 SEKRETARIS KABINET</div>
          <div className="w-20 h-20 mx-auto mb-4 bg-black border-2 border-retroLight flex items-center justify-center overflow-hidden">
            {!imgError ? (
              <img src={DEDDY_IMG} alt="Deddy" className="w-full h-full object-cover" onError={() => setImgError(true)} />
            ) : (
              <span className="text-3xl">👨‍💼</span>
            )}
          </div>
          <div className="text-sm text-retroLight/80 mb-6 leading-relaxed italic px-2">
            "{currentEvent.deddy_intro || `Lapor Presiden! ${currentEvent.description}`}"
          </div>
          <div className="text-xs text-retroLight/40 mb-4">— Deddy, Sekretaris Kabinet —</div>
          <button
            onClick={() => { sfx.click(); setShowChoices(true) }}
            className="px-8 py-3 border-2 border-retroYellow bg-retroYellow/20 hover:bg-retroYellow/40 text-retroLight transition-colors animate-pulse"
          >► LAPORAN DITERIMA ◄</button>
        </div>
      </div>
    )
  }

  const vpHint = vicePresident ? currentEvent.vp_advice : null

  return (
    <div className="fade-in fixed inset-0 flex items-start justify-center bg-black/80 z-50 p-4 pt-8 overflow-y-auto">
      <div className="bg-retroGray border-4 border-retroLight max-w-lg w-full p-6 pixel-border my-auto" style={{ maxHeight: '85vh', overflowY: 'auto' }}>
        <div className="flex items-center justify-between mb-3">
          <span className="text-retroYellow text-lg tracking-wider">⚠ KRISIS ⚠</span>
          {timeLeft !== null && (
            <div className={`text-sm font-bold ${timeLeft <= 5 ? 'text-red-400 animate-pulse' : 'text-retroYellow'}`}>
              ⏱ {timeLeft}s
            </div>
          )}
        </div>
        {deadlinePassed && !autoSelected && (
          <div className="mb-4 p-3 border-2 border-red-500 bg-red-900/20 shake text-center">
            <div className="text-red-400 text-sm font-bold">⏰ WAKTU HABIS!</div>
            <div className="text-xs text-red-300/70 mt-1">Memilih secara acak...</div>
          </div>
        )}
        <h2 className="text-xl text-retroLight mb-3 glow-text">{currentEvent.title}</h2>
        <p className="text-sm text-retroLight/80 mb-4 leading-relaxed">{currentEvent.description}</p>

        {vpHint && (
          <div className="mb-4 p-3 border border-retroGreen bg-retroGreen/10">
            <div className="text-xs text-retroYellow mb-1">💬 Wakil Presiden {vicePresident.name}:</div>
            <div className="text-sm italic text-retroLight/80">"{vpHint.advice}"</div>
          </div>
        )}

        {dubiArry && (
          <div className="mb-4 p-3 border border-red-800 bg-red-900/10">
            <div className="text-xs text-red-400 mb-1">🦅 BUDEE ARIE (LOYALIS PRESIDEN):</div>
            <div className="text-sm italic text-red-300/70">"Pak Presiden, lupakan menteri dan wapres! Rakyat ingin aksi tegas! Ambil risiko, buktikan Anda pemimpin sejati!"</div>
          </div>
        )}

        {relevantMinister && (
          <div className="mb-4 p-3 border border-retroLight/20 bg-blue-900/10">
            <div className="text-xs text-blue-300 mb-1">📊 Menteri Terkait — {relevantMinister.name}:</div>
            <div className="text-xs text-retroLight/60">
              Skill: {relevantMinister.skill} | Loyalitas: {relevantMinister.loyalty}
            </div>
          </div>
        )}

        <div className="space-y-3">
          {shuffledChoices.map((choice, idx) => (
            <button
              key={idx}
              disabled={deadlinePassed}
              onClick={() => {
                if (hasResolved.current) return
                hasResolved.current = true
                clearInterval(timerRef.current)
                sfx.select()
                resolveEvent(choice.effects, false)
              }}
              className={`w-full text-left px-4 py-3 border-2 ${
                deadlinePassed
                  ? 'border-retroGray bg-black/20 text-retroLight/30 cursor-not-allowed'
                  : 'border-retroLight/30 bg-black/40 hover:bg-retroRed/30 hover:border-retroLight transition-colors'
              } text-sm`}
            >
              <span className="text-retroYellow mr-2">[{idx + 1}]</span>
              {choice.label}
            </button>
          ))}

          {relevantMinister && !deadlinePassed && (
            <div className="border-t border-retroGray/30 pt-3 mt-3">
              <button
                onClick={() => {
                  if (hasResolved.current) return
                  hasResolved.current = true
                  clearInterval(timerRef.current)
                  sfx.select()

                  // Score each choice by net effect
                  const scored = shuffledChoices.map((c) => {
                    const net = Object.entries(c.effects || {}).reduce((sum, [, v]) => sum + v, 0)
                    return { choice: c, net }
                  }).sort((a, b) => b.net - a.net)

                  let pick
                  const skill = relevantMinister.skill || 50
                  const loyalty = relevantMinister.loyalty || 50
                  const sabotaging = loyalty < 30 && Math.random() < 0.3

                  if (sabotaging || skill < 60) {
                    pick = scored[scored.length - 1].choice
                  } else if (skill >= 80) {
                    pick = scored[0].choice
                  } else {
                    pick = scored[Math.random() < 0.5 ? 0 : 1].choice
                  }

                  resolveEvent(pick.effects, true)
                }}
                className="w-full text-left px-4 py-3 border-2 border-blue-500/50 bg-blue-900/20 hover:bg-blue-900/40 hover:border-blue-400 transition-colors text-sm"
              >
                <span className="text-blue-300 mr-2">📋</span>
                Delegasikan ke <span className="text-retroYellow">{relevantMinister.name}</span>
                <span className="text-xs text-retroLight/40 ml-2">
                  (skill {relevantMinister.skill}, loyal {relevantMinister.loyalty})
                </span>
              </button>
            </div>
          )}
        </div>
        <div className="mt-4 text-center text-xs text-retroLight/40">
          {deadlinePassed ? 'Mendapatkan respons otomatis...' : 'Pilih dengan bijak, Presiden...'}
        </div>
      </div>
    </div>
  )
}
