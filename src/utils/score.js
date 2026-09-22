const LS_KEY = 'presiden_leaderboard'

export function calcFinalScore({ ending, indicators = {}, quarter = 0, achievements = [], reshuffleCount = 0, oposisiScore = 0 }) {
  const vals = Object.values(indicators).map((v) => Number(v) || 0)
  const avg = vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : 0
  const endBonus = ending === 'lulus' ? 15 : ending === 'menang_pemilu' ? 10 : 0
  const achBonus = Math.min(achievements.length || 0, 8)
  const surviveBonus = Math.min((quarter || 0) / 4, 5)
  const reshPenalty = Math.min(reshuffleCount || 0, 5)
  const oposisiPenalty = Math.round((oposisiScore || 0) / 10)
  const raw = avg + endBonus + achBonus + surviveBonus - reshPenalty - oposisiPenalty
  return Math.max(0, Math.min(100, Math.round(raw)))
}

export function buildShareCaption({ playerName, typeLabel, score, endingTitle, quarter }) {
  const name = (playerName || 'Tanpa Nama').toUpperCase()
  return `Saya jadi ${typeLabel} di PRESIDEN SIMULATOR! Skor ${score}/100 (${endingTitle}, ${quarter || 0} kuartal). Berani jadi presiden? Main: https://buildboxstudio.github.io/Presiden-Simulator/ #PresidenSimulator — ${name}`
}

export function getLocalLeaderboard() {
  try {
    const raw = localStorage.getItem(LS_KEY)
    const list = raw ? JSON.parse(raw) : []
    return Array.isArray(list) ? list : []
  } catch { return [] }
}

export function saveLocalScore(entry) {
  const list = getLocalLeaderboard()
  list.push({ ...entry, date: new Date().toISOString().slice(0, 10) })
  list.sort((a, b) => (b.score - a.score) || ((b.quarter || 0) - (a.quarter || 0)))
  const top = list.slice(0, 10)
  try { localStorage.setItem(LS_KEY, JSON.stringify(top)) } catch { /* ignore */ }
  return top
}
