# 06 — Backend Agent

## 1. Status Jujur

**Proyek ini 100% frontend — tidak ada server, database, API, atau autentikasi.** Peran "backend" di sini dipegang oleh tiga lapisan:

1. **Content layer** — `src/data/*.json` (bertindak sebagai "database" konten).
2. **Persistence layer** — `localStorage` (save game, statistik karir, unlock skenario).
3. **External services** — CDN gambar (ImageKit), Google Fonts, file musik lokal (`public/music/bgm.mp3`).

## 2. "Database" Konten (src/data/)

| File | Isi | Jumlah |
|---|---|---|
| `events.json` | Krisis periode 1 | 29 |
| `events_periode2.json` | Krisis periode 2 (id mulai 101) | 19 |
| `policies.json` | 6 kebijakan dengan `effectsPer10` | 6 |
| `backgrounds.json` | 6 latar belakang (wealth: kaya/cukupan/miskin) | 6 |
| `parties.json` | 3 partai (Nasionalis/Agamis/Demokrat) | 3 |
| `vicePresidents.json` | 3 wapres P1 (satu `will_betray`) | 3 |
| `ministerCandidates.json` | 4 posisi × 5 kandidat (skill/loyalty) | 4 grup |
| `campaign.json` | 8 program kampanye dengan syarat `requires` | 8 |

**Konvensi skema:**
- Event: `{ id, title, description, deddy_intro, choices: [{label, effects{stat:delta}}], vp_advice? }`
- Semua efek memakai key indikator: `apbn`, `keamanan`, `kesejahteraan`, `infrastruktur`, `popularitas`.
- `effectsPer10` pada policy = efek per 10 poin deviasi dari `default`.

## 3. Persistence (localStorage)

| Key | Ditulis oleh | Format |
|---|---|---|
| `presiden_save` | `saveGame()` (autosave tiap laporan kuartal) | JSON state minus `phase`, `currentEvent`, `showQuarterReport`, `quarterReportText` |
| `presiden_career` | `updateCareerStats()` di ResultScreen | `{gamesPlayed, gamesWon, gamesLost, totalQuarters}` |
| `presiden_unlocks` | `unlockScenario()` | `["super_krisis", ...]` |

⚠️ Catatan: `saveGame` memakai closure `state` — pastikan dipanggil setelah state terbaru (autosave sudah di `useEffect [showQuarterReport]`, jadi aman).

## 4. External Services

- **ImageKit CDN**: semua gambar (garuda, peta, logo partai, foto wapres, hasil pemilu). Tergantung uptime CDN; semua `<img>` punya fallback.
- **Google Fonts**: VT323 (di `index.html`).
- **Tidak ada** analytics, telemetri, atau API pihak ketiga lainnya.

## 5. Arahan ke Depan (jika backend dibutuhkan)

Fitur yang masuk akal bila pemilik ingin skala (lihat 20-roadmap):
1. **Leaderboard/tantangan mingguan** — backend ringan (Supabase/Firebase) menyimpan skor akhir.
2. **Cloud save / sinkronisasi antar perangkat** — save `presiden_save` ke cloud.
3. **Analitik funnel** — Plausible/GA4 untuk tahu di fase mana pemain berhenti.

**Aturan:** jangan tambah backend tanpa persetujuan pemilik. Selama frontend-only, semua logic harus tetap bisa jalan offline.
