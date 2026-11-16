# Prompt ChatGPT: 7 gambar README WANA

## Baca dulu

- **Lampirkan screenshot asli di setiap prompt.** Kalau ChatGPT membuat tampilan aplikasi dari nol, hasilnya akan berbeda dari situs live (teks salah eja, tombol palsu), dan juri bisa membandingkannya dengan demo. Jadi tugas ChatGPT di sini adalah **merapikan dan membingkai** screenshot asli, bukan mengarang UI.
- **ChatGPT tidak bisa membuat GIF animasi yang layak.** Untuk `demo.gif`, prompt #7 memberi kamu naskah rekaman, sedangkan file GIF-nya kamu buat sendiri dengan ScreenToGif (gratis, Windows).
- Ambil screenshot dari https://wana-project.vercel.app/ di Chrome:
  1. Tekan F12, lalu Ctrl+Shift+M (mode perangkat).
  2. Desktop: atur ukuran 1440×900. HP: pilih "iPhone 14 Pro" (393×852).
  3. Screenshot lewat Ctrl+Shift+P → ketik "Capture screenshot" (atau "Capture full size screenshot" untuk halaman panjang).
- Sebelum memotret, jalankan `select public.refresh_demo_incidents();` di Supabase SQL Editor supaya kejadian tidak tampil sebagai "info lama".
- Kalau hasil ChatGPT mengubah teks di layar, minta ulang: *"Do not redraw or alter the screenshot content; only place it as-is."*

---

## Prompt 0 · Kirim pertama kali (konteks gaya)

Kirim prompt ini sekali di awal percakapan, lampirkan `public/wana-logo-transparent.png` dan `public/mascot/welcome.png` dari repo.

```
I'm preparing images for the GitHub README of my competition project (TECHNO VERSARY VOL. II). Please remember this brand context for every image I ask for in this chat.

Project: WANA, a shared map where Indonesian citizens report and follow signs of forest and peatland fires (karhutla). Tagline: "Pantau hutan. Bagikan pengamatan." All data in the app is simulated.

Visual direction "Hutan Riang": cheerful and warm on storytelling pages, calm and clear on tool pages. Friendly, hopeful, never alarming or apocalyptic.

Palette:
- Forest green #0e4d2c (primary, dark backgrounds)
- Sage green #44613a (secondary, thin lines)
- Mint cream #e8efdc (light backgrounds)
- White #ffffff (cards)
- Warm amber #e8a33d (small accents only, e.g. map pins)

Style rules for every image:
- Clean, modern product-marketing look, like a polished SaaS landing page.
- Soft shadows, 16–24px rounded corners, generous whitespace.
- Subtle topographic contour lines as background texture at low opacity (~10%).
- Device frames are minimal and neutral (thin dark bezel, no brand logos like Apple).
- When I attach app screenshots, place them EXACTLY as provided. Never redraw, translate, re-type or invent UI, text, buttons or data inside them.
- Any text you add yourself must be spelled exactly as I write it (Indonesian). If you can't render text perfectly, leave that space empty and tell me.
- No watermarks, no extra logos, no people's faces, no dramatic flames.

Attached: the WANA logo and the mascot. Reply "Siap" and wait for my next request.
```

---

## Prompt 1 · `banner.png` (1600×800, gambar utama README)

**Lampirkan:** screenshot desktop Beranda `/` (bagian hero, 1440×900) + screenshot HP `/pantau` (peta dengan penanda).

```
Create the README hero banner for WANA, landscape 2:1 (export at 1600×800).

Layout:
- Background: smooth diagonal gradient from forest green #0e4d2c (left) to a slightly lighter green #1f6a42 (right), with faint topographic contour lines at ~10% opacity.
- Left 40%: the WANA logo (attached earlier) in white/cream, then the headline "WANA" in a bold rounded sans-serif, cream #e8efdc. Below it the tagline "Pantau hutan. Bagikan pengamatan." Below that, a small pill label: "Peta laporan karhutla warga · TECHNO VERSARY VOL. II".
- Right 60%: screenshot 1 (desktop homepage) inside a minimal laptop or browser-window frame, tilted 0–4°, soft long shadow. Screenshot 2 (mobile map) inside a minimal phone frame overlapping the bottom-right corner of the laptop, slightly in front.
- Optional: the mascot small near the bottom-left, looking toward the devices.
- Keep everything inside a 40px safe margin. The banner must look good on both GitHub light and dark mode (opaque background, no transparency).

Place both screenshots exactly as provided; do not alter their content.
```

