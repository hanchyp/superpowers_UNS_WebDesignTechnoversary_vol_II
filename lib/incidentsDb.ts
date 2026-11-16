import { createClient } from "@supabase/supabase-js";
import { connection } from "next/server";
import { cache } from "react";
import type { Database } from "./database.types";
import type { Incident, IncidentLite, TimelineEntry } from "./incidents";

type IncidentRow = Database["public"]["Tables"]["incidents"]["Row"];
type EventRow = Database["public"]["Tables"]["incident_events"]["Row"];

const STALE_HOURS = 48;
const BUCKET = "report-media";

/** Klien publik (tanpa sesi): kejadian bisa dibaca siapa saja lewat RLS. Hanya dipakai di server. */
function publicClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) return null;
  return createClient<Database>(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

const jakarta = { timeZone: "Asia/Jakarta" } as const;

function clock(d: Date) {
  return d.toLocaleTimeString("id-ID", { ...jakarta, hour: "2-digit", minute: "2-digit" }).replace(".", ":");
}

function dayKey(d: Date) {
  return d.toLocaleDateString("en-CA", jakarta);
}

/** "13:58 WIB" untuk hari ini, "6 Nov · 15:20 WIB" untuk hari lain. */
function whenText(iso: string, now: Date) {
  const d = new Date(iso);
  if (dayKey(d) === dayKey(now)) return `${clock(d)} WIB`;
  return `${d.toLocaleDateString("id-ID", { ...jakarta, day: "numeric", month: "short" })} · ${clock(d)} WIB`;
}

function agoText(iso: string, now: Date) {
  const minutes = Math.max(0, Math.round((now.getTime() - new Date(iso).getTime()) / 60_000));
  if (minutes < 1) return "baru saja";
  if (minutes < 60) return `${minutes} mnt lalu`;
  if (minutes < 24 * 60) return `${Math.floor(minutes / 60)} jam lalu`;
  return `${Math.floor(minutes / (24 * 60))} hari lalu`;
}

function toIncident(row: IncidentRow, events: EventRow[], now: Date): Incident {
  const timeline: TimelineEntry[] = [...events]
    .sort((a, b) => b.at.localeCompare(a.at))
    .map((e) => {
      const at = new Date(e.at);
      return {
        time: clock(at),
        day: dayKey(at) === dayKey(now) ? undefined : at.toLocaleDateString("id-ID", { ...jakarta, day: "numeric", month: "short" }),
        title: e.title,
        note: e.note,
        kind: e.kind as TimelineEntry["kind"],
      };
    });
  return {
    id: row.id,
    title: row.title,
    place: row.place,
    region: row.region,
    regionShort: row.region_short,
    lon: row.lon,
    lat: row.lat,
    indication: row.indication,
    review: row.review,
    supportCount: row.support_count,
    condition: row.condition,
    stale: now.getTime() - new Date(row.updated_at).getTime() > STALE_HOURS * 3_600_000,
    updatedAgo: agoText(row.updated_at, now),
    firstSeen: whenText(row.first_seen_at, now),
    updatedAt: whenText(row.updated_at, now),
    summary: row.summary,
    precision: row.precision === "titik" ? "titik" : "area",
    radiusKm: row.radius_km,
    timeline,
    isDemo: row.is_demo,
  };
}

/** Semua kejadian, terbaru di atas. Waktu relatif dihitung saat request; satu query per request. */
export const listIncidents = cache(async (): Promise<Incident[]> => {
  await connection();
  const supabase = publicClient();
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("incidents")
    .select("*, incident_events(*)")
    .order("updated_at", { ascending: false })
    .limit(500);
  if (error) {
    console.error("[incidents] gagal memuat:", error.code, error.message);
    return [];
  }
  const now = new Date();
  return data.map(({ incident_events, ...row }) => toIncident(row, incident_events, now));
});

export async function getIncidentById(id: string): Promise<Incident | null> {
  await connection();
  if (!/^[a-z0-9-]{1,80}$/.test(id)) return null;
  const supabase = publicClient();
  if (!supabase) return null;
  const { data, error } = await supabase.from("incidents").select("*, incident_events(*)").eq("id", id).maybeSingle();
  if (error) console.error("[incidents] gagal memuat kejadian:", error.code, error.message);
  if (!data) return null;
  const { incident_events, ...row } = data;
  return toIncident(row, incident_events, new Date());
}

export function toLite(i: Incident): IncidentLite {
  return { id: i.id, title: i.title, place: i.place, region: i.region, lon: i.lon, lat: i.lat, condition: i.condition, updatedAgo: i.updatedAgo };
}

/** Foto dari laporan warga yang sudah terbit untuk kejadian ini (signed URL, berlaku 1 jam). */
export async function getIncidentPhotos(id: string): Promise<string[]> {
  const supabase = publicClient();
  if (!supabase) return [];
  const { data, error } = await supabase.rpc("incident_photos", { p_incident_id: id });
  if (error || !data?.length) {
    if (error) console.error("[incidents] gagal memuat foto:", error.code, error.message);
    return [];
  }
  const { data: signed } = await supabase.storage.from(BUCKET).createSignedUrls(data.map((p) => p.path), 60 * 60);
  return (signed ?? []).flatMap((s) => (s.signedUrl ? [s.signedUrl] : []));
}
