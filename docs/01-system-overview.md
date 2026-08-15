# 01 — Gambaran Sistem (System Overview)

## 1. Ringkasan

**PRESIDEN SIMULATOR** adalah game simulasi pemerintahan berbasis web (single-page application) di mana pemain berperan sebagai Presiden Indonesia selama **2 periode**, masing-masing **20 kuartal** (1 kuartal ≈ 3 bulan fiktif; ~20–30 menit waktu main per periode).

Game 100% berjalan di browser (frontend-only). Tidak ada server backend. Semua state tersimpan di memori React + `localStorage` untuk persistensi.

## 2. Alur Permainan (Phase State Machine)

```
MENU (TitleScreen)
  → KUSTOMISASI (nama, background, partai, wapres, menteri, skenario)
  → POLICY SETUP (atur 6 kebijakan)        [phase: setup]
  → DASHBOARD (kelola 20 kuartal)          [phase: game]
      ├─ ulangi: laporan kuartal → krisis/desakan → 2 aksi kegiatan
      ├─ game over bila indikator = 0      [phase: result]
      └─ kuartal 21 → PEMILU               [phase: pemilu]
  → PEMILU (3 babak: visi-misi, debat, kampanye+suara)
      ├─ kalah → result (kalah_pemilu / kalah_pemilu_vp)
      └─ menang → PERIODE 2 SETUP (wapres baru, reshuffle opsional) [phase: period2_setup]
  → PERIODE 2 (lagi 20 kuartal + mekanik baru) [phase: game]
  → kuartal 41 → RESULT 'lulus' (INDONESIA EMAS) [phase: result]
```

Phase di-render oleh `App.jsx` berdasarkan `state.phase` dari `GameContext`.

## 3. Indikator Negara (0–100)

| Key | Indikator | Game over di 0 |
|---|---|---|
| `apbn` | APBN | `krisis_anggaran` (bangkrut) |
| `keamanan` | Keamanan | `kudeta` |
| `kesejahteraan` | Kesejahteraan | `revolusi` |
| `infrastruktur` | Infrastruktur | `kehancuran_infrastruktur` |
| `popularitas` | Popularitas | `impeachment` |

## 4. Sistem Utama

| Sistem | Cara kerja | File |
|---|---|---|
| Kebijakan (6) | Slider 0–100; efek diterapkan otomatis tiap kuartal (`diff/default/10 × effectsPer10`) | `data/policies.json` |
| Menteri (4) | Skill + Loyalitas; efektivitas kuartalan; korupsi bila loyal < 40; konflik antar-menteri (P2); reshuffle berbayar popularitas | `data/ministerCandidates.json` |
| Wapres | Buff/debuff; saran di event (`vp_advice`); bisa berkhianat di pemilu (`will_betray`) | `data/vicePresidents.json` |
| Krisis/Event | 29 event P1 + 19 event P2, deadline 20 detik, pilihan acak, bisa didelegasikan ke menteri terkait | `data/events.json`, `events_periode2.json` |
| Kegiatan | 2 aksi/kuartal dari 7 kegiatan; 20% chance event negatif menyelingi | `components/ActivityCard.jsx` |
| Oposisi Score | Naik saat popularitas turun; ≥70% = bahaya kalah telak | `GameContext.jsx` |
| Timses & LOYALIS | Tim sukses 3 anggota untuk kampanye; popularitas ≥80 memicu PROPRES + Budee Arie | `DebatRoom.jsx` |
| Trust Score (pemilu) | 0–100; dimodifikasi oleh visi-misi, debat, kampanye, timses | `DebatRoom.jsx` |
| Checkpoint & Retry | Checkpoint tiap 2 kuartal; 3× retry di layar game over | `GameContext.jsx` |
| Karir & Unlock | `gamesPlayed/Won/Lost`, total kuartal; skenario unlockable | `GameContext.jsx` |
| Skenario | 7 skenario (stabil, krisis ekonomi, konflik, bencana, super_krisis, perang_total, bumi_hangus) | `TitleScreen.jsx` |

## 5. Ending (12)

**Kalah:** `krisis_anggaran`, `kudeta`, `revolusi`, `kehancuran_infrastruktur`, `impeachment`, `kalah_pemilu`, `kalah_pemilu_vp`
**Menang:** `menang_pemilu` (lanjut P2), `lulus` (2 periode penuh → INDONESIA EMAS)

## 6. Persistensi (localStorage)

| Key | Isi |
|---|---|
| `presiden_save` | Save game (tanpa phase/event aktif) — autosave tiap laporan kuartal |
| `presiden_career` | Statistik karir `{gamesPlayed, gamesWon, gamesLost, totalQuarters}` |
| `presiden_unlocks` | Array id skenario yang terbuka |

## 7. Aset Eksternal

- Gambar via CDN **ImageKit** (`ik.imagekit.io/dntonfire/...`) — semua `<img>` punya `onError` fallback.
- Font **VT323** via Google Fonts.
- Musik latar `public/music/bgm.mp3` (WebAudio sfx di-generate prosedural).
