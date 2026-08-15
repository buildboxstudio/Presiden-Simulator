# 03 — Orkestrator (Orchestrator)

## 1. Peran

Orkestrator adalah **konduktor** yang memastikan fase permainan berjalan urut, prioritas UI benar, dan setiap bagian tahu kapan harus tampil. Dalam proyek ini peran itu dipegang oleh **dua lapisan kode**:

1. `src/App.jsx` — phase router (kapan komponen mana dirender).
2. `src/context/GameContext.jsx` — state machine (transisi fase + modal mana yang "aktif").

## 2. Tabel Routing Fase (App.jsx)

| `state.phase` | Komponen | Deskripsi |
|---|---|---|
| `menu` | `TitleScreen` | Judul, kustomisasi, FAQ, karir |
| `setup` | `PolicySetup` | Atur kebijakan awal (P1 & P2) |
| `game` | `Dashboard` | Loop kuartal utama |
| `pemilu` | `DebatRoom` | 3 babak pemilu |
| `period2_setup` | `Period2Setup` | Pilih wapres baru + reshuffle |
| `result` | `ResultScreen` | Ending + statistik |

Fase `setup` dipakai dua kali (awal P1 dan awal P2) — dibedakan lewat `state.period`.

## 3. Prioritas Modal (Dashboard)

Saat kuartal berakhir, beberapa "popup" bisa aktif bersamaan. Orkestrasi prioritasnya (di `Dashboard.jsx`):

```
dubiProposal (usulan 3 periode)   ← tertinggi, z-50
  → ministerProposal (usulan menteri, z-50)
  → partyDemand (desakan partai, z-50)
  → showQuarterReport (laporan, z-40)
  → currentEvent (krisis, z-50)   ← muncul setelah laporan ditutup
  → showActivity (aksi 1..2, z-40) ← setelah krisis selesai
```

Aturan di kode:
- Laporan kuartal disembunyikan jika `dubiProposal` aktif (`showQuarterReport: !dubiProposal`).
- `MinisterProposal` & `PartyDemand` hanya muncul bila tidak ada event aktif.
- Flow aksi: `handleHideReport()` → `pendingActivity=true` → effect memunculkan `ActivityCard` bila `!currentEvent`; setelah 2 aksi selesai, pemain bebas klik "AKHIRI KUARTAL".

## 4. Aturan Orkestrasi

1. **Satu sumber kebenaran**: jangan simpan "fase" di dua tempat. Hanya `state.phase`.
2. **Transisi fase hanya lewat reducer** — tidak ada `navigate()` manual antar komponen.
3. **Modal eksklusif**: aturan prioritas di atas wajib dipertahankan; jangan tampilkan dua modal game-logika sekaligus.
4. **Orkestrator tidak boleh berisi logika game** — hanya routing & prioritas tampilan.

## 5. Catatan untuk Agent

- Saat menambah fase baru: tambah di reducer (action yang mengubah `phase`) + di `App.jsx` + tes manual alurnya.
- Saat menambah modal baru: tentukan posisinya dalam hierarki prioritas di atas.
- QA test mode (`QA_SKIP`) memakai orkestrasi fase untuk melompat — jangan sampai bocor ke produksi (lihat 10-security-agent).
