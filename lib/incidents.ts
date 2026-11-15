// DATA SIMULASI. Semua kejadian di sini fiktif dan wajib ditampilkan dengan label "Data simulasi".

export type Indication = "asap" | "api" | "keduanya";
export type Review = "lolos-ai" | "didukung" | "terverifikasi";
export type Condition = "belum-diketahui" | "berlangsung" | "mereda" | "selesai";

export type TimelineEntry = {
  time: string;
  title: string;
  note: string;
  kind: "pertama" | "ai" | "dukungan" | "pengamatan";
};

export type Incident = {
  id: string;
  title: string;
  place: string;
  region: string;
  regionShort: string;
  lon: number;
  lat: number;
  indication: Indication;
  review: Review;
  supportCount: number;
  condition: Condition;
  /** Tidak ada pembaruan melewati ambang informasi lama (48 jam). */
  stale: boolean;
  updatedAgo: string;
  firstSeen: string;
  updatedAt: string;
  summary: string;
  precision: "titik" | "area";
  radiusKm: number;
  timeline: TimelineEntry[];
};

const featuredIncidents: Incident[] = [
  {
    id: "pulang-pisau",
    title: "Indikasi asap dan api di sekitar Pulang Pisau",
    place: "Pulang Pisau",
    region: "Kalimantan Tengah",
    regionShort: "Kalteng",
    lon: 114.05,
    lat: -2.85,
    indication: "keduanya",
    review: "didukung",
    supportCount: 3,
    condition: "berlangsung",
    stale: false,
    updatedAgo: "12 mnt lalu",
    firstSeen: "13:58 WIB",
    updatedAt: "14:20 WIB",
    summary:
      "Asap putih keabuan terlihat naik dari arah lahan gambut di timur laut Pulang Pisau sejak sekitar 13:50 WIB. Dua pelapor menyebut titik api kecil di tepi kanal. Asap terbawa angin ke barat daya.",
    precision: "area",
    radiusKm: 1.5,
    timeline: [
      {
        time: "14:20",
        title: "Pengamatan tambahan dari warga",
        note: "Asap masih terlihat dari Jl. Trans Kalimantan km 12. Foto lolos pemeriksaan.",
        kind: "pengamatan",
      },
      {
        time: "14:01",
        title: "Status naik: didukung pengamatan lain",
        note: "Ada pengamatan mandiri dari akun berbeda. Oleh sistem, bukan verifikasi petugas.",
        kind: "dukungan",
      },
      {
        time: "13:59",
        title: "Lolos pemeriksaan awal AI, kejadian terbit",
        note: "Tampil di peta sebagai titik perkiraan menurut pelapor.",
        kind: "ai",
      },
      {
        time: "13:58",
        title: "Laporan pertama diterima",
        note: "Identitas pelapor dan lokasi pengamat tidak ditampilkan ke publik.",
        kind: "pertama",
      },
    ],
  },
  {
    id: "pelalawan",
    title: "Indikasi api di sekitar Pelalawan",
    place: "Pelalawan",
    region: "Riau",
    regionShort: "Riau",
    lon: 102.1,
    lat: 0.15,
    indication: "api",
    review: "didukung",
    supportCount: 2,
    condition: "berlangsung",
    stale: false,
    updatedAgo: "45 mnt lalu",
    firstSeen: "12:40 WIB",
    updatedAt: "13:47 WIB",
    summary:
      "Api kecil terlihat di tepi lahan bekas tebangan dekat jalan perkebunan. Asap tipis bergerak ke utara.",
    precision: "titik",
    radiusKm: 0.5,
    timeline: [
      { time: "13:47", title: "Pengamatan tambahan dari warga", note: "Api masih terlihat dari jalan perkebunan.", kind: "pengamatan" },
      { time: "13:05", title: "Status naik: didukung pengamatan lain", note: "Pengamatan mandiri dari akun berbeda.", kind: "dukungan" },
      { time: "12:41", title: "Lolos pemeriksaan awal AI, kejadian terbit", note: "Tampil sebagai titik perkiraan.", kind: "ai" },
      { time: "12:40", title: "Laporan pertama diterima", note: "Identitas pelapor dilindungi.", kind: "pertama" },
    ],
  },
  {
    id: "ogan-komering-ilir",
    title: "Indikasi api di sekitar Ogan Komering Ilir",
    place: "Ogan Komering Ilir",
    region: "Sumatera Selatan",
    regionShort: "Sumsel",
    lon: 105.45,
    lat: -3.35,
    indication: "api",
    review: "lolos-ai",
    supportCount: 0,
    condition: "berlangsung",
    stale: false,
    updatedAgo: "1 jam lalu",
    firstSeen: "13:30 WIB",
    updatedAt: "13:30 WIB",
    summary: "Nyala api terlihat di kejauhan dari tanggul kanal, sekitar dua kilometer ke arah timur.",
    precision: "area",
    radiusKm: 2,
    timeline: [
      { time: "13:31", title: "Lolos pemeriksaan awal AI, kejadian terbit", note: "Tampil sebagai area perkiraan.", kind: "ai" },
      { time: "13:30", title: "Laporan pertama diterima", note: "Identitas pelapor dilindungi.", kind: "pertama" },
    ],
  },
  {
    id: "muaro-jambi",
    title: "Indikasi asap di sekitar Muaro Jambi",
    place: "Muaro Jambi",
    region: "Jambi",
    regionShort: "Jambi",
    lon: 103.75,
    lat: -1.55,
    indication: "asap",
    review: "lolos-ai",
    supportCount: 0,
    condition: "belum-diketahui",
    stale: false,
    updatedAgo: "2 jam lalu",
    firstSeen: "12:32 WIB",
    updatedAt: "12:32 WIB",
    summary: "Kepulan asap abu-abu terlihat di atas kebun warga, sumber belum diketahui.",
    precision: "area",
    radiusKm: 3,
    timeline: [
      { time: "12:33", title: "Lolos pemeriksaan awal AI, kejadian terbit", note: "Tampil sebagai area perkiraan.", kind: "ai" },
      { time: "12:32", title: "Laporan pertama diterima", note: "Identitas pelapor dilindungi.", kind: "pertama" },
    ],
  },
  {
    id: "ketapang",
    title: "Indikasi asap di sekitar Ketapang",
    place: "Ketapang",
    region: "Kalimantan Barat",
    regionShort: "Kalbar",
    lon: 110.35,
    lat: -1.75,
    indication: "asap",
    review: "didukung",
    supportCount: 1,
    condition: "mereda",
    stale: false,
    updatedAgo: "3 jam lalu",
    firstSeen: "09:10 WIB",
    updatedAt: "11:30 WIB",
    summary: "Asap terlihat sejak pagi, pengamatan terbaru menyebut asap mulai menipis.",
    precision: "area",
    radiusKm: 2,
    timeline: [
      { time: "11:30", title: "Pengamatan tambahan: dilaporkan mereda", note: "Asap terlihat menipis dari dermaga.", kind: "pengamatan" },
      { time: "09:40", title: "Status naik: didukung pengamatan lain", note: "Pengamatan mandiri dari akun berbeda.", kind: "dukungan" },
      { time: "09:11", title: "Lolos pemeriksaan awal AI, kejadian terbit", note: "Tampil sebagai area perkiraan.", kind: "ai" },
      { time: "09:10", title: "Laporan pertama diterima", note: "Identitas pelapor dilindungi.", kind: "pertama" },
    ],
  },
  {
    id: "merauke",
    title: "Indikasi api di sekitar Merauke",
    place: "Merauke",
    region: "Papua Selatan",
    regionShort: "Papua Sel.",
    lon: 140.3,
    lat: -8.2,
    indication: "api",
    review: "lolos-ai",
    supportCount: 0,
    condition: "berlangsung",
    stale: false,
    updatedAgo: "5 jam lalu",
    firstSeen: "11:15 WIT",
    updatedAt: "11:15 WIT",
    summary: "Garis api terlihat di padang rumput savana dekat jalan trans.",
    precision: "titik",
    radiusKm: 1,
    timeline: [
      { time: "11:16", title: "Lolos pemeriksaan awal AI, kejadian terbit", note: "Tampil sebagai titik perkiraan.", kind: "ai" },
      { time: "11:15", title: "Laporan pertama diterima", note: "Identitas pelapor dilindungi.", kind: "pertama" },
    ],
  },
  {
    id: "banjar",
    title: "Indikasi asap di sekitar Banjar",
    place: "Banjar",
    region: "Kalimantan Selatan",
    regionShort: "Kalsel",
    lon: 115.0,
    lat: -3.45,
    indication: "asap",
    review: "lolos-ai",
    supportCount: 0,
    condition: "belum-diketahui",
    stale: true,
    updatedAgo: "2 hari lalu",
    firstSeen: "6 Nov · 15:20 WITA",
    updatedAt: "6 Nov · 15:20 WITA",
    summary: "Asap tipis terlihat di kejauhan. Belum ada pembaruan sejak itu.",
    precision: "area",
    radiusKm: 3,
    timeline: [
      { time: "15:21", title: "Lolos pemeriksaan awal AI, kejadian terbit", note: "Tampil sebagai area perkiraan.", kind: "ai" },
      { time: "15:20", title: "Laporan pertama diterima", note: "Identitas pelapor dilindungi.", kind: "pertama" },
    ],
  },
  {
    id: "sumba-timur",
    title: "Indikasi asap di sekitar Sumba Timur",
    place: "Sumba Timur",
    region: "Nusa Tenggara Timur",
    regionShort: "NTT",
    lon: 120.25,
    lat: -9.75,
    indication: "asap",
    review: "lolos-ai",
    supportCount: 0,
    condition: "mereda",
    stale: true,
    updatedAgo: "3 hari lalu",
    firstSeen: "5 Nov · 10:02 WITA",
    updatedAt: "5 Nov · 10:02 WITA",
    summary: "Asap dari arah padang savana, dilaporkan mereda pada sore hari.",
    precision: "area",
    radiusKm: 4,
    timeline: [
      { time: "10:03", title: "Lolos pemeriksaan awal AI, kejadian terbit", note: "Tampil sebagai area perkiraan.", kind: "ai" },
      { time: "10:02", title: "Laporan pertama diterima", note: "Identitas pelapor dilindungi.", kind: "pertama" },
    ],
  },
];

