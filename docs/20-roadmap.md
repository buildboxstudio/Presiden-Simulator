# 20 — Roadmap & Backlog

Sumber: audit teknis 14 Agustus 2026 (`LAPORAN_ANALISIS.md`) + arahan pemilik. Status: `[ ]` = belum, `[x]` = selesai.

## Fase 0 — Keamanan & "Live" (P0 · segera)

- [ ] **Rotasi token GitHub** (S1) — manual oleh pemilik; hapus dari remote URL; beralih ke `gh auth`/SSH
- [x] **Nonaktifkan QA mode `hidupjokowi` di produksi** (S2) — gate `import.meta.env.DEV` (selesai 15 Agu 2026)
- [ ] **Deploy ulang** — jalankan `npm run deploy` agar fix PC layout live (B8)

## Fase 1 — Bug Fungsional (P1 · 1–2 hari) — ✅ selesai 15 Agu 2026

- [x] **B1 — Hidupkan mekanik `foreignControl`**: pilihan "Investor Asing" → `SET_FOREIGN_CONTROL` (25) di context; penalti `ELECTION_RESULT` aktif; tumbuh +1/kuartal di P2; drain Kesejahteraan/Popularitas saat ≥40%; aktivitas P2 "Nasionalisasi Aset Asing" sebagai cara mengurangi
- [x] **B2 — Alur wapres**: layar ganti wapres setelah PECAT dihidupkan (hapus `if (false && ...)`); VP yang dipecat di-filter dari daftar; `SET_VICE_PRESIDENT` me-reset `vpFired` agar wapres baru bisa berkhianat
- [x] **B3 — Laporan kuartal**: `else if (reportDiffs.length > 0)` (defensif; terverifikasi logika lama sudah benar karena `reportDiffs` string — `''` falsy)
- [x] **B4 — Side-effect render**: `sfx.notif()` (DebatRoom intro & EventCard) + `setTimeout(sfx)` (ResultScreen) dipindah ke `useEffect`

## Fase 2 — Kualitas & Pembersihan (P2 · 2–3 hari)

- [x] **Lint `src/` bersih** (37 problem → 0): unused vars/impor, `setState-in-effect` (badEvent→lazy useState, timer→event handler, showActivity→derived, showResults→async tick), `useMemo` di useSound & useBackgroundMusic, catch tanpa binding, dead code (selesai 15 Agu 2026)
- [ ] **Pisah `GameContext.jsx`** (897 baris) — ekstrak engine per-sistem ke `src/context/engine/*.js`
- [ ] **Pisah `DebatRoom.jsx`** (765 baris) — sub-komponen per babak pemilu
- [ ] **Arsipkan folder lama** (`v3.0.2/`, `v3_0_3/`, `public_html/`, `Android App/`) — konfirmasi pemilik
- [ ] **README + docs selesai** (dokumen ini)
- [ ] **CI/CD deploy otomatis** (GitHub Actions — contoh di 11/19)
- [ ] **Hapus state mati** (`disasterActive`, `timsesTeam` bila tak dipakai, `midTermEval`)

## Fase 3 — Fondasi Pengujian (P3)

- [ ] Pasang `vitest` + script `npm test`
- [ ] Unit test reducer `GameContext` (≥80% action utama) — lihat `docs/18-testing-standard.md`
- [ ] Refactor random keluar dari reducer (payload-driven) agar test deterministik
- [ ] Integrasi test di CI

## Fase 4 — Fitur Gameplay (nilai tinggi · pilih sesuai minat)

- [x] **Tingkat kesulitan** (Mudah/Normal/Sulit) — selector di TitleScreen; skala peluang bencana/skandal/tekanan partai + pertumbuhan oposisi + timer event (30/20/15 detik) (selesai 15 Agu 2026)
- [x] **Krisis prosedural berantai** — `followUp` per choice di `events.json`/`events_periode2.json` (6 chain); state `pendingEvents` dijadwalkan di `RESOLVE_EVENT`, dipicu di `END_QUARTER` (selesai 15 Agu 2026)
- [x] **Saran menteri di event** — menteri terkait memberi saran teks; kualitas saran tergantung loyalitas (korup = saran jebakan) & skill (selesai 15 Agu 2026)
- [x] **Grafik tren indikator** — SVG line chart 5 indikator; `historyIndicators` diperpanjang 10 → 20 kuartal (selesai 15 Agu 2026)
- [ ] **Peta Indonesia interaktif** — kunjungan per provinsi; bencana lokal memengaruhi suara daerah (sambung ke `campaign.locations`)
- [ ] **Ekonomi lebih dalam** — utang, inflasi, nilai tukar; trade-off utang vs pembangunan (tidak hanya `apbn`)
- [ ] **Legacy antar-run** — presiden hasil run sebelumnya muncul sebagai tokoh di run berikutnya

## Fase 5 — Skala & Pemasaran (P4)

- [ ] **PWA** — manifest + service worker; installable di HP; haptic feedback
- [ ] **Leaderboard / tantangan mingguan** — backend ringan (Supabase/Firebase); skor = f(kuartal bertahan × rata-rata indikator)
- [ ] **Sinkronisasi save antar perangkat** — export/import base64 atau cloud
- [ ] **Lokalisasi (EN)** — ekstrak teks UI ke i18n
- [ ] **Analitik ringan** (Plausible/GA4) — funnel: sampai babak mana pemain berhenti
- [ ] **Aksesibilitas** — kontras, ukuran font dapat diatur, navigasi keyboard

## Prioritas yang Sedang Berjalan (checked diupdate di sini)

| Item | Pemilik | Target |
|---|---|---|
| — | — | — |

> Setiap item selesai → centang `[x]`, catat tanggal, dan perbarui `docs/14-project-memory.md`.
