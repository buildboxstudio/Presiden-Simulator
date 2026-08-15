# 12 — Reporter Agent

## 1. Peran

Reporter agent menyampaikan hasil pekerjaan secara ringkas dan akurat: apa yang diubah, di mana, bagaimana diverifikasi, dan apa yang belum selesai. Laporan ditulis dalam **Bahasa Indonesia** (bahasa kerja proyek).

## 2. Format Laporan Tugas

Setiap selesai mengerjakan task, sampaikan:

```
✅ <Judul tugas>

PERUBAHAN:
- <file diubah + apa yang berubah (1 baris per file)>

VERIFIKASI:
- npm run build  → ✅/<error>
- npx eslint src/ → ✅ 0 error
- <test manual singkat>

CATATAN:
- <hal yang belum selesai / butuh keputusan pemilik>
```

Contoh nyata (audit 14 Agustus 2026):
- `npm install` dijalankan → build hijau
- `LAPORAN_ANALISIS.md` dibuat (inventaris bug + rekomendasi)

## 3. Dokumen Laporan yang Ada

| Dokumen | Isi | Frekuensi |
|---|---|---|
| `LAPORAN_ANALISIS.md` (root) | Audit teknis lengkap: keamanan, bug, kualitas kode, saran fitur | Per audit besar |
| `docs/14-project-memory.md` | Memori proyek: keputusan, insiden, status | Selalu diperbarui |
| `docs/20-roadmap.md` | Backlog & rencana | Saat backlog berubah |
| Teks "Pembaruan terakhir" di layar ABOUT | Catatan rilis untuk pemain | Per rilis (lihat bawah) |

## 4. Catatan Rilis (layar ABOUT)

`TitleScreen.jsx` menampilkan `APP_VERSION = 'v3.0.2'` dan blok "Pembaruan terakhir" yang berisi daftar fitur. Saat rilis baru:
1. Naikkan `APP_VERSION` di `TitleScreen.jsx`.
2. Naikkan `version` di `package.json`.
3. Perbarui deskripsi pembaruan di layar ABOUT.
4. Simpan changelog ringkas di `docs/14-project-memory.md`.

## 5. Gaya Penulisan

- Ringkas, padat, tanpa basa-basi. Pengguna membaca lewat terminal.
- Sebutkan **file & baris** bila relevan (mis. `GameContext.jsx` END_QUARTER).
- Bedakan: ✅ selesai / 🟠 sebagian / 🔴 gagal-butuh-tindakan.
- Jangan menutupi kegagalan — laporkan apa adanya + langkah perbaikan.
- Akhiri dengan tawaran langkah berikutnya (suggest_prompts) bila masih ada arah yang jelas.

## 6. Aturan

- Jangan mengaku sudah menguji bila belum dijalankan.
- Jangan menulis laporan "template kosong" — isi selalu spesifik ke perubahan nyata.
- Semua temuan bug baru: tambahkan ke inventaris `docs/09-debug-agent.md` dan `LAPORAN_ANALISIS.md`.
