# Knowledge base: EMI Mobile

> Dokumen hidup. **Wajib diperbarui di setiap perubahan** (lihat `CLAUDE.md`).
> Bagian 1–7 = kondisi sistem **saat ini**. Bagian 8 = **log perubahan** (terbaru di atas).
>
> Terakhir disinkronkan dengan: `daniel-staging` (2026-11-19, setelah fitur dark/light mode). Basis dari `staging` @ `af4ea90`.

---

## 1. Gambaran produk

| | |
|---|---|
| Produk | **EMI (Event Management Inventory)**: aplikasi mobile untuk tim lapangan dan gudang dari platform web EMI |
| Pengguna | Admin, Staff (kru lapangan/gudang), Viewer (hanya lihat) |
| Platform | React Native 0.77.2 + TypeScript, Android & iOS (folder `mobile/`) |
| Backend | Server terpisah, **tidak ada di repo ini**. Staging: `https://booqable-staging.emi.web.id` (ditimpa oleh `API_BASE_URL` di `mobile/.env`) |
| Bahasa UI | Inggris. Angka gaya Indonesia (`12.500`, `Rp1.443.680.000`), tanggal `09 Apr 2026` |

Folder lain di repo:
- `src/` (root) adalah **web app lama "Kru"** (aplikasi kru wedding organizer). Domainnya berbeda dan tidak dipakai untuk EMI. Abaikan kecuali PM minta.
- `docs/feature-and-tech-spec.md`, `docs/research-and-negative-cases.md`, dan `docs/design-review.md` juga milik Kru (sudah usang untuk EMI).
- `mobile/README.md` masih menjelaskan versi mock (sebelum integrasi API), jadi sebagian sudah usang. Pegangan utama adalah dokumen ini.

### Branch

| Branch | Isi |
|---|---|
| `daniel-staging` | **Branch kerja PM.** Duplikat `staging`, tempat semua perubahan PM |
| `staging` | Branch FE dev. Integrasi API ada di sini |
| `feature/app-version` | Hanya menampilkan versi di web app Kru, belum digabung |
| `claude/wonderful-heisenberg-6xzrrc` (default GitHub), `claude/magical-keller-91f3cx` | Versi mock lama (`44f484a`), tanpa API |

---

## 2. Alur bisnis

### 2.1 Login dan role
- Login dengan email + password ke `POST /v1/login-emi`. Hasilnya `id` + `token` + profil (`fullname`, `email`, `user_type`).
- Role diturunkan dari `user_type` (`mobile/src/store.tsx → profileUser`):
  - mengandung `ADMIN` → **Admin**
  - mengandung `VIEW` → **Viewer**
  - selain itu → **Staff**
- Viewer hanya bisa melihat. Semua aksi tulis ditolak dengan toast "View only. Ask an admin for access."
- Session disimpan di HP (AsyncStorage, key `emi:auth:v1`, versi 2) dan otomatis dipulihkan saat app dibuka. Kalau server/environment berbeda, session dianggap tidak valid dan user harus login ulang.
- Belum ada refresh token, `/me`, maupun logout di server. Logout hanya menghapus data di HP.
- Setelah login, app mengambil **paket langganan user** (`GET /v1/user/plan`) dan menyimpannya di Redux. Saat ini datanya belum ditampilkan di UI mana pun.

### 2.2 Event
**Siklus hidup (lifecycle) event.** Ditentukan oleh server lewat `lifecycle_status`, dan menjadi tab di layar Events:

| Tab | Arti |
|---|---|
| On Going | Event sedang berjalan |
| Upcoming | Belum mulai / belum ada item |
| Ready to Close | Sudah di stage terakhir |
| Checking Inventory | Sedang cek ulang barang setelah event |
| Returned & Completed | Selesai, barang kembali |
| Transferred | Barang dipindah ke event lain |

**Stage (Event Status).**
- Pipeline stage bisa dikonfigurasi di web (Master Data → Event Status) dan diambil dari `GET /v1/event-status/get-all`, diurutkan menurut `order_data`.
- Setiap stage punya `action`. `SCAN_IN` atau `SCAN_OUT` berarti stage itu stage scan.
- Contoh pipeline dari data lama: Created by admin → On preparing items → Finish setup → Waiting scan in → Event running → Waiting scan out → Finished. Postphone dan Disable adalah status hold.

