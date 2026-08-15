# 18 — Standar Pengujian (Testing Standard)

## 1. Status Saat Ini

- **Belum ada automated test** (tidak ada vitest/jest, tidak ada file test).
- QA dilakukan lewat: (1) gerbang build+lint, (2) checklist manual (`docs/08-qa-agent.md`), (3) QA test mode `hidupjokowi`.
- Karena game frontend-only dengan logika di reducer murni, **unit test sangat layak dan direkomendasikan** (P2/P3 di roadmap).

## 2. Gerbang Otomatis (wajib — sudah berlaku)

| Gerbang | Perintah | Standar |
|---|---|---|
| Build | `npm run build` | Sukses, tanpa error |
| Lint | `npx eslint src/` | 0 error (target 0 warning) |

## 3. Rencana Unit Test (target)

**Framework:** `vitest` (ringan, kompatibel Vite). Bila perlu test komponen: `@testing-library/react` + `jsdom`.

**Prioritas 1 — reducer `GameContext` (inti game):**
```
src/context/__tests__/gameReducer.test.js
```
Kasus wajib:
1. `START_GAME`
   - buffs bg+partai+wapres digabung; buff menteri dari `floor(skill/20)`
   - mods skenario (stabil/krisis_ekonomi/konflik/bencana) diterapkan
   - periode 2 → semua indikator −15
   - clamp 0–100
2. `END_QUARTER`
   - efek kebijakan `(val - default)/10 × effectsPer10`
   - efektivitas menteri `floor((skill × loyalty/100 − 50)/15)`
   - tiap indikator = 0 → `ending` yang benar (`apbn→krisis_anggaran`, dst.)
   - kuartal 21 (P1) → `phase: 'pemilu'`; kuartal 41 (P2) → `ending: 'lulus'`
   - checkpoint tersimpan di kuartal genap; `RETRY_GAME` memulihkan + `retryCount`
3. `ELECTION_RESULT`
   - `totalScore ≥ 50` → menang; `< 50` → kalah
   - penalti `foreignControl > 20` & `oposisiScore ≥ 70`
   - `vpBetrays` → `kalah_pemilu_vp`
4. `PARTY_DEMAND_RESPONSE` / `ACTIVITY` / `RESOLVE_EVENT` / `RESHUFFLE` — efek diterapkan & clamp.

**Prioritas 2 — helper murni:**
- `checkGameOver` (GameContext)
- `shuffle` (EventCard) — deterministik dengan seed/mock Math.random
- Delegasi menteri (skor pilihan berdasarkan skill/loyalty)

**Prioritas 3 — komponen (bila waktu):**
- `StatBar` (nilai & warna bahaya ≤15/≤5)
- `NewsTicker` (3 berita terakhir)
- Flow modal Dashboard (prioritas munculnya popup)

## 4. Strategi Menghadapi Random

`END_QUARTER` berisi banyak `Math.random()` → untuk unit test:
1. **Jangka pendek:** `vi.spyOn(Math, 'random').mockReturnValue(...)` untuk determinisme.
2. **Jangka panjang (rekomendasi):** refactor — reducer menerima payload hasil acak dari komponen, atau ekstrak fungsi murni per-sistem (menteri/bencana/oposisi) yang bisa di-test dengan input tetap.

## 5. Konvensi Penulisan Test

- Nama file: `<module>.test.js` di samping file (`GameContext.test.js`).
- Deskripsi dalam Bahasa Indonesia atau Inggris singkat — konsisten, pilih satu (disarankan Indonesia untuk keterbacaan pemilik).
- Pola: `describe('END_QUARTER')` → `it('menerapkan efek kebijakan dan clamp')`.
- Buat helper `makeState(overrides)` yang membangun state dasar lengkap (copy `initialState`).
- Jalankan: `npx vitest run` (tambahkan script `"test": "vitest run"` di package.json saat framework dipasang).

## 6. Kapan Menjalankan Test

- **Wajib:** setiap perubahan `GameContext.jsx` atau helper yang diuji.
- **Disarankan:** setiap perubahan reduksi besar.
- **CI:** tambahkan ke workflow deploy (lihat `docs/11-devops-agent.md`) agar `npm test` jalan di tiap push.

## 7. Definisi Cakupan (target)

- Reducer `GameContext`: ≥ 80% jalur action utama (semua 20+ action).
- Helper murni: 100% (kecil).
- Komponen: fokus pada yang ber-logika (Dashboard modal flow, EventCard timer).
