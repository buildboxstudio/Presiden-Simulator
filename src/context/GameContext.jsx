import { createContext, useContext, useReducer, useCallback } from 'react'
import eventsData from '../data/events.json'
import eventsPeriode2 from '../data/events_periode2.json'
import policiesData from '../data/policies.json'

const GameContext = createContext()

const initialState = {
  phase: 'menu',
  playerName: '',
  background: null,
  party: null,
  vicePresident: null,
  ministers: {},
  reshuffleCount: 0,
  delegateCount: 0,
  partyDemand: null,
  propores: false,
  dubiArry: false,
  timsesTeam: [],
  period: 1,
  quarter: 0,
  indicators: {
    apbn: 50,
    keamanan: 50,
    kesejahteraan: 50,
    infrastruktur: 50,
    popularitas: 50,
  },
  policies: {},
  currentEvent: null,
  usedEvents: [],
  ending: null,
  newsFeed: [],
  electionStage: 0,
  electionTrust: 50,
  vpFired: false,
  showQuarterReport: false,
  quarterReportText: '',
  qaStage: null,
  dubiProposal: null,
  oposisiScore: 0,
  historyIndicators: [],
  achievements: [],
  scenario: null,
  foreignControl: 0,
  midTermDone: false,
  disasterActive: false,
  retryCount: 0,
  checkpoint: null,
  ministerProposal: null,
  popularitasPenalty: 0,
}