**Item event (line).**
- Diambil dari `GET /v3/fix-list-item-event?event_id=`.
- Setiap item punya:
  - qty, satuan, area/sub area, PIC, gudang asal
  - status scan in/out
  - ownership: IHC / IHP / Outsource
  - package (grouped/box)
  - penanda produksi baru, penanda converted
  - barang rusak (qty + catatan)

**Potong dan kembalikan stok.** Dikerjakan **di backend**, bukan di mobile. Mobile tidak bisa melihat flag stage seperti `cuttingStock` atau `stockReturn`, karena API status hanya mengembalikan `id, name, action, order_data, active_event`. Aturan pastinya perlu dicek di repo backend atau di web.

### 2.3 Tampilan (light / dark mode)
- Pengguna memilih tema di **Profile → Appearance**: **Light**, **Dark**, atau **System** (mengikuti setelan HP).
- **Default Light**, jadi tidak ada perubahan bagi yang tidak membuka setelan ini.
- Pilihan disimpan **per HP** (AsyncStorage `emi:appearance:v1`), tidak ikut akun, tetap ada setelah sign out, dan tidak dikirim ke server.
- Mengganti tema berlaku langsung. Semua layar digambar ulang, dan pengguna tetap di layar yang sama.
- Scanner tetap bertema gelap di kedua mode (by design, untuk kamera).

### 2.4 Stok gudang
- Stok per item per gudang diambil dari `GET /v1/barang-gudang/detail`. Bisa difilter per gudang, status, dan kata kunci.
- Status stok minimum: **SAFE / WARNING / CRITICAL / NOT_SET**. Status ini dihitung server.
- Ringkasan jumlah item per status diambil dari `GET /v1/warehouse-inventory-summary`. Ada juga nilai aset dari `GET /v1/inventory-summary`, tapi hook-nya ada dan belum dipakai di UI.
- Daftar gudang diambil dari `GET /v1/gudang`.

### 2.5 Rent (sewa) dan Outsource

| | Rent (`loan`) | Outsource |
|---|---|---|
| Daftar | `GET /v1/loan-items` | `GET /v1/outsource-items` |
| Alur status | REQUESTED → **BORROWED** → **RETURNED** | REQUESTED → **RECEIVED** → **COMPLETED** |
| Label di UI | Requested → Rented → Returned | Requested → Received → Completed |
| Ubah status | `GET /v1/loan-items/:id`, lalu `PUT` dengan body lengkap | `PUT /v1/outsource-items/:id` |

- **Overdue:** status `OVERDUE` dari server, atau tanggal jatuh tempo sudah lewat dari tanggal HP.
- Barang sewa dan outsource **bukan stok sendiri** dan selalu diproses dengan qty penuh.
- Kalau record terkait event, setelah diterima barangnya masuk sebagai item event (diurus server). Mobile hanya menampilkan pesan "added to the event".
- "Mark Returned/Completed" selalu minta konfirmasi dulu.

### 2.6 Stock opname (hitung fisik)
1. Pilih gudang. Semua item gudang dimuat (limit 99999), dan angka hitung awal = stok sistem.
2. Isi jumlah aktual dan kondisi (Good/Poor). Kalau Poor, tambahkan catatan.
3. **Yang dikirim hanya baris yang selisih atau ditandai Poor.**
4. Submit wajib mengisi **Period** dan **Remark**. Datanya dikirim ke `POST /v1/stock-opname` dengan format `{period, remark, data:[{id, stok, condition GOOD|POOR, notes}]}`.
5. **Hanya boleh ada satu opname Pending.** Kalau masih ada yang Pending, layar hitung diblokir.
6. Riwayat diambil dari `GET /v1/stock-opname`. Flag `draft` ditampilkan sebagai **Pending**, flag `done` sebagai **Approved**. API belum punya status Rejected.
7. Approve/reject **belum bisa dari mobile** untuk data API. Tombolnya hanya muncul untuk data mock lama.

---

## 3. Arsitektur teknis

