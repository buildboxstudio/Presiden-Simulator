# project-memory.md — Peta Proyek

## Fase Proyek

1. **v3.0.X (sekarang)** — Stabilisasi. Bug fix, UI polish, persiapan sosial media.
2. **v3.1.0 (Q1 2025?)** — Save/Load, leaderboard lokal (localStorage).
3. **v4.0.0 (kuartal belakuran)** — Backend multiplayer (daftar pemain). Potensial.

## Arsitektur State

```
App → [TitleScreen | Dashboard | DebatRoom | ResultScreen]
  ├─ gameState: { turn, apbn, support, oposisiScore, ... }
  ├─ activities: []
  ├─ events: []
  └─ soundMuted: bool
```

Semua state top-level `App.jsx`. Prop drilling ke komponen. Tidak ada Context atau Redux (scope terlalu kecil).

## Data Struktur

```
src/data/
  ├─ activities.json       [turn cost, effect masuk ke state]
  ├─ events.json           [event musiman, krisis]
  ├─ ministers.json        [nama, spesialisasi, loyalty]
  ├─ policies.json         [kebijakan APBN, support Δ]
  ├─ dubiProposals.json    [usulan buruk, chance random]
  └─ results.json          [ending, scoring]
```

Setiap file adalah array objek. Ada ikon di setiap entri. **Ikon adalah bagian dari data — jangan hapus atau ubah tanpa verifikasi**.

## Jebakan (Penting)

1. **APBN overflow** — Kalau pemain spend > 100%, apa? Cek `Dashboard.jsx:100` — kita cap di 100%, sisanya hilang. Ada komentar `shortcut:`. User tahu limitasinya.

2. **Event timing** — Event muncul di turn tertentu. Hardcoded di `DebatRoom:280+`. Kalau turn loop berubah, perlu audit event trigger.

3. **Oposisi score** — Naik per turn + keputusan pemain. Batas menang 70. Di bawah itu oposisi tidak bisa menang. Ubah angka ini = ubah difficulty. Ada di `useGameLogic.js`.

4. **Sound** — SFX ada di `src/assets/sounds/`. Kalau file hilang, game masih jalan (permissive). Tidak fatal. Tapi QA perlu dengar.

5. **localStorage key** — `gameState` hardcoded di multiple tempat. Jangan rename tanpa grep seluruh codebase dulu.

## Komponen Penting

- **TitleScreen** — Menu. Next → Dashboard. Musik background.
- **Dashboard** — Status pemain (APBN, support, oposisi). List aktivitas. Next → DebatRoom atau event modal.
- **DebatRoom** — Pertarungan idea vs oposisi. Scoring. Next → event atau ResultScreen.
- **ResultScreen** — Ending. Score breakdown. Button "Play Again".
- **EventCard, ActivityCard, PartyDemand, MinisterProposal, DubiProposal** — UI fragment yang reusable.

## Build & Deploy

- **Dev:** `npm run dev` → `http://localhost:5173`
- **Prod:** `npm run build` → `dist/` → deploy ke GH Pages (`gh-pages` branch).
- **Preview build locally:** `npm run preview`
- **Lint:** `npm run lint` (ESLint + Prettier, konfigurasi di `.eslintrc.cjs`).

Base URL di `vite.config.js`: `base: './'` (root GH Pages).

## UI Style

- Palette: hitam bg, hijau/kuning neon text, merah alert.
- Font: VT323 (pixel art).
- Responsive: mobile 320px+, tablet 768px, desktop 1024px+.
- Animasi: blink, pulse (hanya loading state). Jangan berlebihan.

## Testing

Tidak ada test suite formal (scope indie game kecil). QA manual. Sebelum release:
- Play 1 game penuh sampai ending.
- Cek setiap tombol, link, event muncul.
- Dengarkan SFX (atau cek toggle mute).
- Cek responsif di 320px (mobile), 768px (tablet), 1440px (desktop).
