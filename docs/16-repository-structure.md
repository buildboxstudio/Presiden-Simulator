# 16 — Struktur Repository (Repository Structure)

## 1. Pohon Folder (kode AKTIF)

```
Game President/                      ← root proyek (repo git)
├── README.md                        ← README proyek (bukan template lagi) ✅
├── LAPORAN_ANALISIS.md              ← Audit teknis & inventaris bug
├── package.json                     ← deps: react, react-dom, html2canvas; dev: vite, tailwind, eslint, gh-pages
├── package-lock.json
├── vite.config.js                   ← base '/Presiden-Simulator/', build config
├── eslint.config.js                 ← flat config (js.recommended + react-hooks + react-refresh)
├── postcss.config.js
├── index.html                       ← root HTML (font VT323, title)
├── .gitignore                       ← node_modules, dist, logs
├── public/
│   └── music/bgm.mp3                ← musik latar (loop)
├── dist/                            ← hasil build (di-ignore git)
├── docs/                            ← dokumentasi proyek (21 file, 00–20)
└── src/
    ├── main.jsx                     ← entry React (StrictMode + GameProvider)
    ├── App.jsx                      ← phase router + scaling 16:9 (83 baris)
    ├── index.css                    ← Tailwind 4 @theme, efek pixel, responsive
    ├── context/
    │   └── GameContext.jsx          ← ★ reducer + provider + localStorage (897 baris)
    ├── data/                        ← ★ "database" konten (JSON)
    │   ├── backgrounds.json         ← 6 latar belakang
    │   ├── parties.json             ← 3 partai
    │   ├── vicePresidents.json      ← 3 wapres P1
    │   ├── ministerCandidates.json  ← 4 posisi × 5 kandidat
    │   ├── policies.json            ← 6 kebijakan
    │   ├── events.json              ← 29 krisis P1
    │   ├── events_periode2.json     ← 19 krisis P2
    │   └── campaign.json            ← 8 program kampanye
    ├── hooks/
    │   ├── useSound.js              ← WebAudio sfx prosedural
    │   └── useBackgroundMusic.js    ← bgm.mp3 loop
    └── components/
        ├── TitleScreen.jsx          ← menu, kustomisasi, FAQ, karir (337)
        ├── PolicySetup.jsx          ← slider kebijakan awal (77)
        ├── Dashboard.jsx            ← loop kuartal utama (351)
        ├── EventCard.jsx            ← popup krisis + timer 20s (222)
        ├── ActivityCard.jsx         ← 2 aksi/kuartal (184)
        ├── PartyDemand.jsx          ← desakan partai (39)
        ├── MinisterProposal.jsx     ← usulan menteri (71)
        ├── DubiProposal.jsx         ← usulan 3 periode (40)
        ├── DebatRoom.jsx            ← pemilu 3 babak (765 — target pecah)
        ├── Period2Setup.jsx         ← wapres P2 + reshuffle (181)
        ├── ResultScreen.jsx         ← ending + tipe presiden + screenshot (275)
        ├── StatBar.jsx              ← bar indikator (44)
        ├── NewsTicker.jsx           ← berita berjalan (22)
        ├── PartySelect.jsx          ← pilih partai (69)
        ├── VPSelect.jsx             ← pilih wapres (63)
        ├── MinisterSelect.jsx       ← pilih kabinet (84)
        └── CRTOverlay.jsx           ← overlay CRT (8 — belum dipakai)
```

## 2. Folder NON-AKTIF (belum ter-track git — menunggu keputusan pemilik)

| Folder | Isi | Rekomendasi |
|---|---|---|
| `v3.0.2/` | Salinan proyek lama (dengan node_modules, dist, src) | Arsipkan/hapus — **jangan di-track** |
| `v3_0_3/` | Salinan proyek (hampir identik src aktif) | Arsipkan/hapus |
| `public_html/` | Build statis lama (index.html + assets + music) | Arsipkan/hapus |
| `Android App/` | Versi Android (android/ + dist + src + node_modules) | Pisahkan ke repo sendiri bila mau dilanjutkan |

> ⚠️ Folder ini membuat `npm run lint` men-scan 2.121 masalah (mayoritas dari salinan lama). Pembersihan = prioritas P2 (konfirmasi pemilik dulu).

## 3. Git Branch

- **`main`** — source aktif (HEAD: `62cce8a` Fix PC layout)
- **`gh-pages`** — build deploy GitHub Pages (tertinggal 2 commit — deploy ulang)

## 4. Peta Kepemilikan Kode (siapa bertanggung jawab apa)

| Area | File utama | Agent yang paling sering menyentuh |
|---|---|---|
| Logika game | `GameContext.jsx` | backend/planner (unit test target) |
| UI dashboard | `Dashboard.jsx` + komponen modal | frontend |
| Pemilu | `DebatRoom.jsx` | frontend + QA |
| Konten | `src/data/*.json` | planner/frontend (data-driven) |
| Build/deploy | `vite.config.js`, `package.json` | devops |
| Kualitas | `eslint.config.js`, `docs/17,18` | QA/debug |
