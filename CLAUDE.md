# Aturan kerja repo ini (wajib, setiap sesi)

Pemilik: PM yang mengerjakan fitur dan UI lewat vibe coding. Bicara dengan PM dalam **Bahasa Indonesia**, dengan istilah bisnis. Istilah teknis boleh dipakai, tapi harus dijelaskan.

## 1. Branch

- **Baca dan push selalu di `daniel-staging`.** Jangan push ke branch lain, terutama `staging`, kecuali PM memintanya secara eksplisit.
- `staging` adalah wilayah FE dev. Perubahan dari sana masuk ke `daniel-staging` hanya kalau PM minta ("pull dari staging dan cek"). Prosedurnya:
  1. `git fetch origin staging`, lalu jelaskan commit baru: siapa, apa, file apa, dan dampak bisnisnya.
  2. Cek bentrok dengan `git merge-tree`. Kalau ada konflik, **jangan memilih sendiri**: tunjukkan kedua versi dan minta keputusan PM.
  3. Gabungkan dengan `git merge` biasa. Jangan rebase dan jangan force-push.
  4. Jalankan pengecekan (lihat §3), laporkan hasilnya apa adanya, baru push ke `daniel-staging`.
  5. Catat hasil merge di log `docs/knowledge.md` (dan `docs/ui-changes.md` kalau UI ikut berubah).
- Penggabungan `daniel-staging` ke `staging` hanya lewat pull request, dan hanya kalau PM minta.

## 2. Dokumentasi wajib diperbarui di SETIAP perubahan

Tidak boleh terlewat. Perubahan kode belum dianggap selesai sebelum dokumentasinya ikut diperbarui **di commit yang sama**.

| File | Kapan diperbarui | Isi |
|---|---|---|
| `docs/knowledge.md` | Setiap perubahan kode, merge dari `staging`, atau keputusan bisnis baru | Kondisi sistem terkini (bisnis + teknis), status integrasi API, celah yang diketahui, dan **log perubahan** (entri terbaru di atas) |
| `docs/ui-changes.md` | Setiap perubahan tampilan: layar baru, layout, teks, warna, komponen, alur navigasi, state kosong/error | **Peta UI** per layar (selalu mencerminkan kondisi terkini) dan **log perubahan UI** (sebelum → sesudah, alasannya) |
| `docs/review-notes.md` | Setiap perubahan kode yang penting, terutama yang menyentuh API/backend/database | Catatan untuk **main dev / reviewer**: dampak ke endpoint, payload, dan database (tulis "Tidak ada" kalau memang tidak ada); data lokal (key AsyncStorage, bentuk Redux, cache); perubahan perilaku; hal berisiko yang perlu dicek; verifikasi. Perbarui juga tabel "Ringkasan dampak" di atasnya |

Untuk `docs/review-notes.md`:
- **Isi entrinya setelah commit dibuat**, supaya hash commit-nya benar (boleh di commit lanjutan).
- **Kalau sebuah perubahan mengasumsikan perilaku backend yang belum pasti**, tulis jelas sebagai asumsi dan tanyakan ke PM. Contoh asumsi: field baru, aturan potong stok, status baru.
- **Jangan pernah mengubah kontrak API diam-diam.** Itu mencakup endpoint, nama field, dan payload.

Aturan penulisan:
- Perbarui bagian "kondisi terkini" supaya sesuai kode **dan** tambahkan entri log. Jangan hanya menambah log.
- Format entri log: tanggal, branch/commit, siapa (PM/FE dev/Claude), apa yang berubah, alasan bisnis, dan file yang tersentuh.
- Kalau ada yang belum diverifikasi (misalnya belum dites di HP sungguhan), tulis apa adanya.

## 2b. Butuh API? Stop dan tanya PM dulu (aturan PM, 2026-11-20)

Kalau sebuah permintaan (atau sebagian darinya) butuh **API backend baru atau berubah**, **hentikan dulu bagian itu dan jelaskan ke PM** apa yang dibutuhkan dan kenapa, dengan bahasa bisnis. Yang termasuk: endpoint baru, field atau parameter baru, payload berubah, atau data yang belum ada di respons API sekarang.
- Kerjakan hanya bagian yang bisa jalan dengan API yang ada, lalu sebutkan dengan jelas apa yang ditinggalkan.
- Catat di `docs/review-notes.md` dengan status **"Butuh API: menunggu PM/backend"**: kebutuhan UI-nya, endpoint mana, dan field apa. Tujuannya supaya developer bisa langsung mengambilnya.
- Jangan membuat API palsu (mock) yang membuat fitur tampak selesai, kecuali PM minta preview mock.
- Untuk web (`rezalukman29/emi`), aturan yang sama ada di `CLAUDE.md` repo itu, dengan pencatatan di `docs/api-impact-log.md`.

## 3. Pengecekan sebelum push (folder `mobile/`)

Pakai **yarn**, bukan npm (`yarn.lock` yang dipakai tim; `package-lock.json` sudah tidak sinkron).

```bash
cd mobile && yarn install --frozen-lockfile
yarn typecheck && yarn lint && yarn test
```

Laporkan hasilnya ke PM. Jangan mematikan atau melewati test supaya lolos.

## 4. Arsitektur yang harus diikuti (ringkas)

Lihat `mobile/src/ARCHITECTURE.md` dan `docs/knowledge.md`. Intinya: Screen (tipis) → Controller (hook) → View (hanya props). Data server lewat Service → Repository → `apiClient` dengan React Query. Fitur baru masuk ke `mobile/src/features/<fitur>/`.