function gameReducer(state, action) {
  switch (action.type) {
    case 'START_GAME': {
      const bg = action.background
      const party = action.party
      const vp = action.vicePresident
      const ministers = action.ministers
      const period = action.period || 1
      const scenario = action.scenario || null

      const buffs = { ...(bg?.buffs || {}), ...(party?.buffs || {}), ...(vp?.buffs || {}) }
      const debuffs = { ...(bg?.debuffs || {}), ...(party?.debuffs || {}), ...(vp?.debuffs || {}) }

      Object.values(ministers).forEach((m) => {
        const statMap = { menteri_keuangan: 'apbn', menteri_pertahanan: 'keamanan', menteri_kesehatan: 'kesejahteraan', menteri_pupr: 'infrastruktur' }
        const stat = statMap[m.posisi]
        if (stat) buffs[stat] = (buffs[stat] || 0) + Math.floor(m.skill / 20)
      })

      const scenarioMods = {
        stabil: { apbn: 10, keamanan: 10, kesejahteraan: 10, infrastruktur: 10, popularitas: 10 },
        krisis_ekonomi: { apbn: -20, kesejahteraan: -15, popularitas: -10 },
        konflik: { keamanan: -25, kesejahteraan: -10, popularitas: -5 },
        bencana: { infrastruktur: -25, kesejahteraan: -10, apbn: -10 },
      }

      const baseIndicators = { ...initialState.indicators }
      Object.keys(baseIndicators).forEach((k) => {
        let val = baseIndicators[k] + (buffs[k] || 0) - (debuffs[k] || 0)
        if (period === 2) val -= 15
        if (scenario && scenarioMods[scenario]) {
          val += scenarioMods[scenario][k] || 0
        }
        baseIndicators[k] = Math.max(0, Math.min(100, val))
      })

      const trustBonus = period === 2 ? Math.floor((action.trustBonus ?? state.indicators.popularitas) / 10) * 5 : 0

      const defaultPolicies = {}
      policiesData.forEach((p) => { defaultPolicies[p.id] = p.default })

        const newsItems = ['Selamat datang, Presiden ' + action.name + '!']
        if (party?.id === 'garuda_perkasa' && period === 1) {
          newsItems.push('Ketua Partai Garuda Perkasa minta 4 menteri direshuffle sebagai syarat dukungan!')
        }
        if (trustBonus > 0) {
          newsItems.push(`Popularitas periode 1 dikonversi ke Trust Score: +${trustBonus} poin!`)
        }

        return {
        ...state,
        phase: 'setup',
        playerName: action.name,
        background: bg,
        party: party,
        vicePresident: vp || state.vicePresident,
        ministers: ministers,
        reshuffleCount: 0,
        delegateCount: 0,
        partyDemand: null,
        propores: false,
        dubiArry: false,
        timsesTeam: [],
        dubiProposal: null,
        period: period,
        quarter: 1,
        indicators: baseIndicators,
        policies: defaultPolicies,
        currentEvent: null,
        usedEvents: period === 2 ? [] : state.usedEvents,
        ending: null,
        newsFeed: newsItems,
        electionStage: 0,
        electionTrust: 50 + trustBonus,
        vpFired: false,
        showQuarterReport: false,
        quarterReportText: '',
        oposisiScore: vp?.oposisiBonus || 0,
        historyIndicators: [],
        foreignControl: 0,
        midTermDone: false,
        disasterActive: false,
        scenario: scenario,
      }
    }

    case 'SHOW_QUARTER_REPORT': {
      return { ...state, showQuarterReport: true, quarterReportText: action.text }
    }

    case 'CONFIRM_SETUP': {
      return { ...state, phase: 'game', qaStage: null }
    }

    case 'HIDE_QUARTER_REPORT': {
      return { ...state, showQuarterReport: false, quarterReportText: '' }
    }

    case 'PARTY_DEMAND_RESPONSE': {
      const newIndicators = { ...state.indicators }
      Object.keys(action.effects).forEach((stat) => {
        if (newIndicators[stat] !== undefined) {
          newIndicators[stat] = Math.max(0, Math.min(100, newIndicators[stat] + action.effects[stat]))
        }
      })
      const isGameOver = checkGameOver(newIndicators)
      if (isGameOver) {
        return { ...state, phase: 'result', indicators: newIndicators, ending: isGameOver }
      }
      return {
        ...state,
        indicators: newIndicators,
        partyDemand: null,
        newsFeed: [...state.newsFeed, `Partai: ${action.label}`],
      }
    }

    case 'DUBI_PROPOSAL_RESPONSE': {
      if (action.accepted) {
        const jeblok = { keamanan: 20, kesejahteraan: 20, infrastruktur: 20, popularitas: 20 }
        return {
          ...state,
          indicators: { ...state.indicators, ...jeblok },
          oposisiScore: Math.min(100, (state.oposisiScore || 0) + 50),
          popularitasPenalty: 3,
          dubiProposal: null,
          newsFeed: [...state.newsFeed, 'DAMPAK! BUDEE ARIE berhasil amendemen UUD — Presiden 3 periode! Semua indikator (kecuali APBN) jeblok ke 20%! Oposisi naik 50%!'],
        }
      }
      const naik = {}
      Object.keys(state.indicators).forEach((s) => { naik[s] = Math.min(100, (state.indicators[s] || 0) + 5) })
      return {
        ...state,
        indicators: naik,
        dubiProposal: null,
        newsFeed: [...state.newsFeed, 'Anda tolak usulan 3 periode. Rakyat senang dengan kerendahan hati Anda — semua indikator naik 5%!'],
      }
    }

    case 'RESPOND_MINISTER_PROPOSAL': {
      const { accepted, effects, posisi } = action
      const newIndicators = { ...state.indicators }
      Object.keys(effects).forEach((stat) => {
        if (newIndicators[stat] !== undefined) {
          newIndicators[stat] = Math.max(0, Math.min(100, newIndicators[stat] + effects[stat]))
        }
      })
      const updatedMinisters = { ...state.ministers }
      const minister = updatedMinisters[posisi]
      if (minister) {
        const loyaltyChange = accepted ? 15 : -10
        updatedMinisters[posisi] = { ...minister, loyalty: Math.max(0, Math.min(100, minister.loyalty + loyaltyChange)) }
      }
      const isGameOver = checkGameOver(newIndicators)
      if (isGameOver) {
        return { ...state, phase: 'result', indicators: newIndicators, ending: isGameOver, ministers: updatedMinisters, ministerProposal: null }
      }
      return {
        ...state,
        indicators: newIndicators,
        ministers: updatedMinisters,
        ministerProposal: null,
        newsFeed: [...state.newsFeed, `Menteri ${minister?.name || posisi} merasa ${accepted ? 'didengar' : 'diabaikan'}.`],
      }
    }

    case 'ACTIVITY': {
      const newIndicators = { ...state.indicators }
      let effects = { ...action.effects }
      if (state.popularitasPenalty > 0 && effects.popularitas > 0) {
        effects.popularitas = Math.floor(effects.popularitas * 0.3)
      }
      Object.keys(effects).forEach((stat) => {
        if (newIndicators[stat] !== undefined) {
          newIndicators[stat] = Math.max(0, Math.min(100, newIndicators[stat] + effects[stat]))
        }
      })
      const oposisiPenalty = action.oposisiEffect || 0
      const newOposisi = Math.min(100, (state.oposisiScore || 0) + oposisiPenalty)
      const isGameOver = checkGameOver(newIndicators)
      if (isGameOver) {
        return { ...state, phase: 'result', indicators: newIndicators, ending: isGameOver }
      }
      return {
        ...state,
        indicators: newIndicators,
        oposisiScore: newOposisi,
        newsFeed: [...state.newsFeed, `Aktivitas: ${action.label}`],
      }
    }

    case 'END_QUARTER': {
      const newQuarter = state.quarter + 1
      let newIndicators = { ...state.indicators }
      let nextEvent = state.currentEvent
      const isPeriod2 = state.period === 2
      const brutalMulti = isPeriod2 ? 1.5 : 1

      policiesData.forEach((policy) => {
        const val = state.policies[policy.id]
        if (val !== undefined) {
          const diff = val - policy.default
          Object.keys(policy.effectsPer10).forEach((stat) => {
            newIndicators[stat] = (newIndicators[stat] || 0) + (diff / 10) * policy.effectsPer10[stat]
          })
        }
      })

      let ministerNews = []
      Object.values(state.ministers).forEach((m) => {
        if (m && m.skill && m.loyalty !== undefined) {
          const statMap = { menteri_keuangan: 'apbn', menteri_pertahanan: 'keamanan', menteri_kesehatan: 'kesejahteraan', menteri_pupr: 'infrastruktur' }
          const stat = statMap[m.posisi]
          if (stat) {
            const effectiveness = Math.floor((m.skill * (m.loyalty / 100) - 50) / 15)
            newIndicators[stat] = (newIndicators[stat] || 0) + effectiveness

            if (effectiveness < 0) {
              ministerNews.push(`${m.name} (${m.posisi}) tidak efektif — loyalitas rendah!`)
            } else if (effectiveness > 3) {
              ministerNews.push(`${m.name} (${m.posisi}) bekerja sangat baik!`)
            }

            // Enhanced corruption — loyalty <= 30 triggers corruption every quarter
            const korupsiChance = m.loyalty <= 30 ? 0.5 : m.loyalty < 40 ? 0.15 : 0
            if (korupsiChance > 0 && Math.random() < korupsiChance * brutalMulti) {
              const korupsiAmt = m.loyalty <= 30 ? 10 : 5
              newIndicators.popularitas = (newIndicators.popularitas || 0) - korupsiAmt
              newIndicators.kesejahteraan = (newIndicators.kesejahteraan || 0) - Math.floor(korupsiAmt / 2)
              newIndicators.apbn = (newIndicators.apbn || 0) - Math.floor(korupsiAmt / 2)
              ministerNews.push(`KORUPSI! ${m.name} ditangkap KPK! Popularitas -${korupsiAmt}%, APBN -${Math.floor(korupsiAmt / 2)}%!`)
            }

            // Period 2: minister conflict — ministers with low loyalty undermine each other
            if (isPeriod2 && m.loyalty < 50 && Math.random() < 0.25) {
              const conflictStat = stat === 'apbn' ? 'infrastruktur' : stat === 'infrastruktur' ? 'apbn' : stat === 'keamanan' ? 'kesejahteraan' : 'keamanan'
              newIndicators[conflictStat] = (newIndicators[conflictStat] || 0) - 4
              newIndicators.popularitas = (newIndicators.popularitas || 0) - 3
              ministerNews.push(`KONFLIK! ${m.name} berseteru dengan menteri lain! Stabilitas terganggu!`)
            }
          }
        }
      })

      // Bencana alam — random disaster event (15% chance)
      let disasterNews = []
      if (!nextEvent && Math.random() < (isPeriod2 ? 0.2 : 0.15)) {
        const disasters = [
          { name: 'Gempa Bumi', stat: 'infrastruktur', damage: 20, secondary: 'kesejahteraan', secDamage: 10 },
          { name: 'Banjir Bandang', stat: 'infrastruktur', damage: 15, secondary: 'kesejahteraan', secDamage: 8 },
          { name: 'Gagal Panen', stat: 'kesejahteraan', damage: 18, secondary: 'apbn', secDamage: 10 },
          { name: 'Tsunami', stat: 'infrastruktur', damage: 25, secondary: 'keamanan', secDamage: 12 },
          { name: 'Letusan Gunung', stat: 'kesejahteraan', damage: 15, secondary: 'infrastruktur', secDamage: 10 },
          { name: 'Kekeringan Panjang', stat: 'kesejahteraan', damage: 12, secondary: 'apbn', secDamage: 8 },
          { name: 'Wabah Penyakit', stat: 'kesejahteraan', damage: 15, secondary: 'popularitas', secDamage: 8 },
        ]
        const d = disasters[Math.floor(Math.random() * disasters.length)]
        newIndicators[d.stat] = (newIndicators[d.stat] || 0) - d.damage
        newIndicators[d.secondary] = (newIndicators[d.secondary] || 0) - d.secDamage
        disasterNews.push(`BENCANA! ${d.name} melanda! ${d.stat} -${d.damage}%, ${d.secondary} -${d.secDamage}%!`)
      }

      // Ijazah scandal — period 1 quarters 1-8
      let scandalNews = []
      if (state.period === 1 && newQuarter >= 1 && newQuarter <= 8 && Math.random() < 0.35) {
        const media = ['TV Nasional', 'Radio Kampus', 'Media Sosial', 'Koran Umum', 'YouTube']
        const med = media[Math.floor(Math.random() * media.length)]
        newIndicators.popularitas = Math.max(0, (newIndicators.popularitas || 0) - 3)
        scandalNews.push(`Boy Sukro di ${med}: "Ijazah S1 Presiden di Universitas Gandja Madat PALSU!" Popularitas turun 3%!`)
      }

      // Oposisi score — naik hanya saat popularitas turun karena keputusan pemain
      const popDrop = Math.max(0, (state.indicators.popularitas || 50) - (newIndicators.popularitas || 50))
      let newOposisiScore = state.oposisiScore || 0
      if (popDrop > 0) {
        newOposisiScore = Math.min(100, newOposisiScore + Math.floor(popDrop * 0.5))
      }

      // Party-specific events
      let partyNews = []
      if (state.period === 1 && state.party) {
        if (state.party.id === 'nurani_bangsa' && newQuarter >= 6 && newQuarter <= 14 && !nextEvent && Math.random() < 0.15) {
          newIndicators.popularitas = Math.max(0, (newIndicators.popularitas || 0) - 8)
          newIndicators.apbn = Math.max(0, (newIndicators.apbn || 0) - 10)
          partyNews.push(`SKANDAL! Menteri Agama dari ${state.party.name} korupsi dana haji Rp 2T! Popularitas dan APBN turun drastis!`)
        }
      }
      if (isPeriod2 && state.party) {
        if (state.party.id === 'reformasi_rakyat' && !nextEvent && Math.random() < 0.22) {
          const pressure = [
            { news: `${state.party.name} desak Anda dukung resolusi PBB pro-Israel.`, effects: { popularitas: -5, keamanan: -3 } },
            { news: `${state.party.name} desak Anda buka investasi perusahaan LGBT asing.`, effects: { popularitas: -8, apbn: 5 } },
            { news: `${state.party.name} desak Anda tandatangani perjanjian dagang dengan Amerika.`, effects: { popularitas: -4, kesejahteraan: 4 } },
          ]
          const p = pressure[Math.floor(Math.random() * pressure.length)]
          Object.keys(p.effects).forEach((stat) => {
            if (newIndicators[stat] !== undefined) {
              newIndicators[stat] = Math.max(0, Math.min(100, newIndicators[stat] + p.effects[stat]))
            }
          })
          partyNews.push(p.news)
        }
        if (state.party.id === 'nurani_bangsa' && !nextEvent && Math.random() < 0.2) {
          newIndicators.kesejahteraan = Math.max(0, (newIndicators.kesejahteraan || 0) - 5)
          newIndicators.popularitas = Math.max(0, (newIndicators.popularitas || 0) - 4)
          partyNews.push(`${state.party.name} desak penegakan syariat — Kesejahteraan dan Popularitas turun!`)
        }
      }

      // Desakan timses
      let timsesNews = []
      const timsesChance = isPeriod2 ? 0.3 : 0.2
      if (newQuarter >= 3 && !nextEvent && Math.random() < timsesChance) {
        newIndicators.popularitas = Math.max(0, (newIndicators.popularitas || 0) - 3)
        timsesNews.push('Tim sukses Anda mendesak diberi jabatan menteri — Popularitas turun 3%!')
      }

      // PROPRES
      let propresNews = []
      if (newIndicators.popularitas >= 80 && !state.propores) {
        newIndicators.apbn = Math.min(100, (newIndicators.apbn || 0) + 20)
        newIndicators.keamanan = Math.min(100, (newIndicators.keamanan || 0) + 10)
        propresNews.push('LOYALIS PRESIDEN terbentuk! APBN +20%, Keamanan +10%! BUDEE ARIE bergabung ke tim sukses!')
      }

      // Foreign control — slowly increases
      let newForeignControl = state.foreignControl || 0
      if (isPeriod2 && newForeignControl > 0) {
        newForeignControl = Math.min(100, newForeignControl + 1)
      }

      // Dubi Proposal trap
      let dubiProposal = state.dubiProposal
      if (isPeriod2 && newIndicators.popularitas >= 70 && !dubiProposal && !nextEvent) {
          dubiProposal = {
            id: 'dubi_3_periode',
            title: 'USULAN BUDEE ARIE: PRESIDEN 3 PERIODE',
            desc: `"Pak Presiden ${state.playerName}, rakyat mencintai Anda! Popularitas ${Math.round(newIndicators.popularitas)}%! Saya usulkan amendemen UUD agar Bapak bisa maju 3 periode. Indonesia butuh Anda!" — BUDEE ARIE, Ketua LOYALIS PRESIDEN`,
          }
      }

      // Mid-term evaluation at quarter 10
      let midTermEval = null
      if (newQuarter === 10 && !state.midTermDone) {
        const avgPop = state.historyIndicators.length > 0
          ? state.historyIndicators.reduce((s, h) => s + (h.popularitas || 0), 0) / state.historyIndicators.length
          : newIndicators.popularitas
        if (avgPop >= 60) {
          newIndicators.popularitas = Math.min(100, newIndicators.popularitas + 5)
          newIndicators.apbn = Math.min(100, newIndicators.apbn + 5)
        } else if (avgPop >= 40) {
          // Nothing, average
        } else {
          newIndicators.popularitas = Math.max(0, newIndicators.popularitas - 5)
          newOposisiScore = Math.min(100, newOposisiScore + 10)
        }
      }

      // History tracking — keep last 10 quarters
      const newHistory = [...(state.historyIndicators || [])]
      newHistory.push({ ...newIndicators })
      if (newHistory.length > 10) newHistory.shift()

      // Achievements
      const newAchievements = [...(state.achievements || [])]
      const checkAchievement = (id, name) => {
        if (!newAchievements.find(a => a.id === id)) {
          newAchievements.push({ id, name, quarter: newQuarter })
        }
      }
      if (newQuarter === 5) checkAchievement('quarter_5', '5 Kuartal Bertahan')
      if (newQuarter === 10 && !state.midTermDone) checkAchievement('mid_term', 'Setengah Periode')
      if (newQuarter === 20) checkAchievement('quarter_20', 'Satu Periode Penuh')
      if (newIndicators.popularitas >= 90) checkAchievement('popular_90', 'Popularitas 90%+')
      if (newIndicators.apbn >= 90) checkAchievement('kaya', 'APBN Melimpah')
      if (state.reshuffleCount >= 5) checkAchievement('reshuffle_5', '5× Reshuffle Kabinet')
      if (isPeriod2 && newQuarter >= 15) checkAchievement('period_2_15', 'Setengah Periode 2')
      if (dubiProposal && !state.dubiProposal) checkAchievement('dubi_trap', 'Dapat Tawaran 3 Periode')

      const quarterDiff = {}
      Object.keys(newIndicators).forEach((k) => {
        const old = state.indicators[k]
        const rounded = Math.max(0, Math.min(100, Math.round(newIndicators[k])))
        quarterDiff[k] = rounded - old
        newIndicators[k] = rounded
      })

      const isGameOver = checkGameOver(newIndicators)
      if (isGameOver) {
        return { ...state, phase: 'result', indicators: newIndicators, quarter: newQuarter, ending: isGameOver, oposisiScore: newOposisiScore, historyIndicators: newHistory }
      }

      const maxQuarter = 20
      if (newQuarter > maxQuarter) {
        if (isPeriod2) {
          return { ...state, phase: 'result', quarter: maxQuarter, indicators: newIndicators, ending: 'lulus', oposisiScore: newOposisiScore, historyIndicators: newHistory }
        }
        return { ...state, phase: 'pemilu', quarter: maxQuarter, indicators: newIndicators, currentEvent: null, electionStage: 0, electionTrust: Math.round(newIndicators.popularitas), oposisiScore: newOposisiScore, historyIndicators: newHistory }
      }

      const eventsPool = isPeriod2 ? eventsPeriode2 : eventsData
      let available = eventsPool.filter((e) => !state.usedEvents.includes(e.id))
      // Jika event habis, gunakan ulang event yang sudah dipakai
      if (available.length === 0) {
        available = eventsPool
      }
      const hasEvent = !nextEvent && available.length > 0

      if (hasEvent) {
        // Prioritaskan event yang sesuai skenario
        const scenarioEvents = state.scenario ? available.filter((e) => e.scenario === state.scenario) : []
        const pool = scenarioEvents.length > 0 ? scenarioEvents : available
        const idx = Math.floor(Math.random() * pool.length)
        nextEvent = { ...pool[idx] }
      }

      // Party demands in period 2
      let partyDemand = null
      if (isPeriod2 && !nextEvent && !dubiProposal && state.party && Math.random() < 0.4) {
        const demands = [
          {
            id: 'proyek_kader',
            title: 'Desakan Proyek untuk Kader',
            desc: `${state.party.name} mendesak Anda memberikan proyek infrastruktur ke kader partai.`,
            acceptEffects: { popularitas: 3, infrastruktur: -3, apbn: -5 },
            rejectEffects: { popularitas: -8 },
            acceptLabel: 'Setujui — bagikan proyek',
            rejectLabel: 'Tolak — risiko partai kecewa',
          },
          {
            id: 'menteri_partai',
            title: 'Desakan Kursi Menteri',
            desc: `${state.party.name} minta satu kursi menteri diisi kader partai. Reshuffle atau tolak?`,
            acceptEffects: { popularitas: 5, kesejahteraan: -3 },
            rejectEffects: { popularitas: -10 },
            acceptLabel: 'Setujui — reshuffle',
            rejectLabel: 'Tolak — partai ngambek',
          },
          {
            id: 'kebijakan_populis',
            title: 'Desakan Kebijakan Populis',
            desc: `${state.party.name} meminta Anda mengeluarkan kebijakan populis untuk menarik suara.`,
            acceptEffects: { popularitas: 8, apbn: -8 },
            rejectEffects: { popularitas: -5, keamanan: -3 },
            acceptLabel: 'Keluarkan kebijakan',
            rejectLabel: 'Tolak — terlalu mahal',
          },
          {
            id: 'reshuffle_opsisi',
            title: 'Tekanan Buang Menteri Oposisi',
            desc: `${state.party.name} tidak suka ada menteri dari kalangan oposisi. Desak untuk dipecat.`,
            acceptEffects: { popularitas: 3, keamanan: -3 },
            rejectEffects: { popularitas: -6, kesejahteraan: -2 },
            acceptLabel: 'Setujui — pecat menteri',
            rejectLabel: 'Tolak — biarkan profesional',
          },
        ]
        partyDemand = demands[Math.floor(Math.random() * demands.length)]
      }

      // Minister proposal — setiap 3 kuartal
      let ministerProposal = state.ministerProposal
      const ministerPositions = Object.keys(state.ministers)
      if (!ministerProposal && !nextEvent && ministerPositions.length > 0 && newQuarter % 3 === 0) {
        const pos = ministerPositions[Math.floor(Math.random() * ministerPositions.length)]
        const m = state.ministers[pos]
        const proposals = {
          menteri_keuangan: [
            { title: 'Reformasi Pajak', desc: `${m.name} mengusulkan reformasi pajak untuk meningkatkan penerimaan negara.`, acceptEffects: { apbn: 15, popularitas: -5, kesejahteraan: -3 }, rejectEffects: { apbn: -5, popularitas: 3 } },
            { title: 'Efisiensi Anggaran', desc: `${m.name} ingin memangkas anggaran K/L sebesar 15%.`, acceptEffects: { apbn: 10, popularitas: -3, infrastruktur: -5 }, rejectEffects: { popularitas: -3, apbn: -3 } },
          ],
          menteri_pertahanan: [
            { title: 'Modernisasi Alutsista', desc: `${m.name} mengusulkan modernisasi alat utama sistem pertahanan.`, acceptEffects: { keamanan: 12, apbn: -10 }, rejectEffects: { keamanan: -5, popularitas: -3 } },
            { title: 'Peningkatan Kesejahteraan Prajurit', desc: `${m.name} meminta kenaikan gaji TNI/POLRI.`, acceptEffects: { keamanan: 8, popularitas: 5, apbn: -8 }, rejectEffects: { keamanan: -3, popularitas: -3 } },
          ],
          menteri_kesehatan: [
            { title: 'Program Jaminan Kesehatan Universal', desc: `${m.name} mengusulkan jaminan kesehatan untuk seluruh rakyat.`, acceptEffects: { kesejahteraan: 12, apbn: -12, popularitas: 8 }, rejectEffects: { popularitas: -5, kesejahteraan: -3 } },
            { title: 'Bangun Rumah Sakit Daerah', desc: `${m.name} ingin membangun 50 RS baru di daerah terpencil.`, acceptEffects: { kesejahteraan: 10, infrastruktur: 5, apbn: -10 }, rejectEffects: { kesejahteraan: -3, popularitas: -3 } },
          ],
          menteri_pupr: [
            { title: 'Proyek Jalan Tol Trans-Sumatera', desc: `${m.name} mengusulkan percepatan pembangunan tol Trans-Sumatera.`, acceptEffects: { infrastruktur: 12, apbn: -10, popularitas: 5 }, rejectEffects: { infrastruktur: -5, popularitas: -3 } },
            { title: 'Program Hunian Layak Rakyat', desc: `${m.name} ingin membangun 1 juta rumah rakyat.`, acceptEffects: { kesejahteraan: 8, infrastruktur: 8, apbn: -12, popularitas: 8 }, rejectEffects: { kesejahteraan: -3, popularitas: -5 } },
          ],
        }
        const posProposals = proposals[pos]
        if (posProposals && posProposals.length > 0) {
          ministerProposal = { ...posProposals[Math.floor(Math.random() * posProposals.length)], posisi: pos }
        }
      }

      const diffs = Object.keys(quarterDiff).filter((k) => quarterDiff[k] !== 0)
      const reportDiffs = diffs.map((k) => {
        const v = quarterDiff[k]
        const labels = { apbn: 'APBN', keamanan: 'Keamanan', kesejahteraan: 'Kesejahteraan', infrastruktur: 'Infrastruktur', popularitas: 'Popularitas' }
        return `${labels[k]} ${v > 0 ? '+' : ''}${v}%`
      }).join(', ')

      const variasiLaporan = [
        'Kuwartal %s beres, Presiden!',
        'Laporan kuwartal %s, Pak Presiden.',
        'Kuwartal %s sudah lewat. Ini laporannya.',
        'Alhamdulillah, kuwartal %s selesai.',
        'Presiden, kuwartal %s rampung.',
        'Laporan periodik kuwartal %s, Pak.',
        'Kuwartal %s — ini ringkasannya.',
        'Masuk laporan kuwartal %s.',
        'Selesai kuwartal %s, Presiden.',
        'Presiden, begini kondisi terbaru.',
      ]
      const reportPrefix = variasiLaporan[Math.floor(Math.random() * variasiLaporan.length)].replace('%s', newQuarter)

      let reportText = ''
      const allScandalNews = [...scandalNews, ...partyNews, ...timsesNews, ...propresNews, ...disasterNews]
      const allMinisterNews = [...ministerNews, ...allScandalNews]

      // Mid-term evaluation report
      if (newQuarter === 10 && !state.midTermDone) {
        const avgPop = state.historyIndicators.length > 0
          ? state.historyIndicators.reduce((s, h) => s + (h.popularitas || 0), 0) / state.historyIndicators.length
          : newIndicators.popularitas
        let evalMsg = ''
        if (avgPop >= 60) {
          evalMsg = 'EVALUASI TENGAH PERIODE: Kinerja Anda baik! Bonus APBN +5%, Popularitas +5%!'
        } else if (avgPop >= 40) {
          evalMsg = 'EVALUASI TENGAH PERIODE: Kinerja Anda cukup. Tidak ada bonus.'
        } else {
          evalMsg = 'EVALUASI TENGAH PERIODE: Kinerja Anda buruk! Popularitas -5%, Oposisi menguat!'
        }
        if (allMinisterNews.length > 0) {
          reportText = `${reportPrefix} ${evalMsg} | ${allMinisterNews.slice(0, 2).join(' | ')}`
        } else {
          reportText = `${reportPrefix} ${evalMsg}`
        }
      } else if (allMinisterNews.length > 0) {
        reportText = `${reportPrefix} ${allMinisterNews.slice(0, 3).join(' | ')}`
      } else if (nextEvent) {
        reportText = `${reportPrefix} Ada laporan masuk untuk Presiden!`
      } else if (reportDiffs) {
        reportText = `${reportPrefix} ${reportDiffs}`
      } else {
        reportText = `${reportPrefix} Tidak ada perubahan signifikan.`
      }

      // Oposisi warning
      if (newOposisiScore >= 60 && !nextEvent) {
        reportText += ` ⚠ Oposisi: ${Math.round(newOposisiScore)}%`
      }

      const allNews = [...state.newsFeed]
      if (ministerNews.length > 0) ministerNews.forEach(n => allNews.push(n))
      if (disasterNews.length > 0) disasterNews.forEach(n => allNews.push(n))
      if (scandalNews.length > 0) scandalNews.forEach(n => allNews.push(n))
      if (partyNews.length > 0) partyNews.forEach(n => allNews.push(n))
      if (timsesNews.length > 0) timsesNews.forEach(n => allNews.push(n))
      if (propresNews.length > 0) propresNews.forEach(n => allNews.push(n))
      allNews.push(reportText)

      return {
        ...state,
        quarter: newQuarter,
        indicators: newIndicators,
        currentEvent: nextEvent,
        partyDemand: partyDemand,
        propores: state.propores || propresNews.length > 0,
        dubiArry: state.dubiArry || propresNews.length > 0,
        dubiProposal: dubiProposal,
        showQuarterReport: !dubiProposal,
        quarterReportText: reportText,
        usedEvents: nextEvent ? [...state.usedEvents, nextEvent.id] : state.usedEvents,
        newsFeed: allNews,
        oposisiScore: newOposisiScore,
        historyIndicators: newHistory,
        foreignControl: newForeignControl,
        midTermDone: state.midTermDone || newQuarter === 10,
        achievements: newAchievements,
        ministerProposal: ministerProposal,
        popularitasPenalty: Math.max(0, (state.popularitasPenalty || 0) - 1),
        checkpoint: newQuarter % 2 === 0 ? {
          quarter: newQuarter,
          indicators: { ...newIndicators },
          ministers: { ...state.ministers },
          policies: { ...state.policies },
          oposisiScore: newOposisiScore,
          historyIndicators: [...newHistory],
          newsFeed: [...allNews],
          achievements: [...newAchievements],
          usedEvents: [...state.usedEvents],
          propores: state.propores || propresNews.length > 0,
          dubiArry: state.dubiArry || propresNews.length > 0,
          foreignControl: newForeignControl,
          period: state.period,
          playerName: state.playerName,
          background: state.background,
          party: state.party,
          vicePresident: state.vicePresident,
          reshuffleCount: state.reshuffleCount,
          delegateCount: state.delegateCount,
          scenario: state.scenario,
          vpFired: state.vpFired,
          midTermDone: state.midTermDone || newQuarter === 10,
          popularitasPenalty: state.popularitasPenalty || 0,
        } : state.checkpoint,
      }
    }

    case 'SET_VICE_PRESIDENT': {
      return { ...state, vicePresident: action.vp, newsFeed: [...state.newsFeed, `${action.vp.name} ditunjuk sebagai wakil presiden.`] }
    }

    case 'RESOLVE_EVENT': {
      const { effects, delegated } = action
      let newIndicators = { ...state.indicators }
      Object.keys(effects).forEach((stat) => {
        if (newIndicators[stat] !== undefined) {
          newIndicators[stat] = Math.max(0, Math.min(100, newIndicators[stat] + effects[stat]))
        }
      })
      // Delegation penalty: every delegation drops popularity
      let delegateCount = state.delegateCount || 0
      let newsExtra = []
      if (delegated) {
        delegateCount += 1
        const popPenalty = Math.min(3 + delegateCount * 2, 20)
        newIndicators.popularitas = Math.max(0, newIndicators.popularitas - popPenalty)
        newsExtra.push(`Delegasi ke-${delegateCount}: Popularitas turun ${popPenalty}% — rakyat menilai Anda lemah!`)
      }
      const isGameOver = checkGameOver(newIndicators)
      if (isGameOver) {
        return { ...state, phase: 'result', indicators: newIndicators, ending: isGameOver }
      }
      return {
        ...state,
        indicators: newIndicators,
        delegateCount,
        currentEvent: null,
        newsFeed: [...state.newsFeed, ...newsExtra],
      }
    }

    case 'UPDATE_POLICY': {
      return { ...state, policies: { ...state.policies, [action.policyId]: action.value } }
    }

    case 'RESHUFFLE': {
      const reshuffleCount = (state.reshuffleCount || 0) + 1
      let popCost = 5
      if (reshuffleCount >= 3) popCost = 12
      const newPopularitas = Math.max(0, state.indicators.popularitas - popCost)
      const newIndicators = { ...state.indicators, popularitas: newPopularitas }
      const isGameOver = checkGameOver(newIndicators)
      if (isGameOver) {
        return { ...state, phase: 'result', indicators: newIndicators, ending: isGameOver }
      }
      return {
        ...state,
        ministers: { ...state.ministers, [action.posisi]: action.candidate },
        indicators: newIndicators,
        reshuffleCount,
        newsFeed: [...state.newsFeed, `Reshuffle! ${action.candidate.name} jadi ${action.posisi}.`]
      }
    }

    case 'SET_ELECTION_STAGE': {
      return { ...state, electionStage: action.stage }
    }

    case 'SET_ELECTION_TRUST': {
      return { ...state, electionTrust: Math.max(0, Math.min(100, state.electionTrust + action.delta)) }
    }

    case 'ELECTION_RESULT': {
      const vpBetrays = state.vicePresident && state.vicePresident.will_betray && !state.vpFired
      const randomSwing = Math.floor(Math.random() * 41) - 20
      let totalScore = state.electionTrust + state.indicators.popularitas * 0.3 + state.indicators.kesejahteraan * 0.2 + randomSwing
      if (state.foreignControl > 20) totalScore -= Math.min(30, state.foreignControl)
      if (vpBetrays) totalScore -= 20
      // Oposisi tinggi bikin lebih susah menang, tapi tidak auto-kalah
      if (state.oposisiScore >= 70) totalScore -= 15
      if (totalScore >= 50) {
        return { ...state, phase: 'result', ending: 'menang_pemilu', electionStage: 3 }
      }
      return { ...state, phase: 'result', ending: vpBetrays ? 'kalah_pemilu_vp' : 'kalah_pemilu', electionStage: 3 }
    }

    case 'GO_TO_PERIOD2_SETUP': {
      return { ...state, phase: 'period2_setup' }
    }

    case 'FIRE_VP': {
      return { ...state, vicePresident: null, vpFired: true, newsFeed: [...state.newsFeed, 'Wakil presiden dipecat!'] }
    }

    case 'RESET': {
      return { ...initialState }
    }

    case 'RETRY_GAME': {
      if (state.checkpoint) {
        const cp = state.checkpoint
        return { ...cp, phase: 'game', retryCount: (state.retryCount || 0) + 1 }
      }
      return { ...initialState, retryCount: (state.retryCount || 0) + 1 }
    }

    case 'LOAD_GAME': {
      return { ...action.savedState, phase: 'game', propores: action.savedState.propores || false, dubiArry: action.savedState.dubiArry || false, timsesTeam: action.savedState.timsesTeam || [] }
    }

    case 'QA_SKIP': {
      const { target, stage } = action
      const qaBase = { ...state, qaStage: target }
      if (target === 'pemilu_program') return { ...qaBase, phase: 'pemilu', electionStage: 0 }
      if (target === 'pemilu_debat') return { ...qaBase, phase: 'pemilu', electionStage: 1 }
      if (target === 'pemilu_kampanye') return { ...qaBase, phase: 'pemilu', electionStage: 2 }
      if (target === 'pemilu_timses') return { ...qaBase, phase: 'pemilu', electionStage: stage ?? 0 }
      if (target === 'menang') return { ...qaBase, phase: 'result', ending: 'lulus' }
      if (target === 'kalah') return { ...qaBase, phase: 'result', ending: 'kalah_pemilu' }
      return { ...qaBase, phase: target }
    }

    default:
      return state
  }
}

