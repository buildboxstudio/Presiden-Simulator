# Changelog

Semua perubahan signifikan untuk project ini didokumentasikan di file ini.

Format berdasarkan [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
dan project ini mengikuti [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [3.1.0] - 2024-11-06

### Added
- 7 event baru terkait krisis 2026:
  - **Periode 1 (IDs 39–41):** Skandal penyadapan Jenderal Polri (id 39), Kebakaran hutan masif (id 40), Demonstrasi nasional mahasiswa (id 41).
  - **Periode 2 (IDs 129–131):** Skandal penyadapan fase 2 (id 129), Karhutla fase 2 dengan ancaman global (id 130), Demonstrasi puncak ratusan ribu (id 131).
- 5 soal debat baru di DebatRoom.jsx menggantikan yang lama:
  1. Skandal penyadapan Jenderal Polri (pengganti utang luar negeri).
  2. Kebakaran hutan & izin sawit-tambang (pengganti kesejahteraan rakyat umum).
  3. Demonstrasi mahasiswa & rakyat (pengganti korupsi kabinet umum).
  4. Program Makan Bergizi Gratis Rp 335 triliun (pengganti rupiah melemah).
  5. Turun/pertahankan PPN 12% vs 10% (pengganti deforestasi umum).

### Changed
- DEBATE_QUESTIONS array di DebatRoom.jsx—semua 5 topik disesuaikan dengan peristiwa real 2026.
- Events scoring dan effects disesuaikan dengan gameplay balance (dialog dialog, demo, transparansi).

### Note
- Ini adalah versi feature (3.1.0), bukan breaking (4.0.0), karena game mechanics tetap sama. Event dan soal debat hanya konten baru.
- Save game dari 3.0.4 akan tetap compatible karena tidak ada perubahan struktur data fundamental.

---

## [3.0.4] - 2024-11-06

### Added
- Meta tags untuk SEO: `og:title`, `og:description`, `og:type`, `og:locale` di `index.html`.
- Dokumentasi proyek: `AGENTS.md`, `project-memory.md`, `workflow.md`.

### Changed
- Removed decorative emoji dari UI labels:
  - Dashboard: "🎯 Aksi" → "Aksi", "⚠ Bahaya!" → "Bahaya!".
  - ActivityCard: "⚠ {event}" → "{event}".
  - Ikon di data files (`src/data/*.json`) tetap intact (mereka adalah identitas data, bukan UI decoration).
- Removed comment decorations (`/* ── ... ── */`) dari `index.css` untuk code cleanliness.

### Fixed
- Missing favicon link di `index.html` (sebelumnya ada placeholder, sekarang clean).

---

## [3.0.3] - 2024-10-20

### Added
- Baseline: Game mechanics, turn system, activity & event loop.
- UI components: TitleScreen, Dashboard, DebatRoom, ResultScreen.
- Sound toggle & background music.
- Responsive design untuk mobile (320px), tablet (768px), desktop (1024px+).
- VT323 pixel font untuk aesthetic retro.

### Known Limitations
- APBN overspend dilepas (cap di 100%, sisanya hilang). *Shortcut: upgrade saat balancing diperlukan.*
- Event trigger hardcoded per turn. *Shortcut: refactor ke data-driven event scheduler di v3.2.0.*
- Tidak ada save/load. *Planned untuk v3.2.0.*
- Tidak ada leaderboard. *Planned untuk v3.2.0.*

---

## [3.0.0 - 3.0.2] - Earlier

- Initial development.
- Core game logic & UI.
- Testing & QA fixes.

---

## Upcoming

### [3.2.0] - Planned
- Save & Load game state (localStorage).
- Leaderboard (top 10 scores, localStorage).

### [4.0.0] - Planned
- Backend multiplayer (user registration, shared leaderboard).
- Cross-device sync (account-based).

---

## Format Reference

- **Added** untuk fitur baru.
- **Changed** untuk perubahan existing behavior.
- **Removed** untuk feature yang sudah dihapus.
- **Fixed** untuk bug fix.
- **Known Limitations** untuk debt atau shortcut.
