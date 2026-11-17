import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { Suspense } from "react";
import { AppBar } from "@/components/Chrome";
import { Icon } from "@/components/Icon";
import { RippleLink } from "@/components/RippleLink";
import { MobileTabBar } from "@/components/MobileTabBar";
import type { ReportStatus } from "@/lib/database.types";
import { listIncidents, toLite } from "@/lib/incidentsDb";
import { formatWIB, indicationText, reportPlace, statusText } from "@/lib/reports";
import { supabaseServer } from "@/lib/supabase";

export const metadata: Metadata = { title: "Laporan saya" };

const statusTone: Record<ReportStatus, string> = {
  diperiksa: "bg-ai-soft text-ai-ink",
  terbit: "bg-sprout text-forest",
  "perlu-dilengkapi": "bg-pending-soft text-[#8a5a00]",
  ditolak: "bg-fire-soft text-fire-ink",
};

export default function LaporanSayaPage() {
  return (
    <div className="flex min-h-[100svh] flex-col bg-tint">
      <AppBar search={false} />
      <main className="mx-auto w-full max-w-[800px] flex-1 px-4 pb-32 pt-6 md:pt-12">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold tracking-[-0.02em] md:text-[32px]">Laporan saya</h1>
            <p className="mt-1 text-sm font-medium text-ink-2">Hanya kamu yang bisa melihat daftar ini.</p>
          </div>
          <Link href="/lapor" className="btn-report hidden shrink-0 px-5 py-3 text-[15px] sm:inline-flex">
            <Icon name="plus" size={18} />
            Laporan baru
          </Link>
        </div>
        <Suspense fallback={<p className="mt-8 text-sm font-semibold text-ink-2">Memuat laporan…</p>}>
          <ReportList />
        </Suspense>
      </main>
      <MobileTabBar active="laporan" />
    </div>
  );
}

async function ReportList() {
  await connection();
  const supabase = await supabaseServer();
  const { data: reports, error } = (await supabase
    ?.from("reports")
    .select("code, status, indication, created_at, incident_id, location_mode, lon, lat, direction")
    .order("created_at", { ascending: false })
    .limit(50)) ?? { data: null, error: null };

  if (error) {
    console.error("[laporan-saya] gagal memuat:", error.code, error.message);
    return <p className="mt-8 text-sm font-semibold text-fire-ink">Laporan belum bisa dimuat. Muat ulang halaman ini.</p>;
  }

  if (!reports?.length) {
    return (
      <div className="mt-8 rounded-[24px] border border-line bg-white p-8 text-center shadow-soft">
        <p className="text-lg font-extrabold">Belum ada laporan</p>
        <p className="mt-1 text-sm font-medium text-ink-2">Lihat asap atau api? Kirim pengamatan pertamamu dari tempat aman.</p>
        <RippleLink href="/lapor" className="btn-report mt-5 inline-flex px-6 py-3 text-[15px] hover:bg-sun">
          <Icon name="plus" size={18} />
          Laporkan pengamatan
        </RippleLink>
      </div>
    );
  }

  const incidents = (await listIncidents()).map(toLite);

  return (
    <ul className="mt-6 space-y-3">
      {reports.map((r) => (
        <li key={r.code}>
          <Link
            href={`/laporan-saya/${r.code}`}
            className="flex items-center gap-4 rounded-[20px] border border-line bg-white p-4 shadow-soft transition-colors hover:border-leaf"
          >
            <span className="min-w-0 flex-1">
              <span className="block text-xs font-bold text-ink-2">No. {r.code} · {formatWIB(r.created_at, true)}</span>
              <span className="mt-1 block truncate text-[15px] font-extrabold">{indicationText[r.indication]} · {reportPlace(r, incidents)}</span>
            </span>
            <span className={`shrink-0 rounded-full px-3 py-1 text-xs font-bold ${statusTone[r.status]}`}>{statusText[r.status]}</span>
            <Icon name="chevronRight" size={18} className="shrink-0 text-ink-2" />
          </Link>
        </li>
      ))}
    </ul>
  );
}
