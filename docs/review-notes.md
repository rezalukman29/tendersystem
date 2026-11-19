# Review notes: perubahan di `daniel-staging`

> Untuk **main dev / reviewer** sebelum `daniel-staging` digabung ke `staging`.
> Setiap perubahan penting dicatat di sini dengan fokus pada **dampak ke backend/database**, data yang disimpan di HP, dan bagian yang perlu dicek.
> Entri terbaru di atas. Penjelasan bisnis ada di `docs/knowledge.md`, perubahan tampilan di `docs/ui-changes.md`.
>
> Basis: `staging` @ `af4ea90`. Lihat semua perubahan: `git log --oneline af4ea90..daniel-staging`.

## Ringkasan dampak (semua perubahan sejak basis)

| Area | Ada perubahan? | Detail |
|---|---|---|
| Endpoint API (baru / dihapus) | **Tidak** | — |
| Request/response payload | **Tidak** | — |
| Skema database / migrasi backend | **Tidak** | Tidak ada yang perlu dijalankan di server |
| Header / auth / token | **Tidak** | — |
| Penyimpanan lokal (AsyncStorage) | **Ya** | Key baru `emi:appearance:v1` (dark mode) |
| Bentuk Redux state | **Ya** | Slice baru `appearance` |
| Dependency (`package.json`) | **Tidak** | — |
| Konfigurasi native (android/ios) | **Tidak** | — |

---

## Format entri

```
### <judul> · <commit> · <tanggal> · <oleh>
**Ringkasan:** satu-dua kalimat.
**Dampak backend / database / API:** endpoint, field, payload, perilaku server yang diasumsikan. Tulis "Tidak ada" kalau memang tidak ada.
**Data lokal:** key AsyncStorage, bentuk Redux, cache React Query yang berubah, dan apakah data lama masih terbaca.
**Perubahan perilaku:** apa yang berbeda bagi user/sistem.
**Perlu dicek reviewer:** bagian berisiko atau keputusan yang bisa dipertanyakan.
**File utama:** …
**Verifikasi:** test / preview / perangkat (tulis yang belum).
```

---

## Entri

### Dark / light mode · `cfa4749` · 2026-11-19 · Claude (permintaan PM)

**Ringkasan:** pengguna bisa memilih tema Light / Dark / System di Profile → Appearance. Default Light.

**Dampak backend / database / API:** **tidak ada.**
- Tidak ada endpoint baru dan tidak ada field yang dikirim ke server.
- Pilihan tema tidak disimpan di akun user.
- Kalau nanti tema mau disinkronkan per akun, itu perlu endpoint baru (belum ada, dan belum diminta).

**Data lokal:**
- **AsyncStorage key baru `emi:appearance:v1`.** Nilainya string `"light" | "dark" | "system"`. Nilai lain atau key yang tidak ada dibaca sebagai `"light"`.
- Key ini **tidak dihapus saat sign out** (sengaja: setelan per HP). Key lain (`emi:auth:v1`, `emi:mobile:v1`) tidak berubah.
- **Redux: slice baru `appearance`** = `{ preference, loaded }`, didaftarkan di `src/redux/store.ts`. Slice lain tidak berubah.

**Perubahan perilaku:**
- **Render pertama ditahan sampai pilihan tema dibaca dari HP.** `ThemeGate` di `AppProviders` membungkus `AuthBootstrap`, jadi restore session baru mulai setelah pilihan tema terbaca. Waktunya hanya selama satu baca AsyncStorage.
- **Saat tema diganti, `NavigationContainer` di-remount** (`key` = mode). Akibatnya:
  - posisi navigasi dipertahankan lewat `initialState` dari ref;
  - **state lokal di layar yang sedang terbuka di-reset** (misalnya input yang belum tersimpan);
  - query React Query, Redux, dan session tidak tersentuh, karena berada di luar container.
- `color` di `src/theme.ts` sekarang **objek yang isinya ditukar** saat mode berganti (`applyColorScheme`), bukan konstanta.
  - Style yang dibuat di level modul dibungkus `themed()`, sebuah Proxy yang membangun ulang style setelah mode berganti.
  - Dipakai di `ui/primitives.tsx`, `ui/toast.tsx`, `ui/sheet.tsx`, `screens/Scanner.tsx`.
- Token baru `inverse`, `onInverse`, `redLine` menggantikan warna hardcode di chip terpilih, toast, dan border tombol destructive. Di mode Light warnanya identik dengan sebelumnya.

**Perlu dicek reviewer:**
1. **Pendekatan "palet aktif + remount"** dipilih supaya ±250 pemakaian `color.*` di 22 file tidak berubah, sehingga konflik merge dengan `staging` minimal.
   - Alternatifnya hook `useTheme()` di setiap komponen. Itu lebih "React", tapi diff-nya besar.
   - Kalau tim lebih suka alternatif itu, bisa dimigrasikan bertahap.
2. **Aturan untuk kode baru:**
   - style level modul yang memakai `color.*` **wajib** dibungkus `themed(() => …)`. Kalau tidak, style itu tetap berwarna Light di mode Dark;
   - jangan hardcode warna.
3. `themed()` memakai `Proxy`. Hermes mendukungnya, dan test Jest lolos. Perlu konfirmasi di build release Android/iOS.
4. Default `"light"` adalah keputusan PM yang bisa diubah di `DEFAULT_THEME_PREFERENCE` (`src/redux/appearanceSlice.ts`).

**File utama:**
- baru: `src/theme.ts`, `src/app/theme/ThemeGate.tsx`, `src/app/theme/useColorSchemeState.ts`, `src/redux/appearanceSlice.ts`, `src/data/appearance/appearanceStore.ts`, `src/features/appearance/*`
- diubah: `src/redux/store.ts`, `src/app/AppProviders.tsx`, `App.tsx`, `src/navigation.tsx`, `src/screens/Profile.tsx`, `src/ui/primitives.tsx`, `src/ui/toast.tsx`, `src/ui/sheet.tsx`, `src/screens/Scanner.tsx`

**Verifikasi:**
- typecheck, lint, dan Jest **72/72** lolos;
- test baru di `__tests__/theme.test.tsx` dan `__tests__/App.test.tsx`;
- preview react-native-web (data palsu, di luar repo) untuk 5 layar dalam kedua mode, plus ganti mode langsung;
- **belum dites di perangkat/simulator.**

---

### Dokumentasi dan aturan kerja · `97c9769` · 2026-11-19 · Claude (permintaan PM)

**Ringkasan:** menambah `CLAUDE.md` (aturan kerja AI di repo ini), `docs/knowledge.md`, dan `docs/ui-changes.md`.

**Dampak backend / database / API:** tidak ada. Hanya dokumentasi, tanpa perubahan kode aplikasi.

**Perlu dicek reviewer:**
- `CLAUDE.md` dibaca otomatis oleh Claude Code. Isinya mengatur bahwa Claude hanya push ke `daniel-staging`.
- Bagian "celah yang diketahui" di `docs/knowledge.md` (§5) mencatat hal yang ditemukan di kode `staging`, misalnya progres scan palsu di daftar Events dan layar Scanner/Item Detail yang masih mock. Mohon dikonfirmasi atau dikoreksi.
