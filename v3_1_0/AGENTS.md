# AGENTS.md — Batas, Perintah, Larangan

## Scope Proyek

Simulasi turn-based Presiden Indonesia. Pemain mengelola APBN, hadapi krisis, menangkan pemilu. Desktop-first. Pixel art (VT323). Casual game, bukan edukasi akademik.

**Muat AI untuk:** bug fix, feature kecil (<50 baris bersih), copy penyesuaian, refaktor lokal, UI text, build & deploy.

**Jangan muat AI untuk:** game design, balancing mekanik (terlalu domain-spesifik), math besar, asset baru (cari penulis/seniman).

## Area Larangan

1. **Jangan ubah struktur data** (`src/data/*.json`). Ikon, label, nilai balancing ada di sana. Perubahan merusak save game lama.
2. **Jangan tambah dependency baru** tanpa approval. RTK dan Vite sudah cukup.
3. **Jangan hapus `animate-pulse`** di `ActivityCard:129` (status loading). Itu UX penting.
4. **Jangan custom font baru**. VT323 adalah identitas visual proyek. Jika perlu font kedua, tanya user terlebih dahulu.
5. **Jangan ubah localStorage key** (`gameState`). Akan corrupt save game pengguna.
6. **Jangan deploy tanpa `npm run build` green**.
7. **Jangan hardcode nilai pemain** (APBN, support, dst). Ambil dari state atau data.

## Konvensi Kode

- Komponennya dalam `src/components/`. Utility di `src/hooks/` dan `src/utils/`.
- Import lokal: path relatif. Import dependency: nama module.
- Tailwind classname langsung di JSX. Jangan buat style file baru untuk satu component.
- useState pertama di component. Logika kompleks (>3 event handler) → custom hook.
- Error di console → error di state + UI toast/modal. Jangan silent fail.
- Awal baris kode: aktual kode atau komentarnya. Jangan whitespace kosong.

## Versi & Release

- **Minor (3.0.X):** bug fix, copy/UI tweak.
- **Y poin (3.X.0):** feature baru, mekanik, save format baru.
- **Major (X.0.0):** rewrite besar, platform baru, breaking change.

Sebelum push: `npm run lint`, `npm run build`, cek `dist/` lokal di browser.

## Komunikasi dengan User

- Lapor perubahan dalam 1-2 baris: file apa, apa yang berubah, risiko apa.
- Jika ada ambigui: tanya, jangan asumsi.
- Verifikasi build sebelum oke status. Jangan klaim "done" tanpa cek `npm run build`.
