import type { Database, ReportIndication, ReportStatus } from "./database.types";
import { formatLngLat, nearestIncident } from "./geo";
import type { IncidentLite } from "./incidents";

export type ReportRow = Database["public"]["Tables"]["reports"]["Row"];

export const indicationText: Record<ReportIndication, string> = {
  asap: "Indikasi asap",
  api: "Indikasi api",
  keduanya: "Indikasi asap dan api",
};

export const statusText: Record<ReportStatus, string> = {
  diperiksa: "Diperiksa",
  terbit: "Terbit",
  "perlu-dilengkapi": "Perlu dilengkapi",
  ditolak: "Tidak diterbitkan",
};

/** Jam dalam WIB, sama di server dan browser (hindari beda zona waktu saat render). */
export function formatWIB(iso: string, withDate = false) {
  const d = new Date(iso);
  const time = d.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", timeZone: "Asia/Jakarta" }).replace(".", ":");
  if (!withDate) return `${time} WIB`;
  const date = d.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric", timeZone: "Asia/Jakarta" });
  return `${date}, ${time} WIB`;
}

/** Nama tempat yang ramah dibaca untuk sebuah laporan. */
export function reportPlace(
  r: Pick<ReportRow, "incident_id" | "location_mode" | "lon" | "lat" | "direction">,
  incidents: IncidentLite[],
) {
  const linked = r.incident_id ? incidents.find((i) => i.id === r.incident_id) : undefined;
  if (linked) return linked.place;
  if (r.location_mode === "titik" && r.lon != null && r.lat != null) {
    const near = nearestIncident([r.lon, r.lat], incidents, 25);
    return near ? `Sekitar ${near.incident.place}` : formatLngLat([r.lon, r.lat]);
  }
  return r.direction && r.direction !== "Tidak tahu" ? `Arah ${r.direction.toLowerCase()} dari pelapor` : "Lokasi pelapor";
}