---

## Prompt 2 · `pantau.png` (1440×900)

**Lampirkan:** screenshot desktop `/pantau` dengan **popover kejadian Pulang Pisau terbuka** (klik penandanya dulu).

```
Turn the attached screenshot into a clean presentation image for the "Peta Pantau" feature, landscape 16:10 (export at 1440×900).

- Background: mint cream #e8efdc with faint sage contour lines.
- Put the screenshot inside a minimal browser window frame (three small dots top-left, address bar showing "wana-project.vercel.app/pantau"), rounded 16px, soft shadow, filling about 88% of the width, centered.
- No added headline. Do not crop away the open popover or the incident list panel.

Place the screenshot exactly as provided; do not alter its content.
```

---

## Prompt 3 · `detail.png` (1440×±1600, tinggi)

**Lampirkan:** screenshot **full-size** `/kejadian/pulang-pisau` dari galeri sampai linimasa (potong sebelum footer).

```
Create a tall presentation image of the incident detail page, portrait, about 1440×1600.

- Background: mint cream #e8efdc with faint contour lines.
- Screenshot inside a minimal browser frame (address bar "wana-project.vercel.app/kejadian/pulang-pisau"), centered, rounded corners, soft shadow.
- Add 3 small callout labels on the right margin with thin sage #44613a leader lines pointing to the matching areas of the screenshot. Labels as white rounded pills with forest green text, exactly:
  1. "Hasil pemeriksaan AI"
  2. "Tangga Bukti: Lolos AI → Didukung → Terverifikasi"
  3. "Linimasa kejadian"
- If you can't place the callouts precisely on the right areas, leave them out and tell me.

Place the screenshot exactly as provided; do not alter its content.
```

---

## Prompt 4 · `lapor.png` (±1500×1000)

**Lampirkan:** 3 screenshot HP (login akun demo dulu, buka `/lapor`, **jangan tekan Kirim**):
1. Langkah **Pengamatan** (indikasi dipilih, foto contoh terunggah, mis. `public/photos/simulasi-karhutla-kanal.webp`)
2. Langkah **Lokasi** (penanda di peta)
3. Langkah **Tinjau**

```
Create a feature image showing the 3-step report form, landscape 3:2 (about 1500×1000).

- Background: mint cream #e8efdc with faint contour lines, a very soft forest-green glow behind the phones.
- Three minimal phone frames side by side, evenly spaced, the middle one raised slightly (about 30px higher) for rhythm. Screenshot 1 in the left phone, 2 in the middle, 3 on the right.
- Under each phone a small step label in forest green #0e4d2c, exactly:
  "1 · Pengamatan", "2 · Lokasi", "3 · Tinjau"
- A thin dashed sage line with small arrows connecting the three phones.
- Top-center headline, exactly: "Lapor dalam 3 langkah"

Place the screenshots exactly as provided; do not alter their content.
```

---

## Prompt 5 · `status.png` (1440×900)

**Lampirkan:** screenshot desktop `/laporan-saya/WR-xxxx`. Bagus kalau kamu punya 2: saat **"diperiksa"** (±12 detik pertama setelah kirim) dan saat **terbit**.

Kalau punya 2 screenshot:
```
Create a before/after image of the live report status page, landscape 16:10 (export at 1440×900).

- Background: mint cream #e8efdc with faint contour lines.
- Two browser-window frames side by side, slightly overlapping: screenshot 1 on the left, screenshot 2 on the right, a little in front.
- A small rounded pill label above each frame, exactly: "Sedang diperiksa" (left) and "Terbit di peta" (right). Use amber #e8a33d for the left pill and forest green #0e4d2c for the right pill, white text.
- A curved sage arrow from left frame to right frame with the small text "± 12 detik".

Place the screenshots exactly as provided; do not alter their content.
```