function checkGameOver(indicators) {
  if (indicators.apbn <= 0) return 'krisis_anggaran'
  if (indicators.keamanan <= 0) return 'kudeta'
  if (indicators.kesejahteraan <= 0) return 'revolusi'
  if (indicators.infrastruktur <= 0) return 'kehancuran_infrastruktur'
  if (indicators.popularitas <= 0) return 'impeachment'
  return null
}

export function GameProvider({ children }) {
  const [state, dispatch] = useReducer(gameReducer, initialState)

  const startGame = useCallback((name, background, party, vicePresident, ministers, period, scenario) => {
    dispatch({ type: 'START_GAME', name, background, party, vicePresident, ministers, period, scenario })
  }, [])

  const endQuarter = useCallback(() => dispatch({ type: 'END_QUARTER' }), [])
  const resolveEvent = useCallback((effects, delegated) => dispatch({ type: 'RESOLVE_EVENT', effects, delegated }), [])
  const updatePolicy = useCallback((pid, val) => dispatch({ type: 'UPDATE_POLICY', policyId: pid, value: val }), [])
  const reshuffle = useCallback((pos, cand) => dispatch({ type: 'RESHUFFLE', posisi: pos, candidate: cand }), [])
  const setElectionStage = useCallback((s) => dispatch({ type: 'SET_ELECTION_STAGE', stage: s }), [])
  const setElectionTrust = useCallback((d) => dispatch({ type: 'SET_ELECTION_TRUST', delta: d }), [])
  const electionResult = useCallback(() => dispatch({ type: 'ELECTION_RESULT' }), [])
  const fireVP = useCallback(() => dispatch({ type: 'FIRE_VP' }), [])
  const setVicePresident = useCallback((vp) => dispatch({ type: 'SET_VICE_PRESIDENT', vp }), [])
  const dispatchShowReport = useCallback((t) => dispatch({ type: 'SHOW_QUARTER_REPORT', text: t }), [])
  const dispatchHideReport = useCallback(() => dispatch({ type: 'HIDE_QUARTER_REPORT' }), [])
  const confirmSetup = useCallback(() => dispatch({ type: 'CONFIRM_SETUP' }), [])
  const doActivity = useCallback((label, effects, oposisiEffect) => dispatch({ type: 'ACTIVITY', label, effects, oposisiEffect }), [])
  const respondPartyDemand = useCallback((label, effects) => dispatch({ type: 'PARTY_DEMAND_RESPONSE', label, effects }), [])
  const respondDubiProposal = useCallback((accepted) => dispatch({ type: 'DUBI_PROPOSAL_RESPONSE', accepted }), [])
  const respondMinisterProposal = useCallback((accepted, effects, posisi) => dispatch({ type: 'RESPOND_MINISTER_PROPOSAL', accepted, effects, posisi }), [])
  const resetGame = useCallback(() => dispatch({ type: 'RESET' }), [])
  const retryGame = useCallback(() => dispatch({ type: 'RETRY_GAME' }), [])
  const qaSkip = useCallback((target, stage) => dispatch({ type: 'QA_SKIP', target, stage }), [])

  const saveGame = useCallback(() => {
    const saveData = { ...state }
    delete saveData.phase
    delete saveData.currentEvent
    delete saveData.showQuarterReport
    delete saveData.quarterReportText
    localStorage.setItem('presiden_save', JSON.stringify(saveData))
  }, [state])

  const loadGame = useCallback(() => {
    const raw = localStorage.getItem('presiden_save')
    if (!raw) return false
    try {
      const savedState = JSON.parse(raw)
      dispatch({ type: 'LOAD_GAME', savedState })
      return true
    } catch (e) {
      return false
    }
  }, [])

  const hasSavedGame = useCallback(() => {
    return localStorage.getItem('presiden_save') !== null
  }, [])

  const deleteSave = useCallback(() => {
    localStorage.removeItem('presiden_save')
  }, [])

  // Career stats
  const getCareerStats = useCallback(() => {
    try {
      const raw = localStorage.getItem('presiden_career')
      return raw ? JSON.parse(raw) : { gamesPlayed: 0, gamesWon: 0, gamesLost: 0, totalQuarters: 0 }
    } catch { return { gamesPlayed: 0, gamesWon: 0, gamesLost: 0, totalQuarters: 0 } }
  }, [])

  const updateCareerStats = useCallback((won, quartersPlayed) => {
    const stats = getCareerStats()
    stats.gamesPlayed += 1
    if (won) stats.gamesWon += 1
    else stats.gamesLost += 1
    stats.totalQuarters += quartersPlayed || 0
    localStorage.setItem('presiden_career', JSON.stringify(stats))
  }, [getCareerStats])

  const getUnlockedScenarios = useCallback(() => {
    try {
      const raw = localStorage.getItem('presiden_unlocks')
      return raw ? JSON.parse(raw) : []
    } catch { return [] }
  }, [])

  const unlockScenario = useCallback((scenarioId) => {
    const current = getUnlockedScenarios()
    if (!current.includes(scenarioId)) {
      current.push(scenarioId)
      localStorage.setItem('presiden_unlocks', JSON.stringify(current))
    }
  }, [getUnlockedScenarios])

  const goToPeriod2Setup = useCallback(() => dispatch({ type: 'GO_TO_PERIOD2_SETUP' }), [])

  return (
    <GameContext.Provider value={{
      ...state,
      startGame, endQuarter, resolveEvent, updatePolicy, reshuffle,
      setElectionStage, setElectionTrust, electionResult, fireVP, setVicePresident,       doActivity, respondPartyDemand, respondDubiProposal, respondMinisterProposal, resetGame, retryGame,
      saveGame, loadGame, hasSavedGame, deleteSave,
      getCareerStats, updateCareerStats, getUnlockedScenarios, unlockScenario,
      dispatchShowReport, dispatchHideReport, confirmSetup, qaSkip, goToPeriod2Setup,
    }}>
      {children}
    </GameContext.Provider>
  )
}

export function useGame() {
  const ctx = useContext(GameContext)
  if (!ctx) throw new Error('useGame must be used within GameProvider')
  return ctx
}
