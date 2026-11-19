# UI: peta layar dan log perubahan

> Dokumen hidup. **Wajib diperbarui di setiap perubahan tampilan** (lihat `CLAUDE.md`).
> - **Bagian A–C:** kondisi UI **saat ini**. Selalu disesuaikan dengan kode.
> - **Bagian D:** **log perubahan UI**, entri terbaru di atas, dengan format sebelum → sesudah.
>
> Terakhir disinkronkan dengan: `daniel-staging` (2026-11-19, setelah dark/light mode).

---

## A. Fondasi desain

**Token** (`mobile/src/theme.ts`, diambil dari web EMI). Ada dua palet dengan nama token yang sama. Mode dipilih di Profile → Appearance (Light / Dark / System, default Light).

| Peran | Token | Light | Dark |
|---|---|---|---|
| Latar halaman | `ground` | `#f6f8fb` | `#0b0d12` |
| Kartu / permukaan | `surface` | `#ffffff` | `#151820` |
| Latar tekan / sekunder | `raised` | `#f1f3f8` | `#1d212b` |
| Garis tipis | `border` | `#e4e7ef` | `#262b36` |
| Teks utama / sekunder / redup | `ink` / `muted` / `faint` | `#111827` / `#5b6472` / `#9ca3af` | `#e6e9ef` / `#98a1b0` / `#6b7382` |
| **Brand (navigasi, stage, aksi utama)** | `brand` | indigo `#4f46e5` | `#6366f1` |
| Aksi simpan / diterima / aman | `green` | `#059669` | `#059669` |
| Bahaya / rusak / kritis | `red` | `#dc2626` | `#ef4444` |
| Peringatan / warning / Poor | `orange` | `#ea580c` | `#f97316` |
| Ownership IHC/IHP | `purple` | `#7c3aed` | `#a78bfa` |
| Chip terpilih, toast (kebalikan halaman) | `inverse` / `onInverse` | `#111827` / `#fff` | `#e6e9ef` / `#111827` |
| Garis tombol destructive | `redLine` | `#f3c4c4` | `#5c2326` |

Setiap warna juga punya pasangan `…Soft` (latar tag/callout) dan `…Ink` (teks di atasnya).

**Aturan warna untuk UI baru:**
- jangan hardcode warna; pakai `color.*`;
- style level modul dibungkus `themed(() => …)`;
- Scanner sengaja tetap gelap di kedua mode.

Aturan dasar:
- **Radius:** kontrol 7, kartu 11, sheet 14.
- **Ukuran font:** minimal 12. Judul 24, heading 18, body 15, meta 13, tiny 12.
- **Angka:** pakai `tabular` (lebar seragam). SKU/kode pakai font mono.
- **Permukaan:** dipisahkan garis tipis, tanpa bayangan.
- **Bahasa UI:** Inggris.

**Komponen bersama:**

| File | Komponen |
|---|---|
| `src/ui/primitives.tsx` | `Text` (variant: title/heading/body/strong/small/meta/tiny/label), `Button` (primary, positive, outline, secondary, ghost, destructive; ukuran sm/lg/icon), `Tag` (tone: brand, green, red, orange, purple, neutral, outline), `Card`, `ListCard`, `Row`, `SectionLabel`, `EmptyState`, `Callout`, `Chip` (filter + angka), `Segmented`, `Field`, `Input`, `Stepper`, `Meta`, `MetaRow`, `Stat`, `StatStrip` |
| `src/ui/domain.tsx` | `Header` (besar/kecil, tombol back, slot kanan), `StageTrack`, `LineRow`, `ScanMarks`, `ScanBar`, `SyncStatus`, `IconButton` |
| `src/ui/sheet.tsx` | `Sheet` (bottom sheet) |
| `src/ui/toast.tsx` | `useToast` (success/error) |
| `src/ui/SearchInput.tsx` | `SearchInput` |

---

## B. Navigasi

Bottom tab (`src/navigation.tsx`), hanya tampil setelah login:

