# LAPORAN ANALISIS & DEBUGGING — PRESIDEN SIMULATOR (v3.0.2)

**Tanggal audit:** 14 Agustus 2026
**Repo:** https://github.com/buildboxstudio/Presiden-Simulator
**Situs live:** https://buildboxstudio.github.io/Presiden-Simulator/ (HTTP 200, aktif)
**Stack:** React 19 + Vite 8 + Tailwind 4 (JavaScript/JSX)

---

## 1. RINGKASAN EKSEKUTIF

| Aspek | Status |
|---|---|
| Build produksi | ✅ Sukses (setelah `npm install`) |
| Situs live | ✅ Online |
| Situs live vs kode terbaru | ⚠️ **Tertinggal 2 commit** |
| Keamanan | 🔴 **Token GitHub bocor di remote config** |
| Bug fungsional ditemukan | 🟠 4 bug nyata (2 mekanik mati) |
| Kualitas kode (ESLint `src/`) | 🟠 31 error, 8 warning |
| Ukuran bundle | 🟡 564 kB (warning > 500 kB) |

**Kesimpulan singkat:** Game-nya solid secara konsep dan konten (banyak mekanik menarik: menteri dengan skill/loyalitas, skenario unlock, checkpoint retry, pemilu multi-babak, plot twist wapres khianat). Namun ada 2 mekanik yang sebenarnya **mati/tidak berfungsi**, situs live **belum memuat perbaikan terakhir**, dan ada **kredensial GitHub yang terekspos** di konfigurasi lokal.

---

## 2. TEMUAN KEAMANAN (PRIORITAS TERTINGGI)

### 2.1 🔴 Token GitHub (PAT) tersimpan plaintext di remote URL — WAJIB dirotasi
File `.git/config` berisi:
```
remote.origin.url = https://buildboxstudio:ghp_XXXX...@github.com/buildboxstudio/Presiden-Simulator.git
```
Token ini **tidak** ikut ter-commit ke repo (ada di `.git/config`), jadi tidak terekspos publik lewat GitHub — **tapi** ini risiko besar karena:
- Muncul di riwayat shell / log jika ada yang menjalankan `git push -v`, `git remote -v`, dll.
- Siapa pun yang mendapat salinan folder ini (backup, pindah PC, berbagi) mendapat akses penuh ke repo.
- Jika token bocor ke pihak lain, bisa push kode jahat ke repo publik.

**Tindakan yang disarankan (urutan):**
1. Rotasi/revoke token di GitHub → Settings → Developer settings → Personal access tokens.
2. Ganti remote agar tidak menyimpan token:
   ```bash
   git remote set-url origin https://github.com/buildboxstudio/Presiden-Simulator.git
   ```
