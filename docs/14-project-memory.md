# 14 — Memori Proyek (Project Memory)

Dokumen ini adalah **ingatan jangka panjang** proyek: fakta, keputusan, insiden, dan status. Perbarui setiap kali ada perubahan penting. Jangan hapus riwayat — tambahkan entri baru dengan tanggal.

---

## 1. Fakta Dasar

- **Nama:** PRESIDEN SIMULATOR
- **Studio:** Buildbox Studio © 2026
- **Repo:** https://github.com/buildboxstudio/Presiden-Simulator (public)
- **Live:** https://buildboxstudio.github.io/Presiden-Simulator/
- **Stack:** React 19 · Vite 8 · Tailwind 4 · JS/JSX · html2canvas · GitHub Pages
- **Versi aktif:** `v3.0.2` (`package.json` & `APP_VERSION` di TitleScreen)
- **Konsep:** Simulasi Presiden Indonesia, 2 periode × 20 kuartal, satir politik, estetika retro pixel (VT323).

## 2. Keputusan Penting (log)

| Tanggal | Keputusan | Catatan |
|---|---|---|
| — | State terpusat di `useReducer` (GameContext) | Satu-satunya sumber kebenaran |
| — | Konten data-driven di `src/data/*.json` | 8 file, 48+ event |
| — | Layout 16:9 (1280×720) di landscape, natural di portrait | Fix terakhir `62cce8a` |
| — | Persistensi localStorage: `presiden_save`, `presiden_career`, `presiden_unlocks` | |
| 2026-08-14 | Audit teknis dilakukan → `LAPORAN_ANALISIS.md` dibuat | Banyak temuan (lihat §3) |
| 2026-08-14 | `npm install` dijalankan (node_modules basi, html2canvas hilang) → build hijau | Catatan untuk lingkungan baru |

## 3. Insiden & Status Terbuka (per 2026-08-14)

| Ref | Insiden | Status | Tindakan |
|---|---|---|---|
| S1 | Token GitHub di `.git/config` | 🔴 | **Rotasi token** + `git remote set-url` |
| S2 | QA mode `hidupjokowi` di produksi | 🔴 | Gate `import.meta.env.DEV` |
| B8 | Deploy live tertinggal 2 commit (fix PC layout belum live) | 🟠 | `npm run deploy` |
| B1 | `foreignControl` mati | 🟠 | Fix di roadmap P1 |
| B2 | Pecat wapres tak bisa ganti | 🟠 | Fix di roadmap P1 |
| B3 | Laporan kuartal cabang salah | 🟠 | Fix `reportDiffs.length > 0` |
| B4 | Side-effect render (suara) | 🟠 | Bersihkan saat refactor |
| — | Folder arsip tidak ter-track: `Android App/`, `public_html/`, `v3.0.2/`, `v3_0_3/` | 🟠 | Keputusan pemilik: arsip/ignore/hapus |

## 4. Konvensi Kode yang Harus Diingat

1. **Stat key:** `apbn`, `keamanan`, `kesejahteraan`, `infrastruktur`, `popularitas` (0–100, clamp).
2. **Posisi menteri:** `menteri_keuangan → apbn`, `menteri_pertahanan → keamanan`, `menteri_kesehatan → kesejahteraan`, `menteri_pupr → infrastruktur`.
3. **Skill/loyalty:** skill ≥ 80 = pilih terbaik saat delegasi; skill < 60 atau loyal < 30 = bisa sabotase.
4. **Ambang penting:** popularitas ≥ 80 → PROPRES/Budee Arie; ≥ 70 (P2) → usulan 3 periode; oposisi ≥ 60 warning, ≥ 70 bahaya; delegasi = penalti popularitas `min(3 + n*2, 20)`.
5. **Checkpoint** tiap 2 kuartal; retry maksimal 3×.
6. **Event P2** id ≥ 101; `usedEvents` di-reset di P2.
7. **Base path** Vite = `/Presiden-Simulator/` — jangan diubah.
8. **QA skip** memakai nama `hidupjokowi` (harus hilang dari produksi).

## 5. Karakter & Lore Internal (jangan diubah tanpa izin)

- **Deddy** — Sekretaris Kabinet, penyampai laporan krisis.
- **Boy Sukro** — tokoh skandal ijazah palsu (P1).
- **Budee Arie** — Ketua LOYALIS PRESIDEN; muncul saat popularitas ≥ 80; pengusung "presiden 3 periode".
- **Universitas Gandja Madat** — kampus "asal" ijazah Boy Sukro.
- **Tembok Ratapan Oslo** — "penghargaan" lucu di ending `lulus`.

## 6. Angka Kunci Balance (jangan digeser tanpa tes)

- Reshuffle: popularitas −5 (≥3× → −12).
- Skenario: P2 semua indikator −15; mods skenario di `START_GAME`.
- Trust awal pemilu: `50 + floor(popularitas/10)*5`.
- Election: menang jika `totalScore ≥ 50`; `totalScore = trust + pop*0.3 + kesejahteraan*0.2 ± swing ± penalti`.
- 1 kuartal = 3 bulan fiktif; 20 kuartal/period; `year = floor((quarter-1)/4)+1`.

## 7. Kontak & Catatan

- Pemilik mengelola repo di GitHub (buildboxstudio). Akses via remote dengan token (lihat S1 — **segera diamankan**).
- Bahasa komunikasi: **Indonesia**.