| Tab | Ikon | Layar |
|---|---|---|
| Events | CalendarRange | Daftar event |
| Scan | ScanLine | Pilih event untuk scan |
| Stock | Boxes | Stok gudang |
| Opname | ClipboardCheck | Stock opname. Ada badge merah berisi jumlah opname Pending untuk Admin, tapi **masih dihitung dari data mock** |
| Profile | CircleUserRound | Profil |

Layar tumpuk (stack):
- Event Detail
- Item Detail
- Rentals
- Opname Detail
- Opname Count (gesture back dimatikan, ada konfirmasi "Discard this count?")
- Scanner (modal layar penuh, slide dari bawah)

Sebelum login, hanya tampil layar **Login**.

---

## C. Peta layar (kondisi saat ini)

Legenda sumber data: 🟢 API, 🟡 campuran, 🔴 mock.

### C1. Login 🟢 · `features/auth/views/LoginView.tsx`
- Logo kotak indigo "EMI" + label "EVENT MANAGEMENT INVENTORY", judul **Sign in**, sub "Use your EMI account to continue."
- Field Email (placeholder `name@company.id`) dan Password.
- Validasi Yup: email valid dan wajib, password wajib.
- Tombol **Sign in** nonaktif sampai form valid. Saat proses, teksnya berubah jadi "Signing in…".
- Error dari server tampil di bawah field Password, lalu password dikosongkan. Sukses menampilkan toast "Login successful".

### C2. Events 🟢 · `features/events/views/EventsView.tsx`
- **Header** besar "Events" dengan sapaan "Hi {nama depan}".
- **Pencarian:** placeholder "Event, code or city", debounce 350 ms.
- **Chip tab** bisa digeser, masing-masing dengan angka: On Going (default), Upcoming, Ready to Close, Checking Inventory, Returned & Completed, Transferred.
- **Kartu daftar:** satu baris per event, berisi:
  - kode (mono)
  - nama
  - tag status (kecuali di tab On Going)
  - tanggal dan lokasi
  - khusus tab On Going / Ready to Close: nama stage + "x/y scanned in/out" + bar progres (stage scan), atau "N items"
- **Interaksi:** tarik untuk refresh, scroll tak terbatas (20 per halaman).
- **State:** loading "Loading events…", error "Unable to load events" + Try again, kosong "No {tab} events" / "No match for “…”".
- ⚠️ Progres scan selalu tampil penuh karena server belum mengirim jumlah item yang sudah di-scan.

### C3. Event Detail 🟢 (hanya baca) · `features/eventDetail/views/EventDetailView.tsx`
- **Header:** nama event, sub "kode · lokasi", tombol back.
- **Kartu ringkasan:**
  - tag stage saat ini (indigo) + jumlah item
  - jadwal, lokasi, "PIC · nama"
  - **track stage**: segmen hijau = lewat, indigo = sekarang, abu = belum, dengan teks "Step x of y"
  - kalau stage scan: "Waiting scan in/out" + "x/y scanned" + bar
  - deskripsi, dan catatan dalam callout oranye
- **Chip filter:** All, Added New, Grouped, Production, Broken. Chip yang isinya 0 disembunyikan.
- **Daftar item** dikelompokkan per **area** (label area + total unit). Setiap baris berisi:
  - qty besar + satuan di kiri
  - nama + tag scan ("IN done/pending", "OUT …", "Not scanning")
  - kode · sub area · PIC
  - tag ownership (IHC/IHP ungu, Outsource oranye), box/grouped, Production, Converted, Broken (merah)
  - catatan, dan catatan rusak (merah)
- **Interaksi:** tarik untuk refresh. Kalau sebagian data gagal di-refresh, muncul callout merah.
- ❌ Belum ada tombol Scan, Next stage, laporan rusak, modify, maupun closing (versi mock lama punya, tapi tidak dipakai di layar API).

### C4. Scan Picker 🔴 · `screens/ScanPicker.tsx`
- Header besar "Scan". Berisi daftar event **mock** yang sedang di stage scan. Kalau kosong: "No event is at a scan stage".
- Tap event membuka Scanner.

