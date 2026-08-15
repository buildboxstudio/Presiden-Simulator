# 13 — Komunikasi Antar Agent (Agent Communication)

## 1. Model Kerja

Proyek ini dikerjakan oleh kombinasi **manusia (pemilik)** dan **agent AI** yang bekerja di satu workspace (`E:\Projek Aplikasi\Game President`). Komunikasi terjadi lewat: permintaan tugas (user → agent), dokumen (agent → agent via file), dan laporan (agent → user).

## 2. Protokol Handoff Tugas

```
1. PEMILIK memberi tugas (tujuan, bukan langkah detail)
2. AGENT membaca konteks: docs/ terkait, LAPORAN_ANALISIS.md, kode terkait
3. AGENT menulis rencana via write_todos (multi-langkah) — atau langsung bila sederhana
4. AGENT mengimplementasikan (file yang relevan saja)
5. AGENT memverifikasi: build + lint + test manual yang relevan
6. AGENT melapor (format di 12-reporter-agent.md)
7. PEMILIK menyetujui / meminta revisi / memberi tugas berikutnya
```

## 3. Aturan Komunikasi

| Aturan | Penjelasan |
|---|---|
| Bahasa | Indonesia untuk laporan & dokumen; kode tetap bahasa Inggris (identifier) |
| Satu tujuan per tugas | Jangan campur fix bug + refactor + fitur baru dalam satu permintaan |
| Tanya sebelum eksekusi besar | Deploy, hapus folder, ubah mekanik game, ganti dependensi, commit/push — konfirmasi dulu |
| Jangan eksekusi perintah destruktif | `git push`, `git reset`, `git rebase`, `git branch -D`, hapus file di luar proyek — butuh izin |
| Perintah dengan efek besar | `npm run deploy` (mengubah situs live) — konfirmasi dulu |
| Sumber kebenaran | `docs/` adalah kanon; perbarui saat ada perubahan keputusan |

## 4. Format Pesan antar Agent (via file)

Agen tidak saling bicara langsung — mereka bertukar lewat dokumen:

| Pesan | File |
|---|---|
| Rencana tugas | `docs/04-planner-agent.md` (backlog) + `write_todos` |
| Temuan bug | `docs/09-debug-agent.md` (inventaris) |
| Keputusan desain | `docs/05-architect-agent.md` (ADR) |
| Memori/insiden | `docs/14-project-memory.md` |
| Backlog & roadmap | `docs/20-roadmap.md` |
| Laporan audit | `LAPORAN_ANALISIS.md` |
| Standar | `docs/00-project-rules.md`, `17`, `18` |

## 5. Konvensi Tanda Status

- `✅` selesai / terverifikasi
- `🟠` sebagian / tertunda / butuh keputusan
- `🔴` gagal / kritis / butuh tindakan segera
- `[ ]` item backlog belum dikerjakan, `[x]` selesai

## 6. Aturan Git untuk Semua Agent

1. **Jangan commit/push tanpa diminta** — user (atau skill commit) yang meminta.
2. Bila diminta commit: `git diff` dulu, stage hanya file relevan (jangan `git add -A`), pesan commit fokus pada "mengapa".
3. Jangan menyentuh perubahan milik pihak lain di workspace (cek `git status` sebelum operasi git).
4. Jangan pernah menampilkan/menyebarkan token yang ditemukan di konfigurasi — laporkan saja.