// Titik tambahan agar peta terisi merata di seluruh Indonesia (fiktif).
const extraPlaces: [id: string, place: string, region: string, regionShort: string, lon: number, lat: number][] = [
  ["aceh-barat", "Aceh Barat", "Aceh", "Aceh", 96.2, 4.25],
  ["nagan-raya", "Nagan Raya", "Aceh", "Aceh", 96.55, 4.05],
  ["labuhanbatu", "Labuhanbatu", "Sumatera Utara", "Sumut", 100.1, 2.2],
  ["tapanuli-selatan", "Tapanuli Selatan", "Sumatera Utara", "Sumut", 99.3, 1.5],
  ["rokan-hilir", "Rokan Hilir", "Riau", "Riau", 100.8, 2.0],
  ["bengkalis", "Bengkalis", "Riau", "Riau", 101.9, 1.3],
  ["siak", "Siak", "Riau", "Riau", 102.0, 0.8],
  ["kampar", "Kampar", "Riau", "Riau", 101.1, 0.3],
  ["indragiri-hilir", "Indragiri Hilir", "Riau", "Riau", 103.2, -0.3],
  ["dharmasraya", "Dharmasraya", "Sumatera Barat", "Sumbar", 101.6, -1.0],
  ["tanjung-jabung-timur", "Tanjung Jabung Timur", "Jambi", "Jambi", 103.8, -1.2],
  ["sarolangun", "Sarolangun", "Jambi", "Jambi", 102.7, -2.3],
  ["musi-banyuasin", "Musi Banyuasin", "Sumatera Selatan", "Sumsel", 103.8, -2.5],
  ["banyuasin", "Banyuasin", "Sumatera Selatan", "Sumsel", 104.6, -2.6],
  ["musi-rawas", "Musi Rawas", "Sumatera Selatan", "Sumsel", 102.9, -3.0],
  ["seluma", "Seluma", "Bengkulu", "Bengkulu", 102.6, -4.0],
  ["mesuji", "Mesuji", "Lampung", "Lampung", 105.4, -3.9],
  ["tulang-bawang", "Tulang Bawang", "Lampung", "Lampung", 105.5, -4.4],
  ["bangka-tengah", "Bangka Tengah", "Bangka Belitung", "Babel", 106.2, -2.4],
  ["kubu-raya", "Kubu Raya", "Kalimantan Barat", "Kalbar", 109.4, -0.3],
  ["sanggau", "Sanggau", "Kalimantan Barat", "Kalbar", 110.6, 0.1],
  ["sintang", "Sintang", "Kalimantan Barat", "Kalbar", 111.5, 0.0],
  ["kapuas-hulu", "Kapuas Hulu", "Kalimantan Barat", "Kalbar", 112.5, 0.8],
  ["kotawaringin-timur", "Kotawaringin Timur", "Kalimantan Tengah", "Kalteng", 112.9, -2.3],
  ["katingan", "Katingan", "Kalimantan Tengah", "Kalteng", 113.3, -2.0],
  ["kapuas", "Kapuas", "Kalimantan Tengah", "Kalteng", 114.3, -2.4],
  ["barito-selatan", "Barito Selatan", "Kalimantan Tengah", "Kalteng", 114.8, -1.9],
  ["tanah-laut", "Tanah Laut", "Kalimantan Selatan", "Kalsel", 114.8, -3.8],
  ["hulu-sungai-utara", "Hulu Sungai Utara", "Kalimantan Selatan", "Kalsel", 115.2, -2.4],
  ["paser", "Paser", "Kalimantan Timur", "Kaltim", 116.0, -1.8],
  ["kutai-kartanegara", "Kutai Kartanegara", "Kalimantan Timur", "Kaltim", 116.6, -0.5],
  ["kutai-timur", "Kutai Timur", "Kalimantan Timur", "Kaltim", 117.4, 0.9],
  ["bulungan", "Bulungan", "Kalimantan Utara", "Kaltara", 117.2, 2.8],
  ["kuningan", "Lereng Ciremai, Kuningan", "Jawa Barat", "Jabar", 108.4, -6.9],
  ["karanganyar", "Lereng Lawu, Karanganyar", "Jawa Tengah", "Jateng", 111.2, -7.62],
  ["malang", "Lereng Arjuno, Malang", "Jawa Timur", "Jatim", 112.6, -7.75],
  ["situbondo", "Baluran, Situbondo", "Jawa Timur", "Jatim", 114.4, -7.85],
  ["buleleng", "Buleleng", "Bali", "Bali", 115.0, -8.2],
  ["sumbawa", "Sumbawa", "Nusa Tenggara Barat", "NTB", 117.4, -8.6],
  ["bima", "Bima", "Nusa Tenggara Barat", "NTB", 118.7, -8.5],
  ["ende", "Ende", "Nusa Tenggara Timur", "NTT", 121.7, -8.75],
  ["kupang", "Kupang", "Nusa Tenggara Timur", "NTT", 123.8, -10.0],
  ["belu", "Belu", "Nusa Tenggara Timur", "NTT", 124.9, -9.2],
  ["donggala", "Donggala", "Sulawesi Tengah", "Sulteng", 119.8, -0.6],
  ["boalemo", "Boalemo", "Gorontalo", "Gorontalo", 122.4, 0.65],
  ["minahasa", "Minahasa", "Sulawesi Utara", "Sulut", 124.9, 1.2],
  ["bone", "Bone", "Sulawesi Selatan", "Sulsel", 120.2, -4.6],
  ["konawe", "Konawe", "Sulawesi Tenggara", "Sultra", 122.1, -3.9],
  ["buru", "Buru", "Maluku", "Maluku", 126.6, -3.4],
  ["seram", "Seram Bagian Timur", "Maluku", "Maluku", 130.0, -3.3],
  ["sorong", "Sorong", "Papua Barat Daya", "PBD", 131.4, -1.0],
  ["mimika", "Mimika", "Papua Tengah", "Papua Tengah", 136.8, -4.6],
  ["jayapura", "Sentani, Jayapura", "Papua", "Papua", 140.5, -2.6],
  ["mappi", "Mappi", "Papua Selatan", "Papua Selatan", 139.4, -6.7],
  ["boven-digoel", "Boven Digoel", "Papua Selatan", "Papua Selatan", 140.4, -6.1],
];

