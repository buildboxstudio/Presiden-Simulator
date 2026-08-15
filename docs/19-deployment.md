# 19 — Deployment

## 1. Target

- **Hosting:** GitHub Pages
- **URL:** https://buildboxstudio.github.io/Presiden-Simulator/
- **Branch deploy:** `gh-pages` (root) — dikelola otomatis oleh paket `gh-pages`
- **Base path:** `/Presiden-Simulator/` (di `vite.config.js` — **jangan diubah**)

## 2. Prasyarat

```bash
npm install    # wajib di lingkungan baru (kasus nyata: html2canvas tidak ter-install → build gagal)
```

## 3. Alur Deploy

```bash
# 1) Verifikasi lokal
npm run build
npx eslint src/

# 2) Deploy (build + push dist ke gh-pages) — MINTALAH IZIN pemilik dulu
npm run deploy

# 3) Verifikasi
git log origin/gh-pages -1        # harus commit baru (pesan biasanya dari gh-pages)
# buka URL live dengan hard refresh (Ctrl+Shift+R)
```

**Perintah `npm run deploy`** = `vite build && npx gh-pages -d dist`.

## 4. Verifikasi Post-Deploy

- [ ] URL live terbuka, title "PRESIDEN SIMULATOR"
- [ ] Aset dimuat dari `/Presiden-Simulator/assets/...` (DevTools → Network, tidak ada 404)
- [ ] Musik latar jalan saat klik pertama (path `/Presiden-Simulator/music/bgm.mp3`)
- [ ] Layout PC 16:9 benar (fitur fix `62cce8a`)
- [ ] Tidak ada error konsol (khususnya React error/warning)

## 5. Insiden yang Pernah Terjadi

**"Situs live tertinggal 2 commit" (14 Agustus 2026):**
- `gh-pages` berhenti di `94f73ac`; `main` sudah punya `6f785d3` (Save v3.0.2) & `62cce8a` (Fix PC layout).
- Pemain di live belum mendapat perbaikan layout PC.
- **Solusi:** `npm run deploy` (belum dijalankan — menunggu izin pemilik).
- **Pencegahan:** pasang CI/CD (lihat §7).

## 6. Rollback (jika deploy buruk)

1. Ambil build lama dari riwayat `gh-pages`:
   ```bash
   git checkout gh-pages
   git log --oneline          # pilih commit yang bagus
   git reset --hard <commit>  # hati-hati: butuh izin — operasi git destruktif
   git push origin gh-pages --force   # butuh izin eksplisit!
   ```
2. Alternatif lebih aman: checkout file `dist` dari commit lama lalu `npx gh-pages -d dist` (push normal tanpa force).
> Rollback memengaruhi situs live — selalu koordinasi dengan pemilik.

## 7. CI/CD yang Direkomendasikan (belum ada)

Buat `.github/workflows/deploy.yml` (contoh di `docs/11-devops-agent.md`): build + lint + test + deploy otomatis ke `gh-pages` tiap push ke `main`, memakai `secrets.GITHUB_TOKEN` (aman, tidak perlu token pribadi).

Manfaat:
- Menghapus kasus "lupa deploy".
- Gerbang kualitas otomatis (build + eslint + test).
- Tidak ada token pribadi di workflow.

## 8. Troubleshooting

| Gejala | Solusi |
|---|---|
| `Failed to resolve import "html2canvas"` | `npm install` (node_modules basi) |
| Aset 404 | Cek `base` di `vite.config.js` = `/Presiden-Simulator/` |
| CSS/JS lama (cache) | Hard refresh; GitHub Pages cache agresif |
| Live beda dari source | `git log origin/gh-pages..main` — bila ada commit, deploy ulang |
| Gambar hasil screenshot kosong | CORS ImageKit; `useCORS: true` di html2canvas sudah ada — tidak memblokir game |
| BGM tidak bunyi | Autoplay policy — klik pertama memicu `startMusic` (sudah ditangani) |

## 9. Checklist Rilis Versi Baru

1. Naikkan `version` di `package.json` & `APP_VERSION` di `TitleScreen.jsx`.
2. Perbarui teks "Pembaruan terakhir" di layar ABOUT.
3. `npm run build` + `npx eslint src/` hijau.
4. Tes manual alur utama (checklist `docs/08-qa-agent.md`).
5. Deploy (dengan izin) & verifikasi.
6. Catat di `docs/14-project-memory.md`.
