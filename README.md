<div align="center">

<img src="docs/images/banner.png" alt="WANA: Pantau hutan. Bagikan pengamatan." width="100%">

# WANA

### Pantau hutan. Bagikan pengamatan.

Peta bersama untuk melaporkan dan mengikuti indikasi kebakaran hutan dan lahan (karhutla) di Indonesia.

[![Live Demo](https://img.shields.io/badge/Live_Demo-wana--project.vercel.app-0e4d2c?style=for-the-badge&logo=vercel&logoColor=white)](https://wana-project.vercel.app/)

![Next.js](https://img.shields.io/badge/Next.js_16-000000?style=flat-square&logo=nextdotjs&logoColor=white)
![React](https://img.shields.io/badge/React_19-149eca?style=flat-square&logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178c6?style=flat-square&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_4-06b6d4?style=flat-square&logo=tailwindcss&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-3ecf8e?style=flat-square&logo=supabase&logoColor=white)
![MapLibre](https://img.shields.io/badge/MapLibre_GL-396cb2?style=flat-square&logo=maplibre&logoColor=white)
![TECHNO VERSARY VOL. II](https://img.shields.io/badge/TECHNO_VERSARY-VOL._II-f5c430?style=flat-square)

[Coba demo](https://wana-project.vercel.app/) · [Lihat peta](https://wana-project.vercel.app/pantau) · [Laporkan pengamatan](https://wana-project.vercel.app/lapor) · [Panduan setup](docs/SETUP.md)

</div>

> [!TIP]
> **Juri dan penguji tidak perlu mendaftar.** Buka [halaman masuk](https://wana-project.vercel.app/masuk), lalu klik **Masuk dengan akun demo**.

> [!NOTE]
> WANA adalah prototipe lomba. **Seluruh kejadian di peta adalah data simulasi**, dan pemeriksaan AI juga disimulasikan.

---

## 🔥 Masalah

Setiap musim kemarau, kebakaran hutan dan lahan gambut kembali muncul di Sumatra, Kalimantan, dan wilayah lain di Indonesia. Warga sekitar sering menjadi yang pertama melihat asap atau api, tetapi informasinya:

- **tercecer** di grup chat dan media sosial, tanpa lokasi yang jelas;
- **sulit dipercaya**, karena foto lama atau foto dari tempat lain mudah tersebar ulang;
- **cepat basi**, karena tidak ada yang tahu apakah api masih menyala atau sudah padam.

## 🌱 Solusi

**WANA** mengumpulkan pengamatan warga ke **satu peta bersama**. Setiap laporan diperiksa sebelum tampil, laporan untuk lokasi yang sama digabung menjadi satu kejadian, dan setiap kejadian menunjukkan **seberapa kuat buktinya** serta **seberapa baru informasinya**.

<div align="center">

| 👀 **Amati** | 🤖 **Diperiksa** | 🗺️ **Dilengkapi** |
|:---:|:---:|:---:|
| Lihat asap atau api? Potret dari tempat aman, lalu tandai lokasi atau arahnya. | AI memeriksa foto, waktu, dan lokasi. Lolos berarti layak tampil, belum berarti terverifikasi. | Laporan tampil di peta, dan warga lain bisa menambah pengamatan di kejadian yang sama. |

</div>

## 🎬 Demo

<div align="center">
<img src="docs/images/demo.gif" alt="Alur melapor: peta, isi form 3 langkah, kirim, diperiksa, lalu lolos dan tampil di peta" width="100%">
<sub>Dari peta, isi form 3 langkah, kirim, lalu laporan diperiksa dan lolos dalam ±12 detik.</sub>
</div>

## ✨ Fitur utama

### 🗺️ Peta Pantau Wilayah

Peta nasional dengan penanda yang dikelompokkan (cluster), filter kondisi (*masih berlangsung*, *mereda*, *belum diketahui*, *info lama*), daftar kejadian, dan popover ringkas. Kejadian yang tidak diperbarui lebih dari 48 jam otomatis ditandai **info lama**, supaya peta tidak menyesatkan.

<img src="docs/images/pantau.png" alt="Halaman Pantau Wilayah: peta nasional dan daftar kejadian" width="100%">

### 📸 Lapor dalam 3 langkah

Form pendek yang aman dan menjaga privasi pelapor:

- **Pengamatan**: pilih *asap*, *api*, atau *keduanya*, waktu kejadian, dan hingga 4 foto/video.
- **Lokasi**: taruh titik perkiraan sumber, atau cukup posisi pengamat + arah asap kalau tidak tahu titik pastinya.
- **Tinjau**: kalau ada kejadian serupa di dekat titik itu, WANA menawarkan untuk **menggabungkan** laporan, sehingga tidak muncul duplikat.

Foto dikecilkan otomatis (maks. 1920 px), dan **data lokasi di dalam foto (EXIF/GPS) dibuang** sebelum diunggah.

<img src="docs/images/lapor.png" alt="Form lapor dalam 3 langkah di ponsel" width="100%">

### ⏱️ Status laporan secara langsung

Setelah dikirim, pelapor bisa mengikuti setiap tahap pemeriksaan: kelengkapan data, kewajaran waktu dan lokasi, indikasi visual pada foto, dan pencarian kejadian serupa. Halaman diperbarui otomatis sampai laporan **lolos dan tampil di peta**, atau diminta untuk **dilengkapi**.

<img src="docs/images/status.png" alt="Status laporan: sedang diperiksa lalu lolos dan tampil di peta" width="100%">

### 📋 Detail kejadian yang transparan

Setiap kejadian punya galeri foto, ringkasan pengamatan, **hasil pemeriksaan awal AI beserta keterbatasannya**, area perkiraan sumber, dan **linimasa** dari laporan pertama sampai pengamatan terbaru. Identitas pelapor dan lokasi pengamat tidak pernah ditampilkan ke publik.

<details>
<summary><b>Lihat tangkapan layar halaman detail</b></summary>
<br>
<img src="docs/images/detail.png" alt="Halaman detail kejadian Pulang Pisau" width="100%">
</details>

### 🧭 Lapisan bukti yang jujur

WANA membedakan dengan tegas antara *layak tampil* dan *terverifikasi*:

| Tingkat | Artinya |
|---|---|
| 🔵 **Lolos AI** | Foto, waktu, dan lokasi masuk akal. Ini syarat tampil di peta, **bukan** verifikasi. |
| 🟢 **Didukung warga** | Ada pengamatan mandiri dari akun lain untuk kejadian yang sama. |
| ⚪ **Terverifikasi petugas** | Dikonfirmasi pihak berwenang (rencana pengembangan). |

### 📱 Mobile-first

Dirancang untuk dipakai di lapangan lewat ponsel: bottom sheet di peta, tab bar bawah, tombol besar, dan pengingat keselamatan (*"Ambil foto dari tempat aman"*, *"Hubungi 112"*) di titik-titik yang tepat.

<img src="docs/images/mobile.png" alt="Tampilan WANA di ponsel: beranda, peta, dan detail kejadian" width="100%">

## 🔄 Alur laporan

```mermaid
flowchart LR
    A([👀 Warga melihat<br/>asap atau api]) --> B[📸 Isi form<br/>3 langkah]
    B --> C{🤖 Pemeriksaan<br/>awal AI}
    C -- Perlu dilengkapi --> B
    C -- Ditolak --> X([❌ Tidak tampil])
    C -- Lolos --> D{Ada kejadian<br/>serupa di dekatnya?}
    D -- Ya --> E[➕ Digabung:<br/>dukungan + linimasa bertambah]
    D -- Tidak --> F[📍 Kejadian baru<br/>di peta]
    E --> G([🗺️ Tampil di Peta Pantau])
    F --> G
```

## 🏗️ Arsitektur

```mermaid
flowchart LR
    U[📱 Browser<br/>desktop & ponsel] -->|HTTPS| N

    subgraph V[Vercel]
      N[Next.js 16 App Router<br/>Server Components + Server Actions]
    end

    subgraph SB[Supabase]
      AU[Auth<br/>email + verifikasi]
      DB[(Postgres + RLS<br/>reports · incidents · profiles)]
      ST[Storage<br/>bucket privat report-media]
    end

    N --> AU
    N --> DB
    N --> ST
    U -->|tile peta| OFM[OpenFreeMap<br/>+ MapLibre GL]
```

## 🧰 Teknologi

| Lapisan | Teknologi |
|---|---|
| Framework | **Next.js 16** (App Router, Server Actions), **React 19**, TypeScript |
| Tampilan | **Tailwind CSS 4**, Motion (animasi), Plus Jakarta Sans |
| Peta | **MapLibre GL** + **Supercluster**, tile dari OpenFreeMap / OpenStreetMap |
| Backend | **Supabase**: Auth, Postgres dengan Row Level Security, Storage |
| Hosting | **Vercel** |

## 🚀 Menjalankan secara lokal

```bash
git clone https://github.com/hanchyp/wana.git
cd wana
npm install
cp .env.example .env.local   # isi URL & publishable key Supabase
npm run dev
```

Buka http://localhost:3000. Setup Supabase lengkap (auth, template email, migrasi, akun demo) ada di **[docs/SETUP.md](docs/SETUP.md)**.

## 📁 Struktur proyek

```
app/                 # Rute Next.js: beranda, pantau, kejadian, lapor, laporan-saya, auth
components/          # Peta, navigasi, kartu status, maskot, form akun
lib/                 # Tipe & label kejadian, akses Supabase, kompresi media
supabase/migrations/ # Skema, RLS, simulasi pemeriksaan AI, seed 63 kejadian
public/              # Logo, maskot, foto, video hero, peta SVG
docs/                # Panduan setup & gambar README
```

## 🛣️ Rencana pengembangan

- [ ] Pemeriksaan gambar dengan model AI sungguhan (deteksi asap/api, deteksi foto daur ulang)
- [ ] Integrasi titik panas satelit (mis. NASA FIRMS) sebagai lapisan pembanding
- [ ] Verifikasi oleh petugas (BPBD / Manggala Agni) untuk tingkat **Terverifikasi**
- [ ] Notifikasi kejadian baru di sekitar wilayah pengguna
- [ ] Mode offline untuk area dengan sinyal lemah

## 👥 Tim

| Nama | Peran | GitHub |
|---|---|---|
| Farhan Cahya Permana | Fullstack Developer | [@hanchyp](https://github.com/hanchyp) |
| Alissa Tukhriyatun Nufus | Fullstack Developer | [@aluryy](https://github.com/aluryy) |

---

<div align="center">

**WANA bukan layanan darurat.** Untuk bahaya langsung, hubungi **112** atau pemadam kebakaran **113**.

Dibuat untuk **TECHNO VERSARY VOL. II** 🌳

</div>
