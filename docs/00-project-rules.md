# 00 — Aturan Proyek (Project Rules)

Aturan ini wajib dipatuhi oleh semua agent/human yang mengerjakan **PRESIDEN SIMULATOR** (Buildbox Studio, © 2026).

## 1. Visi

Game simulasi kepemimpinan presiden Indonesia: **satu periode = 20 kuartal, dua periode penuh**, dengan nuansa retro pixel, narasi satir, dan keputusan yang berdampak nyata pada indikator negara.

## 2. Aturan Teknis (Non-Negotiable)

1. **React 19 + Vite + Tailwind CSS 4** — jangan ganti stack tanpa persetujuan.
2. **JavaScript (JSX)**, bukan TypeScript. Jangan migrasi ke TS di luar scope task.
3. **Data-driven**: semua konten (event, kandidat, kebijakan, partai, wapres, background, program kampanye) di `src/data/*.json`. **Jangan hardcode konten game di komponen.**
4. **State terpusat**: semua state game lewat reducer `gameReducer` di `src/context/GameContext.jsx`. Dilarang menyimpan state game di `useState` komponen (kecuali state UI lokal murni).
5. **Reducer harus pure**: tanpa `Math.random()` di dalam reducer bila memungkinkan (acak boleh di komponen/handler, lalu dikirim sebagai payload). `END_QUARTER` saat ini masih berisi random — target refactor.
6. **Tanpa dependensi baru** tanpa alasan tertulis: tanyakan dulu, cek apakah pola yang ada sudah cukup. Saat ini deps sengaja minimal: `react`, `react-dom`, `html2canvas`.
7. **Teori UI Indonesia**: seluruh teks UI berbahasa Indonesia, kecuali nama brand "PRESIDEN SIMULATOR".

## 3. Kualitas

1. **Build harus hijau**: `npm run build` tanpa error sebelum dianggap selesai.
2. **Lint `src/` harus bersih**: `npx eslint src/` = 0 error, 0 warning. Jangan menambah error baru.
3. **Bundle**: target gzip < 200 kB; jangan menambah dependensi besar tanpa diskusi.
4. **Jangan menimbulkan side-effect saat render** (no `sfx()`, `setTimeout`, `Math.random()` langsung di body render).
5. **Responsif**: wajib jalan di PC 16:9 (scaling `App.jsx`) dan mobile portrait (layout natural).

## 4. Keamanan (lihat 10-security-agent.md)

1. **Dilarang keras** menyimpan token/secret di kode, konfigurasi, atau commit. Kasus nyata: token GitHub sempat tersimpan di `.git/config` — sudah dicatat, **rotasi token wajib**.
2. **QA mode `hidupjokowi` tidak boleh aktif di build produksi** — harus di-gate dengan `import.meta.env.DEV`.
3. Semua gambar eksternal (ImageKit) wajib punya fallback `onError`.

## 5. Proses

1. Baca `docs/15-workflow.md` sebelum mulai task.
2. Untuk task multi-langkah, gunakan **write_todos** dan perbarui terus.
3. Jangan commit/push tanpa diminta. Jangan jalankan perintah destruktif (delete branch, reset, force push) tanpa izin.
4. Setiap perubahan berarti diakhiri dengan laporan singkat (lihat `12-reporter-agent.md`).
5. Perbarui `docs/14-project-memory.md` saat ada keputusan penting atau insiden.

## 6. Larangan

- Mengubah alur game (jumlah kuartal, indikator, mekanik pemilu) tanpa persetujuan pemilik — ini game yang sudah live.
- Menghapus folder arsip (`v3.0.2/`, `v3_0_3/`, `public_html/`, `Android App/`) tanpa konfirmasi (belum diputuskan pemilik).
- Memakai bahasa campuran di teks UI (kecuali istilah teknis).
