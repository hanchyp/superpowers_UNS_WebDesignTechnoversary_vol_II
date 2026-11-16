# Laporan Audit QA: WANA (Next.js 16 + Supabase)

Tanggal audit: 16 November 2026

**Ringkasan:** Dari semua fitur, baru **autentikasi** yang benar-benar terhubung ke Supabase. Alur intinya, yaitu lapor, kejadian, peta, status, dan "Laporan Saya", masih **data simulasi** dari [lib/incidents.ts](lib/incidents.ts) dan nilai yang ditulis langsung di kode. Fondasi auth-nya rapi, tapi ada beberapa bug dan celah yang perlu ditutup sebelum menambah fitur lain.

## Yang sudah diuji

| Pengecekan | Hasil |
|---|---|
| `tsc --noEmit` | ✅ Lolos |
| `npm run build` | ✅ Lolos, 77 halaman |
| `npm run lint` | ❌ 1 error, plus 1103 warning dari file vendor |
| `.env.local` | ✅ Ketiga variabel terisi |
| Tabel `profiles` di Supabase | ✅ Ada. Akses tanpa login ditolak (401), sesuai harapan |
| Pengaturan auth Supabase | ✅ Login email aktif, konfirmasi email aktif |
| Login akun demo di localhost:3000 | ❌ **Gagal**: muncul "Belum bisa masuk…" |
| Redirect `kembali=//evil.com` dan `/\evil.com` | ✅ Aman, dikembalikan ke `/` |
| `/auth/confirm` dengan token palsu | ✅ Diarahkan ke halaman error |
| `/laporan-saya/ID-APA-SAJA` | ⚠️ Terbuka tanpa login, untuk ID apa pun |

## Temuan menurut prioritas

### P0: Rusak atau berisiko

1. **Login demo gagal.** Kemungkinan akun `wana@gmail.com` belum dibuat atau belum dikonfirmasi di Supabase, atau password-nya tidak sama dengan `WANA_DEMO_PASSWORD`. Penyebab pastinya belum bisa dicek karena error dari Supabase tidak dicatat di server ([app/masuk/page.tsx:39](app/masuk/page.tsx)).
2. **Akun demo bisa dibajak.** Password demo dikirim ke browser untuk mengisi form otomatis, dan panjangnya hanya 8 karakter. Siapa pun yang membuka `/masuk` bisa membacanya, lalu login lewat Supabase dan mengganti password atau email akun demo. Akibatnya juri bisa tidak bisa masuk.
   **Solusi:** buat tombol "Coba akun demo" sebagai server action yang login di server, supaya password tidak pernah sampai ke browser. Pakai juga password demo yang panjang.
3. **Form login dan daftar kosong setelah gagal.** Email ikut terhapus saat ada error (sudah terbukti saat diuji). Ini perilaku reset form bawaan React 19.
   **Solusi:** kembalikan `email` (dan `name`) di state action, lalu pakai sebagai `defaultValue` di [components/AccountForm.tsx](components/AccountForm.tsx).
4. **Lint error** di [app/pantau/PantauView.tsx:311](app/pantau/PantauView.tsx): `collapsedH.current` dibaca saat render. Pindahkan nilainya ke state. Tambahkan juga `public/maplibre-gl-worker.mjs` ke `globalIgnores` di [eslint.config.mjs](eslint.config.mjs).

### P1: Celah di alur auth

5. **Setelah verifikasi email, pengguna selalu dikirim ke `/`.** Tujuan `kembali` hilang. Kirim `emailRedirectTo` atau parameter `next` saat `signUp`, lalu baca di [app/auth/confirm/route.ts](app/auth/confirm/route.ts) lewat `loginReturn()`.
6. **Belum ada fitur lupa password**, kirim ulang email verifikasi, maupun ganti nama. Tabel `profiles` hanya punya policy `select`.
7. **`/auth/confirm` hanya menangani `type: "email"`.** Tautan untuk recovery, magic link, atau ganti email akan gagal. Baca `type` dari URL dan cek terhadap daftar yang diizinkan.
8. **`/lapor` dan `/laporan-saya` tidak mewajibkan login.** Karena laporan nanti harus punya pemilik, arahkan pengguna yang belum login ke `/masuk?kembali=…` lewat [proxy.ts](proxy.ts) atau di halaman itu sendiri.

