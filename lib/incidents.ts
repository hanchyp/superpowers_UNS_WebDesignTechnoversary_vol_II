// Tipe dan label kejadian. Datanya ada di Supabase (tabel incidents & incident_events),
// dimuat lewat lib/incidentsDb.ts. Data awal simulasi ada di supabase/migrations/*_seed_wana_incidents.sql.

export type Indication = "asap" | "api" | "keduanya";
export type Review = "lolos-ai" | "didukung" | "terverifikasi";
export type Condition = "belum-diketahui" | "berlangsung" | "mereda" | "selesai";

export type TimelineEntry = {
  time: string;
  /** "15 Nov" bila bukan hari ini; kosong untuk hari ini. */
  day?: string;
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
  /** true = data simulasi untuk demo. */
  isDemo: boolean;
};

/** Data ringan untuk komponen klien (mis. mencari kejadian terdekat di form lapor). */
export type IncidentLite = Pick<Incident, "id" | "title" | "place" | "region" | "lon" | "lat" | "condition" | "updatedAgo">;

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

/** Foto ilustrasi (dibuat AI) per jenis indikasi, untuk kejadian yang belum punya foto pelapor. */
export const illustrationPhoto: Record<Indication, string> = {
  asap: "/photos/ilustrasi/asap.webp",
  api: "/photos/ilustrasi/api.webp",
  keduanya: "/photos/ilustrasi/asap-dan-api.webp",
};

// Proyeksi peta Kalimantan (public/maps/map-kalteng-rich.svg, 1100 x 800).
export const REGIONAL = { width: 1100, height: 800 };
export function projectRegional(lon: number, lat: number) {
  const k = 144.73;
  return { x: (lon - 110) * k, y: (1 - lat) * k };
}

/** Apakah titik masuk cakupan peta statis Kalimantan (dengan sedikit margin). */
export function inRegionalMap(lon: number, lat: number) {
  const { x, y } = projectRegional(lon, lat);
  return x > 60 && x < REGIONAL.width - 60 && y > 60 && y < REGIONAL.height - 60;
}

export const regionalTowns = [
  { name: "Palangka Raya", lon: 113.92, lat: -2.21 },
  { name: "Sampit", lon: 112.95, lat: -2.53 },
  { name: "Banjarmasin", lon: 114.59, lat: -3.32 },
];