```
mobile/
  App.tsx                 AppProviders → SafeArea → Toast → AppStoreProvider (legacy) → RootNavigator
  src/
    app/                  AppProviders (Redux + React Query + AuthBootstrap), sessionCoordinator
    api/                  apiClient (axios), normalisasi error, queryClient
    config/env.ts         API_BASE_URL, API_TIMEOUT_MS (react-native-config)
    data/
      repositories/       panggilan HTTP mentah per domain (auth, events, rentals, stock, userPlan)
      services/           ubah bentuk data API → model app, validasi respons
      auth/               credentialStore (AsyncStorage), activeCredential (memori)
    entities/
      api/                bentuk request/response/params persis seperti API (snake_case)
      interfaces/         model yang dipakai app (camelCase)
    features/<fitur>/     screens (tipis) → controllers (hook) → views (presentasi) + interfaces, queries, presenters
    hooks/api/            hook React Query yang bisa dipakai ulang
    redux/                session, profile, userPlan (state global client)
    screens/              layar lama + pembungkus layar yang sudah dimigrasi
    core/                 LEGACY: rules.ts, seed.ts (mock), types.ts, format.ts (format.ts tetap dipakai)
    store.tsx             LEGACY: store mock + role guard + outbox offline
    ui/                   komponen desain (primitives, domain, sheet, toast, SearchInput)
    theme.ts              token warna/ukuran
```

**Aliran data:** View → Controller → hook React Query → Service → Repository → `apiClient` → server.

**Request ke server:**
- Setiap request (kecuali login) membawa header `User-Id` dan `User-Token`.
- Respons standar: `{ success, message, data, code }`. Data berhalaman: `{ data[], page, total_pages, total_records, record_per_page }`.
- Server memakai tipe nullable gaya Go (`{String, Valid}`), dan dibaca lewat `readNullableString`.

**Pengaturan React Query:** `staleTime` 30 detik, retry 2, refetch saat koneksi kembali. Setiap mutation meng-invalidate query key yang terkait.

**Stack:** React Query 5, Redux Toolkit 2, Formik + Yup, axios, React Navigation 7, VisionCamera 4.6, lucide icons.

**Tema (light/dark):**
- `src/theme.ts` punya dua palet (`lightPalette`, `darkPalette`) dengan nama token yang sama.
- `color` adalah palet **aktif**. `applyColorScheme()` menukar isinya.
- Style yang dibuat sekali di level modul (`StyleSheet.create`, peta varian tombol/tag) **wajib** dibungkus `themed(() => …)`, supaya dibangun ulang setelah mode berganti.
- `useResolvedColorScheme()` (`src/app/theme/`) menggabungkan pilihan user dengan setelan HP.
- `ThemeGate` (di `AppProviders`) membaca pilihan tersimpan sebelum layar pertama digambar, dan mengatur status bar.
- `NavigationContainer` diberi `key` = mode, jadi seluruh layar digambar ulang saat mode berganti. Posisi navigasi disimpan di ref, jadi pengguna tidak terlempar.
- State pilihan ada di Redux `appearance`. Setelan UI ada di `features/appearance/` (controller + view), dipasang di layar Profile.
- **Aturan untuk kode baru:**
  - jangan hardcode warna (`#fff`, `#111827`, dan sebagainya); pakai token `color.*`;
  - untuk latar terpilih yang "kebalikan halaman", pakai `color.inverse` / `color.onInverse`;
  - teks putih di atas tombol berwarna (brand/green/red) boleh tetap `#fff`.

**Tooling:** `yarn` (bukan npm). Reactotron untuk debugging.

---

## 4. Status integrasi per layar

| Layar | Sumber data | Status |
|---|---|---|
| Login | API | ✅ |
| Events (daftar + jumlah per tab + cari) | API | ✅ |
| Event Detail (ringkasan, stage, item per area, tab filter) | API | ✅ hanya baca. **Belum ada** scan, Next stage, laporan rusak, modify, closing |
| Stock (daftar, ringkasan, filter gudang, Low only) | API | ✅ |
| Rentals (Rent & Outsource, ubah status) | API | ✅ |
| Opname (daftar gudang + riwayat) | API | ✅ |
| Opname Count (hitung + submit) | API | ✅ |
| Opname Detail | API (dari parameter navigasi) / mock | ⚠️ approve/reject hanya untuk mock |
| Item Detail | **Mock** (`core/seed.ts`) | ❌ belum diintegrasikan |
| Scan Picker, Scanner | **Mock** | ❌ belum diintegrasikan |
| Profile | Nama/role dari API, sync/outbox dari mock, tema disimpan di HP | ⚠️ campuran |

