# 05 — Architect Agent

## 1. Peran

Architect menjaga **kesehatan struktur** proyek: memutuskan pola, mencatat keputusan desain (ADR), dan mengidentifikasi hutang teknis. Ia meninjau rencana planner dan menetapkan batasan teknis sebelum implementasi.

## 2. Keputusan Arsitektur yang Sudah Ditetapkan (ADR)

| # | Keputusan | Alasan | Status |
|---|---|---|---|
| ADR-1 | State game terpusat di `useReducer` | Satu sumber kebenaran; alur kuartal kompleks | ✅ Berlaku |
| ADR-2 | Konten game di `src/data/*.json` | Mudah ditambah tanpa sentuh kode; volume besar (48+ event) | ✅ Berlaku |
| ADR-3 | Bahasa UI Indonesia + nuansa satir | Identitas game | ✅ Berlaku |
| ADR-4 | Design canvas 1280×720, scale via JS di landscape, natural di portrait | Satu layout konsisten di semua layar | ✅ Berlaku (fix terbaru) |
| ADR-5 | Persistensi via `localStorage` (3 key) | Frontend-only; tanpa backend | ✅ Berlaku |
| ADR-6 | Suara: WebAudio prosedural (sfx) + 1 file mp3 (bgm) | Tanpa aset audio besar; bundle kecil | ✅ Berlaku |
| ADR-7 | Screenshot hasil via `html2canvas` | Fitur "simpan sebagai gambar" | ⚠️ Catatan: gambar cross-origin (ImageKit) bisa gagal dirender, tergantung CORS |
| ADR-8 | JavaScript, bukan TypeScript | Kecepatan iterasi; stack awal | ✅ Berlaku |

## 3. Pola yang Wajib Diikuti

1. **Reducer pure**: setiap aksi mengembalikan state baru tanpa mutasi langsung (`{ ...state, ... }` / spread). Sudah konsisten.
2. **Clamp indikator**: semua perubahan indikator lewat `Math.max(0, Math.min(100, val))`.
3. **Buffs/debuffs komposisi**: background + partai + wapres digabung di `START_GAME`; menteri menambah buff per posisi (`statMap`).
4. **Fallback gambar**: semua `<img>` eksternal punya `onError` (sembunyikan atau ganti teks).
5. **Suara hanya di event handler / effect**, bukan saat render (saat ini ada pelanggaran di DebatRoom & ResultScreen — harus dibersihkan).
6. **Efek negatif bisa lebih dari indikator**: efek pilihan event boleh multi-stat (contoh: pilihan "Netral Aktif" = `{keamanan+5, popularitas+8, kesejahteraan-5, apbn-8}`).

## 4. Hutang Teknis Terdaftar (dari LAPORAN_ANALISIS.md)

1. `GameContext.jsx` 897 baris — pecah per-sistem.
2. `DebatRoom.jsx` 765 baris — pecah per babak.
3. Random di dalam reducer → sulit unit test deterministik.
4. `foreignControl` & `disasterActive` mati (dead state).
5. Dead code: `if (false && showNewVPSelect)`, variabel tak terpakai (lint).
6. Bundle 564 kB (gzip 152 kB) — masih wajar, tapi bisa code-split per fase.

## 5. Arahan ke Depan

- **Refactor GameContext**: ekstrak helper murni (mis. `src/context/engine/*.js`) yang menerima `state` + payload dan mengembalikan state baru — lalu reducer tinggal memanggilnya. Ini membuka jalan unit test.
- **Code-split**: `React.lazy` untuk `DebatRoom` & `ResultScreen` (paling berat) — potong first-paint.
- **Data schema**: pertimbangkan validasi ringan (mis. `zod`) bila data JSON terus bertambah — diskusikan dulu (aturan: tanpa deps baru tanpa alasan tertulis).