### C5. Scanner 🔴 · `screens/Scanner.tsx`
- Layar gelap penuh dengan kamera (VisionCamera, QR) dan input manual SKU (placeholder "SKU, e.g. WTC-053").
- Feedback berwarna di atas kamera untuk hasil: OK, Pick the area, Already scanned, Not on this event, Belongs to another event, Unknown. Ada tombol Undo.
- Kalau item ada di beberapa area, muncul sheet "Which one?".
- Masih memakai data mock.

### C6. Stock 🟢 · `features/stock/views/StockView.tsx`
- **Header:** besar "Stock". Tombol kanan **Rentals**: ikon saja, atau "Rentals · N late" kalau ada sewa overdue.
- **Strip angka:** Total items, Safe (hijau), Critical (merah), Warning (oranye).
- **Pencarian:** "Item name or SKU".
- **Chip:** Low only (Critical + Warning), All warehouses, satu chip per gudang (awalan "Gudang " dibuang).
- **Baris item:** nama, SKU, nama gudang; di kanan stok + satuan dan tag status (Critical/Warning/Safe/Not set), lalu chevron. Urutan: Critical → Warning → Safe → Not set, lalu nama.
- **State:** loading, error + Try again, kosong "No items found". Tarik untuk refresh, scroll tak terbatas.
- ⚠️ Tap item membuka Item Detail yang masih mock (kemungkinan "Not found").

### C7. Item Detail 🔴 · `screens/ItemDetail.tsx`
- Kartu: SKU, kategori, status stok, nama, nilai per unit, gudang asal.
- Strip angka termasuk "On events" (merah kalau melebihi stok).
- Stok per gudang, event yang memakai item, riwayat stok. Data mock.

### C8. Rentals (Rent & Outsource) 🟢 · `features/rentals/views/RentalsView.tsx`, `RentalRow.tsx`
- **Header:** "Rent & Outsource", sub "Never our stock. Always the full qty.", tombol back.
- **Segmented:** Rent / Outsource.
- **Chip filter + angka:** All, Open, Requested, Rented/Received, Overdue, Returned/Completed.
- **Label section:** "RENT · N" / "OUTSOURCE · N", dan di kanan "Open Rp…".
- **Baris:**
  - nama item
  - "qty satuan · total biaya · event/area"
  - tag status: Requested oranye, Received indigo, Done hijau, Overdue merah
  - vendor, tanggal "mulai → jatuh tempo" (merah tebal kalau overdue), gudang
- **Tombol:**
  - **Mark Received** (hijau) saat Requested
  - **Mark Returned / Mark Completed** (outline) saat Received/Overdue, dengan dialog konfirmasi
  - Tombol nonaktif selama proses. Viewer tidak bisa beraksi.

### C9. Opname 🟢 · `features/opname/views/OpnameView.tsx`
- **Header:** besar "Stock opname", sub "Physical count".
- **Section "Count a warehouse":** daftar gudang (ikon, nama, lokasi, "N rows", chevron). ⚠️ "N rows" selalu 0.
- **Section "History · N":** baris "#id · gudang", "period · tanggal · N lines · Rp…" dengan tag **Pending** (oranye) atau **Approved** (hijau). ⚠️ Nilai rupiah selalu Rp0.
- Tarik untuk refresh, scroll tak terbatas.

### C10. Opname Count 🟢 · `features/opnameCount/views/OpnameCountView.tsx`
- **Header:** "Count · {gudang}", sub "N rows · defaults to system stock".
- Pencarian "Find item".
- **Blokir:** kalau ada opname Pending, muncul callout oranye "Another opname is waiting for approval." dan daftar disembunyikan.
- **Kartu per item** (berbingkai oranye kalau berubah atau Poor):
  - nama, SKU, satuan, "System N"
  - stepper jumlah aktual + selisih (hijau +, merah −, abu ±0)
  - segmented Good/Poor; kalau Poor, muncul input "Why poor? e.g. faded, chipped"
