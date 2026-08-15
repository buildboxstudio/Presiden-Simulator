# 09 — Debug Agent

## 1. Peran

Debug agent melacak dan memperbaiki bug, serta menjaga inventaris masalah yang diketahui. Semua temuan audit terdokumentasi di **`LAPORAN_ANALISIS.md`**.

## 2. Inventaris Bug Terbuka (status per 14 Agustus 2026)

| # | Bug | Lokasi | Status |
|---|---|---|---|
| B1 | **`foreignControl` mati total** — pilihan "Investor Asing" di kampanye tidak menaikkan state context; penalti `ELECTION_RESULT` tak pernah aktif | `DebatRoom.jsx` (state lokal) + `GameContext.jsx` | 🔴 Terbuka |
| B2 | **Pecat wapres di pemilu → tidak bisa pilih pengganti** — UI mati via `if (false && showNewVPSelect)` | `DebatRoom.jsx:321` | 🔴 Terbuka |
| B3 | **Laporan kuartal salah cabang** — `reportDiffs` (array kosong) selalu truthy → "Tidak ada perubahan signifikan" & "Ada laporan masuk" tak pernah muncul | `GameContext.jsx` END_QUARTER | 🟠 Terbuka |
| B4 | **Side-effect saat render** — `sfx.notif()` di render intro DebatRoom; `setTimeout(sfx)` di render ResultScreen → suara ganda/berulang | `DebatRoom.jsx`, `ResultScreen.jsx` | 🟠 Terbuka |
| B5 | **Statistik karir dobel di dev** — StrictMode mount 2×; `hasUpdated` ref di-reset → `updateCareerStats` 2× | `ResultScreen.jsx` | 🟢 Hanya dev |
| B6 | **QA mode `hidupjokowi` aktif di produksi** — cheat & manipulasi statistik | `TitleScreen.jsx` | 🔴 Terbuka (keamanan) |
| B7 | **Build gagal di lingkungan baru** — `html2canvas` hilang dari node_modules basi | environment | ✅ Solusi: `npm install` |
| B8 | **Deploy live tertinggal 2 commit** — gh-pages belum punya fix PC layout | deployment | 🟠 Terbuka (jalankan `npm run deploy`) |

## 3. Cara Debug Efektif

1. **Reproduksi dulu** — gunakan QA test mode (`hidupjokowi`) untuk lompat cepat ke fase yang bermasalah.
2. **Lacak state** — semua logika lewat reducer. Tambah sementara `console.log` di reducer untuk melihat state sebelum/sesudah action, atau baca langsung nilai `indicators`/`oposisiScore` di komponen.
3. **Cek localStorage** — save game tersimpan di key `presiden_save`. Hapus key untuk reset bersih:
   ```js
   localStorage.removeItem('presiden_save')
   ```
4. **Konvensi clamp** — bila indikator aneh (>100/<0), cek apakah perubahan lewat `Math.max(0, Math.min(100, ...))`; banyak jalur efek di `END_QUARTER` langsung menambah ke `newIndicators` tanpa clamp sebelum di-round.
5. **Prioritas modal** — bila popup tidak muncul/menumpuk, cek urutan prioritas di `docs/03-orchestrator.md`.
6. **Console browser** — aktifkan "React DevTools" & perhatikan warning `setState-in-effect` / impure render (rule ESLint react-hooks v7 baru sangat membantu).

## 4. Aturan Memperbaiki

- **Satu bug = satu perubahan minimal** — jangan gabung dengan refactor.
- Jangan sembunyikan gejala; perbaiki akar penyebab.
- Setelah fix: `npm run build` + `npx eslint src/` + tes manual jalur yang terdampak.
- Perbarui status di tabel inventaris ini & `docs/14-project-memory.md`.
- Bug yang di luar lingkup task: laporkan saja, jangan diperbaiki diam-diam.