---

## 5. Celah dan risiko yang diketahui (perlu keputusan / perbaikan)

1. **Dua sumber data hidup berdampingan.** Store mock lama (`store.tsx` + `core/seed.ts`) masih aktif di samping API.
   - Scan Picker menampilkan event **mock**, bukan event dari server.
   - Event Detail (API) memakai ID event, sedangkan Scanner (mock) memakai key `"tanggal | NAMA"`. Keduanya belum tersambung.
2. **Item Detail kemungkinan "Not found".** Item dari layar Stock dibuka berdasarkan nama, lalu dicari di data mock. Nama dari server hampir pasti tidak cocok.
3. **Angka scan di daftar Events menyesatkan.** Server belum mengirim jumlah item yang sudah di-scan, jadi `scannedItems` sementara diisi total item. Akibatnya progress bar tampil penuh (mis. "20/20 scanned in"). Lihat `features/events/presenters/toEventListItem.ts`.
4. **Daftar gudang di layar Opname selalu "0 rows".** Nilainya di-hardcode `rows = 0` di `OpnameView.tsx`.
5. **Nilai varians opname di riwayat selalu Rp0.** `amount` di-set 0 di service. "Submitted by" menampilkan angka user ID, bukan nama.
6. **Offline outbox hanya untuk aksi mock.** Aksi API (rental, opname) tidak ada antreannya. Kalau offline, langsung gagal dengan pesan error.
7. **Sign out bisa terblokir oleh antrean outbox mock.**
8. **Token disimpan di AsyncStorage, belum Keychain/Keystore.** Ini sudah dicatat sebagai target hardening sebelum rilis (`ARCHITECTURE.md`).
9. **Versi aplikasi tidak konsisten.** Profile menampilkan "EMI mobile · v0.4" (hardcode), `package.json` versi `0.0.1` dengan nama `Kru`.
10. **Aturan potong/kembalikan stok tidak terlihat dari mobile.** Perlu konfirmasi ke backend.

---

## 6. Pengecekan dan test

```bash
cd mobile && yarn install --frozen-lockfile
yarn typecheck && yarn lint && yarn test
```

Kondisi per 2026-11-19 (setelah dark/light mode): typecheck ✅, lint ✅, **72 test lolos** dari 9 suite:
- `__tests__/`: App, authSession, eventsIntegration, rules, stockIntegration, store, theme
- `src/data/services/`: rentals.services, stock.services

Belum pernah dites di HP atau simulator sungguhan dari lingkungan Claude (tidak ada Android SDK/Xcode).

---

## 7. Akun dan konfigurasi

- `.env` (lihat `mobile/.env.example`): `API_BASE_URL`, `API_TIMEOUT_MS`.
- Akun staging: tanyakan ke PM. Akun demo lama (`dewi@emi.id` dan lain-lain) hanya berlaku untuk data mock, bukan server.

---

## 8. Log perubahan

Format: `tanggal · branch@commit · oleh · ringkasan`, lalu detail, alasan, dan file.

### 2026-11-20 · daniel-staging · PM: Aturan "butuh API = stop dulu"
- **Apa:** aturan kerja baru di `CLAUDE.md` §2b. Permintaan yang butuh API baru/berubah dihentikan dulu, dijelaskan ke PM, lalu dicatat di `docs/review-notes.md`.
- **Konteks:** aturan yang sama sudah diterapkan di repo web `rezalukman29/emi` (branch `daniel-staging-web`). Pekerjaan web hari ini (dark mode, port halaman Event, filter Event Calendar) ada di repo itu, dengan catatannya sendiri.
- Tidak ada perubahan kode aplikasi.

