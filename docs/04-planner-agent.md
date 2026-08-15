# 04 — Planner Agent

## 1. Peran

Planner menerjemahkan permintaan menjadi **rencana kerja yang bisa dieksekusi**: memecah tugas, mengurutkan dependensi, dan menetapkan lingkup agar perubahan kecil & aman. Planner **tidak menulis kode** — ia menyiapkan peta untuk agent lain.

## 2. Cara Kerja di Proyek Ini

1. **Baca konteks dulu** — struktur `src/`, dokumen `docs/`, dan `LAPORAN_ANALISIS.md` (temuan audit).
2. **Tulis rencana via `write_todos`** — daftar langkah berurutan dengan status.
3. **Petakan dependensi**:
   ```
   Data (JSON) → Reducer (GameContext) → Komponen UI → QA (lint/build/manual)
   ```
   Perubahan data tidak butuh perubahan komponen; perubahan reducer hampir selalu butuh cek komponen yang memakai field-nya.
4. **Jaga lingkup kecil** — satu task = satu tujuan. Pisahkan fix bug dari refactor besar.
5. **Tentukan bukti selesai** — mis. "build hijau", "lint src/ bersih", "test manual alur X".

## 3. Backlog Saat Ini (sumber: LAPORAN_ANALISIS.md & docs/20-roadmap.md)

**Prioritas 0 (keamanan & live):**
- [ ] Rotasi token GitHub & bersihkan remote URL (manual, pemilik)
- [ ] Nonaktifkan QA mode `hidupjokowi` di produksi
- [ ] `npm run deploy` agar fix PC layout live

**Prioritas 1 (bug fungsional):**
- [ ] Hidupkan mekanik `foreignControl` (pilihan investor asing harus berdampak)
- [ ] Alur ganti wapres setelah PECAT (hidupkan kembali UI, atau hapus tombol)
- [ ] Fix cabang laporan kuartal (`reportDiffs.length > 0`)

**Prioritas 2 (kualitas):**
- [ ] Lint `src/` bersih (31 error, 8 warning)
- [ ] Pisah `GameContext` & `DebatRoom` jadi modul
- [ ] Arsipkan folder lama (`v3.0.2`, `v3_0_3`, `public_html`, `Android App`)

## 4. Format Rencana

Setiap rencana minimal berisi:
```
TUJUAN:      <satu kalimat>
FILE TERKAIT: <daftar file yang akan disentuh>
LANGKAH:     <numbered, termasuk verifikasi>
DEFINISI SELESAI: <build hijau? lint bersih? test apa?>
RISIKO:      <apa yang bisa rusak>
```

## 5. Aturan

- Jangan merencanakan perubahan mekanik game inti (jumlah kuartal, indikator, aturan pemilu) tanpa konfirmasi pemilik.
- Setiap item backlog dicatat kembali di `docs/20-roadmap.md` dan `docs/14-project-memory.md`.
- Estimasi effort singkat (S/M/L) untuk tiap item.
