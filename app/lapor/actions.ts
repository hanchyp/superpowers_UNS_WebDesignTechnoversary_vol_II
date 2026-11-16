"use server";

import { getIncidentById } from "@/lib/incidentsDb";
import { supabaseServer } from "@/lib/supabase";

const BUCKET = "report-media";
const MAX_FILES = 4;
const MAX_BYTES = 25 * 1024 * 1024;
const DIRECTIONS = ["Utara", "Timur laut", "Timur", "Tenggara", "Selatan", "Barat daya", "Barat", "Barat laut", "Tidak tahu"];
const EXT: Record<string, string> = {
  "image/webp": "webp",
  "image/jpeg": "jpg",
  "image/png": "png",
  "video/mp4": "mp4",
  "video/quicktime": "mov",
  "video/webm": "webm",
};

export type NewReport = {
  incidentId: string | null;
  indication: "asap" | "api" | "keduanya";
  observedAt: string;
  locationMode: "titik" | "arah";
  lon: number;
  lat: number;
  direction: string;
  note: string;
  consent: boolean;
  media: { kind: "foto" | "video"; mime: string; size: number }[];
};

export type CreateReportResult =
  | { ok: true; code: string; uploads: { path: string; token: string; index: number }[] }
  | { ok: false; message: string };

/** Simpan laporan, catat bukti, dan buat URL upload sekali pakai untuk tiap file. */
export async function createReport(input: NewReport): Promise<CreateReportResult> {
  const fail = (message: string): CreateReportResult => ({ ok: false, message });

  // Validasi ulang di server; jangan percaya data dari browser.
  if (!["asap", "api", "keduanya"].includes(input.indication)) return fail("Jenis pengamatan tidak dikenal.");
  if (!["titik", "arah"].includes(input.locationMode)) return fail("Mode lokasi tidak dikenal.");
  if (!input.consent) return fail("Persetujuan wajib dicentang.");
  const observed = new Date(input.observedAt);
  const now = Date.now();
  if (Number.isNaN(observed.getTime()) || observed.getTime() > now + 5 * 60_000 || observed.getTime() < now - 7 * 86_400_000) {
    return fail("Waktu pengamatan harus dalam 7 hari terakhir.");
  }
  if (!Number.isFinite(input.lon) || !Number.isFinite(input.lat) || Math.abs(input.lon) > 180 || Math.abs(input.lat) > 90) {
    return fail("Titik lokasi tidak valid.");
  }
  if (input.locationMode === "arah" && !DIRECTIONS.includes(input.direction)) return fail("Arah tidak dikenal.");
  if (input.incidentId && !(await getIncidentById(input.incidentId))) return fail("Kejadian yang dipilih tidak ditemukan.");
  const note = input.note.trim().slice(0, 4000);
  if (!Array.isArray(input.media) || input.media.length < 1 || input.media.length > MAX_FILES) {
    return fail(`Lampirkan 1 sampai ${MAX_FILES} foto atau video.`);
  }
  for (const m of input.media) {
    if (!EXT[m.mime] || !["foto", "video"].includes(m.kind) || !(m.size > 0 && m.size <= MAX_BYTES)) {
      return fail("Ada berkas yang jenis atau ukurannya tidak didukung.");
    }
  }

  const supabase = await supabaseServer(true);
  if (!supabase) return fail("Layanan belum dikonfigurasi.");
  const { data: claims } = await supabase.auth.getClaims();
  const userId = claims?.claims.sub;
  if (!userId) return fail("Sesi berakhir. Silakan masuk lagi.");

  const { data: report, error } = await supabase
    .from("reports")
    .insert({
      incident_id: input.incidentId,
      indication: input.indication,
      observed_at: observed.toISOString(),
      location_mode: input.locationMode,
      // Mode "arah": titik peta tetap disimpan sebagai perkiraan posisi pelapor (tidak ditampilkan publik).
      lon: input.lon,
      lat: input.lat,
      direction: input.locationMode === "arah" ? input.direction : null,
      note: note || null,
      consent_at: new Date().toISOString(),
    })
    .select("id, code")
    .single();

  if (error || !report) {
    console.error("[lapor] insert reports gagal:", error?.code, error?.message);
    if (error?.message?.includes("Terlalu banyak laporan")) return fail("Kamu sudah mengirim banyak laporan dalam satu jam. Coba lagi nanti.");
    return fail("Laporan belum bisa disimpan. Coba lagi.");
  }

  const files = input.media.map((m, index) => ({
    ...m,
    index,
    path: `${userId}/${report.id}/${index + 1}.${EXT[m.mime]}`,
  }));

  const { error: mediaError } = await supabase.from("report_media").insert(
    files.map((f) => ({ report_id: report.id, path: f.path, kind: f.kind, mime: f.mime, size_bytes: f.size, position: f.index })),
  );
  if (mediaError) {
    console.error("[lapor] insert report_media gagal:", mediaError.code, mediaError.message);
    await supabase.from("reports").delete().eq("id", report.id);
    return fail("Bukti belum bisa dicatat. Coba lagi.");
  }

  const uploads: { path: string; token: string; index: number }[] = [];
  for (const f of files) {
    const { data, error: signError } = await supabase.storage.from(BUCKET).createSignedUploadUrl(f.path);
    if (signError || !data) {
      console.error("[lapor] createSignedUploadUrl gagal:", signError?.message);
      await supabase.from("reports").delete().eq("id", report.id);
      return fail("Upload bukti belum bisa disiapkan. Coba lagi.");
    }
    uploads.push({ path: data.path, token: data.token, index: f.index });
  }

  return { ok: true, code: report.code, uploads };
}

/**
 * Batalkan laporan yang buktinya gagal diunggah, supaya tidak terbit tanpa foto.
 * RLS hanya mengizinkan pemilik menghapus laporan yang masih "diperiksa".
 */
export async function cancelReport(code: string): Promise<void> {
  if (!/^WR-\d{1,9}$/.test(code)) return;
  const supabase = await supabaseServer(true);
  if (!supabase) return;
  const { data: report } = await supabase.from("reports").select("id").eq("code", code).eq("status", "diperiksa").maybeSingle();
  if (!report) return;
  const { data: media } = await supabase.from("report_media").select("path").eq("report_id", report.id);
  if (media?.length) await supabase.storage.from(BUCKET).remove(media.map((m) => m.path));
  const { error } = await supabase.from("reports").delete().eq("id", report.id);
  if (error) console.error("[lapor] batal laporan gagal:", error.code, error.message);
}