### 2026-11-19 · daniel-staging · Claude (permintaan PM): Catatan untuk reviewer
- **Apa:** file baru `docs/review-notes.md`, berisi catatan per perubahan untuk main dev/reviewer. Fokusnya dampak ke API/backend/database, data lokal, perubahan perilaku, dan risiko. Aturannya ditambahkan di `CLAUDE.md` §2.
- **Alasan:** app sudah tersambung ke server, jadi reviewer perlu tahu dengan cepat apakah sebuah perubahan menyentuh kontrak API atau database.
- Entri awal mencatat perubahan dark mode (`cfa4749`) dan dokumentasi (`97c9769`). Keduanya **tidak** menyentuh API/database.

### 2026-11-19 · daniel-staging · Claude (permintaan PM): Dark / light mode
- **Apa:** pengguna bisa memilih tema Light / Dark / System di Profile → Appearance. Default Light. Pilihan disimpan per HP.
- **Alasan bisnis:** kenyamanan di lokasi gelap (venue malam, gudang), dan mengikuti setelan HP pengguna.
- **Teknis:**
  - palet dark ditambahkan, dan `color` dijadikan palet aktif;
  - helper `themed()` untuk style level modul;
  - Redux slice `appearance`, penyimpanan `appearanceStore`;
  - `ThemeGate` + `useResolvedColorScheme`;
  - navigasi digambar ulang saat mode berganti, dengan posisi dipertahankan;
  - token baru `inverse`, `onInverse`, `redLine` menggantikan warna hardcode di chip terpilih, toast, dan tombol destructive.
- **Dipilih supaya perubahan kecil:** ±250 pemakaian `color.*` di 22 file **tidak diubah**. Ini mengurangi risiko konflik saat merge dengan pekerjaan FE dev.
- **File:**
  - baru: `src/theme.ts`, `src/redux/appearanceSlice.ts`, `src/redux/store.ts`, `src/data/appearance/appearanceStore.ts`, `src/app/theme/ThemeGate.tsx`, `src/app/theme/useColorSchemeState.ts`, `src/features/appearance/*`
  - diubah: `src/app/AppProviders.tsx`, `App.tsx`, `src/navigation.tsx`, `src/screens/Profile.tsx`, `src/ui/primitives.tsx`, `src/ui/toast.tsx`, `src/ui/sheet.tsx`, `src/screens/Scanner.tsx`
  - test: `__tests__/theme.test.tsx` (baru), `__tests__/App.test.tsx`
- **Verifikasi:**
  - typecheck, lint, dan 72 test lolos;
  - preview web (react-native-web, data palsu): Profile, Events, Event Detail, Stock, Opname dalam kedua mode, termasuk ganti mode langsung dari Profile;
  - **Belum dites di HP/simulator sungguhan** (status bar, mode System saat HP berganti tema).

### 2026-11-19 · daniel-staging · Claude (atas permintaan PM)
- **Dokumentasi awal dibuat.** File: `CLAUDE.md`, `docs/knowledge.md`, `docs/ui-changes.md`.
- **Aturan kerja ditetapkan:** branch kerja `daniel-staging`, dokumentasi wajib diperbarui di setiap perubahan, dan pull dari `staging` hanya atas permintaan PM.
- **Baseline yang dicatat:** `daniel-staging` dibuat sebagai duplikat `staging` @ `af4ea90`.
- Tidak ada perubahan kode aplikasi.

### Riwayat sebelum dokumen ini (dari git)

| Tanggal | Commit | Oleh | Ringkasan |
|---|---|---|---|
| 2026-11-17 | `af4ea90` | rezalukman29 | Integrasi API rental, outsource, stock opname |
| 2026-11-14 | `0b5555f` | rezalukman29 | Integrasi event detail |
| 2026-11-14 | `cf852c9` | rezalukman29 | Setup repo (arsitektur feature-first, React Query, Redux) dan login API |
| 2026-11-04 | `44f484a` | Claude | Mobile diselaraskan dengan domain EMI (versi mock) |
| 2026-10-20 s/d 11-03 | `d145b20`…`d8e5210` | Claude | Web app Kru + versi RN awal (domain wedding, sudah diganti) |