- **Bar bawah tetap:** "N to report", "Variance Rp…" (merah kalau minus), tombol **Submit** (hijau, nonaktif kalau tidak ada perubahan atau terblokir).
- **Sheet "Submit stock opname":** field Period ("e.g. Nov 2026") dan Remark (keduanya wajib), tombol Cancel / **Submit for approval**. Kalau sukses: toast "Opname #id sent for approval", lalu kembali ke layar sebelumnya.
- Keluar saat ada hitungan belum terkirim memunculkan dialog "Discard this count?".

### C11. Opname Detail 🟡 · `screens/OpnameDetail.tsx`
- **Header:** "Opname #id", sub gudang.
- **Kartu:** gudang + tag status, "Submitted by … · waktu".
- **Strip angka:** Rows counted, Reported, Variance.
- **Daftar baris:** nama, "sebelum → sesudah", tag Poor, catatan, selisih berwarna. Catatan kaki: "Poor is a note for the team…".
- Tombol **Reject / Approve** hanya untuk Admin **pada data mock**. Untuk data API, tombolnya tidak muncul.

### C12. Profile 🟡 · `screens/Profile.tsx`
- **Kartu:** inisial, nama, email (mono), tag role (Admin indigo, lainnya netral), lalu catatan role.
- **Section Appearance** (`features/appearance/views/AppearanceSection.tsx`):
  - baris "Theme" dengan ikon sesuai pilihan (matahari / bulan / matahari-bulan);
  - petunjuk: "Applies to this phone only." atau, untuk System, "Follows your phone (now light/dark).";
  - segmented **Light | Dark | System**;
  - mengganti pilihan langsung mengubah seluruh app, dan pengguna tetap di Profile. Kalau gagal tersimpan, muncul toast error "Couldn't save the theme on this phone."
- **Section Sync:** status Online/Offline, "N waiting to send" atau "Last sent …", 4 antrean terakhir, switch **Offline test mode**. Antrean ini dari store mock.
- Tombol **Sign out** (ghost). Ditolak kalau antrean outbox belum kosong.
- Footer "EMI mobile · v0.4" (hardcode).

---

## D. Log perubahan UI

Format setiap entri:

```
### YYYY-MM-DD · branch@commit · oleh (PM / FE dev / Claude)
- Layar: …
- Sebelum: …
- Sesudah: …
- Alasan: …
- File: …
- Diverifikasi: (test / screenshot / belum dites di HP)
```

### 2026-11-19 · daniel-staging · Claude (permintaan PM): Dark / light mode
- **Layar:** semua layar, plus Profile (setelan baru).
- **Sebelum:** app hanya bertema terang, dan tidak ada setelan tampilan.
- **Sesudah:**
  - Profile punya section **Appearance** dengan pilihan Light / Dark / System (default Light);
  - semua layar memakai palet gelap saat Dark aktif;
  - status bar dan tema navigasi ikut berganti.
- **Detail visual:**
  - chip filter terpilih: sebelumnya hitam dengan teks putih (hardcode), sekarang memakai token `inverse` (di Dark: chip terang dengan teks gelap);
  - toast normal memakai `inverse`; toast error tetap merah dengan teks putih;
  - garis tombol destructive memakai token `redLine`.
- **Alasan:** kenyamanan di tempat gelap, dan mengikuti setelan HP.
- **File:** `src/theme.ts`, `src/ui/primitives.tsx`, `src/ui/toast.tsx`, `src/ui/sheet.tsx`, `src/screens/Scanner.tsx`, `src/screens/Profile.tsx`, `src/navigation.tsx`, `App.tsx`, `src/features/appearance/*`, `src/app/theme/*`.
- **Diverifikasi:**
  - test (72 lolos);
  - screenshot preview web light vs dark untuk Profile, Events, Event Detail, Stock, Opname;
  - ganti mode langsung dari Profile.
  - **Belum dites di HP sungguhan.**

### 2026-11-19 · daniel-staging · Claude (atas permintaan PM)
- Dokumen dibuat. Peta UI di atas mencatat kondisi baseline `af4ea90`.
- Belum ada perubahan tampilan.
