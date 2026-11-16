"use server";

import type { ReportStatus } from "@/lib/database.types";
import { supabaseServer } from "@/lib/supabase";

/**
 * Ambil status terbaru laporan. Untuk status "diperiksa", fungsi database juga memajukan
 * simulasi pemeriksaan AI berdasarkan waktu sejak laporan dibuat.
 */
export async function refreshReportStatus(code: string): Promise<{ status: ReportStatus; checks: number } | null> {
  if (!/^WR-\d{1,9}$/.test(code)) return null;
  const supabase = await supabaseServer(true);
  if (!supabase) return null;

  const { data, error } = await supabase.rpc("advance_report_review", { p_code: code });
  if (error) {
    console.error("[laporan-saya] advance_report_review gagal:", error.code, error.message);
    return null;
  }
  const row = data?.[0];
  return row ? { status: row.current_status, checks: row.current_checks } : null;
}
