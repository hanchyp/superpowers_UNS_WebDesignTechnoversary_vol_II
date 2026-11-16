"use server";

import type { ReportStatus } from "@/lib/database.types";
import { supabaseServer } from "@/lib/supabase";

/**
 * Ambil status terbaru laporan. Untuk status "diperiksa", fungsi database juga memajukan
 * simulasi pemeriksaan AI berdasarkan waktu sejak laporan dibuat.
 */
export async function refreshReportStatus(
  code: string,
): Promise<{ status: ReportStatus; checks: number; incident: { id: string; title: string } | null } | null> {
  if (!/^WR-\d{1,9}$/.test(code)) return null;
  const supabase = await supabaseServer(true);
  if (!supabase) return null;

  const { data, error } = await supabase.rpc("advance_report_review", { p_code: code });
  if (error) {
    console.error("[laporan-saya] advance_report_review gagal:", error.code, error.message);
    return null;
  }
  const row = data?.[0];
  if (!row) return null;

  // Setelah terbit, laporan masuk ke sebuah kejadian di peta (digabung atau kejadian baru).
  let incident: { id: string; title: string } | null = null;
  if (row.current_incident) {
    const { data: inc } = await supabase.from("incidents").select("id, title").eq("id", row.current_incident).maybeSingle();
    incident = inc ?? null;
  }
  return { status: row.current_status, checks: row.current_checks, incident };
}