Kalau hanya punya 1 screenshot, pakai Prompt 2, cukup ganti address bar menjadi `wana-project.vercel.app/laporan-saya`.

---

## Prompt 6 · `mobile.png` (±1500×1000)

**Lampirkan:** 3 screenshot HP:
1. `/` Beranda (hero)
2. `/pantau` dengan **bottom sheet** daftar kejadian setengah terbuka
3. `/kejadian/pulang-pisau` bagian atas

```
Create a "mobile-first" showcase image, landscape 3:2 (about 1500×1000).

- Background: same gradient as the banner, forest green #0e4d2c to #1f6a42, faint contour lines.
- Three minimal phone frames in a gentle fan arrangement: left phone rotated -6°, middle upright and slightly larger, right phone rotated +6°. Screenshot 1 left, 2 middle, 3 right. Soft shadows.
- No headline and no labels. Keep a 60px safe margin.

Place the screenshots exactly as provided; do not alter their content.
```

---

## Prompt 7 · `demo.gif` (naskah rekaman, bukan untuk generate)

ChatGPT tidak bisa merekam situs. Pakai prompt ini supaya ChatGPT membantu menyusun storyboard dan pengaturan ScreenToGif, lalu rekam sendiri.

```
I need to record a 10–20 second GIF demo of my web app for a GitHub README (max 10 MB, 960px wide). I'll record it myself with ScreenToGif on Windows. Write me:
1. A shot-by-shot storyboard with seconds per shot for this flow:
   map page /pantau → click "Lapor" → step "Pengamatan" (pick "Asap dan api", upload a photo, type a short note) → step "Lokasi" (drop a pin in Central Kalimantan) → step "Tinjau" → click "Kirim" → status page shows "sedang diperiksa" → about 12 seconds later it becomes published → end on the incident page.
2. Which parts to speed up 2–3× (the waiting part) and which to hold still for 1 second.
3. Recommended ScreenToGif settings: recording area 1280×800, fps, export resize to 960px wide, encoder and quality settings to stay under 10 MB, and how to remove duplicate frames.
4. Tips so the cursor movement looks smooth and deliberate.
Answer in Indonesian.
```

Catatan: menekan **Kirim** membuat laporan sungguhan di database demo. Catat kode WR-nya supaya bisa dihapus nanti kalau perlu.

---

## Prompt cadangan · banner versi ilustrasi (tanpa screenshot)

Pakai ini kalau ingin latar ilustrasi untuk banner, lalu tumpuk logo dan screenshot asli di atasnya (mis. di Canva).

```
Wide 2:1 hero illustration (1600×800) for a civic-tech app called WANA that maps community reports of forest and peatland fires in Indonesia. Cheerful, calm, hopeful mood, not alarming. Lush tropical rainforest and peat swamp landscape of Central Kalimantan from a gentle aerial angle, a winding blackwater river and straight canals, soft morning light, a few thin wisps of distant grey smoke on the horizon to hint at the topic, three tiny amber map pins floating above the forest. Flat-vector meets soft-painted style, rounded shapes, subtle topographic contour lines overlay. Palette: forest green #0e4d2c, sage #44613a, mint cream #e8efdc, amber #e8a33d accents. Keep the left 40% as calm, low-detail negative space for a logo and headline. No text, no letters, no logos, no people, no flames in the foreground, no watermark.
```

---

## Checklist setelah semua jadi

- [ ] Simpan dengan nama persis: `banner.png`, `pantau.png`, `detail.png`, `lapor.png`, `status.png`, `mobile.png`, `demo.gif` di `docs/images/`
- [ ] Cek ulang: teks di dalam screenshot tidak berubah, label tambahan dieja benar
- [ ] Kompres PNG di https://tinypng.com (target < 1,5 MB per file)
- [ ] GIF ≤ 10 MB
- [ ] Kabari saya, lalu README-nya saya tulis
