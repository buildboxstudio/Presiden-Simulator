# 17 — Standar Kode (Coding Standard)

## 1. Bahasa & Naming

| Item | Aturan | Contoh |
|---|---|---|
| Bahasa kode | Inggris (identifier, komentar singkat) | `const newIndicators = ...` |
| Bahasa UI | Indonesia | `'AKHIRI KUARTAL'` |
| Komponen | PascalCase | `TitleScreen.jsx` |
| Variabel/fungsi | camelCase | `handleHideReport` |
| Konstanta UI | UPPER_SNAKE | `MAX_ACTIVITIES`, `DEADLINE_SECONDS` |
| Action reducer | UPPER_SNAKE string | `'END_QUARTER'` |
| Stat key | camelCase, konsisten | `apbn`, `kesejahteraan` |
| Posisi menteri | snake_case, prefix `menteri_` | `menteri_keuangan` |
| File data JSON | lowercase | `events_periode2.json` |

## 2. Struktur Komponen

```jsx
import { useState, useEffect } from 'react'
import { useGame } from '../context/GameContext'
import useSound from '../hooks/useSound'

const LOCAL_CONST = 10          // konstanta di atas komponen

export default function MyComponent() {
  const { someState, someAction } = useGame()   // destructure context
  const [local, setLocal] = useState(null)       // state UI lokal
  const sfx = useSound()

  // handler
  const handleClick = () => { sfx.click(); someAction() }

  return ( ... )
}
```

Aturan:
- Import urut: react → context/hooks → data → komponen lokal.
- Jangan export lebih dari satu komponen per file (rule `react-refresh/only-export-components`) — pisah helper/konstanta ke file lain bila dipakai banyak file.
- Nama handler: `handle<Verb>`.

## 3. State & Reducer

- **Semua state game di context** — komponen hanya boleh punya state UI lokal (tab aktif, modal terbuka, dsb).
- **Reducer murni** — jangan mutasi `state` atau `action`; selalu spread:
  ```js
  case 'FOO': return { ...state, indicators: { ...state.indicators, apbn: 10 } }
  ```
- **Clamp indikator** setiap perubahan:
  ```js
  Math.max(0, Math.min(100, val))
  ```
- **Efek multi-stat** didukung: `effects = { apbn: -5, popularitas: 3 }`.
- Action yang memicu game over: hitung `checkGameOver(newIndicators)` dan set `phase: 'result'` + `ending`.

## 4. Data-Driven

- Konten game TIDAK boleh di-hardcode di komponen. Tambah ke `src/data/*.json`.
- Skema event (jangan ubah tanpa migrasi): `{ id, title, description, deddy_intro, choices: [{label, effects}], vp_advice? }`.
- Akses lewat `import eventsData from '../data/events.json'`.

## 5. Styling

- Utamakan utility Tailwind + token `@theme`: `retroLight`, `retroYellow`, `retroRed`, `retroGreen`, `retroGray`, `font-retro`.
- Warna dinamis (bar/partai) → inline `style={{ background: '#...' }}`.
- Modal game: `fixed inset-0 z-40|z-50 bg-black/70|/80|/90`.
- Tombol utama: `border-2 border-retroYellow bg-retroYellow/20 hover:bg-retroYellow/40`.
- Jangan tambah class CSS baru di `index.css` bila bisa pakai utility; tambahkan hanya untuk efek khusus (pixel-border, glow, ticker).

## 6. Audio

- SFX hanya di **event handler / useEffect**, TIDAK di body render (masalah B4).
- `useSound()` → `sfx.click()`, `sfx.select()`, `sfx.notif()`, dll.
- BGM via `useBackgroundMusic()` — `startMusic()` saat interaksi pertama.

## 7. Gambar Eksternal

```jsx
<img src={url} alt="..." onError={(e) => { e.target.style.display = 'none' }} />
```
Selalu fallback; jangan andalkan uptime CDN.

## 8. Anti-Pattern yang Dilarang

- ❌ `Math.random()` di body render (impure render).
- ❌ `setState` sinkron di dalam `useEffect` tanpa alasan (rule `react-hooks/set-state-in-effect`).
- ❌ `useCallback` dengan object literal (rule `react-hooks/use-memo`).
- ❌ `if (false && ...)` dead code.
- ❌ Variabel/import tak terpakai (`no-unused-vars`).
- ❌ Logika game di komponen (mis. menghitung efek kuartal di Dashboard).
- ❌ `dangerouslySetInnerHTML`.
- ❌ Mengubah `state.phase` dari luar reducer.

## 9. Gerbang Kualitas

```bash
npm run build     # wajib hijau
npx eslint src/   # 0 error (target 0 warning) — aturan aktif: react-hooks v7 (ketat!)
```
Catatan: rule `react-hooks` v7 cukup baru & ketat; bila satu rule terasa salah-sasaran untuk pola yang disengaja, diskusikan — jangan `eslint-disable` tanpa alasan tertulis.