3. Gunakan `gh auth login` (GitHub CLI) atau SSH (https://github.com/settings/keys) untuk autentikasi.

### 2.2 🟠 Mode QA/cheat aktif di build produksi
Mengetik nama **`hidupjokowi`** di layar kustomisasi memunculkan panel QA test yang bisa:
- Skip langsung ke PEMILU / HASIL MENANG / HASIL KALAH.
- Karena `ResultScreen` menghitung statistik karir (`gamesPlayed/Won/Lost`) saat ending, **pemain bisa mengotori statistik karir dan unlock skenario tanpa bermain**.

**Saran:** Guard dengan env var (`import.meta.env.DEV`) sehingga hanya aktif di development, atau hilangkan dari build produksi.

---

## 3. STATUS BUILD & DEPLOY

### 3.1 Build sempat gagal — penyebab: node_modules tidak lengkap
`npm run build` gagal dengan `Failed to resolve import "html2canvas"` padahal `html2canvas` ada di `package.json` (^1.4.1). Penyebab: folder `node_modules` lokal sudah basi/tidak lengkap (mungkin hasil salin-copy antar folder versi). Setelah `npm install`, build **sukses**:
```
dist/index.html                 0.76 kB
dist/assets/index-*.css        40.76 kB
dist/assets/index-*.js        564.21 kB │ gzip 152.07 kB
✓ built in 1.73s
```
> Catatan: jika menjalankan di PC/lingkungan baru, selalu `npm install` dulu.

### 3.2 🔴 Situs live TERTINGGAL dari kode terbaru
- Branch `gh-pages` (yang dipakai GitHub Pages) berhenti di commit `94f73ac`.
- Branch `main` sudah punya 2 commit yang **belum** ter-deploy:
  - `6f785d3` — Save v3.0.2 source to main
  - `62cce8a` — **Fix PC layout: true 16:9 widescreen stage (option B)** ← perbaikan penting yang belum live!
- Artinya: pemain di situs live **belum merasakan fix layout widescreen terbaru**.

**Tindakan:** jalankan `npm run deploy` (vite build + gh-pages) setelah siap.

### 3.3 Folder duplikat/arsip tidak ter-track git (kebingungan)
`Android App/`, `public_html/`, `v3.0.2/`, `v3_0_3/` ada di workspace tapi **tidak ter-track git** (untracked). Ini sumber kebingungan versi — `v3_0_3` bahkan isinya nyaris identik dengan `src/` aktif. **Saran:** arsipkan ke luar folder project atau tambahkan ke `.gitignore`.

---

## 4. BUG FUNGSIONAL (DITEMUKAN SAAT AUDIT KODE)

### 4.1 🔴 Mekanik "Kontrol Asing" (foreign control) MATI TOTAL
**File:** `GameContext.jsx` (END_QUARTER, ELECTION_RESULT) & `DebatRoom.jsx` (kampanye).
- Di `DebatRoom`, memilih opsi kampanye **"Luar Negeri (Investor Asing)"** hanya menjalankan `setForeignControl(true)` — state lokal komponen, tidak pernah di-dispatch ke context.
- Di `GameContext`, `foreignControl` hanya bisa naik lewat `END_QUARTER` dengan syarat `newForeignControl > 0` — tetapi **tidak ada satu pun kode yang membuatnya > 0**. Jadi nilainya selalu 0.
- Akibatnya penalti di `ELECTION_RESULT` (`if (state.foreignControl > 20) totalScore -= ...`) **tidak pernah aktif**. Peringatan "⚠ Dana asing terdeteksi!" hanya kosmetik — pilihan investor asing memberi trust +6 **tanpa risiko apa pun**.

### 4.2 🔴 Memecat Wapres di pemilu → tidak bisa pilih pengganti
**File:** `DebatRoom.jsx` baris 321: `if (false && showNewVPSelect) { ... }`.
- UI pilih wapres pengganti **sengaja/numpang dimatikan** (`if (false)`), tapi tombol "✕ PECAT" tetap ada dan menjalankan `fireVP()`.
- Hasilnya: pemain yang memecat wapres kehilangan wapres sepenuhnya untuk pemilu (termasuk kehilangan buff dan "calon ke-3" jika wapres akan berkhianat) — tanpa opsi ganti. **Keputusan: matikan tombol PECAT, atau hidupkan kembali layar pemilihan pengganti.**

### 4.3 🟠 Laporan kuartal: 2 pesan tidak pernah muncul
**File:** `GameContext.jsx` END_QUARTER (± baris 560–580).
```js
const diffs = Object.keys(quarterDiff).filter(k => quarterDiff[k] !== 0) // bisa []
...
} else if (nextEvent) { reportText = '...Ada laporan masuk...' }
} else if (reportDiffs) { reportText = ... }   // array kosong MASIH truthy!
else { reportText = '...Tidak ada perubahan signifikan...' }
```
- Array kosong `[]` bernilai truthy di JS, jadi `else if (reportDiffs)` **selalu benar** → cabang `nextEvent` dan cabang `"Tidak ada perubahan signifikan"` tidak pernah dieksekusi.
- Efek: saat tidak ada berita apa pun, laporan menampilkan `"Kuwartal N beres, Presiden!"` + string kosong (tanpa info), bukan pesan "tidak ada perubahan".
- **Fix:** ganti kondisi menjadi `reportDiffs.length > 0` (dan sebaiknya cek `nextEvent` lebih dulu sesuai desain).

### 4.4 🟠 Side-effect saat render (suara bisa berbunyi berulang/ganda)
- `DebatRoom.jsx` baris ~231: `sfx.notif()` dipanggil di dalam fungsi render (cabang `if (showIntro)`). Setiap re-render layar intro (mis. parent re-render) memicu suara lagi.
- `ResultScreen.jsx` baris 112: `setTimeout(() => sfx.victory()/gameover(), 100)` dipanggil saat render, bukan di `useEffect` → bisa berbunyi ulang setiap state berubah (mis. saat klik "SIMPAN SEBAGAI GAMBAR" yang set `capturing`).
- Di development (StrictMode aktif di `main.jsx`), komponen di-mount 2× sehingga **efek dijalankan 2×**: `ResultScreen` mencatat `updateCareerStats` dua kali di dev (di produksi tidak, karena StrictMode hanya dev). Tidak fatal di produksi, tapi harus dibersihkan.

### 4.5 🟡 Lain-lain (minor)
- `midTermEval` (GameContext baris 397) di-assign tapi tidak pernah dipakai (dead code).
- `Period2Setup.jsx` baris 165: `Math.random()` dipanggil saat render (impure render) → teks pengalaman bisa berubah-ubah tiap render.
- `DebatRoom.jsx`: `LULUS_IMG` dan `winner` (baris 224) tidak dipakai.
- `Dashboard.jsx`: import `useRef` tidak dipakai; `quarterInYear` dihitung tidak dipakai.
- `TitleScreen.jsx`: `useEffect`, `deleteSave`, `selectedMinisters` tidak dipakai.

---

## 5. KUALITAS KODE & ARSITEKTUR

### 5.1 ESLint — 31 error, 8 warning di `src/` (dengan plugin react-hooks v7)
Kelompok error terbesar:
| Jenis | Contoh | Jumlah |
|---|---|---|
| `no-unused-vars` | import/variabel mati | ±14 |
| `react-hooks/set-state-in-effect` | setState sinkron di dalam effect (Dashboard, DebatRoom, EventCard, ActivityCard) | 4 |
| `react-hooks/use-memo` | `useCallback` menerima object literal (useSound) | 1 |
| `no-constant-condition` | `if (false && ...)` di DebatRoom | 2 |
| `react-hooks/compiler` (impure render) | `Math.random()` di Period2Setup | 1 |
| `no-useless-assignment` | GameContext reportText/evalMsg | 2 |
| `react-refresh/only-export-components` | GameContext mengekspor provider + hook | 1 |

> Catatan: `npm run lint` juga men-scan folder lama (`v3.0.2`, `v3_0_3`, `public_html`, `Android App`) sehingga total 2.121 masalah. Setelah folder arsip dihapus/di-ignore, lint jadi fokus ke kode aktif.

### 5.2 Struktur file
- `GameContext.jsx` = **897 baris** reducer + provider + localStorage helper. Reducer `END_QUARTER` saja ~300 baris (semua sistem: menteri, bencana, skandal, oposisi, partai, timses, propres, dubi, tengah periode, achievement, laporan, checkpoint). Ini sumber utama kompleksitas — saran pisah ke beberapa reducer/helper atau modul per-sistem.
- `DebatRoom.jsx` = **765 baris** dengan 10+ fase UI (intro, wealth, wapres, timses, visi-misi, debat, kampanye, voting, hasil) dalam satu komponen — saran pecah per fase (sudah sebagian via `if` bersarang, bisa jadi sub-komponen).
- Data konten bagus terpisah di `src/data/*.json` (8 file, total ~52 kB) — pola yang sudah benar.

### 5.3 Lain-lain
- **README.md masih template Vite default** — tidak menjelaskan game, cara main, cara deploy. Layak diganti.
- Bundle JS 564 kB (gzip 152 kB) — masih wajar untuk game, tapi bisa dipecah (code-splitting per fase: title/debat/result) untuk percepat first paint.
- `html2canvas` untuk "SIMPAN SEBAGAI GAMBAR" — gambar-gambar dari ImageKit (cross-origin) bisa gagal ter-render di tangkapan layar tergantung header CORS; tidak fatal karena `onError` menyembunyikan gambar.
- Musik latar: `public/music/bgm.mp3` ada dan path memakai `import.meta.env.BASE_URL` — sudah benar dengan base `/Presiden-Simulator/`.
- **Tidak ada** secret lain di `src/` (scan `ghp_`, `api_key`, `token` bersih). Token hanya di `.git/config`.

---

## 6. SARAN FITUR TAMBAHAN (diurutkan prioritas)

### Tahap 1 — Perbaikan dulu (fondasi)
1. **Hidupkan mekanik kontrol asing** (bug 4.1) — buat pilihan "Investor Asing" benar-benar menaikkan `foreignControl` di context; beri sinyal visual + cara menguranginya (mis. blusukan/utang domestik).
2. **Lengkapi alur ganti wapres** atau hapus tombol PECAT di pemilu (bug 4.2).
3. **CI/CD deploy otomatis** — GitHub Actions: build + deploy ke `gh-pages` setiap push ke `main`. Ini mencegah kejadian "live tertinggal 2 commit".
4. **README** yang layak: deskripsi game, cara main, kontrol, cara build & deploy.

### Tahap 2 — Fitur gameplay (dampak tinggi, usaha sedang)
5. **Tingkat kesulitan (Mudah/Normal/Sulit)** — sesuaikan peluang bencana, korupsi, tekanan partai; game saat ini cukup brutal di periode 2.
6. **Peta Indonesia interaktif** — kunjungan daerah per provinsi (kaitkan dengan `campaign.locations` yang sudah ada di pemilu: Jawa/Sumatera/Timur/Merata). Efek lokal: bencana di provinsi X mempengaruhi suara di X.
7. **Ekonomi lebih dalam** — indikator turunan: utang, inflasi, nilai tukar, pertumbuhan. `apbn` terlalu dominan; tambah trade-off utang vs pembangunan.
8. **Krisis prosedural berantai** — pilihan di kuartal 3 memunculkan konsekuensi di kuartal 7 (ingat pilihan pemain, bukan cuma random). Data event sudah ada; tinggal tambah `followUp` pada event.
9. **Legacy/tanah air** — setelah 2 periode menang, tampilkan "Nama Anda di Buku Sejarah" + pencapaian per presiden terdahulu (pola: tiap run menghasilkan karakter yang muncul di run berikutnya).

### Tahap 3 — Skala & pemasaran
10. **PWA + installable** — manifest + service worker; game cocok untuk mobile (sudah ada layout portrait). Tambah haptic feedback di Android.
11. **Leaderboard & tantangan mingguan** — simpan skor akhir (mis. skor = rata-rata indikator × kuartal bertahan) ke backend sederhana (Supabase/Firebase) atau shareable link; topik viral untuk game semacam ini.
12. **Sinkronisasi save antar perangkat** — `localStorage` saat ini lokal per browser; export/import save (string base64) atau simpan ke cloud.
13. **Mode berita/cerita dinamis** — template berita dengan nama-nama fiktif yang di-generate (sudah ada arahnya di "Boy Sukro", "Budee Arie"); buat lebih variatif agar replayability naik.
14. **Lokalisasi (Bahasa Inggris)** — buka pasar internasional; teks sudah terpusat di data JSON + konstanta komponen, tinggal ekstrak ke `i18n`.
15. **Analitik ringan (Plausible/GA4)** — tahu berapa pemain, di babak mana mereka berhenti (funnel), untuk keputusan desain berikutnya.
16. **Aksesibilitas** — kontras teks, ukuran font bisa diatur, navigasi keyboard penuh; kini banyak elemen kecil (text-[10px]) yang sulit dibaca di layar besar.

---

## 7. REKOMENDASI PRIORITAS (ACTION ITEM)

| Prioritas | Aksi | Effort |
|---|---|---|
| P0 | Rotasi token GitHub + hapus dari remote URL | 5 menit |
| P0 | `npm run deploy` agar fix PC layout live | 5 menit |
| P0 | Sembunyikan/disable QA mode `hidupjokowi` di produksi | 15 menit |
| P1 | Fix foreign control (bug 4.1) | 30 menit |
| P1 | Fix alur PECAT wapres (bug 4.2) | 30 menit |
| P1 | Fix laporan kuartal `reportDiffs.length > 0` (bug 4.3) | 10 menit |
| P2 | Bersihkan lint `src/` (31 error → 0) | 1–2 jam |
| P2 | Pisah `GameContext` & `DebatRoom` jadi modul kecil | 1 hari |
| P2 | Hapus/arsipkan folder lama (`v3.0.2`, `v3_0_3`, `public_html`, `Android App`) + update README | 30 menit |
| P3 | CI/CD deploy otomatis (GitHub Actions) | 1 jam |

---

## 8. CATATAN AUDIT

- Audit statis (baca kode + build + lint + inspeksi git remote/branch). Belum ada automated test di project ini — **rekomendasi kuat: tambah minimal unit test untuk reducer `GameContext`** (logika game adalah inti dan paling rawan regresi; reducer murni sehingga mudah di-test tanpa DOM).
- Pengujian manual game penuh (2 periode) disarankan setelah fix P1 untuk memastikan keseimbangan.
