# 02 — Arsitektur (Architecture)

## 1. Lapisan Arsitektur

```
┌─────────────────────────────────────────────────────────┐
│  CONTENT (data-driven)                                   │
│  src/data/*.json — events, policies, ministers, ...      │
└──────────────────────────┬──────────────────────────────┘
                           ▼
┌─────────────────────────────────────────────────────────┐
│  STATE (single source of truth)                          │
│  src/context/GameContext.jsx                             │
│  • initialState (36 field)                               │
│  • gameReducer (action types UPPER_SNAKE)                │
│  • localStorage helpers (save/load/career/unlocks)       │
│  • hook useGame()                                        │
└──────────────────────────┬──────────────────────────────┘
                           ▼
┌─────────────────────────────────────────────────────────┐
│  ORCHESTRATION (phase routing + 16:9 scaling)            │
│  src/App.jsx — render komponen sesuai state.phase        │
└──────────────────────────┬──────────────────────────────┘
                           ▼
┌─────────────────────────────────────────────────────────┐
│  UI COMPONENTS (17) + HOOKS (2)                          │
│  components/TitleScreen, Dashboard, DebatRoom, ...       │
│  hooks/useSound (WebAudio), useBackgroundMusic (bgm)     │
└─────────────────────────────────────────────────────────┘
```

Aliran: komponen memanggil fungsi dari `useGame()` → `dispatch(action)` → `gameReducer` menghasilkan state baru → provider re-render seluruh tree yang memakai context.

## 2. Struktur State (`initialState` di GameContext.jsx)

Kelompok field:

| Kelompok | Field |
|---|---|
| Identitas | `phase`, `playerName`, `background`, `party`, `vicePresident`, `ministers`, `scenario` |
| Progres | `period`, `quarter` (1–40), `reshuffleCount`, `delegateCount`, `retryCount`, `checkpoint` |
| Indikator | `indicators {apbn, keamanan, kesejahteraan, infrastruktur, popularitas}` + `historyIndicators` (10 terakhir) |
| Kebijakan | `policies` (map id → value) |
| Konten aktif | `currentEvent`, `partyDemand`, `ministerProposal`, `dubiProposal`, `qaStage` |
| Perekonomian politik | `oposisiScore`, `electionTrust`, `electionStage`, `foreignControl`, `popularitasPenalty` |
| Buku/lainnya | `newsFeed`, `achievements`, `usedEvents`, `timsesTeam`, `propores`, `dubiArry`, `vpFired`, `midTermDone`, `disasterActive` (tak terpakai), `showQuarterReport`, `quarterReportText` |

## 3. Action Utama (reducer)

| Action | Fungsi |
|---|---|
| `START_GAME` | Bangun indikator awal dari buffs background+partai+wapres+menteri+skenario |
| `END_QUARTER` | **Pipeline inti** (lihat bawah) |
| `ACTIVITY` | Terapkan efek kegiatan ± penalti popularitas |
| `RESOLVE_EVENT` | Terapkan efek pilihan event + penalti delegasi |
| `PARTY_DEMAND_RESPONSE` / `RESPOND_MINISTER_PROPOSAL` / `DUBI_PROPOSAL_RESPONSE` | Respons modal |
| `UPDATE_POLICY` / `RESHUFFLE` | Kebijakan & ganti menteri |
| `ELECTION_RESULT` | Hitung kemenangan pemilu |
| `RETRY_GAME` / `LOAD_GAME` / `RESET` | Checkpoint, save, reset |
| `QA_SKIP` | Lompat fase (QA test mode) |

## 4. Pipeline `END_QUARTER` (urutan aplikasi efek)

1. Efek kebijakan (diff vs default, per 10)
2. Efektivitas menteri (skill × loyalty) + korupsi + konflik (P2)
3. Bencana acak (15–20%)
4. Skandal ijazah "Boy Sukro" (P1, Q1–8, 35%)
5. Oposisi naik (50% dari penurunan popularitas)
6. Event khusus partai + desakan timses
7. PROPRES/LOYALIS (popularitas ≥ 80) → Budee Arie
8. `foreignControl` (P2, +1/kuartal — saat ini tidak pernah aktif, lihat bug)
9. Usulan 3 periode (popularitas ≥ 70, P2)
10. Evaluasi tengah periode (Q10) & achievements
11. Riwayat indikator (max 10) & laporan kuartal
12. Cek game over → pilih event berikutnya (filter skenario) / party demand / proposal menteri (tiap 3 kuartal)
13. Simpan checkpoint tiap 2 kuartal

## 5. Layout & Responsif

- `App.jsx` memakai design canvas **1280×720 (16:9)**.
- **Landscape/PC:** `scale()` agar panggung mengisi viewport (`Math.min(vw/1280, vh/720)`).
- **Portrait/mobile:** fallback natural full-width (`min-height: 100vh`).
- Design tokens di `src/index.css` (`@theme`): `retroRed #961313`, `retroGreen #1a5c1a`, `retroYellow #b39c00`, `retroGray #3a3a3a`, `retroLight #dfdfcf`, font `VT323`.

## 6. Hutang Arsitektur (diketahui)

1. `GameContext.jsx` **897 baris** — reducer `END_QUARTER` ~300 baris. Target: pecah ke modul per-sistem (menteri, bencana, oposisi, laporan).
2. `DebatRoom.jsx` **765 baris** — 10+ fase UI dalam 1 komponen. Target: sub-komponen per babak.
3. Random di dalam reducer (`END_QUARTER`) — menyulitkan unit test deterministik. Target: payload-driven.
4. `if (false && ...)` dead code di DebatRoom (layar ganti wapres).
5. `foreignControl` & `disasterActive` state mati (tidak pernah aktif).
