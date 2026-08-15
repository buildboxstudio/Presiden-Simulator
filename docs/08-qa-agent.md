# 08 — QA Agent

## 1. Peran

QA agent memastikan perubahan tidak merusak game: verifikasi build, lint, dan jalur permainan utama. Saat ini **belum ada automated test** — QA mengandalkan checklist manual + mode test bawaan.

## 2. Mode Test Bawaan (QA Test Mode)

Di layar kustomisasi, ketik nama **`hidupjokowi`** untuk membuka panel QA:
- `GAME` — langsung mulai game (background & partai default)
- `PEMILU` / `TIM SES` / `PROGRAM` / `DEBAT` / `KAMPANYE` — lompat ke babak pemilu tertentu (`QA_SKIP`)
- `HASIL MENANG` / `HASIL KALAH` — langsung ke layar result

⚠️ **PENTING (Security):** mode ini aktif di build produksi. Siapa pun bisa menggunakannya untuk mengotori statistik karir & unlock skenario. **Wajib di-gate dengan `import.meta.env.DEV`** (lihat 10-security-agent.md, item P0).

## 3. Checklist Manual (wajib saat ada perubahan gameplay)

**Alur lengkap:**
- [ ] Menu → kustomisasi → skenario → partai → wapres → menteri → policy setup → dashboard
- [ ] 1 kuartal penuh: laporan → krisis → 2 aksi → kuartal bertambah
- [ ] Event muncul, timer 20 detik jalan, pilihan acak saat timeout, delegasi ke menteri jalan
- [ ] Kebijakan slider bekerja (efek muncul di laporan)
- [ ] Reshuffle kabinet: biaya popularitas naik (5 → 12)
- [ ] Game over: setiap indikator = 0 → ending yang benar; tombol retry (3×) memulihkan checkpoint
- [ ] Kuartal 21 → pemilu: visi-misi (syarat program), debat (trust), kampanye, voting 100 TPS, hasil
- [ ] Menang → periode 2 setup (wapres baru + reshuffle) → P2 dimulai (indikator -15, event baru)
- [ ] Kuartal 41 → ending `lulus`
- [ ] Save & load: autosave tiap laporan; tombol LANJUTKAN PERMAINAN di menu; delete save

**Fitur khusus:**
- [ ] Popularitas ≥ 80 → PROPRES + Budee Arie (dubiArry) auto-join timses
- [ ] Popularitas ≥ 70 (P2) → usulan 3 periode (terima = indikator jeblok + oposisi +50)
- [ ] Wapres `will_betray` → deklarasi jadi calon di pemilu; PECAT wapres → (bug: tidak bisa ganti)
- [ ] Skenario unlock: selesaikan krisis ekonomi → super_krisis terbuka
- [ ] "SIMPAN SEBAGAI GAMBAR" (html2canvas) — cek gambar muncul

**Perangkat/ukuran:**
- [ ] PC landscape (16:9 scale) — semuanya terlihat, tidak terpotong
- [ ] HP portrait (≤ 640px, ≤ 380px) — teks tidak meluber
- [ ] Chrome & browser Android; pastikan tidak ada error di console (React dev warnings)

## 4. Gerbang Otomatis (gate sebelum dianggap selesai)

```bash
npm run build     # wajib sukses
npx eslint src/   # wajib 0 error (target: 0 warning)
```

## 5. Rencana Automated Testing (target)

Logika game ada di reducer murni → sangat cocok unit test tanpa DOM:

1. **Framework:** `vitest` (+ `@testing-library/react` bila perlu test komponen).
2. **Prioritas 1 — reducer `GameContext`:**
   - `START_GAME`: perhitungan buffs (bg+partai+wapres+menteri+skenario), periode 2 (-15), clamp 0–100
   - `END_QUARTER`: efek kebijakan, efektivitas menteri, game over pada tiap indikator 0, laporan kuartal, checkpoint tiap 2 kuartal
   - `ELECTION_RESULT`: ambang menang/kalah, pengaruh `electionTrust`, `oposisiScore`, `foreignControl`, khianat wapres
   - `RETRY_GAME` / `LOAD_GAME` / `RESET`
3. **Prioritas 2 — helper:** `checkGameOver`, `shuffle` (EventCard), pemilihan pilihan menteri (skill/loyalty).
4. **Catatan:** random di reducer (`Math.random()` di `END_QUARTER`) menyulitkan determinisme — refactor ke payload-driven (lihat 05-architect, hutang #3) sebelum menulis test END_QUARTER penuh, atau mock `Math.random`.

## 6. Pelaporan Bug

Semua bug dicatat di `LAPORAN_ANALISIS.md` (inventaris) dan statusnya di-update di `docs/14-project-memory.md`. Format temuan: gejala → reproduksi → akar penyebab → file/baris → usulan fix.
