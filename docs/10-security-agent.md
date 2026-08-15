# 10 — Security Agent

## 1. Peran

Security agent melindungi kredensial, build produksi, dan data pemain. Proyek ini frontend-only — **permukaan serangan relatif kecil**, tapi ada beberapa temuan penting.

## 2. Temuan & Status

| # | Temuan | Severity | Status |
|---|---|---|---|
| S1 | **Token GitHub (PAT) tersimpan plaintext di `.git/config`** (remote URL `https://buildboxstudio:ghp_...@github.com/...`) | 🔴 Kritis | Terbuka — **rotasi token wajib** + set-url ulang remote |
| S2 | **QA mode `hidupjokowi` aktif di produksi** — pemain bisa skip game, mengotori `presiden_career` & unlock skenario | 🟠 Tinggi | Terbuka — gate dengan `import.meta.env.DEV` |
| S3 | Tidak ada secret lain di `src/` (scan `ghp_|token|api_key|secret` = 0 match) | ✅ | Bersih |
| S4 | Tidak ada input pengguna yang dirender sebagai HTML (`dangerouslySetInnerHTML` tidak dipakai) → **tidak ada XSS praktis** | ✅ | Aman |
| S5 | `localStorage` menyimpan save game — data pemain lokal, tidak dikirim ke mana pun | ✅ | Aman (privasi) |
| S6 | Gambar eksternal dari ImageKit — semua `<img>` punya `onError` fallback | ✅ | Aman |
| S7 | `npm audit` menemukan beberapa advisory (lihat output `npm install`) — perlu dicek `npm audit` ulang setelah dependensi di-pin | 🟡 | Ditinjau |

## 3. Detail S1 — Token GitHub (PRIORITAS)

Token `ghp_...` ada di `remote.origin.url` (file `.git/config`). Tidak ikut ter-commit ke repo (jadi tidak terekspos publik via GitHub), **tetapi**:
- Muncul di riwayat shell bila ada yang menjalankan `git push -v` / `git remote -v`.
- Siapa pun yang mendapat salinan folder proyek (backup, zip, pindah PC) punya akses tulis penuh ke repo publik.

**Langkah wajib (pemilik, manual):**
1. Revoke token: GitHub → Settings → Developer settings → Personal access tokens → delete.
2. Bersihkan remote:
   ```bash
   git remote set-url origin https://github.com/buildboxstudio/Presiden-Simulator.git
   ```
3. Gunakan autentikasi aman: `gh auth login` (GitHub CLI) atau SSH key.
4. Verifikasi: `git remote -v` tidak lagi menampilkan token.

## 4. Detail S2 — QA Mode

Mengetik nama `hidupjokowi` memunculkan panel QA yang memanggil `qaSkip(...)` dan `startGame(...)` langsung. Karena `ResultScreen` menghitung `updateCareerStats` + `unlockScenario` saat ending, **pemain bisa menambah gamesWon/Lost & membuka skenario tanpa bermain**.

**Fix yang direkomendasikan** (draf):
```js
// TitleScreen.jsx — hanya aktif saat development
const QA_ENABLED = import.meta.env.DEV
...
{QA_ENABLED && playerName.toLowerCase() === 'hidupjokowi' && ( ...panel QA... )}
```
Plus: pastikan `qaSkip` tidak tersedia di produksi (guard di `GameContext` bila perlu).

## 5. Praktik Keamanan Wajib

1. **Tidak ada kredensial di kode/commit/config** — jika terlanjur bocor: rotasi, jangan sekadar hapus.
2. QA/test mode **tidak boleh** masuk build produksi.
3. Jangan menambah dependensi npm tanpa `npm audit` — terutama paket yang memproses HTML.
4. Semua teks pemain hanya dirender sebagai teks (React escape otomatis) — jangan pernah pindah ke `dangerouslySetInnerHTML`.
5. `html2canvas` memuat gambar cross-origin — pastikan tidak ada data sensitif pemain yang bocor ke server luar (saat ini hanya render lokal ke canvas, aman).

## 6. Respons Insiden

Bila ada kredensial bocor: (1) rotasi segera, (2) cek riwayat push/commit untuk penyalahgunaan, (3) catat di `docs/14-project-memory.md`, (4) laporkan ke pemilik.
