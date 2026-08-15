# 11 — DevOps Agent

## 1. Peran

DevOps agent mengelola build, deploy, lingkungan, dan otomatisasi. Target produksi: **GitHub Pages** di https://buildboxstudio.github.io/Presiden-Simulator/.

## 2. Tooling

| Tool | Versi | Peran |
|---|---|---|
| Node/npm | — (package.json: vite ^8) | Runtime build |
| Vite 8 | rolldown | Build & dev server |
| gh-pages | ^6.3.0 | Deploy `dist/` ke branch `gh-pages` |
| ESLint 10 | — | Gerbang kualitas |

## 3. Perintah Standar

```bash
npm install        # wajib di lingkungan baru (kasus nyata: html2canvas hilang → build gagal)
npm run dev        # dev server (Vite, HMR)
npm run build      # output ke dist/
npm run lint       # ESLint seluruh repo (scan juga folder arsip!)
npx eslint src/    # lint kode aktif saja (standar kualitas)
npm run preview    # lihat hasil build lokal
npm run deploy     # build + push dist ke gh-pages
```

## 4. Konfigurasi Build (`vite.config.js`)

```js
base: '/Presiden-Simulator/',   // WAJIB — agar aset benar di sub-path GitHub Pages
build: { sourcemap: false, cssMinify: true }
```

⚠️ **Jangan** hapus/mengubah `base` — semua path aset (termasuk `music/bgm.mp3` via `import.meta.env.BASE_URL`) bergantung padanya.

## 5. Deploy (GitHub Pages)

1. `npm run deploy` → vite build + `gh-pages -d dist`.
2. Repo di-set GitHub Pages → branch `gh-pages` (root) — sudah aktif.
3. Verifikasi: `git log origin/gh-pages -1` menunjukkan commit baru; buka URL live.

**Insiden terdokumentasi:** branch `gh-pages` sempat tertinggal 2 commit dari `main` (`6f785d3` Save v3.0.2 + `62cce8a` Fix PC layout) — **situs live belum memuat fix PC layout**. Penyebab: deploy terakhir dilakukan sebelum commit terbaru di main. Solusi: jalankan `npm run deploy`.

## 6. Branch & Lingkungan

| Branch | Isi | Kapan |
|---|---|---|
| `main` | Source aktif | Semua pekerjaan |
| `gh-pages` | Hasil build (`dist/`) — dikelola `gh-pages` | Auto saat deploy |

> Jangan commit hasil build ke `main` (dist di-ignore). Source of truth = `src/`.

## 7. CI/CD yang Direkomendasikan (belum ada)

Tambahkan `.github/workflows/deploy.yml` agar deploy otomatis tiap push ke `main` — mencegah kasus "live tertinggal":

```yaml
name: Deploy
on:
  push:
    branches: [main]
permissions:
  contents: write
jobs:
  build-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20 }
      - run: npm ci
      - run: npm run build
      - run: npx eslint src/
      - uses: peaceiris/actions-gh-pages@v4
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist
```

## 8. Pembersihan Workspace (disarankan)

Folder **tidak ter-track git** di workspace: `Android App/`, `public_html/`, `v3.0.2/`, `v3_0_3/` (berisi node_modules & dist sendiri). Risiko: kebingungan versi & lint ikut men-scan file lama (2.121 masalah). **Saran:** arsipkan di luar project atau tambahkan ke `.gitignore` — konfirmasi ke pemilik dulu.

## 9. Troubleshooting

| Gejala | Penyebab | Solusi |
|---|---|---|
| `Failed to resolve import "html2canvas"` | node_modules basi | `npm install` |
| Gambar kosong di hasil screenshot | CORS ImageKit | Fallback `onError` sudah ada; coba `useCORS: true` tetap dipertahankan |
| Aset 404 setelah deploy | `base` berubah | Kembalikan `'/Presiden-Simulator/'` |
| Suara bgm tidak berbunyi | Autoplay policy browser | Sudah ditangani: start saat klik pertama |
