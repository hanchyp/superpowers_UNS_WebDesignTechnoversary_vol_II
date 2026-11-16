# WANA

Peta bersama untuk melaporkan dan mengikuti indikasi kebakaran hutan dan lahan di Indonesia. Prototipe untuk TECHNOVERSARY 2. **Seluruh data adalah simulasi.**

Arah visual: **Hutan Riang**. Ceria di halaman cerita (Beranda), tenang dan jernih di halaman alat (Pantau, Detail, Lapor, Status).

## Menjalankan

```bash
npm install
npm run dev
```

Buka http://localhost:3000.

## Supabase Auth

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

4. Jalankan [migrasi profil](supabase/migrations/202611160001_create_wana_profiles.sql) di **Supabase → SQL Editor**. Migrasi membuat profil untuk akun baru dan akun lama, serta membatasi akses profil ke pemiliknya.
   Lalu jalankan [migrasi laporan](supabase/migrations/202611170001_create_wana_reports.sql): tabel `reports` dan `report_media`, bucket privat `report-media` (maks. 25 MB, JPEG/WebP/PNG/MP4/MOV/WebM), RLS (pelapor hanya melihat miliknya, tidak bisa mengubah status), batas 10 laporan per jam, dan fungsi `advance_report_review` yang **menyimulasikan** pemeriksaan AI (terbit ~12 detik setelah dikirim). Untuk demo, ubah kolom `status` sebuah laporan di **Table Editor → reports** menjadi `perlu-dilengkapi` atau `ditolak` dan halaman statusnya ikut berubah.
   Terakhir jalankan [migrasi kejadian](supabase/migrations/202611170002_create_wana_incidents.sql) dan [seed 63 kejadian simulasi](supabase/migrations/202611170003_seed_wana_incidents.sql). Peta, detail kejadian, dan "Kejadian terbaru" membaca tabel `incidents`. Saat laporan terbit, laporan yang digabung menambah dukungan dan linimasa kejadian; laporan baru menjadi kejadian baru (ID `wr-<nomor>`). Foto dari laporan terbit tampil publik; video tidak. **Sebelum demo**, segarkan waktu data simulasi di SQL Editor: `select public.refresh_demo_incidents();` (kalau tidak, setelah 2 hari semuanya tampil sebagai "info lama").
5. Buka `/daftar`, kirim form, lalu buka tautan verifikasi dari email. Setelah verifikasi berhasil, WANA membuka beranda dengan sesi akun aktif. Untuk menguji login dengan password, buka `/masuk` dari jendela privat yang baru.

Untuk email di luar tim Supabase, siapkan custom SMTP. Di dashboard, cek akun di **Authentication → Users** dan baris profil di **Table Editor → profiles**.

### Akun demo

1. Di **Supabase → Authentication → Users → Add user → Create new user**, buat akun `wana@gmail.com` dengan password khusus demo dan centang **Auto Confirm User**.
2. Isi `WANA_DEMO_PASSWORD` di `.env.local` dengan password yang sama. Untuk deployment demo, tambahkan variabel itu di pengaturan environment hosting.
3. Jalankan ulang aplikasi dan klik **Masuk dengan akun demo** di `/masuk`. Login demo berjalan di server, jadi password demo tidak pernah dikirim ke browser.

## Halaman

| Rute | Isi |
|---|---|
| `/` | Beranda: hero foto, kemampuan, contoh pengamatan, kejadian terbaru, tiga langkah |
| `/pantau` | Peta nasional + daftar kejadian, popover, toggle peta/daftar; mobile memakai bottom sheet |
| `/kejadian/[id]` | Detail kejadian: galeri, ringkasan, hasil pemeriksaan AI, linimasa, Tangga Bukti |
| `/lapor` | Form 3 langkah: Pengamatan → Lokasi → Tinjau (`?kejadian=<id>` untuk menambah pengamatan). Foto dikompresi (maks. 1920 px, EXIF/GPS dibuang) lalu diunggah ke Supabase Storage; laporan disimpan di tabel `reports` |
| `/laporan-saya` | Daftar laporan milik pengguna yang masuk |
| `/laporan-saya/[kode]` | Status laporan dari database (mis. `/laporan-saya/WR-1032`), diperbarui otomatis tiap 2 detik selama diperiksa |
| `/daftar` | Buat akun Supabase Auth dan verifikasi email |
| `/masuk` | Masuk dengan email dan password |
| `/lupa-password` | Minta tautan reset password lewat email |
| `/atur-password` | Buat password baru setelah membuka tautan reset |

## Struktur

- `lib/incidents.ts`: tipe, label, dan proyeksi peta Kalimantan; `lib/incidentsDb.ts`: memuat kejadian dari Supabase
- `components/`: ikon, logo, Tangga Bukti, penanda peta, bar navigasi, footer
- `public/maps/`: peta Indonesia dan Kalimantan bertekstur (SVG)
- `public/photos/`: foto hutan dari Wikimedia Commons
- `public/photos/ilustrasi/`: 3 foto ilustrasi buatan AI (asap, api, asap dan api), dipakai di kejadian yang belum punya foto pelapor dan diberi label "Ilustrasi (dibuat AI)"

## Kredit foto (Wikimedia Commons)

| File | Fotografer | Lisensi |
|---|---|---|
| rawa-gambut-udara.jpg | Ruanda Agung Sugardiman/AusAID | CC BY 2.0 |
| sebangau-rawa.jpg, sebangau-peat-dome.jpg | Mankdhay rahman | CC BY-SA 4.0 |
| sebangau-panorama.jpg | Ariesandy0812 | CC BY-SA 4.0 |
| kapuas.jpg | Achmad Rabin Taim | CC BY 2.0 |
| hutan-lestari.jpg | Arbasbarong | CC BY-SA 4.0 |

WANA bukan layanan darurat. Untuk bahaya langsung, hubungi 112 atau pemadam kebakaran 113.
