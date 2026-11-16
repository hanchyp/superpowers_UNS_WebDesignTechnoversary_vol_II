import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { Suspense } from "react";
import { AppBar } from "@/components/Chrome";
import { listIncidents, toLite } from "@/lib/incidentsDb";
import { formatWIB, indicationText, reportPlace } from "@/lib/reports";
import { supabaseServer } from "@/lib/supabase";
import { StatusView } from "./StatusView";

export const metadata: Metadata = { title: "Status laporan" };

export default function StatusPage(props: PageProps<"/laporan-saya/[id]">) {
  return (
    <Suspense fallback={<div className="min-h-[100svh] bg-tint" />}>
      <ReportStatus {...props} />
    </Suspense>
  );
}

async function ReportStatus({ params }: PageProps<"/laporan-saya/[id]">) {
  const { id: code } = await params;
  if (!/^WR-\d{1,9}$/.test(code)) notFound();

  await connection();
  const supabase = await supabaseServer();
  if (!supabase) notFound();

  // RLS memastikan hanya pemilik yang bisa membaca laporan ini.
  const { data: report } = await supabase
    .from("reports")
    .select("id, code, status, checks_done, indication, created_at, incident_id, location_mode, lon, lat, direction, report_media(path, kind, position)")
    .eq("code", code)
    .maybeSingle();
  if (!report) notFound();

  const media = [...report.report_media].sort((a, b) => a.position - b.position);
  const cover = media.find((m) => m.kind === "foto") ?? media[0];
  let coverUrl: string | null = null;
  if (cover) {
    const { data } = await supabase.storage.from("report-media").createSignedUrl(cover.path, 60 * 60);
    coverUrl = data?.signedUrl ?? null;
  }

  const incidents = (await listIncidents()).map(toLite);
  const linked = report.incident_id ? incidents.find((i) => i.id === report.incident_id) : undefined;

  return (
    <StatusView
      header={<AppBar search={false} />}
      report={{
        code: report.code,
        status: report.status,
        checks: report.checks_done,
        summary: `${indicationText[report.indication]} · ${reportPlace(report, incidents)}`,
        sentAt: formatWIB(report.created_at),
        incident: linked ? { id: linked.id, title: linked.title } : null,
        cover: cover && coverUrl ? { url: coverUrl, kind: cover.kind as "foto" | "video" } : null,
      }}
    />
  );
}
