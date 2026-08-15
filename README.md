# 🇮🇩 PRESIDEN SIMULATOR

> Game simulasi menjadi Presiden Indonesia selama 2 periode. Atur kebijakan, hadapi krisis, menangkan pemilu — atau digulingkan rakyat.

**Buildbox Studio © 2026** — https://github.com/buildboxstudio/Presiden-Simulator
**Mainkan live:** https://buildboxstudio.github.io/Presiden-Simulator/

---

## 🎮 Tentang Game

Kamu terpilih sebagai Presiden Republik Indonesia. Selama **2 periode** (masing-masing 20 kuartal), kamu mengelola 5 indikator negara:

| Indikator | 0% = |
|---|---|
| 💰 APBN | Krisis anggaran / negara bangkrut |
| ⚔ Keamanan | Kudeta militer |
| ❤️ Kesejahteraan | Revolusi rakyat |
| 🏗 Infrastruktur | Kehancuran infrastruktur |
| ⭐ Popularitas | Impeachment |

Setiap kuartal kamu harus memilih kegiatan, menghadapi krisis (dengan deadline 20 detik!), merespons desakan partai, mengatur kebijakan, dan menjaga loyalitas kabinet. Menangkan Pemilu untuk lanjut ke periode 2 — atau lengser dalam aib.

**Fitur utama:**
- 🧑‍⚖️ Kustomisasi lengkap: latar belakang, partai, wapres, 4 menteri, skenario
- 📜 48+ event krisis prosedural (periode 1 & 2) dengan narasi satir khas Indonesia
- 🗳 Pemilu 3 babak: Visi & Misi → Debat Terbuka → Kampanye & Pemungutan Suara
- 🦅 Plot twist: wapres bisa berkhianat, LOYALIS PRESIDEN (Budee Arie) bisa muncul
- 💾 Autosave, checkpoint & retry, statistik karir, achievements, skenario unlockable
- 📸 Simpan hasil akhir sebagai gambar

## 🛠 Tech Stack

React 19 · Vite 8 · Tailwind CSS 4 · JavaScript (JSX) · html2canvas · GitHub Pages

## 📁 Struktur Cepat

```
src/
├── App.jsx                  # Phase router + 16:9 scaling
├── context/GameContext.jsx  # State machine utama (reducer) + localStorage
├── components/              # 17 komponen UI
├── data/                    # 8 file JSON = "database" konten game
└── hooks/                   # useSound (WebAudio), useBackgroundMusic
```

## 📚 Dokumentasi Lengkap

Seluruh dokumentasi proyek ada di folder **[`docs/`](docs/)**:

| Doc | Isi |
|---|---|
| [00-project-rules.md](docs/00-project-rules.md) | Aturan & prinsip proyek |
| [01-system-overview.md](docs/01-system-overview.md) | Gambaran sistem & alur game |
| [02-architecture.md](docs/02-architecture.md) | Arsitektur & alur data |
| [03-orchestrator.md](docs/03-orchestrator.md) | Orkestrasi fase & prioritas modal |
| [04–12] | Peran agent (planner, architect, backend, frontend, QA, debug, security, devops, reporter) |
| [13-agent-communication.md](docs/13-agent-communication.md) | Protokol komunikasi antar agent |
| [14-project-memory.md](docs/14-project-memory.md) | Memori proyek & keputusan penting |
| [15-workflow.md](docs/15-workflow.md) | Alur kerja standar |
| [16-repository-structure.md](docs/16-repository-structure.md) | Struktur repo terperinci |
| [17-coding-standard.md](docs/17-coding-standard.md) | Standar kode |
| [18-testing-standard.md](docs/18-testing-standard.md) | Standar pengujian |
| [19-deployment.md](docs/19-deployment.md) | Cara build & deploy |
| [20-roadmap.md](docs/20-roadmap.md) | Roadmap & backlog |

Laporan audit teknis: **[LAPORAN_ANALISIS.md](LAPORAN_ANALISIS.md)**

## 🚀 Menjalankan

```bash
npm install        # wajib di lingkungan baru
npm run dev        # development (Vite)
npm run build      # build produksi ke dist/
npm run lint       # ESLint (src/ wajib bersih)
npm run deploy     # build + push ke gh-pages
```

## ✍️ Kontribusi / Catatan

- Bahasa UI **Indonesia** (dengan nuansa satir).
- Logika game 100% di frontend; tidak ada backend.
- Ikuti aturan di `docs/00-project-rules.md` sebelum mengubah kode.
