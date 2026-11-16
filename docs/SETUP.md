# Panduan setup WANA

Panduan lengkap untuk menjalankan WANA dengan project Supabase sendiri. Ringkasannya ada di [README](../README.md#-menjalankan-secara-lokal).

## 1. Jalankan aplikasi

```bash
npm install
npm run dev
```

Buka http://localhost:3000.

## 2. Supabase Auth

1. Salin `.env.example` ke `.env.local`. Isi Project URL dan publishable key dari dialog **Connect** pada project Supabase.
2. Di **Authentication → Providers → Email**, aktifkan Email dan **Confirm email**. Di **URL Configuration**, atur **Site URL** ke `http://localhost:3000` saat pengujian lokal atau URL HTTPS WANA untuk deployment.
3. Di **Authentication → Email Templates → Confirm signup**, ubah tautan verifikasi menjadi:

   ```html
   <a href="{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}">Verifikasi akun WANA</a>
   ```

   Lakukan hal yang sama di **Reset Password** supaya fitur **Lupa password** (`/lupa-password`) berfungsi:

   ```html
   <a href="{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=recovery">Atur password baru WANA</a>
   ```

   Tautan itu membuka `/atur-password` untuk membuat password baru. Setelah verifikasi pendaftaran, WANA mengembalikan pengguna ke halaman tempat ia mulai mendaftar (selama dibuka di browser yang sama).

4. Buka `/daftar`, kirim form, lalu buka tautan verifikasi dari email. Setelah verifikasi berhasil, WANA membuka beranda dengan sesi akun aktif. Untuk menguji login dengan password, buka `/masuk` dari jendela privat yang baru.

Untuk email di luar tim Supabase, siapkan custom SMTP. Di dashboard, cek akun di **Authentication → Users** dan baris profil di **Table Editor → profiles**.

## 3. Migrasi database

Jalankan berurutan di **Supabase → SQL Editor**:

1. [Migrasi profil](../supabase/migrations/202611160001_create_wana_profiles.sql): membuat profil untuk akun baru dan akun lama, serta membatasi akses profil ke pemiliknya.
2. [Migrasi laporan](../supabase/migrations/202611170001_create_wana_reports.sql) membuat:
   - tabel `reports` dan `report_media`;
   - bucket privat `report-media` (maks. 25 MB, JPEG/WebP/PNG/MP4/MOV/WebM);
   - RLS: pelapor hanya melihat laporannya sendiri dan tidak bisa mengubah status;
   - batas 10 laporan per jam;
   - fungsi `advance_report_review` yang **menyimulasikan** pemeriksaan AI (laporan terbit ±12 detik setelah dikirim).

   Untuk demo, ubah kolom `status` sebuah laporan di **Table Editor → reports** menjadi `perlu-dilengkapi` atau `ditolak`, dan halaman statusnya ikut berubah.
3. [Migrasi kejadian](../supabase/migrations/202611170002_create_wana_incidents.sql) dan [seed 63 kejadian simulasi](../supabase/migrations/202611170003_seed_wana_incidents.sql).
   - Peta, detail kejadian, dan "Kejadian terbaru" membaca tabel `incidents`.
   - Saat laporan terbit, laporan yang digabung menambah dukungan dan linimasa kejadian. Laporan baru menjadi kejadian baru (ID `wr-<nomor>`).
   - Foto dari laporan terbit tampil publik; video tidak.

> **Sebelum demo**, segarkan waktu data simulasi di SQL Editor:
>
> ```sql
> select public.refresh_demo_incidents();
> ```
>
> Kalau tidak, setelah 2 hari semua kejadian tampil sebagai "info lama".

## 4. Akun demo

1. Di **Supabase → Authentication → Users → Add user → Create new user**, buat akun `wana@gmail.com` dengan password khusus demo dan centang **Auto Confirm User**.
2. Isi `WANA_DEMO_PASSWORD` di `.env.local` dengan password yang sama. Untuk deployment demo, tambahkan variabel itu di pengaturan environment hosting.
3. Jalankan ulang aplikasi dan klik **Masuk dengan akun demo** di `/masuk`. Login demo berjalan di server, jadi password demo tidak pernah dikirim ke browser.

## Variabel lingkungan

| Variabel | Keterangan |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Project URL Supabase |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Publishable key Supabase |
| `WANA_DEMO_PASSWORD` | Password akun demo, hanya dipakai di server |

## Rute lengkap

| Rute | Isi |
|---|---|
| `/` | Beranda: hero video, kemampuan, contoh pengamatan, kejadian terbaru, tiga langkah |
| `/pantau` | Peta nasional + daftar kejadian, popover, filter kondisi; di HP memakai bottom sheet |
| `/kejadian/[id]` | Detail kejadian: galeri, ringkasan, hasil pemeriksaan awal AI, peta area, linimasa |
| `/lapor` | Form 3 langkah: Pengamatan → Lokasi → Tinjau (`?kejadian=<id>` untuk menambah pengamatan). Foto dikompresi (maks. 1920 px, EXIF/GPS dibuang) lalu diunggah ke Supabase Storage |
| `/laporan-saya` | Daftar laporan milik pengguna yang masuk |
| `/laporan-saya/[kode]` | Status laporan (mis. `/laporan-saya/WR-1032`), diperbarui otomatis tiap 2 detik selama diperiksa |
| `/edukasi`, `/tentang`, `/kontak` | Edukasi karhutla, tentang WANA, form kontak |
| `/daftar`, `/masuk` | Daftar dengan verifikasi email; masuk dengan email/password atau akun demo |
| `/lupa-password`, `/atur-password` | Reset password lewat email |
