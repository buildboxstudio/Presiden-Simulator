# workflow.md — Lifecycle Versi & Deploy

## Klasifikasi Versi

| Versi | Type | Kapan | Contoh |
|-------|------|-------|---------|
| 3.0.4 | Patch | Bug, UI, copy | Hapus emoji, meta tag, typo |
| 3.1.0 | Minor | Feature baru | Save/Load game, leaderboard |
| 4.0.0 | Major | Rewrite, breaking | Backend multiplayer, platform baru |

## Proses Pre-Release

### 1. Lint & Type Check
```bash
npm run lint
```
Harus 0 error, 0 warning (atau warning yang sudah di-acknowledge).

### 2. Build
```bash
npm run build
```
Harus 0 error. Output masuk `dist/`.

### 3. Preview Lokal
```bash
npm run preview
```
Buka `http://localhost:4173`. Main game 1x lengkap:
- Title → Dashboard → DebatRoom (beberapa round) → Event (jika ada) → ResultScreen.
- Klik setiap tombol. Dengarkan audio. Cek warna/font.

### 4. Responsif Check
Test di:
- **Mobile (320px):** Chrome DevTools → iPhone 12. Scroll harus smooth, button harus klik.
- **Tablet (768px):** iPad. Layout reflow. Jangan overlap.
- **Desktop (1440px):** Monitor full. Jangan blank space besar.

### 5. Save/Load (jika ada)
Jika versi punya save feature, test:
- Buat game. Halfway → save. Close tab. Buka ulang → load. Cek state sama.
- Ubah versi. Load game lama → harus compatible atau clear cache dengan pesan user.

### 6. Performance (optional)
```bash
npm run preview
```
Buka DevTools → Performance tab. Record play 30 detik. Cek:
- FPS stabil (60 ideal, minimum 30).
- Memory tidak leak (graph stabil, tidak terus naik).
- No jank saat animasi/event.

## Deploy ke GH Pages

### Prasyarat
- `gh-pages` branch sudah ada di GitHub.
- GitHub Pages setting: Source = `gh-pages` branch.
- `vite.config.js` punya `base: './'`.

### Langkah
```bash
npm run build
npm run deploy
```

GitHub CI/CD otomatis (jika ada `.github/workflows/deploy.yml`). Atau manual:
```bash
npx gh-pages -d dist
```

### Verifikasi Deploy
1. Push, tunggu CI ~2 menit (atau langsung jika manual).
2. Kunjungi `https://<username>.github.io/game-president/`.
3. Play 1 game lengkap di production. Cek semuanya work.

## Rollback Jika Gagal

Jika deploy bermasalah:
```bash
git revert <commit-hash>
npm run build && npm run deploy
```

Atau manual revert `gh-pages` branch ke commit terakhir yang stabil.

## Changelog Maintenance

Setiap rilis:
1. Edit `CHANGELOG.md` (top = latest version).
2. Format: [Keep a Changelog](https://keepachangelog.com) — Added/Changed/Fixed/Removed.
3. Include: tanggal, version, commit hash (opsional).

Contoh:
```markdown
## [3.0.4] - 2024-11-06

### Changed
- Removed decorative emoji from UI labels (Dashboard, ActivityCard).
- Removed comment decorations from `index.css` for cleaner code.

### Added
- Meta tags: `og:title`, `og:description`, `og:type`, `og:locale` untuk SEO.

### Fixed
- Meta tag for favicon was missing from `index.html`.
```

## Pre-Commit Checklist

Sebelum `git push`:
- [ ] `npm run lint` — 0 error.
- [ ] `npm run build` — 0 error, `dist/` ada.
- [ ] `npm run preview` — play test, semua work.
- [ ] `CHANGELOG.md` updated.
- [ ] Versi di `package.json` updated.
- [ ] Commit message jelas: `3.0.4: fix emoji labels and metadata`.

## Troubleshooting

| Masalah | Solusi |
|---------|---------|
| Build fail: "VT323 font not found" | Cek `index.html` link Google Fonts aktif. Kalau offline, font fallback ke monospace. |
| Build fail: "ESLint error" | Baca error message. Biasanya unused var, missing import. Fix atau add `.eslintignore`. |
| Deploy fail: "gh-pages branch not found" | Buat branch: `git checkout --orphan gh-pages && git commit --allow-empty -m "init" && git push -u origin gh-pages`. |
| Preview blank page | Cek `vite.config.js` punya `base: './'`. Jika `base: '/'`, akan 404 di GH Pages (bukan root). |
| Sound tidak jalan | Cek `src/assets/sounds/` folder ada. Browser autoplay policy bisa block. User harus interaksi dulu (click tombol). |