const indications: Indication[] = ["api", "asap", "keduanya", "api", "asap"];
const conditions: Condition[] = ["berlangsung", "belum-diketahui", "mereda", "berlangsung"];
const agoMinutes = [18, 25, 33, 41, 52, 64, 78, 95, 110, 135, 160, 190];

function pad(n: number) {
  return String(n).padStart(2, "0");
}

const extraIncidents: Incident[] = extraPlaces.map(([id, place, region, regionShort, lon, lat], i) => {
  const indication = indications[i % indications.length];
  const stale = i % 11 === 7;
  const ago = agoMinutes[i % agoMinutes.length];
  const updated = 14 * 60 + 32 - ago;
  const first = updated - 6 - (i % 4) * 5;
  const clock = (m: number) => `${pad(Math.floor(m / 60))}:${pad(m % 60)}`;
  const kind = indication === "asap" ? "asap" : indication === "api" ? "api" : "asap dan api";
  return {
    id,
    title: `Indikasi ${kind} di sekitar ${place}`,
    place,
    region,
    regionShort,
    lon,
    lat,
    indication,
    review: i % 3 === 0 ? "lolos-ai" : "didukung",
    supportCount: i % 3 === 0 ? 0 : 1 + (i % 4),
    condition: stale ? "belum-diketahui" : conditions[i % conditions.length],
    stale,
    updatedAgo: stale ? "3 hari lalu" : ago < 60 ? `${ago} mnt lalu` : `${Math.floor(ago / 60)} jam lalu`,
    firstSeen: `${clock(first)} WIB`,
    updatedAt: `${clock(updated)} WIB`,
    summary: `Warga melaporkan ${kind} di sekitar ${place}, ${region}. Lokasi berupa perkiraan dari pengamat di sekitar area.`,
    precision: i % 2 === 0 ? "area" : "titik",
    radiusKm: i % 2 === 0 ? 2 : 1,
    timeline: [
      { time: clock(updated), title: "Lolos pemeriksaan awal AI, kejadian terbit", note: "Tampil di peta sebagai titik perkiraan menurut pelapor.", kind: "ai" },
      { time: clock(first), title: "Laporan pertama diterima", note: "Identitas pelapor dan lokasi pengamat tidak ditampilkan ke publik.", kind: "pertama" },
    ],
  };
});

export const incidents: Incident[] = [...featuredIncidents, ...extraIncidents];

export const featuredId = "pulang-pisau";

export function getIncident(id: string) {
  return incidents.find((i) => i.id === id);
}

export const conditionLabel: Record<Condition, string> = {
  "belum-diketahui": "Kondisi belum diketahui",
  berlangsung: "Masih berlangsung",
  mereda: "Dilaporkan mereda",
  selesai: "Selesai berdasarkan peninjauan",
};

export const indicationLabel: Record<Indication, string> = {
  asap: "Asap",
  api: "Api",
  keduanya: "Asap dan api",
};

// Proyeksi peta Kalimantan (public/maps/map-kalteng-rich.svg, 1100 x 800).
export const REGIONAL = { width: 1100, height: 800 };
export function projectRegional(lon: number, lat: number) {
  const k = 144.73;
  return { x: (lon - 110) * k, y: (1 - lat) * k };
}

export const regionalTowns = [
  { name: "Palangka Raya", lon: 113.92, lat: -2.21 },
  { name: "Sampit", lon: 112.95, lat: -2.53 },
  { name: "Banjarmasin", lon: 114.59, lat: -3.32 },
];
