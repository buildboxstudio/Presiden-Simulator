# 15 — Alur Kerja (Workflow)

## 1. Alur Standar Tugas

```
┌─────────┐   ┌──────────────┐   ┌─────────────┐   ┌───────────┐   ┌───────────┐
│ 1. Baca │ → │ 2. Rencana   │ → │ 3. Implement│ → │ 4. Verif  │ → │ 5. Lapor  │
│ konteks │   │ (write_todos)│   │ (file terkait│  │ build+lint │   │ (12-report)│
└─────────┘   └──────────────┘   └─────────────┘   └───────────┘   └───────────┘
```

1. **Baca konteks:** `docs/` (terutama 00, 01, 02), `LAPORAN_ANALISIS.md`, kode yang akan disentuh, `git status` (jangan ganggu perubahan orang lain).
2. **Rencana:** tulis langkah via `write_todos` untuk task > 1 langkah; tentukan lingkup & definisi selesai.
3. **Implement:** edit langsung dengan tools; ikuti standar `docs/17-coding-standard.md`; perubahan sekecil mungkin.
4. **Verifikasi:**
   - `npm run build` → wajib hijau
   - `npx eslint src/` → wajib 0 error (target 0 warning)
   - Test manual jalur terdampak (checklist `docs/08-qa-agent.md`)
   - UI/web: pastikan preview berjalan & tidak ada error konsol
5. **Lapor:** format di `docs/12-reporter-agent.md`; perbarui `docs/14-project-memory.md` bila ada keputusan/insiden baru.

## 2. Alur Kerja Fitur Baru

1. Konfirmasi kebutuhan dengan pemilik (lingkup kecil: data → state → UI).
2. Cek pola yang sudah ada (cari contoh serupa di `src/`).
3. Jika menambah konten → tambah ke `src/data/*.json` dulu (jangan hardcode).
4. Jika menambah state → tambah action reducer + field `initialState`.
5. UI → komponen baru atau perluasan komponen yang ada (ikuti prioritas modal `docs/03-orchestrator.md`).
6. Verifikasi & lapor. Perbarui `docs/20-roadmap.md` (tandai selesai).

## 3. Alur Kerja Fix Bug

1. Cek inventaris `docs/09-debug-agent.md` — sudah tercatat? Bila baru, catat dulu (gejala → reproduksi → akar → file/baris).
2. Reproduksi (pakai QA mode `hidupjokowi` bila perlu lompat fase).
3. Fix minimal di akar penyebab — jangan gabung dengan refactor.
4. Verifikasi reproduksi lama sudah sembuh + tidak ada regresi.
5. Update status inventaris & memory.

## 4. Alur Kerja Deploy

```
1. npm run build       (pastikan hijau)
2. npm run lint        (pastikan src/ bersih — opsional tapi disarankan)
3. npm run deploy      (vite build + gh-pages -d dist)   ← konfirmasi pemilik dulu
4. git log origin/gh-pages -1   (verifikasi commit baru)
5. Buka https://buildboxstudio.github.io/Presiden-Simulator/ (hard refresh)
```

⚠️ Deploy mengubah situs live — **minta izin pemilik dulu**.

## 5. Alur Kerja Insiden Keamanan

1. Hentikan penyebaran (mis. rotasi token — jangan hanya hapus).
2. Catat di `docs/14-project-memory.md` + `docs/10-security-agent.md`.
3. Periksa jejak (riwayat push/commit bila perlu).
4. Laporkan ke pemilik dengan langkah pencegahan.

## 6. Definition of Done (DoD)

Sebuah task dianggap selesai bila SEMUA:
- [ ] Tujuan tercapai (sesuai permintaan)
- [ ] `npm run build` hijau
- [ ] `npx eslint src/` 0 error baru (tidak memperburuk)
- [ ] Jalur game yang terdampak teruji manual
- [ ] Tidak ada file tidak relevan yang berubah
- [ ] Laporan terkirim (perubahan + verifikasi)
- [ ] Memory/roadmap diperbarui bila relevan

## 7. Larangan dalam Workflow

- Tidak ada commit/push tanpa permintaan eksplisit.
- Tidak ada perintah destruktif (reset, force, delete branch) tanpa izin.
- Tidak ada `git add -A` / staging luas.
- Tidak ada perubahan di luar project directory.
- Tidak menjalankan skrip produksi/berefek besar tanpa izin.