### P2: Masih berupa tampilan, belum berfungsi

9. **Form lapor** ([app/lapor/LaporForm.tsx](app/lapor/LaporForm.tsx)):
   - Selalu diarahkan ke `/laporan-saya/WR-1029`.
   - Foto yang tampil statis dan tombol "Tambah foto/video" tidak melakukan apa-apa.
   - Catatan, jam 13:50, dan pin lokasi sudah terisi duluan.
   - **Checkbox persetujuan sudah tercentang sejak awal.** Ini tidak sah sebagai persetujuan dan harus default `false`.
10. **Halaman status** memakai `setTimeout` 15 detik untuk pura-pura "terbit". Link "Laporan Saya" di [components/MobileTabBar.tsx:21](components/MobileTabBar.tsx) juga ditulis langsung ke WR-1029.
11. ~~**Tombol "Bagikan" dan "Laporkan masalah"** di halaman kejadian belum melakukan apa-apa.~~ Selesai: "Bagikan" sudah berfungsi, "Laporkan masalah" dihapus.
12. **Form kontak** membuka draf `mailto:` ke `wana@project.com`, yang kelihatannya alamat placeholder.

### P3: Kualitas

13. **Belum ada test sama sekali.** Belum ada tipe TypeScript hasil generate Supabase, dan migrasi tidak bisa dijalankan ulang dengan aman (belum pakai `if not exists`).
14. **Gambar besar di halaman auth** perlu `priority` atau `loading="eager"`. Next sudah memberi peringatan LCP untuk ini.

## Rekomendasi agar web benar-benar berfungsi

### Tahap 1: Skema data di Supabase

Semua tabel dibuat lewat migrasi dengan RLS.

- `incidents`: id, judul, wilayah, indikasi, kondisi, status review, lokasi `geography(Point)` (aktifkan **PostGIS**), radius, `published_at`. **Bisa dibaca publik** jika sudah terbit.
- `reports`: `user_id = auth.uid()`, `incident_id` (boleh kosong), indikasi, waktu pengamatan, lokasi atau arah, catatan, `status` (`diperiksa` / `terbit` / `perlu-dilengkapi` / `ditolak`), `consent_at`. Pengguna **hanya bisa membaca dan menambah laporannya sendiri**.
- `report_media`: path file di Storage, tipe, ukuran.
- `incident_events` untuk linimasa, serta `incident_supports`.
- **Storage bucket privat** `report-media` dengan policy path `{auth.uid()}/...`. Hapus EXIF/GPS dari foto, karena README menjanjikan lokasi pelapor tidak tampil ke publik.

### Tahap 2: Alur lapor

- Server action yang memvalidasi input (misalnya pakai `zod`) → upload via signed upload URL → insert `reports`.
- Fungsi SQL `nearby_incidents(lon, lat, km)` untuk pilihan "gabung dengan kejadian ini" atau "buat baru".
- Batasi jumlah laporan per pengguna per jam lewat fungsi atau constraint di database.

### Tahap 3: Status dan peta langsung

- Ganti `setTimeout` dengan **Supabase Realtime** pada baris `reports` milik pengguna.
- Pemeriksaan AI dijalankan di **Edge Function** atau database webhook, yang lalu memperbarui `status`.
- `/pantau` mengambil data dari tabel `incidents` (bisa difilter per area peta), dengan Realtime untuk titik baru. Pindahkan `lib/incidents.ts` menjadi seed data.
- Tambahkan halaman `/laporan-saya` berisi daftar laporan pengguna.

### Tahap 4: Operasional

- Peran moderator lewat `app_metadata.role` dan policy khusus moderator.
- Supabase CLI (`supabase db push`, `supabase gen types typescript`).
- Test end-to-end dengan Playwright untuk daftar, login, lapor, dan status.
- Jalankan **Security Advisor** di dashboard Supabase.
- Siapkan custom SMTP sebelum demo, karena email bawaan Supabase dibatasi jumlahnya.
