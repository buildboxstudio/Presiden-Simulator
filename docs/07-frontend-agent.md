# 07 — Frontend Agent

## 1. Peran

Frontend agent membangun & merawat seluruh UI: komponen, styling, responsif, audio, dan interaksi. Semua pekerjaan frontend terjadi di `src/`.

## 2. Inventaris Komponen

| File | Fungsi | Catatan |
|---|---|---|
| `App.jsx` | Phase router + scaling 16:9 | Jangan tambah logika game di sini |
| `TitleScreen.jsx` | Menu utama, kustomisasi (nama/bg/partai/wapres/menteri/skenario), FAQ, KARIR, ABOUT | Berisi QA mode `hidupjokowi` (harus di-disable di prod) |
| `PolicySetup.jsx` | Slider kebijakan awal | Dipakai P1 & P2 |
| `Dashboard.jsx` | Layar utama: tab Ringkasan/Kebijakan/Kabinet, laporan kuartal, header, ticker | Orkestrator modal (lihat 03) |
| `EventCard.jsx` | Popup krisis dengan deadline 20 detik + delegasi ke menteri | `shuffle()` memakai Fisher–Yates |
| `ActivityCard.jsx` | Pilih 1 dari 7 kegiatan; 20% event negatif | 2× per kuartal |
| `PartyDemand.jsx` / `MinisterProposal.jsx` / `DubiProposal.jsx` | Modal desakan partai / usulan menteri / usulan 3 periode | |
| `DebatRoom.jsx` | Pemilu 3 babak: visi-misi, debat, kampanye, voting animasi | 765 baris — target dipecah |
| `Period2Setup.jsx` | Wapres baru + reshuffle kabinet P2 | |
| `ResultScreen.jsx` | Ending, grafik, tipe presiden, screenshot | Update career stats di sini |
| `StatBar.jsx` / `NewsTicker.jsx` / `CRTOverlay.jsx` | Bar indikator / berita berjalan / overlay CRT (belum dipakai) | |

## 3. Sistem Styling

- **Tailwind CSS 4** dengan `@theme` di `src/index.css`:
  - Warna: `retroRed #961313`, `retroGreen #1a5c1a`, `retroYellow #b39c00`, `retroGray #3a3a3a`, `retroLight #dfdfcf`
  - Font: `font-retro` = VT323 (monospace pixel)
- Efek: `pixel-border`, `pixel-border-light`, `glow-text`, `blink`, `fade-in`, `shake`, `news-ticker` (scroll 20s), `scanline` (CRT, belum dipakai).
- Warna dinamis (bar, partai) via inline `style`, bukan class dinamis.
- Mobile: media query di `index.css` mengecilkan typography (max-width 640px & 380px).

## 4. Responsif (PENTING)

- **Landscape/PC**: `App.jsx` menskalakan canvas 1280×720 dengan `transform: scale()` — cek `gameRef.style.transform`, `transformOrigin center`.
- **Portrait/mobile**: layout natural, `min-height: 100vh`.
- Uji di: desktop 16:9, laptop 16:10, tablet portrait, HP sempit (≤380px), dan HP dengan browser zoom.

## 5. Audio

- `hooks/useSound.js`: **WebAudio** — semua sfx di-generate prosedural (select/click/success/danger/event/notif/gameover/victory). Tanpa file audio.
- `hooks/useBackgroundMusic.js`: `public/music/bgm.mp3`, loop, volume 0.3, path memakai `import.meta.env.BASE_URL` (aman untuk base path `/Presiden-Simulator/`).
- ⚠️ Aturan: **jangan panggil sfx saat render** — hanya di handler/effect. (Pelanggaran saat ini: `DebatRoom.jsx` `sfx.notif()` di render intro; `ResultScreen.jsx` `setTimeout(sfx)` di render — masuk backlog fix.)

## 6. Pola UI yang Wajib Dipertahankan

1. Semua tombol utama pakai teks "► ... ◄" dan border `border-2`.
2. Modal game memakai `fixed inset-0 z-40/z-50 bg-black/xx`.
3. Setiap `<img>` eksternal punya `onError` fallback.
4. Emoji sebagai ikon (konsisten, tanpa file ikon).
5. `truncate`/`break-words` untuk nama panjang pemain (maxLength 30).
6. Gaya satir khas Indonesia di semua narasi (mis. "Boy Sukro", "Budee Arie", "Universitas Gandja Madat").
